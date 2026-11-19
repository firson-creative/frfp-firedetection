# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## PROTOTIPE SISTEM KLASIFIKASI TINGKAT RISIKO TITIK PANAS KARHUTLA BERBASIS JARINGAN SYARAF TIRUAN (ANN-MLP)
### Untuk Prioritas Verifikasi Lapangan dan Audit Kepatuhan Lingkungan (Wilayah Percontohan: Provinsi Riau)

---

| Atribut Dokumen | Keterangan |
| :--- | :--- |
| **Judul Proyek** | Sistem Klasifikasi Tingkat Risiko Titik Panas Kebakaran Hutan dan Lahan Berbasis Jaringan Syaraf Tiruan (ANN) untuk Prioritas Audit Kepatuhan Lingkungan |
| **Versi Dokumen** | v1.1.0 (Approved Baseline: Next.js + Bounded Area Riau) |
| **Mata Kuliah** | Kecerdasan Buatan (Artificial Intelligence) — Semester 3 |
| **Alokasi Tim** | 3 Orang (AI/Data Lead, Backend & GIS Lead, Frontend & UI/UX Lead) |
| **Tech Stack Terpilih**| **Next.js (React) + Tailwind CSS + Leaflet.js** (Frontend) & **FastAPI + TensorFlow** (Backend) |
| **Wilayah Target** | **Provinsi Riau** (Lahan Gambut Sumatera Bagian Tengah) |
| **Estimasi Durasi** | 4 Minggu (4 Sprints) |
| **Status Dokumen** | **FINAL & APPROVED FOR IMPLEMENTATION** |

---

## 1. RINGKASAN EKSEKUTIF & WILAYAH TARGET TERBATAS

### 1.1 Latar Belakang & Pembatasan Wilayah Target (Provinsi Riau)
Kebakaran hutan dan lahan (Karhutla) di Indonesia terkonsentrasi sangat tinggi pada ekosistem lahan gambut. Untuk memastikan prototipe memiliki akurasi spasial tajam, kontekstual, dan realistis diselesaikan dalam batas waktu 4 minggu, **wilayah target pengujian dan data latih secara eksplisit dibatasi pada Provinsi Riau**.

* **Karakteristik Wilayah Percontohan (Provinsi Riau):**
  * Memiliki hamparan kubah gambut (*peatland*) luas yang sangat rentan terbakar saat musim kemarau.
  * Sentra konsesi perkebunan kelapa sawit (HGU) dan Hutan Tanaman Industri (HTI) yang membutuhkan audit kepatuhan lingkungan rutin dari Balai Gakkum KLHK dan Dinas LHK Riau.
  * **Bounding Box Koordinat Geografis Valid:**
    $$\text{Latitude (Lintang): } -1.15^\circ \text{ s.d. } 2.45^\circ \text{ LU/LS}$$
    $$\text{Longitude (Bujur): } 100.00^\circ \text{ s.d. } 103.85^\circ \text{ BT}$$

```
                [ PETA PROVINSI RIAU (BOUNDING BOX) ]
      100.00° BT ───────────────────────────────── 103.85° BT
  2.45° LU ┌─────────────────────────────────────────┐
           │   Rokan Hilir       Dumai     Bengkalis │
           │        Rokan Hulu      Siak    Meranti  │
           │             Pekanbaru    Pelalawan      │
           │       Kampar        Indragiri Hulu      │
 -1.15° LS └──────────────────────── Indragiri Hilir ┘
```

### 1.2 Solusi yang Dibangun
Prototipe berbasis **Web Full-Stack modern (Next.js + FastAPI + TensorFlow)** yang secara otomatis mengklasifikasikan titik panas satelit **NASA FIRMS (VIIRS 375m)** di wilayah Riau ke dalam kategori **LOW RISK** dan **HIGH RISK** untuk mengarahkan rute patroli harian Satgas Manggala Agni dan penjadwalan audit kepatuhan konsesi.

---

## 2. SPESIFIKASI TEKNOLOGI & ARSITEKTUR FULL-STACK

Sesuai keputusan arsitektur (Stack Opsi B), prototipe memisahkan antarmuka pengguna (*Client-side SPA/SSR*) dan mesin inferensi AI (*REST API Microservice*):

