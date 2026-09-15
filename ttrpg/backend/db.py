# ===================
#       IMPORTS
# ===================
from flask import abort
import sqlite3
import os

# ==========================
#       DATABASE PATHS
# ==========================
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(ROOT_DIR, "database", "noah.db")
SQL_PATH = os.path.join(ROOT_DIR, "database", "noah.sql")

# ===============================
#       DATABASE CONNECTION
# ===============================
def get_connection(db_path=DB_PATH):
    # Return an SQLite connection with Foreign Keys enabled
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA FOREIGN_KEYS = ON")

    # Allows access by column name
    conn.row_factory = sqlite3.Row
    return conn

def fetchone_or_404(conn, sql: str, params: tuple = ()):
    # Execute SQL, return the row or abort with 404 if not found.
    cursor = conn.cursor()
    cursor.execute(sql, params)
    row = cursor.fetchone()
    if row is None:
        abort(404)
    return row