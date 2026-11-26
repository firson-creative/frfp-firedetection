from fastapi.testclient import TestClient
from app.main import app

def test_endpoints():
    with TestClient(app) as client:
        res = client.get("/")
        assert res.status_code == 200, res.text
        print("[PASS] Root GET /:", res.json()["system"])

        payload_kalteng = {
            "latitude": -1.8200,
            "longitude": 113.4500,
            "brightness": 352.0,
            "scan": 0.42,
            "track": 0.38,
            "frp": 34.0,
            "bright_t31": 292.0,
            "acq_date": "2026-11-20",
            "acq_time": "0630",
            "daynight": "D"
        }
        res_pred = client.post("/api/v1/predict", json=payload_kalteng)
        assert res_pred.status_code == 200, res_pred.text
        data = res_pred.json()
        print(f"[PASS] POST /api/v1/predict ({data['province_region']}): {data['risk_class']} | {data['local_time_str']}")
        assert data["is_indonesia"] is True

        res_sync = client.post("/api/v1/sync-nrt?batch_size=20")
        assert res_sync.status_code == 200, res_sync.text
        sync_data = res_sync.json()
        print(f"[PASS] POST /api/v1/sync-nrt: {sync_data['message']} (Added: {sync_data['added_count']})")

        res_geo = client.get("/api/v1/hotspots?limit=10")
        assert res_geo.status_code == 200
        geo = res_geo.json()
        print(f"[PASS] GET /api/v1/hotspots: {len(geo['features'])} features returned")

        res_stats = client.get("/api/v1/stats")
        assert res_stats.status_code == 200
        print("[PASS] GET /api/v1/stats:", res_stats.json())

if __name__ == "__main__":
    test_endpoints()
    print("\n[ALL TESTS PASSED] Backend FRFP Nasional siap digunakan!")
