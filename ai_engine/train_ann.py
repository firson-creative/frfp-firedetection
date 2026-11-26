"""
train_ann.py
Skrip Pelatihan Model Jaringan Syaraf Tiruan (ANN-MLP) untuk Klasifikasi Tingkat Risiko Karhutla
Wilayah Percontohan: Provinsi Riau (Data Riil NASA FIRMS VIIRS 375m).
Sesuai spesifikasi PRD Bab 5.
"""

import os
import argparse
import time
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

FEATURE_COLS = [
    'latitude',
    'longitude',
    'brightness',
    'scan',
    'track',
    'frp',
    'bright_t31'
]

def train_and_evaluate(csv_path: str, output_dir: str = "./artifacts"):
    start_time = time.time()
    print(f"[*] Memuat data berlabel riil Riau dari: {csv_path}")

    # Baca CSV dengan pandas
    df = pd.read_csv(csv_path)

    # Validasi kelengkapan fitur
    for col in FEATURE_COLS:
        if col not in df.columns:
            raise ValueError(f"Kolom fitur '{col}' tidak ditemukan dalam dataset!")
    if 'label' not in df.columns:
        raise ValueError("Kolom 'label' (0 / 1) tidak ditemukan dalam dataset!")

    # Pastikan data bersih
    df = df.dropna(subset=FEATURE_COLS + ['label'])

    X = df[FEATURE_COLS].values
    y = df['label'].values.astype(int)

    total_records = len(df)
    high_risk_count = int((y == 1).sum())
    low_risk_count = int((y == 0).sum())

    print(f"[*] Total dataset riil Riau: {total_records:,} baris")
    print(f"[*] Proporsi kelas:")
    print(f"    - HIGH RISK (1): {high_risk_count:,} ({high_risk_count / total_records * 100:.2f}%)")
    print(f"    - LOW RISK  (0): {low_risk_count:,} ({low_risk_count / total_records * 100:.2f}%)")

    # Split Train (80%) dan Test (20%) secara stratified
    print("[*] Melakukan Stratified Train-Test Split (80% Train, 20% Test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Normalisasi MinMaxScaler untuk 7 fitur
    print("[*] Menerapkan normalisasi MinMaxScaler pada 7 fitur masukan...")
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Membangun Model Jaringan Syaraf Tiruan Sederhana (ANN-MLP: 7 -> 16 -> 1)
    # Sesuai kurikulum pengenalan JST tingkat sarjana (Semester 3):
    # 3-Layer Feedforward (Input: 7, Single Hidden Layer: 16 ReLU, Output: 1 Sigmoid)
    print("\n[*] Menginisialisasi arsitektur JST Sederhana (ANN-MLP): 7 -> 16 -> 1...")
    mlp = MLPClassifier(
        hidden_layer_sizes=(16,),
        activation='relu',
        solver='adam',
        learning_rate_init=0.001,
        max_iter=100,
        batch_size=64,
        early_stopping=True,
        validation_fraction=0.15,
        n_iter_no_change=10,
        random_state=42,
        verbose=True
    )

    print("[*] Melatih model ANN-MLP pada dataset riil NASA FIRMS...")
    mlp.fit(X_train_scaled, y_train)

    # Evaluasi pada data uji (Test Set)
    print("\n" + "="*55)
    print("EVALUASI ILMIAH MODEL JST PADA TESTING SET:")
    print("="*55)
    y_pred_proba = mlp.predict_proba(X_test_scaled)[:, 1]
    y_pred = (y_pred_proba >= 0.50).astype(int)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print(f"Jumlah sampel uji (Test Set) : {len(y_test):,} data")
    print(f"Akurasi Model                 : {acc * 100:.2f}% (Target PRD: >= 85.0%)")
    print(f"Precision                     : {prec:.4f}")
    print(f"Recall                        : {rec:.4f}")
    print(f"F1-Score                      : {f1:.4f} (Target PRD: >= 0.80)")
    print(f"Target PRD Tercapai           : {'YA (MEMENUHI SYARAT)' if (acc >= 0.85 and f1 >= 0.80) else 'BELUM'}")

    print("\nConfusion Matrix:")
    print("                Prediksi LOW RISK (0) | Prediksi HIGH RISK (1)")
    print(f"Aktual LOW  (0):        {cm[0][0]:<14} |        {cm[0][1]}")
    print(f"Aktual HIGH (1):        {cm[1][0]:<14} |        {cm[1][1]}")

    print("\nClassification Report Lengkap:")
    print(classification_report(y_test, y_pred, target_names=['LOW RISK (0)', 'HIGH RISK (1)'], digits=4))

    # Simpan Artefak
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "ann_model_riau.pkl")
    scaler_path = os.path.join(output_dir, "scaler_riau.pkl")

    joblib.dump(mlp, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"[OK] Model tersimpan di : {model_path}")
    print(f"[OK] Scaler tersimpan di: {scaler_path}")

    # Sinkronisasi langsung ke direktori backend/app/models
    backend_model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app", "models"))
    os.makedirs(backend_model_dir, exist_ok=True)
    joblib.dump(mlp, os.path.join(backend_model_dir, "ann_model_riau.pkl"))
    joblib.dump(scaler, os.path.join(backend_model_dir, "scaler_riau.pkl"))
    print(f"[OK] Artefak tersinkronisasi ke backend: {backend_model_dir}")

    total_time = time.time() - start_time
    print(f"[OK] Seluruh proses pelatihan selesai dalam {total_time:.2f} detik.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Pelatihan ANN-MLP Karhutla Riau")
    parser.add_argument('--data', type=str, default='../data/riau_hotspots_labeled.csv', help="Path dataset berlabel Riau")
    parser.add_argument('--output', type=str, default='./artifacts', help="Direktori penyimpanan model")
    args = parser.parse_args()

    train_and_evaluate(args.data, args.output)
