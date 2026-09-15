from typing import Any
from flask import abort

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO DIFFICULTY (DifficultyName) VALUES (?)",
            (data["DifficultyName"],),
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM DIFFICULTY ORDER BY DifficultyName"
        ).fetchall()

def get_by_id(difficulty_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn, "SELECT * FROM DIFFICULTY WHERE DifficultyID = ?", (difficulty_id,)
        )

# ===================
#       UPDATE
# ===================
def update(difficulty_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE DIFFICULTY SET DifficultyName = ? WHERE DifficultyID = ?",
            (data["DifficultyName"], difficulty_id),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(difficulty_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM DIFFICULTY WHERE DifficultyID = ?", (difficulty_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
