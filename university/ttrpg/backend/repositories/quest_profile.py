from typing import Any
from flask import abort

from ..db import get_connection

# ===================
#       CREATE
# ===================
def create(data: dict):
    with get_connection() as conn:
        conn.execute(
            """INSERT INTO QUEST_PROFILE (QuestID, PlayerID) VALUES (?, ?)""",
            (data["QuestID"], data["PlayerID"]),
        )
        conn.commit()

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM QUEST_PROFILE").fetchall()

# ===================
#       UPDATE
# ===================
def update(quest_id: int, player_id: int, data: dict) -> None:
    with get_connection() as conn:
        # Junction tables don't update keys
        # Update is optional/only added if additional fields exist
        # 405 suggests operation is not supported here
        abort(405)

# ===================
#       DELETE
# ===================
def delete(quest_id: int, player_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            """
                DELETE FROM QUEST_PROFILE
                WHERE QuestID = ? AND PlayerID = ?
            """, (quest_id, player_id),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
