"""
backend/app/services/geo.py
Layanan Validasi Geografis Nasional, Zona Waktu, dan Wilayah Indonesia
"""

import datetime
from typing import Dict, Any, Tuple
from ..config import INDONESIA_BOUNDING_BOX

def is_point_in_indonesia(latitude: float, longitude: float) -> bool:
    """
    Mengecek apakah koordinat berada di dalam Bounding Box Sabang sampai Merauke.
    Latitude : -11.00 s.d. 6.00
    Longitude: 95.00 s.d. 141.00
    """
    lat_ok = INDONESIA_BOUNDING_BOX["lat_min"] <= latitude <= INDONESIA_BOUNDING_BOX["lat_max"]
    lon_ok = INDONESIA_BOUNDING_BOX["lon_min"] <= longitude <= INDONESIA_BOUNDING_BOX["lon_max"]
    return lat_ok and lon_ok

def get_local_timezone(longitude: float) -> Tuple[str, int]:
    """
    Menghitung zona waktu Indonesia berdasarkan bujur:
    WIB  : < 110° BT (UTC+7)
    WITA : 110° - 125° BT (UTC+8)
    WIT  : >= 125° BT (UTC+9)
    """
    if longitude < 110.0:
        return ("WIB", 7)
    elif longitude < 125.0:
        return ("WITA", 8)
    else:
        return ("WIT", 9)

def format_satellite_timestamp(
    acq_date: str = "",
    acq_time: str = "",
    longitude: float = 101.4478,
    daynight: str = "D"
) -> str:
    """
    Mengonversi tanggal dan jam lintasan satelit (UTC) ke waktu lokal (WIB/WITA/WIT).
    acq_time berformat 4 digit (misal '0320' -> 03:20 UTC).
    """
    tz_label, tz_offset = get_local_timezone(longitude)
    dn_label = "Siang" if daynight == "D" else "Malam"

    if not acq_date:
        now = datetime.datetime.now()
        return f"{now.strftime('%Y-%m-%d %H:%M')} {tz_label} ({dn_label})"

    time_str = str(acq_time).strip().zfill(4)
    try:
        hour_utc = int(time_str[:2])
        minute_utc = int(time_str[2:])
        date_obj = datetime.datetime.strptime(acq_date.strip(), "%Y-%m-%d")
        dt_utc = date_obj.replace(hour=hour_utc, minute=minute_utc)

        # Tambahkan offset zona waktu lokal
        dt_local = dt_utc + datetime.timedelta(hours=tz_offset)
        return f"{dt_local.strftime('%Y-%m-%d %H:%M')} {tz_label} ({dn_label})"
    except Exception:
        return f"{acq_date} {time_str} ({tz_label} / {dn_label})"

def get_indonesia_region(latitude: float, longitude: float) -> str:
    """
    Estimasi pendekatan pulau/provinsi berdasarkan koordinat geografis.
    """
    if not is_point_in_indonesia(latitude, longitude):
        return "Di luar Teritori Indonesia"

    # Sumatera (Lon: 95.0 - 106.0, Lat: -6.0 - 6.0)
    if longitude < 106.0 and latitude > -6.0:
        if latitude > 3.0:
            return "Provinsi Aceh"
        elif latitude > 1.0:
            return "Provinsi Sumatera Utara"
        elif latitude > -0.5:
            if longitude > 100.0 and longitude < 104.0:
                return "Provinsi Riau"
            else:
                return "Provinsi Sumatera Barat"
        elif latitude > -2.5:
            return "Provinsi Jambi"
        elif latitude > -4.5:
            return "Provinsi Sumatera Selatan"
        else:
            return "Provinsi Lampung"

    # Jawa & Bali (Lon: 105.0 - 116.0, Lat: -9.0 - -5.5)
    elif latitude <= -5.5 and longitude <= 116.0:
        if longitude < 107.0:
            return "Provinsi Jawa Barat / DKI Banten"
        elif longitude < 111.0:
            return "Provinsi Jawa Tengah / DIY"
        elif longitude < 114.5:
            return "Provinsi Jawa Timur"
        else:
            return "Provinsi Bali"

    # Kalimantan (Lon: 108.5 - 119.5, Lat: -4.5 - 4.5)
    elif longitude >= 108.5 and longitude <= 119.5 and latitude > -4.5:
        if longitude < 112.5:
            return "Provinsi Kalimantan Barat"
        elif latitude < -1.0:
            if longitude < 115.0:
                return "Provinsi Kalimantan Tengah"
            else:
                return "Provinsi Kalimantan Selatan"
        else:
            if latitude > 2.0:
                return "Provinsi Kalimantan Utara"
            else:
                return "Provinsi Kalimantan Timur"

    # Sulawesi (Lon: 118.5 - 125.5, Lat: -6.0 - 2.5)
    elif longitude >= 118.5 and longitude <= 125.5 and latitude > -6.0:
        if latitude > 0.5:
            return "Provinsi Sulawesi Utara / Gorontalo"
        elif latitude > -2.0:
            return "Provinsi Sulawesi Tengah"
        elif longitude < 120.5:
            return "Provinsi Sulawesi Selatan / Barat"
        else:
            return "Provinsi Sulawesi Tenggara"

    # Nusa Tenggara (Lon: 116.0 - 125.5, Lat: -11.0 - -8.0)
    elif longitude >= 116.0 and longitude <= 125.5 and latitude <= -8.0:
        if longitude < 119.5:
            return "Provinsi Nusa Tenggara Barat"
        else:
            return "Provinsi Nusa Tenggara Timur"

    # Maluku (Lon: 125.5 - 132.0, Lat: -9.0 - 3.0)
    elif longitude >= 125.5 and longitude < 132.0:
        if latitude > -1.0:
            return "Provinsi Maluku Utara"
        else:
            return "Provinsi Maluku"

    # Papua (Lon: >= 132.0)
    else:
        if latitude > -2.5:
            return "Provinsi Papua / Papua Barat"
        elif latitude > -5.0:
            return "Provinsi Papua Tengah / Pegunungan"
        else:
            return "Provinsi Papua Selatan (Merauke)"
