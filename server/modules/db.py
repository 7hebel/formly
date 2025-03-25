import sqlite3
import uuid

db_conn = sqlite3.connect("./data/data.sql")
DB = db_conn.cursor()
DB.execute("""
    CREATE TABLE IF NOT EXISTS users (
        uuid STRING PRIMARY KEY,
        fullname STRING NOT NULL,
        email STRING NOT NULL UNIQUE,
        password STRING NOT NULL,
        owned_forms STRING NOT NULL,
        answered_forms STRING NOT NULL,
        trusted_ip STRING
    )
""")

def insert_user(fullname: str, email: str, password: str, trusted_ip: str) -> str:
    """ Insert new user into DB. Returns uuid. """
    user_id = uuid.uuid4().hex
    DB.execute("""
        INSERT INTO users (uuid, fullname, email, password, owned_forms, answered_forms, trusted_ip)
        VALUES (?, ?, ?, ?, '', '', ?)
    """, (user_id, fullname, email, password, trusted_ip))
    db_conn.commit()
    return user_id


def get_user_by_uuid(user_id: str) -> tuple[str] | None:
    DB.execute(f"SELECT * FROM users WHERE uuid='{user_id}'")    
    return DB.fetchone()

    
def is_email_used(email: str) -> bool:
    users_with_email = DB.execute(f"SELECT * FROM users WHERE email='{email}'").fetchall()
    return len(users_with_email) > 0
    