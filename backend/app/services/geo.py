"""
backend/app/services/geo.py
Layanan Validasi Geografis & Spasial Provinsi Riau
"""

from ..config import RIAU_BOUNDING_BOX

def is_point_in_riau(latitude: float, longitude: float) -> bool:
    """
    Mengecek apakah koordinat berada di dalam Bounding Box resmi Provinsi Riau.
    Latitude : -1.15 s.d. 2.45
    Longitude: 100.00 s.d. 103.85
    """
    lat_ok = RIAU_BOUNDING_BOX["lat_min"] <= latitude <= RIAU_BOUNDING_BOX["lat_max"]
    lon_ok = RIAU_BOUNDING_BOX["lon_min"] <= longitude <= RIAU_BOUNDING_BOX["lon_max"]
    return lat_ok and lon_ok

def get_riau_subregion(latitude: float, longitude: float) -> str:
    """
    Estimasi pendekatan nama wilayah/kabupaten di Riau berdasarkan kuadran koordinat.
    """
    if not is_point_in_riau(latitude, longitude):
        return "Di luar Wilayah Riau"

    if latitude >= 1.5:
        if longitude <= 101.5:
            return "Kab. Rokan Hilir / Dumai"
        else:
            return "Kab. Bengkalis"
    elif latitude >= 0.5:
        if longitude <= 101.0:
            return "Kab. Rokan Hulu"
        elif longitude <= 102.0:
            return "Kota Pekanbaru / Kab. Siak"
        else:
            return "Kab. Kepulauan Meranti / Siak Timur"
    elif latitude >= -0.2:
        if longitude <= 101.5:
            return "Kab. Kampar"
        else:
            return "Kab. Pelalawan"
    else:
        if longitude <= 102.2:
            return "Kab. Indragiri Hulu"
        else:
            return "Kab. Indragiri Hilir"
