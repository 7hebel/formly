import sqlite3
import uuid

db_conn = sqlite3.connect("./data/data.sql", autocommit=True)
DB = db_conn.cursor()
DB.execute("""
    CREATE TABLE IF NOT EXISTS users (
        uuid STRING PRIMARY KEY,
        fullname STRING NOT NULL,
        email STRING NOT NULL,
        password STRING NOT NULL,
        owned_forms STRING NOT NULL,
        answered_forms STRING NOT NULL
    )
""")


def insert_user(fullname: str, email: str, password: str) -> str:
    """ Insert new user into DB. Returns uuid. """
    user_id = uuid.uuid4().hex
    DB.execute(f"""
       INSERT INTO users
       VALUES ('{user_id}', '{fullname}', '{email}', '{password}', '', '')
    """)

    return user_id


def get_user_by_uuid(user_id: str) -> tuple[str] | None:
    DB.execute(f"SELECT * FROM users WHERE uuid='{user_id}'")    
    return DB.fetchone()

    
def is_email_used(email: str) -> bool:
    users_with_email = DB.execute(f"SELECT * FROM users WHERE email='{email}'").fetchall()
    return len(users_with_email) > 0
    