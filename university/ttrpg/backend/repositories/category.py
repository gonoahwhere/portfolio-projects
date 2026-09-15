from typing import Any
from flask import abort

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO CATEGORY (CategoryName) VALUES (?)", (data["CategoryName"],)
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM CATEGORY ORDER BY CategoryName").fetchall()

def get_by_id(category_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn, "SELECT * FROM CATEGORY WHERE CategoryID = ?", (category_id,)
        )

# ===================
#       UPDATE
# ===================
def update(category_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE CATEGORY SET CategoryName = ? WHERE CategoryID = ?",
            (data["CategoryName"], category_id),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(category_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM CATEGORY WHERE CategoryID = ?", (category_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
