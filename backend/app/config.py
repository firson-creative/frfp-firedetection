import os

INDONESIA_BOUNDING_BOX = {
    "lat_min": -11.00,
    "lat_max": 6.00,
    "lon_min": 95.00,
    "lon_max": 141.00
}

INDONESIA_DEFAULT_CENTER = {
    "latitude": -0.7893,
    "longitude": 113.9213,
    "zoom": 5
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "app", "models")
MODEL_KERAS_PATH = os.path.join(MODEL_DIR, "ann_model_riau.keras")
MODEL_PKL_PATH = os.path.join(MODEL_DIR, "ann_model_riau.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler_riau.pkl")

DATABASE_PATH = os.path.join(BASE_DIR, "frfp_hotspots.db")

NRT_DATASET_PATH = os.path.join(os.path.dirname(BASE_DIR), "data", "fire_nrt_SV-C2_829694.csv")

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]
