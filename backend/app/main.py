"""
backend/app/main.py
Server Utama REST API FastAPI
Prototipe Sistem Klasifikasi Tingkat Risiko Titik Panas Karhutla Riau (ANN-MLP)
"""

import os
import csv
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS
from .services.database import init_db, insert_batch_hotspots, get_statistics
from .services.model_service import model_service
from .routers import predict, hotspots

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Inisialisasi basis data SQLite
    print("[*] Menginisialisasi basis data SQLite...")
    init_db()

    # Preload sample data jika DB masih kosong
    stats = get_statistics()
    if stats["total_hotspots"] == 0:
        sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "riau_hotspots_labeled.csv"))
        if os.path.exists(sample_path):
            print(f"[*] Melakukan seed data awal dari: {sample_path}")
            seeds = []
            with open(sample_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for i, row in enumerate(reader):
                    if i >= 150:  # Muat 150 titik contoh awal untuk tampilan peta
                        break
                    try:
                        pred = model_service.predict_single({
                            'latitude': float(row['latitude']),
                            'longitude': float(row['longitude']),
                            'brightness': float(row['brightness']),
                            'scan': float(row['scan']),
                            'track': float(row['track']),
                            'frp': float(row['frp']),
                            'bright_t31': float(row['bright_t31'])
                        })
                        seeds.append(pred)
                    except Exception:
                        continue
            if seeds:
                insert_batch_hotspots(seeds)
                print(f"[OK] {len(seeds)} data titik panas Riau berhasil di-seed ke basis data.")

    yield
    print("[*] Menutup server backend...")

app = FastAPI(
    title="API Klasifikasi Titik Panas Karhutla Riau (ANN-MLP)",
    description="REST API Microservice untuk Klasifikasi Risiko Karhutla dan Prioritas Audit Lingkungan Provinsi Riau.",
    version="1.1.0",
    lifespan=lifespan
)

# Konfigurasi CORS (PRD Section 6.1)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrasi Router
app.include_router(predict.router)
app.include_router(hotspots.router)

@app.get("/", tags=["Root"])
def root_status():
    return {
        "system": "Prototipe Klasifikasi Risiko Titik Panas Karhutla Riau",
        "version": "1.1.0",
        "status": "ONLINE",
        "docs_url": "/docs",
        "model_loaded": model_service.is_loaded
    }

@app.get("/health", tags=["Root"])
def health_check():
    return {
        "status": "HEALTHY",
        "target_region": "Provinsi Riau (-1.15 to 2.45 lat, 100.00 to 103.85 lon)",
        "model_engine": "ANN-MLP (TensorFlow/Keras)" if model_service.is_loaded else "Standard Rule-Based PRD Engine"
    }
