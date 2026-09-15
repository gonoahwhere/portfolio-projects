from typing import Any
from flask import abort

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO STATUS (StatusName) VALUES (?)", (data["StatusName"],)
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM STATUS ORDER BY StatusName").fetchall()

def get_by_id(status_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn, "SELECT * FROM STATUS WHERE StatusID = ?", (status_id,)
        )

# ===================
#       UPDATE
# ===================
def update(status_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE STATUS SET StatusName = ? WHERE StatusID = ?",
            (data["StatusName"], status_id),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(status_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM STATUS WHERE StatusID = ?", (status_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
