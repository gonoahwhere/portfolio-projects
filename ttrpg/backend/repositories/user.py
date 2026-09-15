from typing import Any
from flask import abort

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            """INSERT INTO "USER" (Username, Email, PasswordHash, CreationDate) VALUES (?, ?, ?, ?)""",
            (
                data["Username"],
                data["Email"],
                data["PasswordHash"],
                data["CreationDate"],
            ),
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute('SELECT * FROM "USER" ORDER BY Username').fetchall()

def get_by_id(user_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn, 'SELECT * FROM "USER" WHERE UserID = ?', (user_id,)
        )

# ===================
#       UPDATE
# ===================
def update(user_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            UPDATE "USER"
            SET 
                Username = ?, 
                Email = ?, 
                PasswordHash = ?,
                CreationDate = ?
            WHERE UserID = ?
        """,
            (
                data["Username"],
                data["Email"],
                data["PasswordHash"],
                data["CreationDate"],
                user_id,
            ),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(user_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM USER WHERE UserID = ?", (user_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
