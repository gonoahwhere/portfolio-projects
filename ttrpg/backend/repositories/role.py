from typing import Any
from flask import abort 

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO ROLE (RoleName) VALUES (?)", (data["RoleName"],)
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM ROLE ORDER BY RoleName").fetchall()

def get_by_id(role_id: int):
    with get_connection() as conn:
        return fetchone_or_404(conn, "SELECT * FROM ROLE WHERE RoleID = ?", (role_id,))

# ===================
#       UPDATE
# ===================
def update(role_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE ROLE SET RoleName = ? WHERE RoleID = ?", (data["RoleName"], role_id)
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(role_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM ROLE WHERE RoleID = ?", (role_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