```
┌────────────────────────────────────────────────────────┐
│             FRONTEND LAYER (Person 3)                  │
│  Next.js 14+ (App Router) + Tailwind CSS + Lucide      │
│  React-Leaflet (Interactive GIS Map) + Axios Client     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON / REST API (Port 8000)
                            ▼
┌────────────────────────────────────────────────────────┐
│             BACKEND LAYER (Person 2)                   │
│  FastAPI (Python 3.10+) + Uvicorn ASGI Server          │
│  CORS Middleware + Pydantic v2 Schema Validation       │
│  Spatial Bounding Filter (Riau) + SQLite Database      │
└───────────────────────────┬────────────────────────────┘
                            │ Model Inference
                            ▼
┌────────────────────────────────────────────────────────┐
│             AI ENGINE LAYER (Person 1)                 │
│  TensorFlow / Keras ANN-MLP (7 → 64 → 32 → 1)          │
│  Artifacts: ann_model_riau.keras & minmax_scaler.pkl   │
└────────────────────────────────────────────────────────┘
```

---

## 3. PEMBAGIAN TUGAS TIM 3 ORANG (UPDATED WORK DIVISION)

### 3.1 Rincian Tugas Anggota Tim

#### Person 1: AI & Data Science Lead (Machine Learning Engineer)
* **Tanggung Jawab:**
  1. Mengunduh data historis NASA FIRMS VIIRS dan memfilter rekaman koordinat khusus Provinsi Riau ($-1.15 \le \text{lat} \le 2.45$ dan $100.00 \le \text{lon} \le 103.85$).
  2. Menerapkan formula **Ground Truth resmi**:
     $$\text{Label} = 1 \ (\text{High Risk}) \iff (\text{FRP} \ge 15.0\text{ MW}) \lor (\text{Brightness} - \text{Bright\_T31} \ge 25.0\text{ K})$$
     $$\text{Label} = 0 \ (\text{Low Risk}) \iff \text{Kondisi lainnya}$$
  3. Membangun dan melatih model ANN-MLP ($7 \rightarrow 64 \rightarrow 32 \rightarrow 1$) dengan normalisasi `MinMaxScaler`.
  4. Mengevaluasi metrik ilmiah (Akurasi $\ge 85\%$, F1-Score $\ge 0,80$, Confusion Matrix).
  5. Mengekspor artefak model `ann_model_riau.keras` dan `scaler_riau.pkl` beserta notebook dokumentasi pelatihan.

#### Person 2: Backend & System Lead (API & Database Engineer)
* **Tanggung Jawab:**
  1. Membangun REST API server berbasis **FastAPI** dengan CORS diaktifkan untuk domain Next.js (`http://localhost:3000`).
  2. Memuat artefak model dari Person 1 ke dalam memori aplikasi saat startup (`@app.on_event("startup")`).
  3. Mengimplementasikan validasi skema input Pydantic dan pemotong koordinat spasial Riau (*out-of-bounds warning* jika di luar Riau).
  4. Menyediakan endpoint `/api/v1/predict` (single hotspot), `/api/v1/predict-batch` (upload CSV), dan `/api/v1/hotspots` (GeoJSON filter).
  5. Mengelola basis data lokal **SQLite** (`hotspots_riau.db`) untuk mencatat log riwayat prediksi dan status audit lapangan.

