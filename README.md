# Prototipe Sistem Klasifikasi Risiko Titik Panas Karhutla (Provinsi Riau)
**Berbasis Jaringan Syaraf Tiruan (ANN-MLP)**

Sistem full-stack untuk mengklasifikasikan titik panas satelit NASA FIRMS (VIIRS 375m) di Provinsi Riau ke dalam tingkat risiko **LOW RISK** dan **HIGH RISK** untuk prioritas patroli lapangan Manggala Agni dan audit kepatuhan lingkungan konsesi perkebunan (HGU/HTI).

---

## 🏛️ Arsitektur Proyek
```text
FRFP/
├── ai_engine/          # (Person 1) Dataset, script filter Riau, training ANN-MLP, ekspor .keras & .pkl
├── backend/            # (Person 2) FastAPI, Pydantic, filter spasial, database SQLite
├── frontend/           # (Person 3) Next.js 14+ (App Router), Tailwind CSS, React-Leaflet
├── data/               # Dataset raw dan hasil filter spasial Riau
└── docs/               # PRD dan dokumentasi teknis
```

---

## 🎯 Pembagian Peran Tim (3 Orang)
1. **Person 1 (AI & Data Science Lead):** Filtering data NASA FIRMS koordinat Riau, formula Ground Truth, training model ANN-MLP (7→64→32→1), evaluasi (F1-score, Confusion Matrix), export `ann_model_riau.keras` & `scaler_riau.pkl`.
2. **Person 2 (Backend & System Lead):** FastAPI REST API, CORS middleware, skema Pydantic, spatial bounding check, endpoint `/predict`, `/predict-batch`, `/hotspots`, dan SQLite database.
3. **Person 3 (Frontend & UI/UX Lead):** Next.js 14+ App Router, peta interaktif React-Leaflet (Pusat: Pekanbaru), formulir single prediction, upload batch CSV, dan cetak Surat Tugas PDF.

---

## 🚀 Quick Start

### 1. AI Engine (Person 1)
```bash
cd ai_engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python filter_riau_data.py --input ../data/fire_archive_SV-C2_sample.csv
python train_ann.py
```

### 2. Backend API (Person 2)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Dashboard (Person 3)
```bash
cd frontend
npm install
npm run dev
```
Dashboard: [http://localhost:3000](http://localhost:3000)
