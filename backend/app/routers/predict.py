"""
backend/app/routers/predict.py
Router Endpoint Prediksi Titik Panas Karhutla Riau (Single & Batch CSV)
"""

import io
import csv
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from ..schemas import HotspotInput, PredictionResponse, BatchPredictionResponse
from ..services.model_service import model_service
from ..services.geo import is_point_in_riau
from ..services.database import insert_hotspot, insert_batch_hotspots, clear_hotspots

router = APIRouter(prefix="/api/v1", tags=["Prediction"])

@router.post("/reset-db")
def reset_hotspots_database():
    """Menghapus semua riwayat hotspot dari basis data SQLite."""
    clear_hotspots()
    return {"status": "SUCCESS", "message": "Basis data hotspot berhasil di-reset menjadi kosong."}

@router.post("/predict", response_model=PredictionResponse)
def predict_single_hotspot(input_data: HotspotInput):
    """
    Endpoint untuk menguji prediksi 1 titik panas satelit secara interaktif.
    """
    result = model_service.predict_single(input_data.model_dump())

    # Simpan ke SQLite
    record_id = insert_hotspot(result)
    result["id"] = record_id

    return result

@router.post("/predict-batch", response_model=BatchPredictionResponse)
async def predict_batch_csv(
    file: UploadFile = File(...),
    replace_existing: bool = Query(False, description="Hapus data lama sebelum mengimpor batch baru")
):
    """
    Endpoint menerima upload file CSV satelit NASA FIRMS (VIIRS 375m),
    memfilter koordinat Provinsi Riau, menjalankan inferensi batch,
    dan menyimpan data ke database lokal.
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
    riau_predictions: List[dict] = []
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
        except (ValueError, KeyError):
            continue

        if not is_point_in_riau(lat, lon):
            total_out_of_bounds += 1
            continue

        pred = model_service.predict_single({
            'latitude': lat,
            'longitude': lon,
            'brightness': brightness,
            'scan': scan,
            'track': track,
            'frp': frp,
            'bright_t31': bright_t31
        })

        if pred['risk_class'] == 'HIGH RISK':
            high_risk_count += 1
        else:
            low_risk_count += 1

        riau_predictions.append(pred)

    # Simpan batch ke SQLite
    if riau_predictions:
        if replace_existing:
            clear_hotspots()
        insert_batch_hotspots(riau_predictions)

    return BatchPredictionResponse(
        total_uploaded=total_uploaded,
        total_processed_riau=len(riau_predictions),
        total_out_of_bounds=total_out_of_bounds,
        high_risk_count=high_risk_count,
        low_risk_count=low_risk_count,
        records=riau_predictions[:100]  # Batasi 100 record pertama pada payload respon
    )
