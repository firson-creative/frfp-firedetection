"""
backend/app/schemas.py
Skema Validasi Pydantic v2 untuk Titik Panas Karhutla Riau
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HotspotInput(BaseModel):
    """
    7 Fitur Masukan Sesuai PRD Bab 4.1
    """
    latitude: float = Field(
        ...,
        description="Koordinat lintang (Rentang Riau: -1.15 s.d. 2.45)",
        examples=[0.5071]
    )
    longitude: float = Field(
        ...,
        description="Koordinat bujur (Rentang Riau: 100.00 s.d. 103.85)",
        examples=[101.4478]
    )
    brightness: float = Field(
        ...,
        ge=250.0,
        le=550.0,
        description="Suhu kecerahan kanal I-4 dalam Kelvin (Rentang: 300.0 - 505.0 K)",
        examples=[338.5]
    )
    scan: float = Field(
        ...,
        ge=0.1,
        le=2.0,
        description="Resolusi pemindaian satelit dalam km (Rentang: 0.32 - 0.80 km)",
        examples=[0.45]
    )
    track: float = Field(
        ...,
        ge=0.1,
        le=2.0,
        description="Resolusi lintasan satelit dalam km (Rentang: 0.36 - 0.80 km)",
        examples=[0.40]
    )
    frp: float = Field(
        ...,
        ge=0.0,
        le=2000.0,
        description="Fire Radiative Power dalam Megawatt (FRP)",
        examples=[24.6]
    )
    bright_t31: float = Field(
        ...,
        ge=250.0,
        le=400.0,
        description="Suhu kanal I-5 pembanding latar dalam Kelvin (Rentang: 275.0 - 345.0 K)",
        examples=[296.2]
    )

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    latitude: float
    longitude: float
    brightness: float
    scan: float
    track: float
    frp: float
    bright_t31: float
    delta_t: float
    probability: float
    risk_class: str  # "HIGH RISK" | "LOW RISK"
    risk_label: int  # 1 | 0
    is_riau: bool
    audit_priority: str
    recommendation: str
    created_at: Optional[str] = None

class BatchPredictionResponse(BaseModel):
    total_uploaded: int
    total_processed_riau: int
    total_out_of_bounds: int
    high_risk_count: int
    low_risk_count: int
    records: List[PredictionResponse]

class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
