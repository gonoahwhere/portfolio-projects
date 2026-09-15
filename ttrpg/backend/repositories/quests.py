from typing import Any
from flask import abort

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO QUESTS (QuestName, DifficultyID, AreaID)
            VALUES (?, ?, ?)
        """,
            (data["QuestName"], data["DifficultyID"], data["AreaID"]),
        )
        conn.commit()
        return cursor.lastrowid
    
# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("""
            SELECT
                q.QuestID,
                q.QuestName,
                d.DifficultyID,
                d.DifficultyName,
                a.AreaID,
                a.AreaName
            FROM QUESTS q
            JOIN DIFFICULTY d ON q.DifficultyID = d.DifficultyID
            JOIN ORGANISATIONAL_AREA a ON q.AreaID = a.AreaID
            ORDER BY q.QuestName
        """).fetchall()

def get_by_id(quest_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn,
            """
            SELECT
                q.QuestID,
                q.QuestName,
                d.DifficultyID,
                d.DifficultyName,
                a.AreaID,
                a.AreaName
            FROM QUESTS q
            JOIN DIFFICULTY d ON q.DifficultyID = d.DifficultyID
            JOIN ORGANISATIONAL_AREA a ON q.AreaID = a.AreaID
            WHERE q.QuestID = ?
        """,
            (quest_id,),
        )

# ===================
#       UPDATE
# ===================
def update(quest_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            UPDATE QUESTS
            SET
                QuestName = ?,
                DifficultyID = ?,
                AreaID = ?
            WHERE QuestID = ?
        """,
            (data["QuestName"], data["DifficultyID"], data["AreaID"], quest_id),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(quest_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM QUESTS WHERE QuestID = >", (quest_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
