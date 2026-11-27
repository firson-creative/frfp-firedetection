# Materi Presentasi Kelompok — FRFP (Fire Risk Foresight & Prioritization)

Dokumen ini disusun sebagai panduan persiapan presentasi proyek kepada dosen, khususnya untuk menjelaskan konsep sistem dan model **Jaringan Syaraf Tiruan (JST / ANN-MLP)** beserta lokasi kode programnya, dibagi menjadi **3 bagian** untuk 3 anggota kelompok.

---

## Ringkasan Alur Sistem

```text
[Dataset CSV NASA FIRMS / Input Manual]
                  │
                  ▼
   Normalisasi MinMaxScaler (0 - 1)
                  │
                  ▼
     Model JST ANN-MLP (7 → 16 → 1)
     Probabilitas >= 0.50 → HIGH RISK
     Probabilitas <  0.50 → LOW RISK
                  │
                  ▼
   Filter Daratan (GeoJSON) + Provinsi/Kabupaten + Zona Waktu (WIB/WITA/WIT)
                  │
                  ▼
       Simpan ke SQLite (frfp_hotspots.db)
                  │
                  ▼
   Tampil di Frontend Next.js (Peta Nasional, Prediksi Manual, Upload CSV, Cetak PDF)
```

---

## Bagian Anggota 1 — Konsep Proyek, Data & Model JST (AI Engine)

### 1. Masalah & Tujuan Proyek
- Satelit NASA FIRMS VIIRS mendeteksi ribuan titik panas di Indonesia. Tidak semua titik panas merupakan kebakaran berbahaya (ada panas kecil biasa dan ada kebakaran besar).
- **FRFP (*Fire Risk Foresight & Prioritization*)** menggunakan model JST untuk mengklasifikasikan setiap titik menjadi **`HIGH RISK`** (prioritas ditangani/diaudit) dan **`LOW RISK`** (pemantauan rutin).

### 2. Persiapan & Pelabelan Data (*Ground Truth*)
- **Lokasi kode**: [`ai_engine/filter_riau_data.py`](../ai_engine/filter_riau_data.py) (fungsi `is_within_riau`, `calculate_ground_truth_label`, `process_csv_streaming`).
- Data mentah disaring pada wilayah percontohan Riau (`latitude` `-1.15` s.d. `2.45`, `longitude` `100.00` s.d. `103.85`) menjadi **104.439 baris** di [`data/riau_hotspots_labeled.csv`](../data/riau_hotspots_labeled.csv).
- Aturan pelabelan awal:
  - **`1` (`HIGH RISK`)**: jika `frp >= 15.0` MW **atau** selisih suhu `(brightness - bright_t31) >= 25.0` K.
  - **`0` (`LOW RISK`)**: selain kondisi di atas.

### 3. Arsitektur & Pelatihan Model JST (`ANN-MLP`)
- **Lokasi kode**: [`ai_engine/train_ann.py`](../ai_engine/train_ann.py) (`FEATURE_COLS`, `MinMaxScaler`, `MLPClassifier`, `joblib.dump`).
- **7 Fitur Input (`FEATURE_COLS`)**:
  1. `latitude` (lintang)
  2. `longitude` (bujur)
  3. `brightness` (suhu kecerahan kanal I-4, Kelvin)
  4. `scan` (resolusi piksel arah *scan*, km)
  5. `track` (resolusi piksel arah *track*, km)
  6. `frp` (*Fire Radiative Power*, MW)
  7. `bright_t31` (suhu latar kanal I-5, Kelvin)
- **Pembagian Data**: *Stratified train-test split* **80% data latih** (83.551 baris) dan **20% data uji** (20.888 baris).
- **Normalisasi**: Menggunakan **`MinMaxScaler`** untuk mengubah nilai seluruh 7 fitur ke rentang `0` s.d. `1` agar fitur berskala ratusan (misal suhu `350 K`) tidak mendominasi fitur berskala desimal (misal `scan 0.45`).
- **Struktur Jaringan (`7 → 16 → 1`)**:
  - **Input Layer**: 7 neuron (sesuai 7 fitur).
  - **Hidden Layer**: 1 lapis berisi 16 neuron dengan fungsi aktivasi **ReLU**.
  - **Output Layer**: 1 neuron dengan fungsi aktivasi **Sigmoid / Logistic** yang menghasilkan probabilitas `0,0` s.d. `1,0` (ambang batas `>= 0,50` diklasifikasikan sebagai `HIGH RISK`).
