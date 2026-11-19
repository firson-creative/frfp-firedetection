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

def get_indonesia_subregion(latitude: float, longitude: float, province: str = "") -> str:
    """
    Estimasi pendekatan Kabupaten / Kota berdasarkan koordinat geografis dan provinsi.
    """
    if not is_point_in_indonesia(latitude, longitude):
        return "Luar Wilayah"

    prov = province or get_indonesia_region(latitude, longitude)

    # Riau
    if "Riau" in prov and "Kepulauan" not in prov:
        if latitude >= 1.5 and longitude <= 101.6:
            return "Kota Dumai"
        elif latitude >= 1.5 and longitude <= 101.2:
            return "Kab. Rokan Hilir"
        elif latitude >= 0.9 and longitude >= 101.5:
            return "Kab. Bengkalis"
        elif 0.5 <= latitude <= 1.4 and 101.4 <= longitude <= 102.4:
            return "Kab. Siak"
        elif -0.2 <= latitude <= 0.7 and 101.6 <= longitude <= 103.2:
            return "Kab. Pelalawan"
        elif -0.5 <= latitude <= 0.6 and longitude <= 101.5:
            return "Kab. Kampar"
        elif -1.0 <= latitude <= 0.0 and longitude >= 102.7:
            return "Kab. Indragiri Hilir"
        elif -0.8 <= latitude <= 0.0 and 101.8 <= longitude <= 102.7:
            return "Kab. Indragiri Hulu"
        elif 0.8 <= latitude <= 1.5 and longitude >= 102.4:
            return "Kab. Kepulauan Meranti"
        else:
            return "Kab. Siak"

    # Kalimantan Tengah
    elif "Kalimantan Tengah" in prov:
        if -3.5 <= latitude <= -1.8 and 113.8 <= longitude <= 114.6:
            return "Kab. Pulang Pisau"
        elif -3.5 <= latitude <= -1.0 and 114.2 <= longitude <= 115.0:
            return "Kab. Kapuas"
        elif -2.5 <= latitude <= -1.8 and 113.6 <= longitude <= 114.1:
            return "Kota Palangka Raya"
        elif -3.2 <= latitude <= -1.5 and 112.5 <= longitude <= 113.5:
            return "Kab. Kotawaringin Timur"
        elif -3.0 <= latitude <= -1.5 and 111.4 <= longitude <= 112.3:
            return "Kab. Kotawaringin Barat"
        elif -3.0 <= latitude <= -1.0 and 113.2 <= longitude <= 113.9:
            return "Kab. Katingan"
        else:
            return "Kab. Pulang Pisau"

    # Kalimantan Barat
    elif "Kalimantan Barat" in prov:
        if latitude <= -1.0:
            return "Kab. Ketapang"
        elif -1.0 <= latitude <= 0.2 and 109.1 <= longitude <= 109.9:
            return "Kab. Kubu Raya"
        elif latitude >= 0.8:
            return "Kab. Sambas"
        elif longitude >= 111.8:
            return "Kab. Sintang"
        else:
            return "Kab. Kubu Raya"

    # Kalimantan Selatan
    elif "Kalimantan Selatan" in prov:
        if longitude >= 115.6:
            return "Kab. Kotabaru"
        elif latitude <= -3.5:
            return "Kab. Tanah Laut"
        elif -3.8 <= latitude <= -3.0 and longitude >= 115.3:
            return "Kab. Tanah Bumbu"
        else:
            return "Kab. Banjar"

    # Kalimantan Timur
    elif "Kalimantan Timur" in prov:
        if latitude >= 1.5:
            return "Kab. Berau"
        elif longitude >= 117.0:
            return "Kab. Kutai Timur"
        elif -1.5 <= latitude <= -0.5:
            return "Kab. Penajam Paser Utara"
        else:
            return "Kab. Kutai Kartanegara"

    # Papua Selatan
    elif "Papua Selatan" in prov:
        if latitude <= -6.8:
            return "Kab. Merauke"
        elif longitude <= 139.2:
            return "Kab. Asmat"
        elif latitude >= -6.0 and longitude >= 140.0:
            return "Kab. Boven Digoel"
        else:
            return "Kab. Mappi"

    # Papua / Papua Barat / Tengah / Pegunungan
    elif "Papua" in prov:
        if longitude <= 134.5:
            return "Kab. Manokwari"
        elif -5.0 <= latitude <= -3.5 and longitude <= 137.5:
            return "Kab. Mimika"
        elif longitude >= 139.5:
            return "Kota Jayapura"
        else:
            return "Kab. Nabire"

    # Sumatera Selatan
    elif "Sumatera Selatan" in prov:
        if longitude >= 104.8 and latitude <= -3.0:
            return "Kab. Ogan Komering Ilir"
        elif latitude >= -3.0 and longitude >= 104.2:
            return "Kab. Banyuasin"
        elif latitude >= -3.0:
            return "Kab. Musi Banyuasin"
        else:
            return "Kab. Muara Enim"

    # Jambi
    elif "Jambi" in prov:
        if longitude >= 103.5 and latitude <= -1.4:
            return "Kab. Muaro Jambi"
        elif latitude >= -1.4 and longitude >= 103.6:
            return "Kab. Tanjung Jabung Timur"
        elif latitude >= -1.4 and longitude < 103.6:
            return "Kab. Tanjung Jabung Barat"
        else:
            return "Kab. Tebo"

    # Sulawesi Tenggara
    elif "Sulawesi Tenggara" in prov:
        if latitude <= -4.8:
            return "Kab. Buton"
        elif latitude <= -4.2 and longitude <= 122.0:
            return "Kab. Bombana"
        elif longitude <= 121.8:
            return "Kab. Kolaka"
        else:
            return "Kab. Konawe"

    # Sulawesi Tengah
    elif "Sulawesi Tengah" in prov:
        if latitude <= -1.8 and longitude >= 121.2:
            return "Kab. Morowali"
        elif longitude >= 122.0:
            return "Kab. Banggai"
        elif latitude >= 0.5:
            return "Kab. Tolitoli"
        else:
            return "Kab. Poso"

    # Sulawesi Selatan / Barat
    elif "Sulawesi" in prov:
        if latitude <= -4.8:
            return "Kab. Gowa"
        elif -3.5 <= latitude <= -2.0 and longitude >= 120.8:
            return "Kab. Luwu Timur"
        elif -4.5 <= latitude <= -3.5 and longitude >= 120.0:
            return "Kab. Bone"
        else:
            return "Kab. Luwu Utara"

    # Default fallback
    return f"Kabupaten Wilayah {prov.replace('Provinsi ', '')}"

