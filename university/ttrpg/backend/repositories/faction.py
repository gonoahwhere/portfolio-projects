from typing import Any
from flask import abort

from ..db import get_connection, fetchone_or_404

# ===================
#       CREATE
# ===================
def create(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            """INSERT INTO FACTION (FactionName, Planet, Description, MaxPlayers) VALUES (?, ?, ?, ?)""",
            (
                data["FactionName"],
                data.get("Planet", "Earth"),
                data.get("Description"),
                data["MaxPlayers"],
            ),
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM FACTION ORDER BY FactionName").fetchall()

def get_by_id(faction_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn, "SELECT * FROM FACTION WHERE FactionID = ?", (faction_id,)
        )

# ===================
#       UPDATE
# ===================
def update(faction_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            UPDATE FACTION
            SET 
                FactionName = ?, 
                Planet = ?, 
                Description = ?,
                MaxPlayers = ?
            WHERE FactionID = ?
        """,
            (
                data["FactionName"],
                data.get("Planet", "Earth"),
                data.get("Description"),
                data["MaxPlayers"],
                faction_id,
            ),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(faction_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM FACTION WHERE FactionID = ?", (faction_id),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