- **Proses Training & Hasil**:
  - Optimizer **Adam** (`learning_rate_init=0.001`), *loss* `log_loss` (*Binary Crossentropy*), regularisasi L2 (`alpha=0.0001`), `batch_size=64`, dan *early stopping* (berhenti konvergen di iterasi ke-54).
  - **Hasil Evaluasi (20.888 data uji)**: Akurasi **99,39%** dan F1-Score **0,9957**.
  - **Artefak Tersimpan**: [`backend/app/models/ann_model_riau.pkl`](../backend/app/models/ann_model_riau.pkl) dan [`backend/app/models/scaler_riau.pkl`](../backend/app/models/scaler_riau.pkl).

---

## Bagian Anggota 2 — Backend API, Logika Geografis & Database

### 1. Cara Backend Memuat & Memakai Model JST
- **Lokasi kode**: [`backend/app/services/model_service.py`](../backend/app/services/model_service.py) (class `HotspotRiskModelService`, fungsi `load_model` dan `predict_single`).
- Saat server FastAPI menyala, `load_model()` membaca `ann_model_riau.pkl` dan `scaler_riau.pkl` ke memori.
- Saat ada data masuk ke `predict_single()`, data dinormalisasi menggunakan `scaler.transform()` lalu dihitung probabilitasnya dengan `model.predict_proba()`.

### 2. Endpoint Input Manual & Upload Dataset CSV
- **Lokasi kode**: [`backend/app/routers/predict.py`](../backend/app/routers/predict.py) (`predict_single_hotspot`, `predict_batch_csv`, `load_sample_dataset`).
- **`POST /api/v1/predict`**: Menerima 1 titik data input manual dari pengguna, menghitung prediksi JST, lalu menyimpannya ke database.
- **`POST /api/v1/predict-batch`**: Membaca file CSV besar secara bertahap (*chunk* per 25.000 baris), menyaring titik dalam wilayah Indonesia, lalu menjalankan prediksi JST secara massal (*vectorized*) agar cepat.
- **`POST /api/v1/load-sample`**: Memuat dataset uji lokal yang sudah diunduh (`kalimantan`, `sulawesi`, `papua`, `nasional`, `riau`).

### 3. Penyaringan Laut, Wilayah Administratif & Zona Waktu
- **Lokasi kode**: [`backend/app/services/geo.py`](../backend/app/services/geo.py) (`is_point_in_indonesia`, `is_point_on_indonesia_land`, `get_local_timezone`, `get_indonesia_region`, `get_indonesia_subregion`).
- Titik panas di laut lepas (misalnya suar gas rig minyak lepas pantai) disaring menggunakan poligon daratan GeoJSON (`STRtree` Shapely) sehingga tidak masuk sebagai karhutla daratan.
- Menentukan nama Provinsi dan Kabupaten/Kota secara otomatis, serta mengonversi jam satelit UTC menjadi **WIB / WITA / WIT** berdasarkan garis bujur.

### 4. Database & Penyajian Data ke Peta
- **Lokasi kode**: [`backend/app/services/database.py`](../backend/app/services/database.py) (`init_db`, `insert_hotspot`, `insert_batch_hotspots`, `get_hotspots`, `get_statistics`) dan [`backend/app/routers/hotspots.py`](../backend/app/routers/hotspots.py) (`get_hotspots_geojson`, `get_system_stats`).
- Seluruh hasil klasifikasi disimpan ke basis data SQLite (`frfp_hotspots.db`).
- Data dikirim ke frontend dalam format standar peta **GeoJSON `FeatureCollection`** melalui `GET /api/v1/hotspots` dan ringkasan statistik via `GET /api/v1/stats`.

---

## Bagian Anggota 3 — Frontend (Antarmuka Web) & Demo Aplikasi

