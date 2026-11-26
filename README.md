# FRFP — Fire Risk Foresight & Prioritization (v2.0 Nationwide)
**Platform Kecerdasan Buatan Deteksi & Prakiraan Risiko Karhutla Skala Nasional Berbasis Jaringan Syaraf Tiruan (ANN-MLP)**

Sistem full-stack terintegrasi untuk mengklasifikasikan titik panas satelit NASA FIRMS (VIIRS 375m) di seluruh wilayah Indonesia (**Sabang s.d. Merauke, 38 Provinsi**) ke dalam tingkat risiko **LOW RISK** dan **HIGH RISK** guna pengarahan patroli lapangan Satgas Manggala Agni dan audit kepatuhan lingkungan Ditjen Gakkum KLHK.

---

## 🌟 Fitur Utama FRFP v2.0
1. **Model JST Sederhana & Berkualitas Tinggi (ANN-MLP):**
   - Menggunakan arsitektur standar 3-lapis feedforward ($7 \rightarrow 16 \rightarrow 1$) ramah kurikulum pengenalan JST (Semester 3).
   - Dilatih pada **104.439 data riil satelit NASA FIRMS VIIRS (375m)**.
   - Akurasi pengujian: **99.39%**, F1-Score: **0.9957** (20.888 data uji).
   - Notebook Google Colab tersedia di [`notebooks/SiAgni_ANN_Prediksi_Risiko_Karhutla.ipynb`](file:///f:/Projects/FRFP/notebooks/SiAgni_ANN_Prediksi_Risiko_Karhutla.ipynb).
2. **Cakupan Spasial Nasional (Sabang - Merauke):**
   - Bounding Box: $-11.00^\circ \text{ s.d. } 6.00^\circ$ LU/LS dan $95.00^\circ \text{ s.d. } 141.00^\circ$ BT.
   - Peta interaktif Leaflet dengan pemilih **38 Provinsi Indonesia** yang dikelompokkan per pulau (*flyTo camera navigation*).
3. **Konversi Waktu Satelit Otomatis:**
   - Menghitung waktu lokal Indonesia (**WIB, WITA, WIT**) secara dinamis berdasarkan bujur titik api.
   - Indikator orbit siang/malam (☀️ Siang / 🌙 Malam).
4. **Pengolahan Dataset Lokal & Input Manual:**
   - Mendukung pemrosesan batch CSV dari dataset NASA FIRMS yang sudah diunduh (`/ingest`) dan pemuatan dataset sampel wilayah Indonesia.
   - Mendukung input parameter titik panas secara manual melalui form prediksi cepat (`/predict`).
5. **Akselerasi & Fleksibilitas Audit:**
   - Uji prediksi cepat instan (`/predict`).
   - Ingesti batch CSV satelit dengan opsi penggantian data lama (`/ingest`).
   - Lembar Surat Perintah Tugas verifikasi lapangan resmi siap cetak (`/priority-list`).
   - Desain modern bernuansa **Emerald Green & Liquid Glass (Frosted Glassmorphism)**.

---

## 🏛️ Struktur Repositori
```text
FRFP/
├── ai_engine/          # Pelatihan model ANN-MLP (TensorFlow / Scikit-Learn) & artifact .pkl
├── backend/            # FastAPI v2.0 REST API, geo timezone service, SQLite DB, model inference
├── frontend/           # Next.js 14+ (App Router), Tailwind CSS, React-Leaflet, Emerald Liquid Glass
├── data/               # Dataset CSV NASA FIRMS yang sudah diunduh & sampel wilayah Indonesia
├── notebooks/          # Google Colab / Jupyter Notebook SiAgni-ANN untuk tugas kuliah AI (Semester 3)
├── run_system.bat      # 1-Click Runner: Menjalankan Backend (:8000) & Frontend (:3000)
├── run_frontend.bat    # Runner khusus Frontend Next.js (:3000)
└── README.md
```

---

## 🚀 Panduan Menjalankan Sistem

### Cara Cepat (1-Click Runner di Windows):
Cukup klik dua kali file:
👉 **`run_system.bat`** (otomatis membuka Backend di port 8000 dan Frontend di port 3000).

---

### Cara Manual via Terminal:

#### 1. Menjalankan Backend (FastAPI :8000)
```bash
cd backend
python run.py
```
- Akses API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. Menjalankan Frontend (Next.js :3000)
Buka tab terminal baru:
```bash
cd frontend
npm run dev
```
- Akses Dashboard FRFP: [http://localhost:3000](http://localhost:3000)
