"""
train_ann.py
Skrip Pelatihan Model Jaringan Syaraf Tiruan (ANN-MLP) untuk Klasifikasi Tingkat Risiko Karhutla
Wilayah Percontohan: Provinsi Riau.
Sesuai spesifikasi PRD Bab 5.
"""

import os
import argparse
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
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

def build_ann_mlp_model(input_dim: int = 7):
    """
    Arsitektur JST (ANN-MLP):
      Input Layer    : 7 Neuron
      Hidden Layer 1 : 64 Neuron, ReLU, Dropout(0.2)
      Hidden Layer 2 : 32 Neuron, ReLU, Dropout(0.1)
      Output Layer   : 1 Neuron, Sigmoid
    """
    from tensorflow import keras
    from tensorflow.keras import layers

    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(64, activation='relu', name="hidden_layer_1"),
        layers.Dropout(0.2, name="dropout_1"),
        layers.Dense(32, activation='relu', name="hidden_layer_2"),
        layers.Dropout(0.1, name="dropout_2"),
        layers.Dense(1, activation='sigmoid', name="output_layer")
    ])

    optimizer = keras.optimizers.Adam(learning_rate=0.001)
    model.compile(
        optimizer=optimizer,
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    return model

def train_and_evaluate(csv_path: str, output_dir: str = "./artifacts"):
    print(f"[*] Memuat data dari: {csv_path}")
    df = pd.read_csv(csv_path)

    # Validasi kelengkapan fitur
    for col in FEATURE_COLS:
        if col not in df.columns:
            raise ValueError(f"Kolom fitur '{col}' tidak ditemukan dalam dataset!")
    if 'label' not in df.columns:
        raise ValueError("Kolom 'label' (0 / 1) tidak ditemukan dalam dataset!")

    X = df[FEATURE_COLS].values
    y = df['label'].values

    print(f"[*] Total dataset: {len(df)} baris")
    print(f"[*] Proporsi kelas:")
    print(f"    - HIGH RISK (1): {(y == 1).sum()} ({(y == 1).mean() * 100:.1f}%)")
    print(f"    - LOW RISK  (0): {(y == 0).sum()} ({(y == 0).mean() * 100:.1f}%)")

    # Split Train (80%) dan Test (20%) secara stratified
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Normalisasi MinMaxScaler
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Buat Model ANN
    model = build_ann_mlp_model(input_dim=len(FEATURE_COLS))
    model.summary()

    # Callback EarlyStopping
    from tensorflow.keras.callbacks import EarlyStopping
    early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

    print("[*] Memulai pelatihan model ANN-MLP...")
    history = model.fit(
        X_train_scaled, y_train,
        validation_split=0.2,
        epochs=60,
        batch_size=32,
        callbacks=[early_stop],
        verbose=1
    )

    # Evaluasi pada data uji (Test Set)
    print("\n" + "="*50)
    print("EVALUASI MODEL PADA DATA TESTING:")
    print("="*50)
    y_pred_prob = model.predict(X_test_scaled).ravel()
    y_pred = (y_pred_prob >= 0.50).astype(int)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print(f"Akurasi  : {acc * 100:.2f}% (Target PRD >= 85%)")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1-Score : {f1:.4f} (Target PRD >= 0.80)")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['LOW RISK (0)', 'HIGH RISK (1)']))

    # Simpan Artefak
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "ann_model_riau.keras")
    scaler_path = os.path.join(output_dir, "scaler_riau.pkl")

    model.save(model_path)
    joblib.dump(scaler, scaler_path)

    print(f"[OK] Model tersimpan di : {model_path}")
    print(f"[OK] Scaler tersimpan di: {scaler_path}")

    # Duplikasi juga ke backend/app/models agar langsung terbaca oleh Person 2
    backend_model_dir = os.path.abspath("../backend/app/models")
    os.makedirs(backend_model_dir, exist_ok=True)
    model.save(os.path.join(backend_model_dir, "ann_model_riau.keras"))
    joblib.dump(scaler, os.path.join(backend_model_dir, "scaler_riau.pkl"))
    print(f"[OK] Artefak otomatis disinkronisasi ke backend: {backend_model_dir}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Pelatihan ANN-MLP Karhutla Riau")
    parser.add_argument('--data', type=str, default='../data/riau_hotspots_labeled.csv', help="Path dataset berlabel Riau")
    parser.add_argument('--output', type=str, default='./artifacts', help="Direktori penyimpanan model")
    args = parser.parse_args()

    train_and_evaluate(args.data, args.output)
