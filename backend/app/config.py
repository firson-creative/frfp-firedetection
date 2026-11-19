"""
backend/app/config.py
Konfigurasi Wilayah Target Riau & Parameter Sistem
"""

import os

# Koordinat Bounding Box Resmi Provinsi Riau (PRD 1.1)
RIAU_BOUNDING_BOX = {
    "lat_min": -1.15,
    "lat_max": 2.45,
    "lon_min": 100.00,
    "lon_max": 103.85
}

# Koordinat Center Default (Pekanbaru, Riau) untuk Peta Leaflet
RIAU_DEFAULT_CENTER = {
    "latitude": 0.5071,
    "longitude": 101.4478,
    "zoom": 8
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "app", "models")
MODEL_KERAS_PATH = os.path.join(MODEL_DIR, "ann_model_riau.keras")
MODEL_PKL_PATH = os.path.join(MODEL_DIR, "ann_model_riau.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler_riau.pkl")

DATABASE_PATH = os.path.join(BASE_DIR, "hotspots_riau.db")

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000"
]
