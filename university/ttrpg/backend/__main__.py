# ===================
#       IMPORTS
# ===================
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import hashlib
import random

from .db import get_connection, DB_PATH, SQL_PATH

# ========================
#       REPO IMPORTS
# ========================
from .repositories import area
from .repositories import category
from .repositories import difficulty
from .repositories import faction
from .repositories import game_session
from .repositories import game_status
from .repositories import player_game
from .repositories import profile
from .repositories import quest_profile
from .repositories import quests
from .repositories import role
from .repositories import spaceship
from .repositories import status
from .repositories import user

# =====================
#       FLASH APP
# =====================
app = Flask(__name__)
CORS(app)

# ===================================
#       DATABASE INITIALIZATION
# ===================================
def init_db(db_path=DB_PATH, sql_path=SQL_PATH):
    # Create the SQLite database from noah.sql if it doesn't exist.
    if not os.path.exists(db_path):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        with open(sql_path, "r", encoding="utf-8") as f:
            sql_script = f.read()
        conn = sqlite3.connect(db_path)
        conn.executescript(sql_script)
        conn.commit()
        conn.close()
        print(f"Database created at {db_path}!")
    else:
        print(f"Database already exists at {db_path}!")

PREFIXES = [
    "Astra", "Nyx", "Orion", "Vanta", "Erebus", "Lyra", "Draco",
    "Helios", "Zenith", "Umbra", "Nova", "Quasar", "Vortex",
    "Eclipse", "Pulsar", "Nebula", "Stellar", "Cosmos", "Ion", "Arc",
    "Kryth", "Veyra", "Solon", "Thalos", "Xyra", "Zenth", "Arkon",
    "Velor", "Myrr", "Oberon", "Caelum", "Drax", "Eryx", "Feron",
    "Galax", "Halon", "Icar", "Jorv", "Kael", "Lunor", "Morv",
    "Nexis", "Oryn", "Pyra", "Quell", "Raxor", "Sable", "Tyr"
]

MIDDLES = [
    "Prime", "Core", "Drift", "Exo", "Void", "Shard", "Flux",
    "Reach", "Edge", "Gate", "Spire", "Rift", "Haven", "Node",
    "Field", "Sector", "Belt", "Halo", "Zone", "Matrix", "Fold",
    "Arc", "Wave", "Step", "Ring", "Plane", "Bridge", "Nest",
    "Crown", "Vale", "Watch", "Locus", "Orbit", "Pulse", "Chain"
]

def generate_planet_name(seed: str):

    with get_connection() as conn:
        existing = set(row["Planet"] for row in conn.execute("SELECT Planet FROM FACTION").fetchall())

    while True:
        prefix = random.choice(PREFIXES)
        middle = random.choice(MIDDLES)

        name = f"{prefix} {middle}"

        if name not in existing:
            return name


# ====================
#        ROUTES
# ====================
@app.route("/factions", methods=["GET", "POST"])
def get_factions():
    if request.method == "GET":
        return jsonify([dict(r) for r in faction.get_all()])

    if request.method == "POST":
        data = request.get_json()
        faction_name = data.get("FactionName")

        if not faction_name:
            return jsonify({"error": "FactionName required"}), 400

        try:
            with get_connection() as conn:

                planet = generate_planet_name(faction_name)
                max_players = random.randint(10, 60)

                cur = conn.execute("""
                    INSERT INTO FACTION (FactionName, Planet, MaxPlayers)
                    VALUES (?, ?, ?)
                """, (faction_name, planet, max_players))

                conn.commit()

                return jsonify({
                    "FactionID": cur.lastrowid,
                    "FactionName": faction_name,
                    "Planet": planet,
                    "MaxPlayers": max_players
                }), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
