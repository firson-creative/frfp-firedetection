"""
test_api.py
Skrip pengujian unit sederhana untuk API FastAPI Karhutla Riau
"""

from fastapi.testclient import TestClient
from app.main import app

def test_endpoints():
    with TestClient(app) as client:
        # 1. Test Root
        res = client.get("/")
        assert res.status_code == 200, res.text
        print("[PASS] Root GET /:", res.json()["system"])

        # 2. Test Predict Single (High Risk example inside Riau)
        # Lat: 0.5071 (Pekanbaru), FRP: 32.5 (> 15), delta_t: 345 - 295 = 50 (> 25)
        payload = {
            "latitude": 0.5071,
            "longitude": 101.4478,
            "brightness": 345.0,
            "scan": 0.45,
            "track": 0.40,
            "frp": 32.5,
            "bright_t31": 295.0
        }
        res_pred = client.post("/api/v1/predict", json=payload)
        assert res_pred.status_code == 200, res_pred.text
        data = res_pred.json()
        print("[PASS] POST /api/v1/predict (High Risk):", data["risk_class"], "Probability:", data["probability"])
        assert data["risk_class"] == "HIGH RISK"
        assert data["is_riau"] is True

        # 3. Test Predict Single (Low Risk example inside Riau)
        payload_low = {
            "latitude": 0.8200,
            "longitude": 101.7500,
            "brightness": 305.0,
            "scan": 0.40,
            "track": 0.38,
            "frp": 5.2,
            "bright_t31": 298.0
        }
        res_low = client.post("/api/v1/predict", json=payload_low)
        assert res_low.status_code == 200
        data_low = res_low.json()
        print("[PASS] POST /api/v1/predict (Low Risk):", data_low["risk_class"], "Probability:", data_low["probability"])
        assert data_low["risk_class"] == "LOW RISK"

        # 4. Test Predict Single (Outside Riau)
        payload_out = {
            "latitude": 4.5000,
            "longitude": 96.5000,
            "brightness": 350.0,
            "scan": 0.40,
            "track": 0.38,
            "frp": 30.0,
            "bright_t31": 295.0
        }
        res_out = client.post("/api/v1/predict", json=payload_out)
        assert res_out.status_code == 200
        data_out = res_out.json()
        print("[PASS] POST /api/v1/predict (Out of Riau): is_riau =", data_out["is_riau"])
        assert data_out["is_riau"] is False

        # 5. Test Hotspots GeoJSON
        res_geo = client.get("/api/v1/hotspots")
        assert res_geo.status_code == 200
        geo = res_geo.json()
        print(f"[PASS] GET /api/v1/hotspots (GeoJSON): {len(geo['features'])} features returned")

        # 6. Test Stats
        res_stats = client.get("/api/v1/stats")
        assert res_stats.status_code == 200
        print("[PASS] GET /api/v1/stats:", res_stats.json())

if __name__ == "__main__":
    test_endpoints()
    print("\n[ALL TESTS PASSED] Backend API siap digunakan!")
