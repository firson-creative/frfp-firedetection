import os
import json
import datetime
from typing import Dict, Any, Tuple, Optional
from ..config import INDONESIA_BOUNDING_BOX

_SPATIAL_INITIALIZED = False
_TREE = None
_GEOMS = []
_PROPS = []

BAKOSURTANAL_TO_PROVINCE = {
    "DI. ACEH": "Provinsi Aceh",
    "SUMATERA UTARA": "Provinsi Sumatera Utara",
    "SUMATERA BARAT": "Provinsi Sumatera Barat",
    "RIAU": "Provinsi Riau",
    "KEPULAUAN RIAU": "Provinsi Kepulauan Riau",
    "JAMBI": "Provinsi Jambi",
    "SUMATERA SELATAN": "Provinsi Sumatera Selatan",
    "BANGKA BELITUNG": "Provinsi Kep. Bangka Belitung",
    "BENGKULU": "Provinsi Bengkulu",
    "LAMPUNG": "Provinsi Lampung",
    "DKI JAKARTA": "Provinsi DKI Jakarta",
    "BANTEN": "Provinsi Banten",
    "JAWA BARAT": "Provinsi Jawa Barat",
    "JAWA TENGAH": "Provinsi Jawa Tengah",
    "DAERAH ISTIMEWA YOGYAKARTA": "Provinsi D.I. Yogyakarta",
    "JAWA TIMUR": "Provinsi Jawa Timur",
    "BALI": "Provinsi Bali",
    "NUSATENGGARA BARAT": "Provinsi Nusa Tenggara Barat",
    "NUSA TENGGARA TIMUR": "Provinsi Nusa Tenggara Timur",
    "KALIMANTAN BARAT": "Provinsi Kalimantan Barat",
    "KALIMANTAN TENGAH": "Provinsi Kalimantan Tengah",
    "KALIMANTAN SELATAN": "Provinsi Kalimantan Selatan",
    "KALIMANTAN TIMUR": "Provinsi Kalimantan Timur",
    "KALIMANTAN UTARA": "Provinsi Kalimantan Utara",
    "SULAWESI UTARA": "Provinsi Sulawesi Utara",
    "GORONTALO": "Provinsi Gorontalo",
    "SULAWESI TENGAH": "Provinsi Sulawesi Tengah",
    "SULAWESI BARAT": "Provinsi Sulawesi Barat",
    "SULAWESI SELATAN": "Provinsi Sulawesi Selatan",
    "SULAWESI TENGGARA": "Provinsi Sulawesi Tenggara",
    "MALUKU": "Provinsi Maluku",
    "MALUKU UTARA": "Provinsi Maluku Utara",
    "PAPUA": "Provinsi Papua",
    "PAPUA BARAT": "Provinsi Papua Barat"
}

def _init_spatial_engine():
    global _SPATIAL_INITIALIZED, _TREE, _GEOMS, _PROPS
    if _SPATIAL_INITIALIZED:
        return

    try:
        from shapely.geometry import shape
        from shapely.strtree import STRtree

        candidate_paths = [
            os.path.abspath("data/indonesia-prov.geojson"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "data", "indonesia-prov.geojson"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "indonesia-prov.geojson"),
        ]

        target_file = None
        for p in candidate_paths:
            if os.path.exists(p):
                target_file = p
                break

        if target_file:
            with open(target_file, "r", encoding="utf-8") as f:
                geojson_data = json.load(f)

            _GEOMS = [shape(feat["geometry"]) for feat in geojson_data.get("features", [])]
            _PROPS = [feat.get("properties", {}) for feat in geojson_data.get("features", [])]
            _TREE = STRtree(_GEOMS)
            _SPATIAL_INITIALIZED = True
    except Exception as e:
        print(f"[WARN] Inisialisasi Spatial Landmask gagal: {e}")
        _SPATIAL_INITIALIZED = False

_init_spatial_engine()