# GRABS ALL USERS AND THE DATA FROM THE USER TABLE
@app.route("/users", methods=["GET", "POST"])
def get_users():
    if request.method == "GET":
        with get_connection() as conn:
            rows = conn.execute("""
                SELECT UserID, Username, Email, CreationDate
                FROM "USER"
            """).fetchall()
            return jsonify([dict(r) for r in rows])

    elif request.method == "POST":
        data = request.get_json()

        username = data.get("Username")
        email = data.get("Email")
        password = data.get("Password")

        if not username or not email or not password:
            return jsonify({"error": "Missing fields"}), 400

        password_hash = hashlib.sha256(password.encode()).hexdigest()

        with get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO "USER" (Username, Email, PasswordHash)
                VALUES (?, ?, ?)
            """, (username, email, password_hash))

            conn.commit()

        return jsonify({
            "UserID": cur.lastrowid,
            "Username": username,
            "Email": email
        }), 201
        
# USES THE INDIVIDUAL USER ID TO GRAB ALL DATA BELONGING TO THE USER
@app.route("/user/<int:user_id>/full")
def get_user_full(user_id):
    user_data = user.get_by_id(user_id)

    with get_connection() as conn:
        profiles = conn.execute("""SELECT * FROM PROFILE WHERE UserID = ?""", (user_id,)).fetchall()
        result_profiles = []

        for p in profiles:
            profile_dict = dict(p)

            # Direct relationships
            faction_row = conn.execute("""
                SELECT FactionID, FactionName, Planet, MaxPlayers
                FROM FACTION
                WHERE FactionID = ?
            """, (p["FactionID"],)).fetchone()
            spaceship_row = conn.execute("SELECT * FROM SPACESHIP WHERE ShipID = ?", (p["ShipID"],)).fetchone()
            category_row = conn.execute("SELECT * FROM CATEGORY WHERE CategoryID = ?", (p["CategoryID"],)).fetchone()
            role_row = conn.execute("SELECT * FROM ROLE WHERE RoleID = ?", (p["RoleID"],)).fetchone()
            status_row = conn.execute("SELECT * FROM STATUS WHERE StatusID = ?", (p["StatusID"],)).fetchone()

            # Game Sessions & Game Status
            games_rows = conn.execute("""
                SELECT 
                    gs.*,
                    gstat.StatusName AS GameStatusName,
                    pg.Score
                FROM GAME_SESSION gs
                JOIN GAME_STATUS gstat ON gs.StatusID = gstat.StatusID
                JOIN PLAYER_GAME pg ON gs.GameID = pg.GameID
                WHERE pg.PlayerID = ?
            """, (p["PlayerID"],)).fetchall()

            # Quests, Difficulty & Area
            quests_rows = conn.execute("""
                SELECT 
                    q.*,
                    d.DifficultyName,
                    a.AreaName
                FROM QUESTS q
                JOIN DIFFICULTY d ON q.DifficultyID = d.DifficultyID
                JOIN ORGANISATIONAL_AREA a ON q.AreaID = a.AreaID
                JOIN QUEST_PROFILE qp ON q.QuestID = qp.QuestID
                WHERE qp.PlayerID = ?
            """, (p["PlayerID"],)).fetchall()

            profile_dict["Faction"] = dict(faction_row) if faction_row else None
            profile_dict["Spaceship"] = dict(spaceship_row) if spaceship_row else None
            profile_dict["Category"] = dict(category_row) if category_row else None
            profile_dict["Role"] = dict(role_row) if role_row else None
            profile_dict["Status"] = dict(status_row) if status_row else None
            profile_dict["Games"] = [dict(g) for g in games_rows]
            profile_dict["Quests"] = [dict(q) for q in quests_rows]
            
            result_profiles.append(profile_dict)
    
    return jsonify({
        "User": {
            "UserID": user_data["UserID"],
            "Username": user_data["Username"],
            "Email": user_data["Email"],
            "CreationDate": user_data["CreationDate"]
        },
        "Profiles": result_profiles
    })

# USES THE INDIVIDUAL USER ID TO GRAB PARTIAL DATA BELONGING TO THE USER
@app.route("/user/<int:user_id>/partial")
def get_user_partial(user_id):
    user_data = user.get_by_id(user_id)
    with get_connection() as conn:
        profiles = conn.execute("""SELECT * FROM PROFILE WHERE UserID = ?""", (user_id,)).fetchall()
        result_profiles = []

        for p in profiles:
            profile_dict = dict(p)

            partial_profile = {
                "PlayerID": profile_dict.get("PlayerID"),
                "PlayerName": profile_dict.get("PlayerName"),
                "Rank": profile_dict.get("Rank"),
                "StatusID": profile_dict.get("StatusID"),
            }

            result_profiles.append(partial_profile)
        
    return jsonify({
        "User": {
            "UserID": user_data["UserID"],
            "Username": user_data["Username"],
            "Email": user_data["Email"],
            "CreationDate": user_data["CreationDate"]
        },
        "Profiles": result_profiles
    })

@app.route("/spaceships")
def get_spaceships():
    return jsonify([dict(row) for row in spaceship.get_all()])

@app.route("/categories")
def get_categories():
    return jsonify([dict(row) for row in category.get_all()])

@app.route("/roles")
def get_roles():
    return jsonify([dict(row) for row in role.get_all()])

@app.route("/statuses")
def get_statuses():
    return jsonify([dict(row) for row in status.get_all()])

@app.route("/profiles", methods=["GET", "POST"])
def profiles():
    if request.method == "GET":
        return jsonify([dict(r) for r in profile.get_all()])

    if request.method == "POST":
        data = request.get_json()

        try:
            faction_value = data["FactionID"]

            with get_connection() as conn:

                if isinstance(faction_value, str) and not faction_value.isdigit():

                    planet = generate_planet_name(faction_value)

                    cur = conn.execute("""
                        INSERT INTO FACTION (FactionName, Planet, MaxPlayers)
                        VALUES (?, ?, ?)
                    """, (
                        faction_value,
                        planet,
                        random.randint(10, 60)
                    ))

                    faction_id = cur.lastrowid

                else:
                    faction_id = int(faction_value)

                ship_value = data["ShipID"]

                if isinstance(ship_value, str) and not ship_value.isdigit():
                    cur = conn.execute(
                        "INSERT INTO SPACESHIP (ShipName) VALUES (?)",
                        (ship_value,)
                    )
                    ship_id = cur.lastrowid
                else:
                    ship_id = int(ship_value)

                cur = conn.execute("""
                    INSERT INTO PROFILE (
                        PlayerName, Rank, Experience,
                        UserID, FactionID, ShipID,
                        CategoryID, RoleID, StatusID
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    data["PlayerName"],
                    data.get("Rank", 1),
                    data.get("Experience", 0),
                    data["UserID"],
                    faction_id,
                    ship_id,
                    data["CategoryID"],
                    data["RoleID"],
                    data["StatusID"]
                ))

                conn.commit()

                return jsonify({
                    "PlayerID": cur.lastrowid,
                    "PlayerName": data["PlayerName"],
                    "FactionID": faction_id
                }), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route("/profiles/<int:player_id>", methods=["PUT"])
