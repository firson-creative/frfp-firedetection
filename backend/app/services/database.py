"""
backend/app/services/database.py
Manajemen Basis Data SQLite untuk FRFP - Fire Risk Foresight & Prioritization
"""

import sqlite3
import datetime
from typing import List, Dict, Any, Optional
from ..config import DATABASE_PATH

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH, timeout=25.0)
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
        subregion TEXT,
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
        "subregion": "TEXT",
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
        delta_t, probability, risk_class, risk_label, is_indonesia, province_region, subregion,
        acq_date, acq_time, daynight, local_time_str,
        audit_priority, audit_status, recommendation, created_at
    ) VALUES (
        :latitude, :longitude, :brightness, :scan, :track, :frp, :bright_t31,
        :delta_t, :probability, :risk_class, :risk_label, :is_indonesia, :province_region, :subregion,
        :acq_date, :acq_time, :daynight, :local_time_str,
        :audit_priority, :audit_status, :recommendation, :created_at
    );
    """, {
        **record,
        "is_indonesia": 1 if record.get("is_indonesia", True) else 0,
        "province_region": record.get("province_region", "Indonesia"),
        "subregion": record.get("subregion") or record.get("province_region", "Indonesia"),
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
    if not records:
        return 0

    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    tuple_rows = []
    for r in records:
        tuple_rows.append((
            float(r['latitude']),
            float(r['longitude']),
            float(r['brightness']),
            float(r['scan']),
            float(r['track']),
            float(r['frp']),
            float(r['bright_t31']),
            float(r['delta_t']),
            float(r['probability']),
            str(r['risk_class']),
            int(r['risk_label']),
            1 if r.get('is_indonesia', True) else 0,
            str(r.get('province_region', 'Indonesia')),
            str(r.get('subregion') or r.get('province_region', 'Indonesia')),
            str(r.get('acq_date') or datetime.date.today().isoformat()),
            str(r.get('acq_time') or '0000'),
            str(r.get('daynight') or 'D'),
            str(r.get('local_time_str') or 'WIB'),
            str(r.get('audit_priority') or 'Sedang'),
            str(r.get('audit_status') or 'PENDING'),
            str(r.get('recommendation') or ''),
            str(r.get('created_at') or now)
        ))

    cursor.executemany("""
    INSERT INTO hotspots (
        latitude, longitude, brightness, scan, track, frp, bright_t31,
        delta_t, probability, risk_class, risk_label, is_indonesia, province_region, subregion,
        acq_date, acq_time, daynight, local_time_str,
        audit_priority, audit_status, recommendation, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, tuple_rows)

    conn.commit()
    conn.close()
    return len(tuple_rows)

def get_hotspots(
    risk_class: Optional[str] = None,
    province: Optional[str] = None,
    kabupaten: Optional[str] = None,
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
        query += " AND (province_region LIKE ? OR subregion LIKE ?)"
        params.append(f"%{province}%")
        params.append(f"%{province}%")

    if kabupaten and kabupaten != "ALL":
        query += " AND (subregion LIKE ? OR province_region LIKE ?)"
        params.append(f"%{kabupaten}%")
        params.append(f"%{kabupaten}%")

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
