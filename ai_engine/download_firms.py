import os
import argparse
import urllib.request

def download_firms_data(map_key: str, source: str = "VIIRS_SNPP_NRT", days: int = 10, output_path: str = "../data/firms_real_indonesia.csv"):
    url = f"https://firms.modaps.eosdis.nasa.gov/api/country/csv/{map_key}/{source}/IDN/{days}"
    print(f"[*] Menghubungi NASA FIRMS API...")
    print(f"[*] URL Sumber: https://firms.modaps.eosdis.nasa.gov/api/country/csv/[MAP_KEY]/{source}/IDN/{days}")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)

    try:
        with urllib.request.urlopen(req, timeout=30) as response, open(output_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"[OK] Berhasil mengunduh data riil ({len(data)} bytes) ke: {output_path}")
            print(f"[*] Langkah berikutnya: jalankan filter spasial Riau:")
            print(f"    python ai_engine/filter_riau_data.py --input {output_path} --output ../data/riau_hotspots_labeled.csv")
    except Exception as e:
        print(f"[ERROR] Gagal mengunduh: {e}")
        print("💡 Catatan: Jika API Key belum aktif atau ada pembatasan koneksi, Anda dapat mengunduh file CSV langsung via web browser di:")
        print("   https://firms.modaps.eosdis.nasa.gov/download/")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download Real NASA FIRMS Active Fire Data for Indonesia")
    parser.add_argument("--key", type=str, required=True, help="NASA FIRMS MAP_KEY Anda")
    parser.add_argument("--source", type=str, default="VIIRS_SNPP_NRT", help="Sumber sensor (default: VIIRS_SNPP_NRT)")
    parser.add_argument("--days", type=int, default=10, help="Jumlah hari ke belakang (1 s.d. 10)")
    parser.add_argument("--output", type=str, default="../data/firms_real_indonesia.csv", help="Path penyimpanan CSV")
    args = parser.parse_args()

    download_firms_data(args.key, args.source, args.days, args.output)
