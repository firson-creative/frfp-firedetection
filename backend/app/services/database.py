"""
backend/app/services/database.py
Manajemen Basis Data SQLite Lokal untuk Riwayat Prediksi dan Audit Lapangan
"""

import sqlite3
import datetime
from typing import List, Dict, Any, Optional
from ..config import DATABASE_PATH

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Membuat tabel-tabel SQLite saat aplikasi pertama kali dijalankan."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hotspots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        brightness REAL NOT NULL,
        scan REAL NOT NULL,
        track REAL NOT NULL,
        frp REAL NOT NULL,
        bright_t31 REAL NOT NULL,
        delta_t REAL NOT NULL,
        probability REAL NOT NULL,
        risk_class TEXT NOT NULL,
        risk_label INTEGER NOT NULL,
        is_riau INTEGER NOT NULL,
        subregion TEXT,
        audit_priority TEXT,
        audit_status TEXT DEFAULT 'PENDING',
        recommendation TEXT,
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

def insert_hotspot(record: Dict[str, Any]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO hotspots (
        latitude, longitude, brightness, scan, track, frp, bright_t31,
        delta_t, probability, risk_class, risk_label, is_riau, subregion,
        audit_priority, audit_status, recommendation, created_at
    ) VALUES (
        :latitude, :longitude, :brightness, :scan, :track, :frp, :bright_t31,
        :delta_t, :probability, :risk_class, :risk_label, :is_riau, :subregion,
        :audit_priority, :audit_status, :recommendation, :created_at
    );
    """, {
        **record,
        "is_riau": 1 if record.get("is_riau") else 0,
        "subregion": record.get("subregion", "Riau"),
        "audit_status": record.get("audit_status", "PENDING"),
        "created_at": record.get("created_at") or now
    })

    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def insert_batch_hotspots(records: List[Dict[str, Any]]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    count = 0
    for r in records:
        cursor.execute("""
        INSERT INTO hotspots (
            latitude, longitude, brightness, scan, track, frp, bright_t31,
            delta_t, probability, risk_class, risk_label, is_riau, subregion,
            audit_priority, audit_status, recommendation, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            r['latitude'], r['longitude'], r['brightness'], r['scan'], r['track'], r['frp'], r['bright_t31'],
            r['delta_t'], r['probability'], r['risk_class'], r['risk_label'],
            1 if r.get('is_riau') else 0, r.get('subregion', 'Riau'),
            r.get('audit_priority', 'Sedang'), r.get('audit_status', 'PENDING'),
            r.get('recommendation', ''), r.get('created_at') or now
        ))
        count += 1

    conn.commit()
    conn.close()
    return count

def get_hotspots(risk_class: Optional[str] = None, limit: int = 500) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    if risk_class:
        cursor.execute("SELECT * FROM hotspots WHERE risk_class = ? ORDER BY id DESC LIMIT ?", (risk_class, limit))
    else:
        cursor.execute("SELECT * FROM hotspots ORDER BY id DESC LIMIT ?", (limit,))

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_statistics() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM hotspots")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM hotspots WHERE risk_class = 'HIGH RISK'")
    high_risk = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM hotspots WHERE risk_class = 'LOW RISK'")
    low_risk = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM hotspots WHERE audit_status = 'PENDING' AND risk_class = 'HIGH RISK'")
    pending_audit = cursor.fetchone()[0]

    conn.close()
    return {
        "total_hotspots": total,
        "high_risk_count": high_risk,
        "low_risk_count": low_risk,
        "pending_audit_high_risk": pending_audit
    }
