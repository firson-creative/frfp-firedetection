import os
import csv
import argparse
import time

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
    return (RIAU_LAT_MIN <= lat <= RIAU_LAT_MAX) and (RIAU_LON_MIN <= lon <= RIAU_LON_MAX)

def calculate_ground_truth_label(frp: float, brightness: float, bright_t31: float) -> int:
    delta_temp = brightness - bright_t31
    if frp >= 15.0 or delta_temp >= 25.0:
        return 1
    return 0

def process_csv_streaming(input_path: str, output_path: str):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"File input tidak ditemukan: {input_path}")

    start_time = time.time()
    total_raw = 0
    riau_count = 0
    high_risk_count = 0
    low_risk_count = 0

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    with open(input_path, 'r', encoding='utf-8', errors='ignore') as infile:
        reader = csv.DictReader(infile)
        if not reader.fieldnames:
            raise ValueError("CSV tidak memiliki header valid.")

        field_map = {orig.strip().lower(): orig for orig in reader.fieldnames}

        for col in REQUIRED_COLUMNS:
            if col not in field_map:
                raise ValueError(f"Kolom wajib '{col}' tidak ditemukan di CSV! Kolom yang ada: {list(reader.fieldnames)}")

        out_fields = list(reader.fieldnames)
        for extra in ['delta_t', 'label', 'risk_category']:
            if extra not in out_fields:
                out_fields.append(extra)

        with open(output_path, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=out_fields)
            writer.writeheader()

            for row in reader:
                total_raw += 1

                if total_raw % 500000 == 0:
                    elapsed = time.time() - start_time
                    print(f"[*] Dipindai: {total_raw:,} baris ({elapsed:.1f}s) | Titik lolos di Riau: {riau_count:,}")

                try:
                    lat = float(row[field_map['latitude']])
                    lon = float(row[field_map['longitude']])
                    brightness = float(row[field_map['brightness']])
                    scan = float(row[field_map['scan']])
                    track = float(row[field_map['track']])
                    frp = float(row[field_map['frp']])
                    bright_t31 = float(row[field_map['bright_t31']])
                except (ValueError, KeyError, TypeError):
                    continue

                if is_within_riau(lat, lon):
                    riau_count += 1
                    delta_t = round(brightness - bright_t31, 2)
                    label = calculate_ground_truth_label(frp, brightness, bright_t31)
                    risk_category = 'HIGH RISK' if label == 1 else 'LOW RISK'

                    if label == 1:
                        high_risk_count += 1
                    else:
                        low_risk_count += 1

                    row['delta_t'] = delta_t
                    row['label'] = label
                    row['risk_category'] = risk_category
                    writer.writerow(row)

    total_time = time.time() - start_time
    print("\n" + "="*50)
    print("HASIL PENYARINGAN SPASIAL PROVINSI RIAU:")
    print("="*50)
    print(f"Total baris mentah dianalisis : {total_raw:,}")
    print(f"Total titik lolos wilayah Riau: {riau_count:,}")
    if riau_count > 0:
        pct_high = (high_risk_count / riau_count) * 100
        pct_low = (low_risk_count / riau_count) * 100
        print(f"  - HIGH RISK (Kelas 1)       : {high_risk_count:,} ({pct_high:.2f}%)")
        print(f"  - LOW RISK  (Kelas 0)       : {low_risk_count:,} ({pct_low:.2f}%)")
    print(f"Waktu pemrosesan              : {total_time:.2f} detik")
    print(f"File hasil filter disimpan di : {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Filter dataset NASA FIRMS untuk Provinsi Riau dan buat Ground Truth")
    parser.add_argument('--input', type=str, required=True, help="Path ke file input CSV NASA FIRMS")
    parser.add_argument('--output', type=str, default='../data/riau_hotspots_labeled.csv', help="Path file output CSV")
    args = parser.parse_args()

    process_csv_streaming(args.input, args.output)

if __name__ == '__main__':
    main()
