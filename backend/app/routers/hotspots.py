from typing import Optional
from fastapi import APIRouter, Query
from ..schemas import GeoJSONFeatureCollection, GeoJSONFeature, GeoJSONGeometry
from ..services.database import get_hotspots, get_statistics

router = APIRouter(prefix="/api/v1", tags=["Hotspots & GIS"])

@router.get("/hotspots", response_model=GeoJSONFeatureCollection)
def get_hotspots_geojson(
    risk_class: Optional[str] = Query(None, description="Filter kelas risiko: 'HIGH RISK' atau 'LOW RISK'"),
    province: Optional[str] = Query(None, description="Filter nama provinsi / wilayah Indonesia"),
    kabupaten: Optional[str] = Query(None, description="Filter nama kabupaten / kota di Indonesia"),
    limit: int = Query(1000, ge=1, le=5000, description="Maksimum jumlah titik hotspot yang diambil")
):
    rows = get_hotspots(risk_class=risk_class, province=province, kabupaten=kabupaten, limit=limit)
    features = []

    for r in rows:
        feature = GeoJSONFeature(
            type="Feature",
            geometry=GeoJSONGeometry(
                type="Point",
                coordinates=[r["longitude"], r["latitude"]]
            ),
            properties={
                "id": r["id"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "brightness": r["brightness"],
                "frp": r["frp"],
                "bright_t31": r["bright_t31"],
                "delta_t": r["delta_t"],
                "probability": r["probability"],
                "risk_class": r["risk_class"],
                "province_region": r.get("province_region", "Indonesia"),
                "subregion": r.get("subregion") or r.get("province_region", "Indonesia"),
                "acq_date": r.get("acq_date", ""),
                "acq_time": r.get("acq_time", ""),
                "daynight": r.get("daynight", "D"),
                "local_time_str": r.get("local_time_str", "WIB"),
                "audit_priority": r.get("audit_priority", "Sedang"),
                "audit_status": r.get("audit_status", "PENDING"),
                "recommendation": r.get("recommendation", ""),
                "created_at": r.get("created_at")
            }
        )
        features.append(feature)

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)

@router.get("/stats")
def get_system_stats():
    return get_statistics()
