import os
import sqlite3
import json
import time
import random
from typing import List, Dict, Any, Optional

DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.getcwd(), "data"))
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(DATA_DIR, "careercompass.db"))
FREE_MAP_LIMIT = 3

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

def init_db():
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS maps (
                id          TEXT PRIMARY KEY,
                user_email  TEXT NOT NULL,
                title       TEXT NOT NULL,
                goal        TEXT NOT NULL,
                profile     TEXT NOT NULL,
                roadmap     TEXT NOT NULL,
                completed   TEXT NOT NULL DEFAULT '[]',
                created_at  INTEGER NOT NULL,
                updated_at  INTEGER NOT NULL
            );
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_maps_user ON maps (user_email, updated_at DESC);
        """)
        conn.commit()

def row_to_map(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "title": row["title"],
        "goal": row["goal"],
        "profile": json.loads(row["profile"]),
        "roadmap": json.loads(row["roadmap"]),
        "completed": json.loads(row["completed"]),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"]
    }

def list_maps(user_email: str) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM maps WHERE user_email = ? ORDER BY updated_at DESC",
            (user_email,)
        ).fetchall()
        return [row_to_map(r) for r in rows]

def count_maps(user_email: str) -> int:
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT COUNT(*) AS n FROM maps WHERE user_email = ?",
            (user_email,)
        ).fetchone()
        return row["n"] if row else 0

def get_map(user_email: str, id: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT * FROM maps WHERE id = ? AND user_email = ?",
            (id, user_email)
        ).fetchone()
        return row_to_map(row) if row else None

def create_map(user_email: str, profile: Dict[str, Any], roadmap: Dict[str, Any], completed: List[str] = None) -> Dict[str, Any]:
    if completed is None:
        completed = []
    
    now_ms = int(time.time() * 1000)
    # Generate unique ID: map_base36_random
    # base36 representation of timestamp
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    val = now_ms
    b36 = ""
    while val > 0:
        val, r = divmod(val, 36)
        b36 = chars[r] + b36
    rand_str = "".join(random.choices(chars, k=6))
    map_id = f"map_{b36}_{rand_str}"
    
    title = roadmap.get("title") or profile.get("goal") or "Roadmap"
    
    with get_db_connection() as conn:
        conn.execute(
            """INSERT INTO maps
                (id, user_email, title, goal, profile, roadmap, completed, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                map_id,
                user_email,
                title,
                profile.get("goal", ""),
                json.dumps(profile),
                json.dumps(roadmap),
                json.dumps(completed),
                now_ms,
                now_ms
            )
        )
        conn.commit()
        
    return get_map(user_email, map_id)

def update_map_completed(user_email: str, id: str, completed: List[str]) -> Optional[Dict[str, Any]]:
    existing = get_map(user_email, id)
    if not existing:
        return None
        
    now_ms = int(time.time() * 1000)
    with get_db_connection() as conn:
        conn.execute(
            "UPDATE maps SET completed = ?, updated_at = ? WHERE id = ? AND user_email = ?",
            (json.dumps(completed), now_ms, id, user_email)
        )
        conn.commit()
        
    return get_map(user_email, id)

def delete_map(user_email: str, id: str) -> bool:
    with get_db_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM maps WHERE id = ? AND user_email = ?",
            (id, user_email)
        )
        conn.commit()
        return cursor.rowcount > 0
