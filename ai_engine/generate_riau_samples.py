import os
import csv
import random
import argparse

def generate_samples_dict(n_samples: int = 1000, seed: int = 42):
    random.seed(seed)
    rows = []

    n_in = int(n_samples * 0.90)

    for i in range(n_samples):
        if i < n_in:
            lat = round(random.uniform(-1.0, 2.3), 5)
            lon = round(random.uniform(100.2, 103.6), 5)
        else:
            lat = round(random.uniform(2.5, 4.5), 5)
            lon = round(random.uniform(96.0, 99.5), 5)

        brightness = round(min(500.0, max(300.0, random.gauss(330.0, 25.0))), 2)
        scan = round(random.uniform(0.32, 0.75), 2)
        track = round(random.uniform(0.36, 0.78), 2)
        bright_t31 = round(min(325.0, max(280.0, random.gauss(298.0, 8.0))), 2)

        frp_raw = random.expovariate(1.0 / 12.0)
        frp = round(min(450.0, max(0.5, frp_raw)), 2)

        confidence = random.choice(['nominal', 'low', 'high'])
        acq_date = random.choice(['2024-06-15', '2024-07-20', '2024-08-10', '2024-09-02'])
        acq_time = random.randint(100, 2359)
        daynight = random.choice(['D', 'N'])

        rows.append({
            'latitude': lat,
            'longitude': lon,
            'brightness': brightness,
            'scan': scan,
            'track': track,
            'acq_date': acq_date,
            'acq_time': acq_time,
            'satellite': 'N',
            'confidence': confidence,
            'version': '2.0NRT',
            'bright_t31': bright_t31,
            'frp': frp,
            'daynight': daynight
        })
    return rows

def save_to_csv(rows, output_path: str):
    if not rows:
        return
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    fieldnames = list(rows[0].keys())
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Generate synthetic NASA FIRMS dataset for local dev")
    parser.add_argument('--count', type=int, default=800, help="Jumlah baris data")
    parser.add_argument('--output', type=str, default='../data/sample_firms_viirs.csv', help="Path output file")
    args = parser.parse_args()

    data = generate_samples_dict(n_samples=args.count)
    save_to_csv(data, args.output)
    print(f"[OK] Berhasil menghasilkan {len(data)} baris data sampel NASA FIRMS di: {args.output}")