### 1. Kerangka Navigasi, Tema & Welcome Screen
- **Lokasi kode**: [`frontend/components/AppShell.tsx`](../frontend/components/AppShell.tsx), [`frontend/components/ThemeProvider.tsx`](../frontend/components/ThemeProvider.tsx), dan [`frontend/components/WelcomeSplash.tsx`](../frontend/components/WelcomeSplash.tsx).
- Sidebar navigasi dapat disembunyikan/ditampilkan (*collapsible*) agar area peta maksimal, dilengkapi switch tema **Light** (putih, ikon api) dan **Dark** (hitam, ikon air).
- Saat halaman utama diakses, tampil animasi pembuka (*welcome animation*) dengan logo FRFP, video latar terkompresi, dan tagline *"Jaga Hutan Jaga Rumah Kita"*.

### 2. Halaman Peta Nasional (`/`)
- **Lokasi kode**: [`frontend/app/page.tsx`](../frontend/app/page.tsx) dan [`frontend/components/IndonesiaMap.tsx`](../frontend/components/IndonesiaMap.tsx) (`HotspotMarkers`, `parseAcquisitionTimestamp`, `IndonesiaMap`).
- Mengambil data GeoJSON dari backend dan menampilkannya di peta interaktif Leaflet (merah = `HIGH RISK`, hijau = `LOW RISK`).
- Dilengkapi filter kelas risiko, navigasi ke 38 provinsi, filter **Waktu Rekam** (`Semua Periode`, `24 Jam Terakhir`, `7 Hari`), serta animasi **zoom in** otomatis (`map.flyTo`) saat suatu titik diklik.

### 3. Halaman Prediksi Manual (`/predict`) & Upload CSV (`/ingest`)
- **Lokasi kode prediksi manual**: [`frontend/app/predict/page.tsx`](../frontend/app/predict/page.tsx) (`PredictPage`, `handleSubmit`) untuk mensimulasikan 7 parameter satelit dan melihat hasil klasifikasi secara langsung.
- **Lokasi kode upload CSV**: [`frontend/app/ingest/page.tsx`](../frontend/app/ingest/page.tsx) (`IngestPage`, `handleUpload`, `handleLoadSample`) dan [`frontend/components/ConfirmModal.tsx`](../frontend/components/ConfirmModal.tsx) untuk mengunggah file CSV lokal, memuat dataset sampel per pulau, serta konfirmasi reset database.

### 4. Halaman Surat Tugas & Cetak PDF (`/priority-list`)
- **Lokasi kode**: [`frontend/app/priority-list/page.tsx`](../frontend/app/priority-list/page.tsx) (`PriorityListPage`, `handlePrint`, `handleExportCSV`) dan aturan `@media print` di [`frontend/app/globals.css`](../frontend/app/globals.css).
- Menampilkan khusus titik `HIGH RISK` dengan filter berjenjang Provinsi → Kabupaten/Kota, ekspor ke CSV, serta cetak PDF surat perintah tugas resmi dalam format landscape A4.

---

## Contekan Jawaban Cepat Pertanyaan Dosen

1. **"Kenapa pakai arsitektur sederhana `7 → 16 → 1`?"**
   Karena data input berupa 7 fitur numerik (*tabular data*). Satu *hidden layer* berisi 16 neuron **ReLU** sudah cukup menangkap hubungan non-linear antara suhu (`brightness`, `bright_t31`) dan energi radiasi api (`frp`) tanpa *overfitting*, dengan akurasi uji **99,39%**.
2. **"Kenapa harus dinormalisasi dengan `MinMaxScaler`?"**
   Agar seluruh fitur berada pada skala yang sama (`0`–`1`), sehingga proses optimasi bobot dengan **Adam** lebih cepat stabil dan tidak didominasi fitur yang angkanya besar.
3. **"Kenapa lapisan output memakai aktivasi Sigmoid / Logistic?"**
   Karena masalah ini adalah klasifikasi biner (2 kelas: `LOW RISK` = 0, `HIGH RISK` = 1), sehingga fungsi Sigmoid menghasilkan probabilitas di rentang `0` hingga `1`.
4. **"Model dilatih pakai data Riau, bagaimana bisa dipakai untuk seluruh Indonesia?"**
   Secara fisik, karakteristik kebakaran hutan (FRP tinggi dan selisih suhu kanal I-4 terhadap I-5 besar) berlaku sama di seluruh daerah; ke depannya model dapat dilatih ulang (*re-training*) dengan dataset historis seluruh Indonesia agar bobot spasial `latitude` dan `longitude` ikut terkalibrasi secara nasional.
