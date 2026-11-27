# Penjelasan Baris per Baris Kode `ai_engine/train_ann.py`

Dokumen ini menjelaskan setiap baris kode pada skrip pelatihan model JST (`ANN-MLP`) di [`ai_engine/train_ann.py`](../ai_engine/train_ann.py) yang menghasilkan artefak `ann_model_riau.pkl` dan `scaler_riau.pkl`.

> **Catatan:** Baris kosong yang hanya berfungsi sebagai pemisah blok tidak dimasukkan ke tabel agar lebih ringkas dibaca.

| Baris | Kode Program | Penjelasan |
| :---: | :--- | :--- |
| 1 | ``import os`` | Mengimpor modul `os` untuk operasi sistem file dan manajemen path direktori. |
| 2 | ``import argparse`` | Mengimpor modul `argparse` untuk membaca argumen baris perintah (`--data`, `--output`). |
| 3 | ``import time`` | Mengimpor modul `time` untuk mengukur total durasi proses pelatihan. |
| 4 | ``import joblib`` | Mengimpor `joblib` untuk menyimpan objek model JST dan scaler ke file biner `.pkl`. |
| 5 | ``import pandas as pd`` | Mengimpor `pandas` untuk membaca dan memanipulasi data CSV dalam bentuk `DataFrame`. |
| 6 | ``import numpy as np`` | Mengimpor `numpy` (tersedia untuk operasi array numerik). |
| 7 | ``from sklearn.model_selection import train_test_split`` | Mengimpor fungsi pembagi dataset menjadi data latih (*train*) dan data uji (*test*). |
| 8 | ``from sklearn.preprocessing import MinMaxScaler`` | Mengimpor scaler untuk menormalisasi seluruh fitur numerik ke rentang `[0, 1]`. |
| 9 | ``from sklearn.neural_network import MLPClassifier`` | Mengimpor kelas Jaringan Syaraf Tiruan (*Multi-Layer Perceptron*) dari `scikit-learn`. |
| 10 | ``from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report`` | Mengimpor metrik evaluasi klasifikasi biner untuk mengukur performa model pada data uji. |
| 12 | ``FEATURE_COLS = [`` | Memulai daftar konstanta nama kolom fitur input yang wajib ada dan urutannya harus konsisten. |
| 13 | ``    'latitude',`` | Fitur ke-1: koordinat garis lintang titik panas (derajat). |
| 14 | ``    'longitude',`` | Fitur ke-2: koordinat garis bujur titik panas (derajat). |
| 15 | ``    'brightness',`` | Fitur ke-3: suhu kecerahan kanal inframerah I-4 satelit VIIRS (Kelvin). |
| 16 | ``    'scan',`` | Fitur ke-4: lebar resolusi piksel satelit pada arah pemindaian (*scan*, km). |
| 17 | ``    'track',`` | Fitur ke-5: panjang resolusi piksel satelit pada arah lintasan orbit (*track*, km). |
| 18 | ``    'frp',`` | Fitur ke-6: *Fire Radiative Power*, daya radiasi panas kebakaran (Megawatt/MW). |
| 19 | ``    'bright_t31'`` | Fitur ke-7: suhu kecerahan latar belakang kanal I-5 (Kelvin). |
| 20 | ``]`` | Menutup daftar 7 fitur masukan untuk layer input JST (`7` neuron). |
| 22 | ``def train_and_evaluate(csv_path: str, output_dir: str = "./artifacts"):`` | Mendefinisikan fungsi utama pelatihan, evaluasi, dan penyimpanan model dengan parameter path CSV dan folder output. |
| 23 | ``    start_time = time.time()`` | Mencatat waktu mulai eksekusi fungsi dalam detik (epoch timestamp). |
| 24 | ``    print(f"[*] Memuat data berlabel riil Riau dari: {csv_path}")`` | Menampilkan pesan status lokasi file dataset yang sedang dibaca. |
| 26 | ``    df = pd.read_csv(csv_path)`` | Membaca file CSV dataset berlabel menjadi tabel `DataFrame` pandas (`df`). |
| 28 | ``    for col in FEATURE_COLS:`` | Melakukan iterasi pada setiap nama kolom fitur di `FEATURE_COLS`. |
| 29 | ``        if col not in df.columns:`` | Memeriksa apakah kolom fitur tersebut tersedia pada header CSV. |
| 30 | ``            raise ValueError(f"Kolom fitur '{col}' tidak ditemukan dalam dataset!")`` | Menghentikan program dengan pesan error jika ada salah satu dari 7 kolom fitur yang hilang. |
| 31 | ``    if 'label' not in df.columns:`` | Memeriksa ketersediaan kolom target `label` (`0` = Low Risk, `1` = High Risk). |
| 32 | ``        raise ValueError("Kolom 'label' (0 / 1) tidak ditemukan dalam dataset!")`` | Menghentikan program dengan pesan error jika kolom `label` tidak ditemukan. |
| 34 | ``    df = df.dropna(subset=FEATURE_COLS + ['label'])`` | Menghapus baris yang memiliki nilai kosong (`NaN`) pada kolom fitur maupun kolom `label`. |
| 36 | ``    X = df[FEATURE_COLS].values`` | Mengekstrak matriks fitur input `X` berbentuk `(jumlah_baris, 7)` sebagai array NumPy. |
| 37 | ``    y = df['label'].values.astype(int)`` | Mengekstrak vektor target `y` dan memastikan tipenya integer (`0` atau `1`). |
| 39 | ``    total_records = len(df)`` | Menghitung total jumlah baris data bersih yang siap digunakan. |
| 40 | ``    high_risk_count = int((y == 1).sum())`` | Menghitung jumlah data berlabel `1` (`HIGH RISK`). |
| 41 | ``    low_risk_count = int((y == 0).sum())`` | Menghitung jumlah data berlabel `0` (`LOW RISK`). |
| 43 | ``    print(f"[*] Total dataset riil Riau: {total_records:,} baris")`` | Mencetak total jumlah baris dataset ke terminal dengan pemisah ribuan. |
| 44 | ``    print(f"[*] Proporsi kelas:")`` | Mencetak judul informasi distribusi kelas target. |
| 45 | ``    print(f"    - HIGH RISK (1): {high_risk_count:,} ({high_risk_count / total_records * 100:.2f}%)")`` | Menampilkan jumlah dan persentase data kelas `HIGH RISK (1)`. |
| 46 | ``    print(f"    - LOW RISK  (0): {low_risk_count:,} ({low_risk_count / total_records * 100:.2f}%)")`` | Menampilkan jumlah dan persentase data kelas `LOW RISK (0)`. |
| 48 | ``    print("[*] Melakukan Stratified Train-Test Split (80% Train, 20% Test)...")`` | Memberi informasi bahwa pembagian data latih dan uji sedang dilakukan. |
| 49 | ``    X_train, X_test, y_train, y_test = train_test_split(`` | Memanggil fungsi `train_test_split` untuk membagi `X` dan `y` menjadi set latih dan set uji. |
| 50 | ``        X, y, test_size=0.20, random_state=42, stratify=y`` | Menetapkan proporsi uji 20% (latih 80%), seed acak tetap `42` agar reprodusibel, dan `stratify=y` agar rasio kelas tetap seimbang. |
| 51 | ``    )`` | Menutup pemanggilan `train_test_split`. |
| 53 | ``    print("[*] Menerapkan normalisasi MinMaxScaler pada 7 fitur masukan...")`` | Mencetak informasi bahwa tahap normalisasi fitur dimulai. |
| 54 | ``    scaler = MinMaxScaler()`` | Membuat objek `MinMaxScaler` untuk menskalakan nilai fitur ke rentang `0` sampai `1`. |
| 55 | ``    X_train_scaled = scaler.fit_transform(X_train)`` | Menghitung nilai `min`/`max` **hanya dari data latih** (`fit`) lalu menormalisasi `X_train` (mencegah *data leakage*). |
| 56 | ``    X_test_scaled = scaler.transform(X_test)`` | Menormalisasi `X_test` menggunakan parameter `min`/`max` dari `X_train` tanpa melakukan `fit` ulang. |
| 58 | ``    print("\n[*] Menginisialisasi arsitektur JST Sederhana (ANN-MLP): 7 -> 16 -> 1...")`` | Menampilkan informasi arsitektur jaringan saraf tiruan yang digunakan (`7` input, `16` hidden, `1` output). |
| 59 | ``    mlp = MLPClassifier(`` | Membuat objek model klasifikasi *Multi-Layer Perceptron* (JST feedforward). |
| 60 | ``        hidden_layer_sizes=(16,),`` | Menentukan 1 lapisan tersembunyi (*hidden layer*) berisi `16` neuron. |
| 61 | ``        activation='relu',`` | Menggunakan fungsi aktivasi *ReLU* (`max(0, x)`) pada lapisan tersembunyi. |
| 62 | ``        solver='adam',`` | Menggunakan algoritma optimasi *Adam* untuk memperbarui bobot selama *backpropagation*. |
| 63 | ``        learning_rate_init=0.001,`` | Menetapkan laju pembelajaran awal (*learning rate*) sebesar `0.001`. |
| 64 | ``        max_iter=100,`` | Menetapkan batas maksimum `100` epoch pelatihan. |
| 65 | ``        batch_size=64,`` | Memproses `64` sampel data per pembaruan bobot (*mini-batch gradient descent*). |
| 66 | ``        early_stopping=True,`` | Mengaktifkan penghentian dini otomatis jika performa validasi tidak lagi membaik (mencegah *overfitting*). |
| 67 | ``        validation_fraction=0.15,`` | Menyisihkan `15%` dari data latih sebagai data validasi internal untuk memantau *early stopping*. |
| 68 | ``        n_iter_no_change=10,`` | Menghentikan training jika skor validasi tidak membaik selama `10` epoch berturut-turut. |
| 69 | ``        random_state=42,`` | Menetapkan seed inisialisasi bobot awal agar hasil pelatihan konsisten saat dijalankan ulang. |
| 70 | ``        verbose=True`` | Menampilkan log progres *loss* pada setiap iterasi pelatihan di terminal. |
| 71 | ``    )`` | Menutup inisialisasi `MLPClassifier`. |
| 73 | ``    print("[*] Melatih model ANN-MLP pada dataset riil NASA FIRMS...")`` | Mencetak informasi bahwa proses training JST dimulai. |
| 74 | ``    mlp.fit(X_train_scaled, y_train)`` | Melatih model `mlp` menggunakan data latih ternormalisasi `X_train_scaled` dan label `y_train`. |
| 76 | ``    print("\n" + "="*55)`` | Mencetak garis pembatas judul bagian evaluasi. |
| 77 | ``    print("EVALUASI ILMIAH MODEL JST PADA TESTING SET:")`` | Mencetak judul bagian evaluasi model pada data uji. |
| 78 | ``    print("="*55)`` | Mencetak garis pembatas bawah judul evaluasi. |
| 79 | ``    y_pred_proba = mlp.predict_proba(X_test_scaled)[:, 1]`` | Menghitung probabilitas prediksi kelas `1` (`HIGH RISK`) pada seluruh data uji. |
| 80 | ``    y_pred = (y_pred_proba >= 0.50).astype(int)`` | Mengubah probabilitas menjadi label kelas biner (`1` jika `>= 0.50`, selainnya `0`). |
| 82 | ``    acc = accuracy_score(y_test, y_pred)`` | Menghitung nilai *Accuracy* (rasio prediksi benar terhadap seluruh data uji). |
| 83 | ``    prec = precision_score(y_test, y_pred, zero_division=0)`` | Menghitung nilai *Precision* untuk kelas positif (`HIGH RISK`). |
| 84 | ``    rec = recall_score(y_test, y_pred, zero_division=0)`` | Menghitung nilai *Recall* (sensitivitas deteksi titik `HIGH RISK`). |
| 85 | ``    f1 = f1_score(y_test, y_pred, zero_division=0)`` | Menghitung *F1-Score* (rata-rata harmonis antara *Precision* dan *Recall*). |
| 86 | ``    cm = confusion_matrix(y_test, y_pred)`` | Membentuk matriks 2x2 *Confusion Matrix* (`TN`, `FP`, `FN`, `TP`). |
| 88 | ``    print(f"Jumlah sampel uji (Test Set) : {len(y_test):,} data")`` | Menampilkan banyaknya data uji yang dievaluasi. |
| 89 | ``    print(f"Akurasi Model                 : {acc * 100:.2f}% (Target PRD: >= 85.0%)")`` | Menampilkan persentase akurasi model beserta pembanding target minimal PRD. |
| 90 | ``    print(f"Precision                     : {prec:.4f}")`` | Menampilkan nilai *Precision* dalam format 4 angka di belakang koma. |
| 91 | ``    print(f"Recall                        : {rec:.4f}")`` | Menampilkan nilai *Recall* dalam format 4 angka di belakang koma. |
| 92 | ``    print(f"F1-Score                      : {f1:.4f} (Target PRD: >= 0.80)")`` | Menampilkan nilai *F1-Score* beserta pembanding target minimal PRD. |
| 93 | ``    print(f"Target PRD Tercapai           : {'YA (MEMENUHI SYARAT)' if (acc >= 0.85 and f1 >= 0.80) else 'BELUM'}")`` | Mengevaluasi otomatis apakah syarat PRD (`Akurasi >= 85%` dan `F1 >= 0.80`) terpenuhi. |
| 95 | ``    print("\nConfusion Matrix:")`` | Mencetak judul tampilan *Confusion Matrix*. |
| 96 | ``    print("                Prediksi LOW RISK (0) \| Prediksi HIGH RISK (1)")`` | Mencetak header kolom *Confusion Matrix*. |
| 97 | ``    print(f"Aktual LOW  (0):        {cm[0][0]:<14} \|        {cm[0][1]}")`` | Mencetak baris aktual `LOW RISK`: *True Negative* (`cm[0][0]`) dan *False Positive* (`cm[0][1]`). |
| 98 | ``    print(f"Aktual HIGH (1):        {cm[1][0]:<14} \|        {cm[1][1]}")`` | Mencetak baris aktual `HIGH RISK`: *False Negative* (`cm[1][0]`) dan *True Positive* (`cm[1][1]`). |
| 100 | ``    print("\nClassification Report Lengkap:")`` | Mencetak judul laporan klasifikasi detail per kelas. |
| 101 | ``    print(classification_report(y_test, y_pred, target_names=['LOW RISK (0)', 'HIGH RISK (1)'], digits=4))`` | Menampilkan laporan lengkap `precision`, `recall`, `f1-score`, dan `support` untuk kedua kelas. |
| 103 | ``    os.makedirs(output_dir, exist_ok=True)`` | Membuat folder output (default `./artifacts`) jika belum ada. |
| 104 | ``    model_path = os.path.join(output_dir, "ann_model_riau.pkl")`` | Menyusun path lengkap file output model `ann_model_riau.pkl`. |
| 105 | ``    scaler_path = os.path.join(output_dir, "scaler_riau.pkl")`` | Menyusun path lengkap file output scaler `scaler_riau.pkl`. |
| 107 | ``    joblib.dump(mlp, model_path)`` | Menyimpan objek model JST terlatih `mlp` ke file `.pkl` di folder artefak. |
| 108 | ``    joblib.dump(scaler, scaler_path)`` | Menyimpan objek `scaler` (`MinMaxScaler`) ke file `.pkl` di folder artefak. |
| 110 | ``    print(f"[OK] Model tersimpan di : {model_path}")`` | Menampilkan konfirmasi lokasi penyimpanan file model. |
| 111 | ``    print(f"[OK] Scaler tersimpan di: {scaler_path}")`` | Menampilkan konfirmasi lokasi penyimpanan file scaler. |
| 113 | ``    backend_model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app", "models"))`` | Menentukan path absolut folder `backend/app/models` relatif terhadap lokasi skrip `train_ann.py`. |
| 114 | ``    os.makedirs(backend_model_dir, exist_ok=True)`` | Memastikan direktori model milik backend sudah tersedia. |
| 115 | ``    joblib.dump(mlp, os.path.join(backend_model_dir, "ann_model_riau.pkl"))`` | Menyalin/menyimpan ulang model `mlp` langsung ke folder backend agar siap dipakai API. |
| 116 | ``    joblib.dump(scaler, os.path.join(backend_model_dir, "scaler_riau.pkl"))`` | Menyalin/menyimpan ulang `scaler` langsung ke folder backend. |
| 117 | ``    print(f"[OK] Artefak tersinkronisasi ke backend: {backend_model_dir}")`` | Menampilkan konfirmasi bahwa artefak model di backend telah diperbarui. |
| 119 | ``    total_time = time.time() - start_time`` | Menghitung selisih waktu selesai dan waktu mulai untuk mengetahui total durasi proses. |
| 120 | ``    print(f"[OK] Seluruh proses pelatihan selesai dalam {total_time:.2f} detik.")`` | Mencetak total waktu pelatihan dalam satuan detik. |
| 122 | ``if __name__ == '__main__':`` | Menjamin blok kode di bawahnya hanya berjalan jika file dieksekusi langsung sebagai skrip utama. |
| 123 | ``    parser = argparse.ArgumentParser(description="Pelatihan ANN-MLP Karhutla Riau")`` | Membuat parser argumen CLI beserta deskripsi program. |
| 124 | ``    parser.add_argument('--data', type=str, default='../data/riau_hotspots_labeled.csv', help="Path dataset berlabel Riau")`` | Mendefinisikan argumen `--data` untuk menentukan lokasi CSV latih (default `../data/riau_hotspots_labeled.csv`). |
| 125 | ``    parser.add_argument('--output', type=str, default='./artifacts', help="Direktori penyimpanan model")`` | Mendefinisikan argumen `--output` untuk menentukan folder output artefak (default `./artifacts`). |
| 126 | ``    args = parser.parse_args()`` | Mem-parsing argumen yang diberikan pengguna melalui terminal. |
| 128 | ``    train_and_evaluate(args.data, args.output)`` | Memanggil fungsi utama `train_and_evaluate` dengan nilai argumen `--data` dan `--output`. |
