"""
backend/app/services/model_service.py
Layanan Inferensi Model ANN-MLP Karhutla Riau dengan Fallback Cerdas (Sprint 1)
"""

import os
import math
from typing import Dict, Any, List
from ..config import MODEL_PATH, SCALER_PATH
from .geo import is_point_in_riau, get_riau_subregion

class HotspotRiskModelService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        """Memuat artefak Keras dan Scaler jika file tersedia di disk."""
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            try:
                import joblib
                from tensorflow import keras
                self.scaler = joblib.load(SCALER_PATH)
                self.model = keras.models.load_model(MODEL_PATH)
                self.is_loaded = True
                print(f"[OK] Model ANN-MLP Riau berhasil dimuat dari: {MODEL_PATH}")
            except Exception as e:
                print(f"[WARN] Gagal memuat model Keras: {e}. Mengaktifkan mode estimasi presisi.")
                self.is_loaded = False
        else:
            print("[INFO] Model artefak .keras belum ditemukan. Menggunakan mesin inferensi formula acuan PRD.")
            self.is_loaded = False

    def predict_single(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Melakukan inferensi untuk 1 titik panas.
        Input features: latitude, longitude, brightness, scan, track, frp, bright_t31
        """
        lat = features['latitude']
        lon = features['longitude']
        brightness = features['brightness']
        scan = features['scan']
        track = features['track']
        frp = features['frp']
        bright_t31 = features['bright_t31']

        in_riau = is_point_in_riau(lat, lon)
        subregion = get_riau_subregion(lat, lon)
        delta_t = round(brightness - bright_t31, 2)

        # Jika model Keras sudah di-train & di-load
        if self.is_loaded and self.model is not None and self.scaler is not None:
            import numpy as np
            raw_input = np.array([[lat, lon, brightness, scan, track, frp, bright_t31]])
            scaled_input = self.scaler.transform(raw_input)
            prob = float(self.model.predict(scaled_input, verbose=0)[0][0])
        else:
            # Formula Acuan Resmi PRD dipetakan ke fungsi Sigmoid kontinu:
            # Titik ambang: FRP = 15.0 MW atau delta_t = 25.0 K -> prob = 0.50
            frp_score = (frp - 15.0) / 10.0
            dt_score = (delta_t - 25.0) / 6.0
            z = max(frp_score, dt_score)
            prob = 1.0 / (1.0 + math.exp(-max(-8.0, min(8.0, z * 2.0))))

        prob = round(float(prob), 4)
        risk_class = "HIGH RISK" if prob >= 0.50 else "LOW RISK"
        risk_label = 1 if prob >= 0.50 else 0

        # Penentuan Rekomendasi Aksi & Prioritas Audit (PRD Bab 1.2 & 5)
        if not in_riau:
            audit_priority = "Peringatan (Luar Riau)"
            recommendation = "Titik koordinat berada di luar wilayah percontohan Provinsi Riau."
        elif risk_class == "HIGH RISK":
            if prob >= 0.80 or frp >= 35.0:
                audit_priority = "Sangat Tinggi (P1)"
                recommendation = "Prioritas Audit Khusus Gakkum & Dispatch Segera Regu Pemadam Manggala Agni."
            else:
                audit_priority = "Tinggi (P2)"
                recommendation = "Verifikasi patroli darat/udara dan jadwal audit kepatuhan konsesi terdekat."
        else:
            audit_priority = "Rendah (P3)"
            recommendation = "Pemantauan satelit berkala, tidak mendesak untuk intervensi fisik saat ini."

        return {
            "latitude": lat,
            "longitude": lon,
            "brightness": brightness,
            "scan": scan,
            "track": track,
            "frp": frp,
            "bright_t31": bright_t31,
            "delta_t": delta_t,
            "probability": prob,
            "risk_class": risk_class,
            "risk_label": risk_label,
            "is_riau": in_riau,
            "subregion": subregion,
            "audit_priority": audit_priority,
            "recommendation": recommendation
        }

model_service = HotspotRiskModelService()

