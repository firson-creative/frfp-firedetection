"""
backend/app/routers/predict.py
Router Endpoint Prediksi FRFP Nasional (Single, Batch CSV, dan Near-Realtime Auto-Sync)
"""

import os
import io
import csv
import datetime
import urllib.request
from typing import List, Optional
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from ..schemas import HotspotInput, PredictionResponse, BatchPredictionResponse, SyncNRTResponse
from ..services.model_service import model_service
from ..services.geo import (
    is_point_in_indonesia,
    is_point_on_indonesia_land,
    format_satellite_timestamp,
    get_indonesia_region,
    get_indonesia_subregion
)
from ..services.database import insert_hotspot, insert_batch_hotspots, clear_hotspots
from ..config import NRT_DATASET_PATH

router = APIRouter(prefix="/api/v1", tags=["Prediction"])

@router.post("/reset-db")
def reset_hotspots_database():
    """Menghapus semua riwayat hotspot dari basis data SQLite."""
    try:
        clear_hotspots()
        return {"status": "SUCCESS", "message": "Basis data hotspot FRFP berhasil di-reset menjadi kosong."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengosongkan basis data: {str(e)}")

@router.post("/predict", response_model=PredictionResponse)
def predict_single_hotspot(input_data: HotspotInput):
    """
    Endpoint untuk menguji prediksi 1 titik panas satelit secara interaktif di seluruh Indonesia.
    """
    result = model_service.predict_single(input_data.model_dump())
    record_id = insert_hotspot(result)
    result["id"] = record_id
    return result

@router.post("/predict-batch", response_model=BatchPredictionResponse)
def predict_batch_csv(
    file: UploadFile = File(...),
    replace_existing: bool = Query(False, description="Hapus data lama sebelum mengimpor batch baru"),
    max_stored_rows: int = Query(50000, description="Batas maksimum titik yang disimpan ke basis data untuk kestabilan peta")
):
    """
    Endpoint pemrosesan batch satelit NASA FIRMS VIIRS 375m berkinerja tinggi:
    - Menggunakan chunked streaming (pd.read_csv) sehingga file raksasa (>700MB) tidak membebani memori.
    - Inferensi ANN-MLP ter-vektorisasi (vectorized NumPy) sehingga ratusan ribu baris selesai dalam hitungan detik.
    - Penyimpanan SQLite batch berkecepatan tinggi via executemany.
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Format file harus berupa CSV (.csv)")

    if replace_existing:
        clear_hotspots()

    total_uploaded = 0
    total_processed_indonesia = 0
    total_out_of_bounds = 0
    high_risk_count = 0
    low_risk_count = 0

    to_insert_records: List[dict] = []
    sample_preview_records: List[dict] = []

    required_cols = ['latitude', 'longitude', 'brightness', 'scan', 'track', 'frp', 'bright_t31']

    try:
        # Stream file in chunks of 25,000 rows without loading entire file into memory
        chunks = pd.read_csv(file.file, chunksize=25000, low_memory=False)

        for chunk_idx, chunk in enumerate(chunks):
            # Normalize column names to lowercase
            col_map = {str(c).strip().lower(): c for c in chunk.columns}

            # Validasi kolom wajib pada chunk pertama
            if chunk_idx == 0:
                missing = [r for r in required_cols if r not in col_map]
                if missing:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Kolom wajib {missing} tidak ditemukan pada CSV. Kolom yang ada: {list(chunk.columns)}"
                    )

            # Rename chunk columns to standard names
            std_rename = {col_map[r]: r for r in required_cols}
            if 'acq_date' in col_map:
                std_rename[col_map['acq_date']] = 'acq_date'
            if 'acq_time' in col_map:
                std_rename[col_map['acq_time']] = 'acq_time'
            if 'daynight' in col_map:
                std_rename[col_map['daynight']] = 'daynight'

            chunk = chunk.rename(columns=std_rename)

            # Coerce numeric columns and drop NaN rows
            for num_col in required_cols:
                chunk[num_col] = pd.to_numeric(chunk[num_col], errors='coerce')
            chunk = chunk.dropna(subset=required_cols)

            chunk_len = len(chunk)
            total_uploaded += chunk_len

            # Vectorized filter for Indonesia Bounding Box: lat: -11.0 to 6.0, lon: 95.0 to 141.0
            indo_mask = (
                (chunk['latitude'] >= -11.0) & (chunk['latitude'] <= 6.0) &
                (chunk['longitude'] >= 95.0) & (chunk['longitude'] <= 141.0)
            )

            indo_df = chunk[indo_mask]
            indo_count = len(indo_df)
            total_processed_indonesia += indo_count
            total_out_of_bounds += (chunk_len - indo_count)

            if indo_count == 0:
                continue

            # Vectorized ANN Model Inference
            X = indo_df[required_cols].values
            X_scaled = model_service.scaler.transform(X)
            probs = model_service.model.predict_proba(X_scaled)[:, 1]

            chunk_high = int((probs >= 0.5).sum())
            high_risk_count += chunk_high
            low_risk_count += (indo_count - chunk_high)

            delta_t_vals = indo_df['brightness'].values - indo_df['bright_t31'].values

            # Convert to storage records up to max_stored_rows
            if len(to_insert_records) < max_stored_rows:
                capacity_left = max_stored_rows - len(to_insert_records)
                slice_df = indo_df.iloc[:capacity_left]
                slice_probs = probs[:capacity_left]
                slice_delta = delta_t_vals[:capacity_left]

                lats = slice_df['latitude'].values
                lons = slice_df['longitude'].values
                brights = slice_df['brightness'].values
                scans = slice_df['scan'].values
                tracks = slice_df['track'].values
                frps = slice_df['frp'].values
                t31s = slice_df['bright_t31'].values

                acq_dates = slice_df['acq_date'].astype(str).values if 'acq_date' in slice_df.columns else [datetime.date.today().isoformat()] * len(slice_df)
                acq_times = slice_df['acq_time'].astype(str).values if 'acq_time' in slice_df.columns else ['0000'] * len(slice_df)
                daynights = slice_df['daynight'].astype(str).values if 'daynight' in slice_df.columns else ['D'] * len(slice_df)

                now_ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                for i in range(len(slice_df)):
                    prob_val = float(slice_probs[i])
                    is_high = prob_val >= 0.5
                    risk_str = "HIGH RISK" if is_high else "LOW RISK"
                    d_t = round(float(slice_delta[i]), 2)
                    lat_val = float(lats[i])
                    lon_val = float(lons[i])

                    # FILTER PERMUKAAN LAUT: Abaikan titik di laut lepas (rig gas lepas pantai, flare, kapal)
                    if not is_point_on_indonesia_land(lat_val, lon_val):
                        continue

                    reg = get_indonesia_region(lat_val, lon_val)
                    if "Laut" in reg or "Luar" in reg:
                        continue

                    sub = get_indonesia_subregion(lat_val, lon_val, reg)
                    time_str = format_satellite_timestamp(
                        acq_date=str(acq_dates[i]),
                        acq_time=str(acq_times[i]),
                        longitude=lon_val,
                        daynight=str(daynights[i])
                    )

                    rec = {
                        'latitude': lat_val,
                        'longitude': lon_val,
                        'brightness': round(float(brights[i]), 2),
                        'scan': round(float(scans[i]), 2),
                        'track': round(float(tracks[i]), 2),
                        'frp': round(float(frps[i]), 2),
                        'bright_t31': round(float(t31s[i]), 2),
                        'delta_t': d_t,
                        'probability': round(prob_val, 4),
                        'risk_class': risk_str,
                        'risk_label': 1 if is_high else 0,
                        'is_indonesia': True,
                        'province_region': reg,
                        'subregion': sub,
                        'acq_date': str(acq_dates[i]),
                        'acq_time': str(acq_times[i]),
                        'daynight': str(daynights[i]),
                        'local_time_str': time_str,
                        'audit_priority': "Sangat Tinggi (P1)" if is_high else "Rendah (P3)",
                        'audit_status': "PENDING" if is_high else "VERIFIED",
                        'recommendation': "Prioritas Audit Khusus Gakkum & Dispatch Segera Regu Pemadam." if is_high else "Pemantauan satelit berkala.",
                        'created_at': now_ts
                    }
                    to_insert_records.append(rec)

                    if len(sample_preview_records) < 100:
                        sample_preview_records.append(rec)

    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Gagal memproses file CSV: {str(err)}")

    # Bulk insert into SQLite
    if to_insert_records:
        insert_batch_hotspots(to_insert_records)

    return BatchPredictionResponse(
        total_uploaded=total_uploaded,
        total_processed_indonesia=total_processed_indonesia,
        total_out_of_bounds=total_out_of_bounds,
        high_risk_count=high_risk_count,
        low_risk_count=low_risk_count,
        records=sample_preview_records
    )

@router.post("/sync-nrt", response_model=SyncNRTResponse)
def sync_near_realtime_hotspots(
    api_key: Optional[str] = Query(None, description="Opsional: NASA FIRMS MAP_KEY jika tersedia"),
    batch_size: int = Query(60, ge=10, le=300, description="Jumlah titik simulasi per sinkronisasi")
):
    """
    Endpoint Near-Realtime Auto-Sync:
    1. Jika api_key diberikan dan valid: menarik data langsung dari NASA FIRMS API.
    2. Jika tanpa api_key: melakukan simulasi pengambilan data stream satelit terbaru
       dari dataset NRT lokal (fire_nrt_SV-C2_829694.csv) dengan penyesuaian waktu saat ini.
    """
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    today_date = datetime.date.today().isoformat()
    now_time = datetime.datetime.now().strftime("%H%M")

    # Opsi 1: Jika user memasukkan API Key dan koneksi internet tersedia
    if api_key and len(api_key.strip()) > 10:
        url = f"https://firms.modaps.eosdis.nasa.gov/api/country/csv/{api_key.strip()}/VIIRS_SNPP_NRT/IDN/1"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'FRFP-System/2.0'})
            with urllib.request.urlopen(req, timeout=12) as response:
                content = response.read().decode('utf-8', errors='ignore')
                reader = csv.DictReader(io.StringIO(content))
                field_map = {orig.strip().lower(): orig for orig in (reader.fieldnames or [])}

                new_records = []
                for row in reader:
                    try:
                        lat = float(row[field_map['latitude']])
                        lon = float(row[field_map['longitude']])
                        if not is_point_in_indonesia(lat, lon) or not is_point_on_indonesia_land(lat, lon):
                            continue
                        pred = model_service.predict_single({
                            'latitude': lat,
                            'longitude': lon,
                            'brightness': float(row[field_map['brightness']]),
                            'scan': float(row[field_map['scan']]),
                            'track': float(row[field_map['track']]),
                            'frp': float(row[field_map['frp']]),
                            'bright_t31': float(row[field_map['bright_t31']]),
                            'acq_date': row.get(field_map.get('acq_date', '')) or today_date,
                            'acq_time': row.get(field_map.get('acq_time', '')) or now_time,
                            'daynight': row.get(field_map.get('daynight', '')) or 'D'
                        })
                        new_records.append(pred)
                    except Exception:
                        continue

                if new_records:
                    insert_batch_hotspots(new_records)
                    high_c = sum(1 for r in new_records if r['risk_class'] == 'HIGH RISK')
                    return SyncNRTResponse(
                        status="SUCCESS",
                        message=f"Berhasil menarik {len(new_records)} titik NRT langsung dari NASA FIRMS API.",
                        added_count=len(new_records),
                        high_risk_count=high_c,
                        low_risk_count=len(new_records) - high_c,
                        source="NASA FIRMS LIVE API",
                        timestamp=now_str
                    )
        except Exception as e:
            print(f"[WARN] Gagal menghubungi NASA Live API: {e}. Mengalihkan ke Smart Local Stream.")

    # Opsi 2: Smart Local Stream dari file NRT lokal yang dimiliki pengguna
    simulated_records = []
    if os.path.exists(NRT_DATASET_PATH):
        import random
        # Ambil sampel acak dari file NRT lokal
        with open(NRT_DATASET_PATH, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            field_map = {orig.strip().lower(): orig for orig in (reader.fieldnames or [])}
            all_rows = []
            for i, row in enumerate(reader):
                if i >= 15000:  # Batasi pembacaan memori
                    break
                all_rows.append(row)

            chosen = random.sample(all_rows, min(batch_size, len(all_rows)))
            for row in chosen:
                try:
                    lat = float(row[field_map['latitude']])
                    lon = float(row[field_map['longitude']])
                    if not is_point_in_indonesia(lat, lon) or not is_point_on_indonesia_land(lat, lon):
                        continue
                    pred = model_service.predict_single({
                        'latitude': lat,
                        'longitude': lon,
                        'brightness': float(row[field_map['brightness']]),
                        'scan': float(row[field_map['scan']]),
                        'track': float(row[field_map['track']]),
                        'frp': float(row[field_map['frp']]),
                        'bright_t31': float(row[field_map['bright_t31']]),
                        'acq_date': today_date,
                        'acq_time': now_time,
                        'daynight': 'D' if datetime.datetime.now().hour in range(6, 18) else 'N'
                    })
                    simulated_records.append(pred)
                except Exception:
                    continue

    if simulated_records:
        insert_batch_hotspots(simulated_records)
        high_c = sum(1 for r in simulated_records if r['risk_class'] == 'HIGH RISK')
        return SyncNRTResponse(
            status="SUCCESS",
            message=f"Berhasil menyinkronkan {len(simulated_records)} titik satelit terbaru (Near-Realtime Mode).",
            added_count=len(simulated_records),
            high_risk_count=high_c,
            low_risk_count=len(simulated_records) - high_c,
            source="FRFP Near-Realtime Feed",
            timestamp=now_str
        )
    else:
        return SyncNRTResponse(
            status="IDLE",
            message="Tidak ada data satelit baru yang terdeteksi saat ini.",
            added_count=0,
            high_risk_count=0,
            low_risk_count=0,
            source="FRFP Near-Realtime Feed",
            timestamp=now_str
        )

@router.post("/load-sample", response_model=BatchPredictionResponse)
def load_sample_dataset(
    region: str = Query("kalimantan", description="Pilihan region: kalimantan, sulawesi, papua, nasional, riau"),
    replace_existing: bool = Query(True, description="Gantikan data lama di database")
):
    """
    Endpoint pemuatan instan dataset sampel ringan (<200KB) untuk pengujian cepat:
    - kalimantan (1.500 baris)
    - sulawesi (1.200 baris)
    - papua (1.500 baris)
    - nasional (2.500 baris)
    - riau (4.843 baris)
    """
    # Root directory proyek FRFP
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    sample_files = {
        "kalimantan": os.path.join(root_dir, "data", "kalimantan_sample_test.csv"),
        "sulawesi": os.path.join(root_dir, "data", "sulawesi_sample_test.csv"),
        "papua": os.path.join(root_dir, "data", "papua_sample_test.csv"),
        "nasional": os.path.join(root_dir, "data", "indonesia_nasional_sample_test.csv"),
        "riau": os.path.join(root_dir, "data", "riau_nrt_test.csv"),
    }

    target_file = sample_files.get(region.lower().strip())
    if not target_file or not os.path.exists(target_file):
        raise HTTPException(
            status_code=404,
            detail=f"File sampel untuk region '{region}' tidak ditemukan. Opsi tersedia: {list(sample_files.keys())}"
        )

    if replace_existing:
        clear_hotspots()

    df = pd.read_csv(target_file)
    required_cols = ['latitude', 'longitude', 'brightness', 'scan', 'track', 'frp', 'bright_t31']

    total_uploaded = len(df)
    indo_mask = (
        (df['latitude'] >= -11.0) & (df['latitude'] <= 6.0) &
        (df['longitude'] >= 95.0) & (df['longitude'] <= 141.0)
    )
    indo_df = df[indo_mask]
    total_indo = len(indo_df)
    total_out = total_uploaded - total_indo

    X = indo_df[required_cols].values
    X_scaled = model_service.scaler.transform(X)
    probs = model_service.model.predict_proba(X_scaled)[:, 1]
    delta_t_vals = indo_df['brightness'].values - indo_df['bright_t31'].values

    high_risk_count = int((probs >= 0.5).sum())
    low_risk_count = total_indo - high_risk_count

    now_ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    to_insert_records = []
    preview_records = []

    lats = indo_df['latitude'].values
    lons = indo_df['longitude'].values
    brights = indo_df['brightness'].values
    scans = indo_df['scan'].values
    tracks = indo_df['track'].values
    frps = indo_df['frp'].values
    t31s = indo_df['bright_t31'].values
    acq_dates = indo_df['acq_date'].astype(str).values if 'acq_date' in indo_df.columns else [datetime.date.today().isoformat()] * total_indo
    acq_times = indo_df['acq_time'].astype(str).values if 'acq_time' in indo_df.columns else ['0000'] * total_indo
    daynights = indo_df['daynight'].astype(str).values if 'daynight' in indo_df.columns else ['D'] * total_indo

    for i in range(total_indo):
        prob_val = float(probs[i])
        is_high = prob_val >= 0.5
        risk_str = "HIGH RISK" if is_high else "LOW RISK"
        lat_val = float(lats[i])
        lon_val = float(lons[i])

        # FILTER PERMUKAAN LAUT: Abaikan titik di laut lepas (rig gas lepas pantai, flare, kapal)
        if not is_point_on_indonesia_land(lat_val, lon_val):
            continue

        reg = get_indonesia_region(lat_val, lon_val)
        if "Laut" in reg or "Luar" in reg:
            continue

        sub = get_indonesia_subregion(lat_val, lon_val, reg)
        time_str = format_satellite_timestamp(
            acq_date=str(acq_dates[i]),
            acq_time=str(acq_times[i]),
            longitude=lon_val,
            daynight=str(daynights[i])
        )

        rec = {
            'latitude': lat_val,
            'longitude': lon_val,
            'brightness': round(float(brights[i]), 2),
            'scan': round(float(scans[i]), 2),
            'track': round(float(tracks[i]), 2),
            'frp': round(float(frps[i]), 2),
            'bright_t31': round(float(t31s[i]), 2),
            'delta_t': round(float(delta_t_vals[i]), 2),
            'probability': round(prob_val, 4),
            'risk_class': risk_str,
            'risk_label': 1 if is_high else 0,
            'is_indonesia': True,
            'province_region': reg,
            'subregion': sub,
            'acq_date': str(acq_dates[i]),
            'acq_time': str(acq_times[i]),
            'daynight': str(daynights[i]),
            'local_time_str': time_str,
            'audit_priority': "Sangat Tinggi (P1)" if is_high else "Rendah (P3)",
            'audit_status': "PENDING" if is_high else "VERIFIED",
            'recommendation': "Prioritas Audit Khusus Gakkum & Dispatch Segera Regu Pemadam." if is_high else "Pemantauan satelit berkala.",
            'created_at': now_ts
        }
        to_insert_records.append(rec)
        if len(preview_records) < 100:
            preview_records.append(rec)

    insert_batch_hotspots(to_insert_records)

    return BatchPredictionResponse(
        total_uploaded=total_uploaded,
        total_processed_indonesia=total_indo,
        total_out_of_bounds=total_out,
        high_risk_count=high_risk_count,
        low_risk_count=low_risk_count,
        records=preview_records
    )
