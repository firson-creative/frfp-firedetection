from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HotspotInput(BaseModel):
    latitude: float = Field(
        ...,
        description="Koordinat lintang (Rentang Indonesia: -11.00 s.d. 6.00)",
        examples=[-0.7893]
    )
    longitude: float = Field(
        ...,
        description="Koordinat bujur (Rentang Indonesia: 95.00 s.d. 141.00)",
        examples=[113.9213]
    )
    brightness: float = Field(
        ...,
        ge=250.0,
        le=550.0,
        description="Suhu kecerahan kanal I-4 dalam Kelvin (Rentang: 300.0 - 505.0 K)",
        examples=[345.2]
    )
    scan: float = Field(
        ...,
        ge=0.1,
        le=2.0,
        description="Resolusi pemindaian satelit dalam km (0.32 - 0.80 km)",
        examples=[0.45]
    )
    track: float = Field(
        ...,
        ge=0.1,
        le=2.0,
        description="Resolusi lintasan satelit dalam km (0.36 - 0.80 km)",
        examples=[0.40]
    )
    frp: float = Field(
        ...,
        ge=0.0,
        le=3000.0,
        description="Fire Radiative Power dalam Megawatt (FRP)",
        examples=[32.4]
    )
    bright_t31: float = Field(
        ...,
        ge=250.0,
        le=400.0,
        description="Suhu kanal I-5 pembanding latar dalam Kelvin (275.0 - 345.0 K)",
        examples=[294.5]
    )
    acq_date: Optional[str] = Field(None, description="Tanggal perekaman (YYYY-MM-DD)", examples=["2026-11-20"])
    acq_time: Optional[str] = Field(None, description="Waktu perekaman UTC (HHMM)", examples=["0630"])
    daynight: Optional[str] = Field("D", description="Lintasan Siang (D) atau Malam (N)", examples=["D"])

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
    risk_class: str
    risk_label: int
    is_indonesia: bool
    province_region: str
    acq_date: str
    acq_time: str
    daynight: str
    local_time_str: str
    audit_priority: str
    recommendation: str
    created_at: Optional[str] = None

class BatchPredictionResponse(BaseModel):
    total_uploaded: int
    total_processed_indonesia: int
    total_out_of_bounds: int
    high_risk_count: int
    low_risk_count: int
    records: List[PredictionResponse]

class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: List[float]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