#### Person 3: Frontend & UI/UX Lead (Full-Stack Next.js Developer)
* **Tanggung Jawab:**
  1. Menyiapkan proyek **Next.js 14+ (App Router)** dengan **Tailwind CSS** dan icon library **Lucide-React**.
  2. Mengembangkan komponen peta GIS interaktif menggunakan **React-Leaflet** dengan fokus visual terpusat pada Provinsi Riau (titik merah: *High Risk*, titik hijau: *Low Risk*).
  3. Membangun halaman Formulir Prediksi Cepat (*Single Hotspot Input*) dengan validasi form dan preview probabilitas real-time.
  4. Membangun halaman Batch CSV Ingestion dengan komponen *drag-and-drop*, tabel data dinamis, dan filter tingkat keparahan.
  5. Membangun fitur ekspor dokumen Surat Tugas Patroli / Audit Lapangan ke format PDF/CSV.
  6. Menjaga konsistensi palet warna profesional corporate-tech (*Navy #142B4A, Deep Blue #1D4E89, Cyan #20B8D5*).

---

### 3.2 Matriks Tanggung Jawab RACI

| Komponen Proyek | Person 1 (AI Lead) | Person 2 (Backend Lead) | Person 3 (Frontend Lead) |
| :--- | :---: | :---: | :---: |
| **Filtering Dataset Spasial Riau** | **R / A** | C | I |
| **Ground Truth Labeling Formula** | **R / A** | C | I |
| **Pelatihan Model ANN-MLP & Export** | **R / A** | C | I |
| **Setup FastAPI & CORS Middleware** | I | **R / A** | C |
| **Endpoint Predict & Batch Processing** | C | **R / A** | C |
| **Database SQLite & Schema Setup** | I | **R / A** | I |
| **Setup Next.js & Tailwind UI Shell** | I | C | **R / A** |
| **Peta Interaktif React-Leaflet Riau** | I | C | **R / A** |
| **Formulir Input Manual & Batch Upload** | I | C | **R / A** |
| **Ekspor Laporan Audit Lapangan (PDF)**| I | I | **R / A** |
| **Integrasi Client-Server (Axios API)**| C | **R** | **R / A** |
| **Penyusunan Slide Presentasi & Demo** | **R** | **R** | **R / A** |

---

## 4. SPESIFIKASI DATA & 7 FITUR INPUT MODEL

### 4.1 Definisi 7 Fitur Masukan
Model ANN menerima 7 parameter numerik kontinu:

| No | Nama Parameter | Tipe Data | Rentang Valid (Area Riau) | Satuan | Deskripsi |
| :-: | :--- | :---: | :---: | :---: | :--- |
| **1** | `latitude` | Float | $-1.15 \text{ s.d. } 2.45$ | Derajat | Koordinat lintang di Provinsi Riau. |
| **2** | `longitude` | Float | $100.00 \text{ s.d. } 103.85$| Derajat | Koordinat bujur di Provinsi Riau. |
| **3** | `brightness` | Float | $300.0 \text{ s.d. } 505.0$ | Kelvin (K) | Suhu kecerahan kanal inframerah I-4 ($3,75\,\mu\text{m}$). |
| **4** | `scan` | Float | $0.32 \text{ s.d. } 0.80$ | km | Resolusi spasial arah pemindaian satelit. |
| **5** | `track` | Float | $0.36 \text{ s.d. } 0.80$ | km | Resolusi spasial lintasan orbit satelit. |
| **6** | `frp` | Float | $0.0 \text{ s.d. } 1200.0$ | MW | *Fire Radiative Power* (energi radiasi kebakaran). |
| **7** | `bright_t31` | Float | $275.0 \text{ s.d. } 345.0$ | Kelvin (K) | Suhu kanal inframerah I-5 ($11\,\mu\text{m}$) pembanding latar. |

### 4.2 Formula Ground Truth Resmi (Disahkan)
$$\text{Class} = 1 \ (\text{HIGH RISK}) \iff (\text{FRP} \ge 15.0\text{ MW}) \lor (\text{brightness} - \text{bright\_t31} \ge 25.0\text{ K})$$
$$\text{Class} = 0 \ (\text{LOW RISK}) \iff \text{Kondisi lainnya}$$

---

## 5. SPESIFIKASI ARSITEKTUR MODEL JST (ANN-MLP)

* **Input Layer:** 7 Neuron (setelah normalisasi `MinMaxScaler`).
* **Hidden Layer 1:** 64 Neuron, Aktivasi **ReLU**, Dropout $0.2$.
* **Hidden Layer 2:** 32 Neuron, Aktivasi **ReLU**, Dropout $0.1$.
* **Output Layer:** 1 Neuron, Aktivasi **Sigmoid** ($\hat{y} \in [0.00, 1.00]$).
* **Optimizer:** Adam ($lr = 0.001$).
* **Fungsi Rugi:** Binary Cross-Entropy.
* **Logika Keputusan:**
  * $\hat{y} < 0,50 \rightarrow$ **LOW RISK (Kelas 0):** Pemantauan satelit rutin.
  * $\hat{y} \ge 0,50 \rightarrow$ **HIGH RISK (Kelas 1):** Prioritas audit lapangan dan patroli cepat Satgas.

---

## 6. SPESIFIKASI BACKEND REST API (FASTAPI)

### 6.1 Konfigurasi CORS
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 6.2 Endpoint Utama
1. `POST /api/v1/predict`: Menerima 7 fitur titik panas $\rightarrow$ mengembalikan probabilitas, kelas risiko, status verifikasi spasial Riau, dan rekomendasi aksi.
2. `POST /api/v1/predict-batch`: Menerima upload multipart file CSV NASA FIRMS $\rightarrow$ memfilter baris koordinat Riau $\rightarrow$ eksekusi inferensi batch $\rightarrow$ menyimpan ke SQLite $\rightarrow$ mengembalikan rekapitulasi jumlah *High Risk* vs *Low Risk*.
3. `GET /api/v1/hotspots`: Mengembalikan data titik panas dalam format GeoJSON FeatureCollection untuk dirender langsung oleh React-Leaflet di peta.

---

## 7. SPESIFIKASI FRONTEND DASHBOARD (NEXT.JS & REACT-LEAFLET)

### 7.1 Struktur Halaman Next.js
```
frontend/
├── app/
│   ├── layout.tsx         (Header Navbar, Brand Logo, Status Server)
│   ├── page.tsx           (Dashboard Utama & Peta Leaflet Provinsi Riau)
│   ├── predict/
│   │   └── page.tsx       (Formulir Input Uji Prediksi Titik Tunggal)
│   ├── ingest/
│   │   └── page.tsx       (Upload CSV Satelit NASA FIRMS Batch)
│   ├── priority-list/
│   │   └── page.tsx       (Tabel Prioritas Audit & Fitur Cetak PDF Surat Tugas)
│   └── model-diagnostics/
│       └── page.tsx       (Grafik Evaluasi Model, F1-Score, Confusion Matrix)
```

### 7.2 Fitur Peta Spasial Riau (React-Leaflet)
* **Pusat Peta Default (*Center View*):** Latitude `0.5071`, Longitude `101.4478` (Pekanbaru, Riau), Zoom Level `8`.
* **Layer Peta:** OpenStreetMap / CartoDB Dark & Light Tiles.
* **Marker Styling:**
  * Marker Merah (#DC2626) dengan animasi *pulse* untuk titik *High Risk*.
  * Marker Hijau (#16A34A) untuk titik *Low Risk*.
* **Interaktivitas:** Klik marker memunculkan *Popup Card* berisi detail suhu, FRP, probabilitas inferensi ANN, dan tombol cepat `Cetak ke Surat Tugas`.

---

## 8. TIMELINE PELAKSANAAN SPRINT (4 MINGGU)

| Fase | Durasi | Target Capaian (Person 1, 2, 3) | Deliverable Kunci |
| :--- | :---: | :--- | :--- |
| **Sprint 1** | Minggu 1 | Filter dataset area Riau, setup FastAPI, inisialisasi Next.js + Tailwind. | Dataset Riau CSV, API skeleton, UI layout dasar. |
| **Sprint 2** | Minggu 2 | Pelatihan ANN-MLP Riau, pembuatan endpoint `/predict`, integrasi React-Leaflet peta Riau. | `ann_model_riau.keras`, API predict aktif, peta interaktif Riau. |
| **Sprint 3** | Minggu 3 | Evaluasi F1-Score, endpoint batch upload CSV, form manual & ekspor PDF laporan. | Batch processing jalan, cetak PDF surat tugas, data SQLite terisi. |
| **Sprint 4** | Minggu 4 | Pengujian integrasi (E2E testing), optimasi latensi, pembuatan slide presentasi & demo. | Prototipe full-stack siap diuji & dipresentasikan. |

---

## 9. KEPATUHAN ETIKA & REGULASI

1. **Prioritas Lapangan Objektif:** Klasifikasi *High Risk* ditujukan untuk mengefisiensikan pergerakan regu Manggala Agni dan Polisi Kehutanan di lapangan, bukan sebagai vonis bersalah langsung tanpa pemeriksaan fisik.
2. **Keterbukaan Model (*Explainability*):** Sistem selalu menyajikan nilai selisih suhu kecerahan ($\Delta T = \text{brightness} - \text{bright\_t31}$) dan daya pancar radiasi (FRP) agar auditor memahami faktor pemicu skor probabilitas AI.
3. **Reproducibility:** Seluruh kode Next.js, FastAPI, bobot ANN, dan script filter spasial Riau didokumentasikan di repositori Git proyek.
