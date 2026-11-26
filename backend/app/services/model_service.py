import os
import math
import datetime
from typing import Dict, Any, List
from ..config import MODEL_KERAS_PATH, MODEL_PKL_PATH, SCALER_PATH
from .geo import is_point_in_indonesia, is_point_on_indonesia_land, get_indonesia_region, get_indonesia_subregion, format_satellite_timestamp

class HotspotRiskModelService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_type = None
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        import joblib

        if os.path.exists(MODEL_PKL_PATH) and os.path.exists(SCALER_PATH):
            try:
                self.scaler = joblib.load(SCALER_PATH)
                self.model = joblib.load(MODEL_PKL_PATH)
                self.model_type = "SKLEARN_MLP"
                self.is_loaded = True
                print(f"[OK] FRFP Model ANN-MLP (.pkl) berhasil dimuat dari: {MODEL_PKL_PATH}")
                return
            except Exception as e:
                print(f"[WARN] Gagal memuat model .pkl: {e}")

        if os.path.exists(MODEL_KERAS_PATH) and os.path.exists(SCALER_PATH):
            try:
                from tensorflow import keras
                self.scaler = joblib.load(SCALER_PATH)
                self.model = keras.models.load_model(MODEL_KERAS_PATH)
                self.model_type = "KERAS"
                self.is_loaded = True
                print(f"[OK] FRFP Model ANN-MLP (.keras) berhasil dimuat dari: {MODEL_KERAS_PATH}")
                return
            except Exception as e:
                print(f"[WARN] Gagal memuat model .keras: {e}")

        print("[INFO] Model biner belum ditemukan. Mengaktifkan mesin estimasi rumus standar PRD.")
        self.model_type = "RULE_BASED"
        self.is_loaded = False

    def predict_single(self, features: Dict[str, Any]) -> Dict[str, Any]:
        lat = float(features['latitude'])
        lon = float(features['longitude'])
        brightness = float(features['brightness'])
        scan = float(features['scan'])
        track = float(features['track'])
        frp = float(features['frp'])
        bright_t31 = float(features['bright_t31'])

        acq_date = features.get('acq_date') or datetime.date.today().isoformat()
        acq_time = str(features.get('acq_time') or "0600").strip().zfill(4)
        daynight = features.get('daynight') or "D"

        in_indonesia = is_point_in_indonesia(lat, lon)
        is_land = is_point_on_indonesia_land(lat, lon)
        province_region = get_indonesia_region(lat, lon)
        subregion = get_indonesia_subregion(lat, lon, province_region)
        delta_t = round(brightness - bright_t31, 2)
        local_time_str = format_satellite_timestamp(acq_date, acq_time, lon, daynight)

        if self.is_loaded and self.model is not None and self.scaler is not None:
            import numpy as np
            raw_input = np.array([[lat, lon, brightness, scan, track, frp, bright_t31]])
            scaled_input = self.scaler.transform(raw_input)

            if self.model_type == "SKLEARN_MLP":
                prob = float(self.model.predict_proba(scaled_input)[0, 1])
            else:
                prob = float(self.model.predict(scaled_input, verbose=0)[0][0])
        else:
            frp_score = (frp - 15.0) / 10.0
            dt_score = (delta_t - 25.0) / 6.0
            z = max(frp_score, dt_score)
            prob = 1.0 / (1.0 + math.exp(-max(-8.0, min(8.0, z * 2.0))))

        prob = round(float(prob), 4)
        risk_class = "HIGH RISK" if prob >= 0.50 else "LOW RISK"
        risk_label = 1 if prob >= 0.50 else 0

        if not in_indonesia:
            audit_priority = "Peringatan (Luar Negeri)"
            recommendation = "Titik koordinat berada di luar kedaulatan teritori Republik Indonesia."
        elif not is_land or "Laut" in province_region:
            audit_priority = "Non-Prioritas (Wilayah Perairan/Laut)"
            recommendation = "Titik berada di permukaan laut lepas (indikasi suar gas rig minyak lepas pantai / gas flaring, bukan karhutla daratan)."
        elif risk_class == "HIGH RISK":
            if prob >= 0.85 or frp >= 35.0:
                audit_priority = "Sangat Tinggi (P1)"
                recommendation = f"Dispatch darurat Regu Manggala Agni Daops {province_region} & Audit Investigasi Balai Gakkum KLHK."
            else:
                audit_priority = "Tinggi (P2)"
                recommendation = f"Verifikasi ground check terpadu di {province_region} dan pemeriksaan izin konsesi terdekat."
        else:
            audit_priority = "Rendah (P3)"
            recommendation = "Pemantauan satelit berkala via FRFP, tidak mendesak untuk intervensi fisik darat saat ini."

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
            "is_indonesia": in_indonesia,
            "province_region": province_region,
            "subregion": subregion,
            "acq_date": acq_date,
            "acq_time": acq_time,
            "daynight": daynight,
            "local_time_str": local_time_str,
            "audit_priority": audit_priority,
            "recommendation": recommendation
        }

model_service = HotspotRiskModelService()
