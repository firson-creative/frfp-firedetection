"""
backend/app/services/database.py
Manajemen Basis Data SQLite untuk FRFP - Fire Risk Foresight & Prioritization
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
    """Membuat tabel-tabel SQLite dengan skema lengkap metadata tanggal & waktu satelit."""
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
        is_indonesia INTEGER NOT NULL,
        province_region TEXT,
        acq_date TEXT,
        acq_time TEXT,
        daynight TEXT,
        local_time_str TEXT,
        audit_priority TEXT,
        audit_status TEXT DEFAULT 'PENDING',
        recommendation TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # Self-healing migration for existing databases
    cursor.execute("PRAGMA table_info(hotspots);")
    existing_cols = [row[1] for row in cursor.fetchall()]
    needed_cols = {
        "is_indonesia": "INTEGER DEFAULT 1",
        "province_region": "TEXT",
        "acq_date": "TEXT",
        "acq_time": "TEXT",
        "daynight": "TEXT",
        "local_time_str": "TEXT"
    }
    for col_name, col_type in needed_cols.items():
        if col_name not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE hotspots ADD COLUMN {col_name} {col_type};")
            except Exception:
                pass

    conn.commit()
    conn.close()

def clear_hotspots():
    """Menghapus semua data hotspot dari tabel SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM hotspots;")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='hotspots';")
    conn.commit()
    conn.close()

def insert_hotspot(record: Dict[str, Any]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO hotspots (
        latitude, longitude, brightness, scan, track, frp, bright_t31,
        delta_t, probability, risk_class, risk_label, is_indonesia, province_region,
        acq_date, acq_time, daynight, local_time_str,
        audit_priority, audit_status, recommendation, created_at
    ) VALUES (
        :latitude, :longitude, :brightness, :scan, :track, :frp, :bright_t31,
        :delta_t, :probability, :risk_class, :risk_label, :is_indonesia, :province_region,
        :acq_date, :acq_time, :daynight, :local_time_str,
        :audit_priority, :audit_status, :recommendation, :created_at
    );
    """, {
        **record,
        "is_indonesia": 1 if record.get("is_indonesia", True) else 0,
        "province_region": record.get("province_region", "Indonesia"),
        "acq_date": record.get("acq_date", datetime.date.today().isoformat()),
        "acq_time": record.get("acq_time", "0000"),
        "daynight": record.get("daynight", "D"),
        "local_time_str": record.get("local_time_str", "WIB"),
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
            delta_t, probability, risk_class, risk_label, is_indonesia, province_region,
            acq_date, acq_time, daynight, local_time_str,
            audit_priority, audit_status, recommendation, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            r['latitude'], r['longitude'], r['brightness'], r['scan'], r['track'], r['frp'], r['bright_t31'],
            r['delta_t'], r['probability'], r['risk_class'], r['risk_label'],
            1 if r.get('is_indonesia', True) else 0,
            r.get('province_region', 'Indonesia'),
            r.get('acq_date', datetime.date.today().isoformat()),
            r.get('acq_time', '0000'),
            r.get('daynight', 'D'),
            r.get('local_time_str', 'WIB'),
            r.get('audit_priority', 'Sedang'),
            r.get('audit_status', 'PENDING'),
            r.get('recommendation', ''),
            r.get('created_at') or now
        ))
        count += 1

    conn.commit()
    conn.close()
    return count

def get_hotspots(
    risk_class: Optional[str] = None,
    province: Optional[str] = None,
    limit: int = 1000
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM hotspots WHERE 1=1"
    params = []

    if risk_class and risk_class != "ALL":
        query += " AND risk_class = ?"
        params.append(risk_class)

    if province and province != "ALL":
        query += " AND province_region LIKE ?"
        params.append(f"%{province}%")

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
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

    # Ambil 5 provinsi paling rawan
    cursor.execute("""
    SELECT province_region, COUNT(*) as cnt 
    FROM hotspots 
    WHERE risk_class = 'HIGH RISK' 
    GROUP BY province_region 
    ORDER BY cnt DESC 
    LIMIT 5
    """)
    top_provinces = [{"province": row[0], "count": row[1]} for row in cursor.fetchall()]

    conn.close()
    return {
        "total_hotspots": total,
        "high_risk_count": high_risk,
        "low_risk_count": low_risk,
        "pending_audit_high_risk": pending_audit,
        "top_provinces": top_provinces
    }
