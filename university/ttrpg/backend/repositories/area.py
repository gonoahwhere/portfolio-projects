from typing import Any
from flask import abort

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO ORGANISATIONAL_AREA (AreaName) VALUES (?)", (data["AreaName"],)
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM ORGANISATIONAL_AREA ORDER BY AreaName"
        ).fetchall()


def get_by_id(area_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn, "SELECT * FROM ORGANISATIONAL_AREA WHERE AreaID = ?", (area_id,)
        )

# ===================
#       UPDATE
# ===================
def update(area_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE ORGANISATIONAL_AREA SET AreaName = ? WHERE AreaID = ?",
            (data["AreaName"], area_id),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(area_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM ORGANISATIONAL_AREA WHERE AreaID = ?", (area_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
