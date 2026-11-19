"""
filter_riau_data.py
Modul untuk memfilter dataset NASA FIRMS (VIIRS 375m) ke dalam wilayah target Provinsi Riau
dan menghasilkan label Ground Truth resmi sesuai spesifikasi PRD v1.1.0.

Bounding Box Wilayah Riau:
  Latitude  : -1.15 s.d. 2.45
  Longitude : 100.00 s.d. 103.85

Formula Ground Truth Resmi:
  Label = 1 (HIGH RISK) jika (FRP >= 15.0 MW) ATAU (brightness - bright_t31 >= 25.0 K)
  Label = 0 (LOW RISK)  jika kondisi lainnya
"""

import os
import csv
import argparse

# Bounding Box resmi Provinsi Riau (PRD Section 1.1)
RIAU_LAT_MIN = -1.15
RIAU_LAT_MAX = 2.45
RIAU_LON_MIN = 100.00
RIAU_LON_MAX = 103.85

REQUIRED_COLUMNS = [
    'latitude',
    'longitude',
    'brightness',
    'scan',
    'track',
    'frp',
    'bright_t31'
]

def is_within_riau(lat: float, lon: float) -> bool:
    """Mengecek apakah koordinat berada di dalam Bounding Box Provinsi Riau."""
    return (RIAU_LAT_MIN <= lat <= RIAU_LAT_MAX) and (RIAU_LON_MIN <= lon <= RIAU_LON_MAX)

def calculate_ground_truth_label(frp: float, brightness: float, bright_t31: float) -> int:
    """
    1 (HIGH RISK) jika FRP >= 15.0 MW ATAU (brightness - bright_t31 >= 25.0 K)
    0 (LOW RISK) untuk lainnya.
    """
    delta_temp = brightness - bright_t31
    if frp >= 15.0 or delta_temp >= 25.0:
        return 1
    return 0

def process_csv(input_path: str, output_path: str):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"File input tidak ditemukan: {input_path}")

    rows_in_riau = []
    total_raw = 0
    high_risk_count = 0
    low_risk_count = 0

    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        # Normalize header keys to lowercase
        field_map = {orig.strip().lower(): orig for orig in reader.fieldnames}

        # Validate required columns
        for col in REQUIRED_COLUMNS:
            if col not in field_map:
                raise ValueError(f"Kolom wajib '{col}' tidak ditemukan di CSV! Kolom yang ada: {list(reader.fieldnames)}")

        for row in reader:
            total_raw += 1
            try:
                lat = float(row[field_map['latitude']])
                lon = float(row[field_map['longitude']])
                brightness = float(row[field_map['brightness']])
                scan = float(row[field_map['scan']])
                track = float(row[field_map['track']])
                frp = float(row[field_map['frp']])
                bright_t31 = float(row[field_map['bright_t31']])
            except (ValueError, KeyError):
                continue

            if is_within_riau(lat, lon):
                delta_t = round(brightness - bright_t31, 2)
                label = calculate_ground_truth_label(frp, brightness, bright_t31)
                risk_category = 'HIGH RISK' if label == 1 else 'LOW RISK'

                if label == 1:
                    high_risk_count += 1
                else:
                    low_risk_count += 1

                new_row = dict(row)
                new_row['latitude'] = lat
                new_row['longitude'] = lon
                new_row['brightness'] = brightness
                new_row['scan'] = scan
                new_row['track'] = track
                new_row['frp'] = frp
                new_row['bright_t31'] = bright_t31
                new_row['delta_t'] = delta_t
                new_row['label'] = label
                new_row['risk_category'] = risk_category
                rows_in_riau.append(new_row)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    if rows_in_riau:
        fieldnames = list(rows_in_riau[0].keys())
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows_in_riau)

    print(f"[*] Total data mentah           : {total_raw}")
    print(f"[*] Total data lolos filter Riau : {len(rows_in_riau)}")
    if rows_in_riau:
        pct_high = (high_risk_count / len(rows_in_riau)) * 100
        pct_low = (low_risk_count / len(rows_in_riau)) * 100
        print(f"    - HIGH RISK (Kelas 1)        : {high_risk_count} ({pct_high:.1f}%)")
        print(f"    - LOW RISK  (Kelas 0)        : {low_risk_count} ({pct_low:.1f}%)")
    print(f"[OK] File hasil filter tersimpan di: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Filter dataset NASA FIRMS untuk Provinsi Riau dan buat Ground Truth")
    parser.add_argument('--input', type=str, required=True, help="Path ke file input CSV NASA FIRMS")
    parser.add_argument('--output', type=str, default='../data/riau_hotspots_labeled.csv', help="Path file output CSV")
    args = parser.parse_args()

    process_csv(args.input, args.output)

if __name__ == '__main__':
    main()
