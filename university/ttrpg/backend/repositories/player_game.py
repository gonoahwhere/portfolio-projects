from typing import Any
from flask import abort

from ..db import get_connection

# ===================
#       CREATE
# ===================
def create(data: dict):
    with get_connection() as conn:
        conn.execute(
            """INSERT INTO PLAYER_GAME (PlayerID, GameID, Score) VALUES (?, ?, ?)""",
            (data["PlayerID"], data["GameID"], data.get("Score", 0)),
        )
        conn.commit()

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM PLAYER_GAME").fetchall()

# ===================
#       UPDATE
# ===================
def update(player_id: int, game_id: int, data: dict) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            """
                UPDATE PLAYER_GAME
                SET Score = ?
                WHERE PlayerID = ? AND GameID = ?
            """, (data["Score"], player_id, game_id),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(player_id: int, game_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            """
                DELETE FROM PLAYER_GAME
                WHERE PlayerID = ? AND GameID = ?
            """, (player_id, game_id),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