def update_profile(player_id):
    data = request.get_json()
    try:
        with get_connection() as conn:

            # Resolve ship — name string creates new, digit reuses existing
            ship_value = data["ShipID"]
            if isinstance(ship_value, str) and not ship_value.strip().isdigit():
                cur = conn.execute(
                    "INSERT INTO SPACESHIP (ShipName) VALUES (?)", (ship_value,)
                )
                ship_id = cur.lastrowid
            else:
                ship_id = int(ship_value)

            conn.execute("""
                UPDATE PROFILE SET
                    PlayerName = ?, FactionID = ?, ShipID = ?,
                    CategoryID = ?, RoleID = ?, StatusID = ?,
                    Experience = ?, Rank = ?
                WHERE PlayerID = ?
            """, (
                data["PlayerName"], data["FactionID"], ship_id,
                data["CategoryID"], data["RoleID"], data["StatusID"],
                data["Experience"], data["Rank"],
                player_id
            ))
            conn.commit()
            return jsonify({"ok": True}), 200

    except Exception as e:
        print(f"UPDATE ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/profiles/<int:player_id>", methods=["DELETE"])
def delete_profile(player_id):
    try:
        with get_connection() as conn:
            conn.execute("DELETE FROM QUEST_PROFILE WHERE PlayerID = ?", (player_id,))
            conn.execute("DELETE FROM PLAYER_GAME WHERE PlayerID = ?", (player_id,))
            conn.execute("DELETE FROM PROFILE WHERE PlayerID = ?", (player_id,))
            conn.commit()
            return jsonify({"ok": True}), 200
    except Exception as e:
        print(f"DELETE PROFILE ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        with get_connection() as conn:
            conn.execute('DELETE FROM "USER" WHERE UserID = ?', (user_id,))
            conn.commit()
            return jsonify({"ok": True}), 200
    except Exception as e:
        print(f"DELETE USER ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/quests", methods=["GET"])
def get_quests():
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT q.QuestID, q.QuestName, d.DifficultyName, a.AreaName
            FROM QUESTS q
            JOIN DIFFICULTY d ON q.DifficultyID = d.DifficultyID
            JOIN ORGANISATIONAL_AREA a ON q.AreaID = a.AreaID
        """).fetchall()
        return jsonify([dict(r) for r in rows])
    
@app.route('/game_sessions', methods=['POST'])
def create_game_session():
    data = request.get_json()
    try:
        with get_connection() as conn:
            cur = conn.execute("""
                INSERT INTO GAME_SESSION (GameDate, Duration, StatusID)
                VALUES (?, ?, ?)
            """, (data["GameDate"], data["Duration"], data["StatusID"]))
            game_id = cur.lastrowid

            conn.execute("""
                INSERT INTO PLAYER_GAME (PlayerID, GameID, Score)
                VALUES (?, ?, ?)
            """, (data["PlayerID"], game_id, data["Score"]))
            conn.commit()

            return jsonify({"GameID": game_id}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/quest_profiles", methods=["POST"])
def create_quest_profile():
    data = request.get_json()
    try:
        with get_connection() as conn:
            conn.execute("""
                INSERT INTO QUEST_PROFILE (QuestID, PlayerID) VALUES (?, ?)
            """, (data["QuestID"], data["PlayerID"]))
            conn.commit()
            return jsonify({"ok": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ===================
#       RUN APP
# ===================
if __name__ == "__main__":
    init_db()
    app.run(debug=True)