def is_point_in_indonesia(latitude: float, longitude: float) -> bool:
    lat_ok = INDONESIA_BOUNDING_BOX["lat_min"] <= latitude <= INDONESIA_BOUNDING_BOX["lat_max"]
    lon_ok = INDONESIA_BOUNDING_BOX["lon_min"] <= longitude <= INDONESIA_BOUNDING_BOX["lon_max"]
    return lat_ok and lon_ok

def is_point_on_indonesia_land(latitude: float, longitude: float, coastal_tolerance_deg: float = 0.018) -> bool:
    if not is_point_in_indonesia(latitude, longitude):
        return False

    _init_spatial_engine()
    if _SPATIAL_INITIALIZED and _TREE is not None and len(_GEOMS) > 0:
        from shapely.geometry import Point
        pt = Point(longitude, latitude)

        candidates = _TREE.query(pt)
        for idx in candidates:
            if _GEOMS[idx].contains(pt):
                return True

        min_dist = min(_GEOMS[idx].distance(pt) for idx in range(len(_GEOMS)))
        return min_dist <= coastal_tolerance_deg

    if -4.5 <= latitude <= 0.5 and 117.5 < longitude < 118.6:
        return False
    if -5.5 <= latitude <= -4.0 and 108.0 <= longitude <= 114.0:
        return False
    if -4.8 <= latitude <= -3.0 and 120.6 <= longitude <= 121.2:
        return False

    return True

def get_local_timezone(longitude: float) -> Tuple[str, int]:
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

        dt_local = dt_utc + datetime.timedelta(hours=tz_offset)
        return f"{dt_local.strftime('%Y-%m-%d %H:%M')} {tz_label} ({dn_label})"
    except Exception:
        return f"{acq_date} {time_str} ({tz_label} / {dn_label})"

def get_indonesia_region(latitude: float, longitude: float) -> str:
    if not is_point_in_indonesia(latitude, longitude):
        return "Di luar Teritori Indonesia"

    _init_spatial_engine()
    if _SPATIAL_INITIALIZED and _TREE is not None and len(_GEOMS) > 0:
        from shapely.geometry import Point
        pt = Point(longitude, latitude)

        detected_raw = None
        candidates = _TREE.query(pt)
        for idx in candidates:
            if _GEOMS[idx].contains(pt):
                detected_raw = _PROPS[idx].get("Propinsi")
                break

        if not detected_raw:
            min_idx = min(range(len(_GEOMS)), key=lambda i: _GEOMS[i].distance(pt))
            if _GEOMS[min_idx].distance(pt) <= 0.018:
                detected_raw = _PROPS[min_idx].get("Propinsi")

        if detected_raw:
            prov_name = BAKOSURTANAL_TO_PROVINCE.get(detected_raw, f"Provinsi {detected_raw}")

            if detected_raw == "PAPUA":
                if latitude <= -5.0:
                    return "Provinsi Papua Selatan (Merauke)"
                elif -5.0 < latitude <= -3.0 and longitude < 138.2:
                    return "Provinsi Papua Tengah"
                elif -5.0 < latitude <= -3.0 and longitude >= 138.2:
                    return "Provinsi Papua Pegunungan"
                else:
                    return "Provinsi Papua"
            elif detected_raw == "PAPUA BARAT":
                if longitude <= 132.5:
                    return "Provinsi Papua Barat Daya"
                else:
                    return "Provinsi Papua Barat"

            return prov_name

    if longitude >= 118.6 and longitude <= 126.0 and -6.0 <= latitude <= 4.0:
        if latitude > 1.2 and longitude >= 123.5:
            return "Provinsi Sulawesi Utara"
        elif latitude > 0.2 and longitude <= 123.5:
            return "Provinsi Gorontalo"
        elif -2.0 <= latitude <= 1.5 and longitude <= 124.0:
            return "Provinsi Sulawesi Tengah"
        elif -3.6 <= latitude <= -0.8 and longitude <= 119.8:
            return "Provinsi Sulawesi Barat"
        elif latitude <= -2.5 and longitude >= 121.0:
            return "Provinsi Sulawesi Tenggara"
        else:
            return "Provinsi Sulawesi Selatan"

    elif 108.5 <= longitude <= 117.5 and -4.5 <= latitude <= 4.5:
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

    elif longitude < 106.0 and latitude > -6.0:
        if latitude > 3.0:
            return "Provinsi Aceh"
        elif latitude > 1.0:
            return "Provinsi Sumatera Utara"
        elif latitude > -0.5:
            if 100.0 <= longitude <= 104.0:
                return "Provinsi Riau"
            else:
                return "Provinsi Sumatera Barat"
        elif latitude > -2.5:
            return "Provinsi Jambi"
        elif latitude > -4.5:
            return "Provinsi Sumatera Selatan"
        else:
            return "Provinsi Lampung"

    elif latitude <= -5.5 and longitude <= 116.0:
        if longitude < 107.0:
            return "Provinsi Jawa Barat"
        elif longitude < 111.0:
            return "Provinsi Jawa Tengah"
        elif longitude < 114.5:
            return "Provinsi Jawa Timur"
        else:
            return "Provinsi Bali"

    elif longitude >= 116.0 and longitude <= 125.5 and latitude <= -8.0:
        if longitude < 119.5:
            return "Provinsi Nusa Tenggara Barat"
        else:
            return "Provinsi Nusa Tenggara Timur"

    elif 125.5 <= longitude < 132.0:
        if latitude > -1.0:
            return "Provinsi Maluku Utara"
        else:
            return "Provinsi Maluku"

    elif longitude >= 132.0:
        if latitude <= -5.0:
            return "Provinsi Papua Selatan (Merauke)"
        elif -5.0 < latitude <= -3.0:
            return "Provinsi Papua Tengah"
        elif longitude <= 133.5:
            return "Provinsi Papua Barat"
        else:
            return "Provinsi Papua"

    return "Laut / Perairan Lepas"

