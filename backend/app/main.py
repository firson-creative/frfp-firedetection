"""
backend/app/main.py
Server Utama REST API FastAPI
FRFP - Fire Risk Foresight & Prioritization (ANN-MLP)
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS
from .services.database import init_db
from .services.model_service import model_service
from .routers import predict, hotspots

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Inisialisasi basis data SQLite
    print("[*] Menginisialisasi basis data FRFP SQLite...")
    init_db()
    yield
    print("[*] Menutup server backend FRFP...")

app = FastAPI(
    title="FRFP - Fire Risk Foresight & Prioritization API",
    description="REST API Microservice untuk Klasifikasi Risiko Karhutla Berbasis Jaringan Syaraf Tiruan (ANN-MLP) Skala Nasional.",
    version="2.0.0",
    lifespan=lifespan
)

# Konfigurasi CORS
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
        "system": "FRFP - Fire Risk Foresight & Prioritization",
        "version": "2.0.0",
        "coverage": "Seluruh Wilayah Indonesia (Sabang s.d. Merauke)",
        "status": "ONLINE",
        "docs_url": "/docs",
        "model_loaded": model_service.is_loaded,
        "model_engine": model_service.model_type
    }

@app.get("/health", tags=["Root"])
def health_check():
    return {
        "status": "HEALTHY",
        "system": "FRFP",
        "target_region": "Indonesia (-11.00 to 6.00 lat, 95.00 to 141.00 lon)",
        "model_engine": model_service.model_type
    }
