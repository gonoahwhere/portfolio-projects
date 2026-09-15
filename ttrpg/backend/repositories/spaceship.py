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
            INSERT INTO SPACESHIP
                (ShipName,
                Level,
                HealthPoints,
                AttackPower,
                DefencePower,
                ShipDestroyed)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                data["ShipName"],
                data.get("Level", 1),
                data.get("HealthPoints", 100),
                data.get("AttackPower", 10),
                data.get("DefencePower", 5),
                data.get("ShipDestroyed", 0),
            ),
        )
        conn.commit()
        return cursor.lastrowid

# ===================
#       READ
# ===================
def get_all() -> list[Any]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM SPACESHIP ORDER BY ShipName").fetchall()

def get_by_id(ship_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn, "SELECT * FROM SPACESHIP WHERE ShipID = ?", (ship_id,)
        )

# ===================
#       UPDATE
# ===================
def update(ship_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            UPDATE SPACESHIP
            SET 
                ShipName = ?, 
                Level = ?, 
                HealthPoints = ?, 
                AttackPower = ?, 
                DefencePower = ?, 
                ShipDestroyed = ?
            WHERE ShipID = ?
        """,
            (
                data["ShipName"],
                data.get("Level", 1),
                data.get("HealthPoints", 100),
                data.get("AttackPower", 10),
                data.get("DefencePower", 5),
                data.get("ShipDestroyed", 0),
                ship_id,
            ),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(ship_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM SPACESHIP WHERE ShipID = ?", (ship_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