def get_indonesia_subregion(latitude: float, longitude: float, province: str = "") -> str:
    prov = province or get_indonesia_region(latitude, longitude)
    if prov == "Laut / Perairan Lepas" or "Luar" in prov:
        return "Perairan Lepas"

    if "Sulawesi Barat" in prov:
        if latitude <= -3.3:
            return "Kab. Polewali Mandar"
        elif -3.3 < latitude <= -2.9 and longitude <= 119.15:
            return "Kab. Majene"
        elif -3.3 < latitude <= -2.6 and longitude > 119.15:
            return "Kab. Mamasa"
        elif -2.9 < latitude <= -2.2:
            return "Kab. Mamuju"
        elif -2.2 < latitude <= -1.7:
            return "Kab. Mamuju Tengah"
        else:
            return "Kab. Pasangkayu"

    elif "Sulawesi Selatan" in prov:
        if latitude >= -2.7 and longitude >= 120.8:
            return "Kab. Luwu Timur"
        elif latitude >= -2.7:
            return "Kab. Luwu Utara"
        elif -3.3 <= latitude <= -2.7:
            if longitude <= 120.0:
                return "Kab. Tana Toraja"
            else:
                return "Kota Palopo"
        elif -3.6 <= latitude <= -3.3:
            if longitude <= 119.75:
                return "Kab. Pinrang"
            else:
                return "Kab. Enrekang"
        elif -4.0 <= latitude <= -3.6:
            if longitude <= 119.7:
                return "Kota Parepare"
            elif longitude <= 120.1:
                return "Kab. Sidenreng Rappang"
            else:
                return "Kab. Wajo"
        elif -4.5 <= latitude <= -4.0:
            if longitude <= 119.75:
                return "Kab. Barru"
            elif longitude <= 120.1:
                return "Kab. Soppeng"
            else:
                return "Kab. Bone"
        elif -5.0 <= latitude <= -4.5:
            if longitude <= 119.65:
                return "Kab. Pangkajene dan Kepulauan"
            else:
                return "Kab. Bone"
        elif -5.3 <= latitude <= -5.0:
            if longitude <= 119.5:
                return "Kota Makassar"
            else:
                return "Kab. Maros"
        elif latitude <= -5.3:
            if longitude <= 119.5:
                return "Kab. Takalar"
            elif longitude <= 119.8:
                return "Kab. Gowa"
            elif longitude <= 120.1:
                return "Kab. Jeneponto"
            elif longitude <= 120.35:
                return "Kab. Bantaeng"
            else:
                return "Kab. Bulukumba"
        else:
            return "Kab. Luwu"

    elif "Sulawesi Tengah" in prov:
        if latitude <= -1.8 and longitude >= 121.2:
            return "Kab. Morowali"
        elif longitude >= 122.0:
            return "Kab. Banggai"
        elif latitude >= 0.5:
            return "Kab. Tolitoli"
        elif -1.0 <= latitude <= 0.0 and longitude <= 120.2:
            return "Kab. Donggala"
        elif -1.1 <= latitude <= -0.8 and 119.8 <= longitude <= 120.0:
            return "Kota Palu"
        elif -1.5 <= latitude <= -1.0 and longitude <= 120.2:
            return "Kab. Sigi"
        else:
            return "Kab. Poso"

    elif "Sulawesi Tenggara" in prov:
        if latitude <= -4.8:
            return "Kab. Buton"
        elif latitude <= -4.2 and longitude <= 122.0:
            return "Kab. Bombana"
        elif longitude <= 121.8:
            return "Kab. Kolaka"
        elif -4.1 <= latitude <= -3.8 and longitude >= 122.4:
            return "Kota Kendari"
        else:
            return "Kab. Konawe"

    elif "Kalimantan Selatan" in prov:
        if longitude >= 115.8:
            return "Kab. Kotabaru"
        elif latitude <= -3.4 and longitude >= 115.3:
            return "Kab. Tanah Bumbu"
        elif latitude <= -3.5:
            return "Kab. Tanah Laut"
        elif -3.5 <= latitude <= -3.0:
            return "Kab. Banjar"
        elif latitude >= -2.4:
            return "Kab. Tabalong"
        else:
            return "Kab. Tapin"

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

    elif "Riau" in prov and "Kepulauan" not in prov:
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
        elif 0.4 <= latitude <= 0.7 and 101.35 <= longitude <= 101.55:
            return "Kota Pekanbaru"
        else:
            return "Kab. Siak"

    elif "Papua Selatan" in prov:
        if latitude <= -6.8:
            return "Kab. Merauke"
        elif longitude <= 139.2:
            return "Kab. Asmat"
        elif latitude >= -6.0 and longitude >= 140.0:
            return "Kab. Boven Digoel"
        else:
            return "Kab. Mappi"

    elif "Papua" in prov:
        if longitude <= 134.5:
            return "Kab. Manokwari"
        elif -5.0 <= latitude <= -3.5 and longitude <= 137.5:
            return "Kab. Mimika"
        elif longitude >= 139.5:
            return "Kota Jayapura"
        else:
            return "Kab. Nabire"

    elif "Sumatera Selatan" in prov:
        if longitude >= 104.8 and latitude <= -3.0:
            return "Kab. Ogan Komering Ilir"
        elif latitude >= -3.0 and longitude >= 104.2:
            return "Kab. Banyuasin"
        elif latitude >= -3.0:
            return "Kab. Musi Banyuasin"
        else:
            return "Kab. Muara Enim"

    elif "Jambi" in prov:
        if longitude >= 103.5 and latitude <= -1.4:
            return "Kab. Muaro Jambi"
        elif latitude >= -1.4 and longitude >= 103.6:
            return "Kab. Tanjung Jabung Timur"
        elif latitude >= -1.4 and longitude < 103.6:
            return "Kab. Tanjung Jabung Barat"
        else:
            return "Kab. Tebo"

    clean_prov = prov.replace("Provinsi ", "").replace(" (Merauke)", "")
    return f"Kabupaten Wilayah {clean_prov}"
