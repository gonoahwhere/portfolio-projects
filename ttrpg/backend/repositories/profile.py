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
            INSERT INTO PROFILE 
                (PlayerName, Rank, Experience, UserID, FactionID, ShipID, CategoryID, RoleID, StatusID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                data["PlayerName"],
                data.get("Rank", 1),
                data.get("Experience", 0),
                data["UserID"],
                data["FactionID"],
                data["ShipID"],
                data["CategoryID"],
                data["RoleID"],
                data["StatusID"],
            ),
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
                p.PlayerID,
                p.PlayerName,
                p.Rank,
                p.Experience,
                p.LastLogin,
                p.CreationDate,
                u.UserID,
                u.Username,
                f.FactionID,
                f.FactionName,
                s.ShipID,
                s.ShipName,
                c.CategoryID,
                c.CategoryName,
                r.RoleID,
                r.RoleName,
                st.StatusID,
                st.StatusName
            FROM PROFILE p
            JOIN USER u ON p.UserID = u.UserID
            JOIN FACTION f ON p.FactionID = f.FactionID
            JOIN SPACESHIP s ON p.ShipID = s.ShipID
            JOIN CATEGORY c ON p.CategoryID = c.CategoryID
            JOIN ROLE r ON p.RoleID = r.RoleID
            JOIN STATUS st ON p.StatusID = st.StatusID
            ORDER BY p.PlayerName
        """).fetchall()

def get_by_id(player_id: int):
    with get_connection() as conn:
        return fetchone_or_404(
            conn,
            """
            SELECT
                p.PlayerID,
                p.PlayerName,
                p.Rank,
                p.Experience,
                p.LastLogin,
                p.CreationDate,
                u.UserID,
                u.Username,
                f.FactionID,
                f.FactionName,
                s.ShipID,
                s.ShipName,
                c.CategoryID,
                c.CategoryName,
                r.RoleID,
                r.RoleName,
                st.StatusID,
                st.StatusName
            FROM PROFILE p
            JOIN USER u ON p.UserID = u.UserID
            JOIN FACTION f ON p.FactionID = f.FactionID
            JOIN SPACESHIP s ON p.ShipID = s.ShipID
            JOIN CATEGORY c ON p.CategoryID = c.CategoryID
            JOIN ROLE r ON p.RoleID = r.RoleID
            JOIN STATUS st ON p.StatusID = st.StatusID
            WHERE p.PlayerID = ?
        """,
            (player_id,),
        )

# ===================
#       UPDATE
# ===================
def update(player_id: int, data: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            UPDATE PROFILE 
            SET
                PlayerName = ?,
                Rank = ?,
                Experience = ?,
                UserID = ?,
                FactionID = ?,
                ShipID = ?,
                CategoryID = ?,
                RoleID = ?,
                StatusID = ?
            WHERE PlayerID = ?
        """,
            (
                data["PlayerName"],
                data.get("Rank", 1),
                data.get("Experience", 0),
                data["UserID"],
                data["FactionID"],
                data["ShipID"],
                data["CategoryID"],
                data["RoleID"],
                data["StatusID"],
                player_id,
            ),
        )
        conn.commit()

# ===================
#       DELETE
# ===================
def delete(player_id: int) -> None:
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM PROFILE WHERE PlayerID = ?", (player_id,),
        )
        if cursor.rowcount == 0:
            abort(404)
        conn.commit()
