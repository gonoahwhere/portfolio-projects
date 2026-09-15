from typing import Any
from flask import abort

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            """INSERT INTO GAME_SESSION (GameDate, Duration, StatusID) VALUES (?, ?, ?)""",
            (data.get("GameDate"), data.get("Duration", 10), data["StatusID"]),
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM GAME_SESSION ORDER BY GameDate").fetchall()

def get_by_id(game_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn, "SELECT * FROM GAME_SESSION WHERE GameID = ?", (game_id,)
        )

# ===================
#       UPDATE
# ===================
def update(game_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            """UPDATE GAME_SESSION SET GameDate = ?, Duration = ?, StatusID = ? WHERE GameID = ?""",
            (data.get("GameDate"), data.get("Duration", 10), data["StatusID"], game_id),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(game_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM GAME_SESSION WHERE GameID = ?", (game_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
