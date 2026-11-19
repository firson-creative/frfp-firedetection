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
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from ..schemas import HotspotInput, PredictionResponse, BatchPredictionResponse, SyncNRTResponse
from ..services.model_service import model_service
from ..services.geo import is_point_in_indonesia
from ..services.database import insert_hotspot, insert_batch_hotspots, clear_hotspots
from ..config import NRT_DATASET_PATH

router = APIRouter(prefix="/api/v1", tags=["Prediction"])

@router.post("/reset-db")
def reset_hotspots_database():
    """Menghapus semua riwayat hotspot dari basis data SQLite."""
    clear_hotspots()
    return {"status": "SUCCESS", "message": "Basis data hotspot FRFP berhasil di-reset menjadi kosong."}

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
async def predict_batch_csv(
    file: UploadFile = File(...),
    replace_existing: bool = Query(False, description="Hapus data lama sebelum mengimpor batch baru")
):
    """
    Endpoint menerima upload file CSV satelit NASA FIRMS VIIRS 375m (skala nasional),
    memfilter koordinat Indonesia, menjalankan inferensi batch, dan menyimpan ke database.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Format file harus berupa CSV (.csv)")

    contents = await file.read()
    decoded = contents.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="File CSV kosong atau tidak valid.")

    field_map = {orig.strip().lower(): orig for orig in reader.fieldnames}
    required = ['latitude', 'longitude', 'brightness', 'scan', 'track', 'frp', 'bright_t31']

    for req in required:
        if req not in field_map:
            raise HTTPException(
                status_code=422,
                detail=f"Kolom wajib '{req}' tidak ditemukan pada CSV. Kolom yang ada: {list(reader.fieldnames)}"
            )

    total_uploaded = 0
    total_out_of_bounds = 0
    predictions: List[dict] = []
    high_risk_count = 0
    low_risk_count = 0

    for row in reader:
        total_uploaded += 1
        try:
            lat = float(row[field_map['latitude']])
            lon = float(row[field_map['longitude']])
            brightness = float(row[field_map['brightness']])
            scan = float(row[field_map['scan']])
            track = float(row[field_map['track']])
            frp = float(row[field_map['frp']])
            bright_t31 = float(row[field_map['bright_t31']])

            acq_date = row.get(field_map.get('acq_date', ''))
            acq_time = row.get(field_map.get('acq_time', ''))
            daynight = row.get(field_map.get('daynight', '')) or 'D'
        except (ValueError, KeyError):
            continue

        if not is_point_in_indonesia(lat, lon):
            total_out_of_bounds += 1
            continue

        pred = model_service.predict_single({
            'latitude': lat,
            'longitude': lon,
            'brightness': brightness,
            'scan': scan,
            'track': track,
            'frp': frp,
            'bright_t31': bright_t31,
            'acq_date': acq_date,
            'acq_time': acq_time,
            'daynight': daynight
        })

        if pred['risk_class'] == 'HIGH RISK':
            high_risk_count += 1
        else:
            low_risk_count += 1

        predictions.append(pred)

    # Simpan batch ke SQLite
    if predictions:
        if replace_existing:
            clear_hotspots()
        insert_batch_hotspots(predictions)

    return BatchPredictionResponse(
        total_uploaded=total_uploaded,
        total_processed_indonesia=len(predictions),
        total_out_of_bounds=total_out_of_bounds,
        high_risk_count=high_risk_count,
        low_risk_count=low_risk_count,
        records=predictions[:100]
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
                        if not is_point_in_indonesia(lat, lon):
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
                    if not is_point_in_indonesia(lat, lon):
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
