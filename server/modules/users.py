from collections import namedtuple
import sqlite3
import hashlib
import bcrypt
import uuid


db_conn = sqlite3.connect("./data/data.sql")
DB = db_conn.cursor()
DB.execute("""
    CREATE TABLE IF NOT EXISTS users (
        uuid STRING PRIMARY KEY,
        fullname STRING NOT NULL,
        email STRING NOT NULL UNIQUE,
        password STRING NOT NULL,
        trusted_ip STRING
    )
""")
DB.execute("""
    CREATE TABLE IF NOT EXISTS invitations (
        user_uuid STRING NOT NULL,
        group_id STRING NOT NULL,
        PRIMARY KEY (user_uuid, group_id),
        FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE
    )        
""")


def is_email_used(email: str) -> bool:
    users_with_email = DB.execute(f"SELECT * FROM users WHERE email='{email}'").fetchall()
    return len(users_with_email) > 0
    
def hash_ip(raw_ip: str) -> str:
    return hashlib.sha1(raw_ip.encode()).hexdigest()


User = namedtuple("User", ["uuid", "fullname", "email", "password", "trusted_ip"])


def get_user_by_uuid(user_id: str) -> User | None:
    DB.execute(f"SELECT * FROM users WHERE uuid='{user_id}'")    
    data = DB.fetchone()
    if data is not None:
        return User(*data)    

def get_user_by_email(email: str) -> User | None:
    DB.execute(f"SELECT * FROM users WHERE email=?", (email,))
    data = DB.fetchone()
    if data:
        return User(*data)

def register_user(fullname: str, email: str, raw_password: str, user_ip: str) -> User | str:
    if is_email_used(email):
        return "This email is already used by another user."
    
    encrypted_password = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
    
    user_id = uuid.uuid4().hex
    DB.execute("""
        INSERT INTO users (uuid, fullname, email, password, trusted_ip)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, fullname, email, encrypted_password, hash_ip(user_ip)))
    db_conn.commit()
    
    return get_user_by_uuid(user_id)

def set_trusted_ip(user_uuid: str, raw_ip: str) -> None:
    DB.execute(f"UPDATE users SET trusted_ip=? WHERE uuid=?", (hash_ip(raw_ip), user_uuid))

def validate_password(user_uuid: str, raw_password: str) -> bool:
    user = get_user_by_uuid(user_uuid)
    if user:
        return bcrypt.checkpw(raw_password.encode(), user.password.encode())

def prepare_user_brief(user_uuid: str) -> dict[str, str]:
    user = get_user_by_uuid(user_uuid)
    if user:
        return {
            "uuid": user_uuid,
            "fullname": user.fullname,
            "email": user.email
        }
    
def logout(user_uuid: str) -> None:
    set_trusted_ip(user_uuid, "")
    
def update_fullname(user_uuid: str, new_name: str) -> None:
    DB.execute(f"UPDATE users SET fullname=? WHERE uuid=?", (new_name, user_uuid))
    
def update_email(user_uuid: str, new_email: str) -> bool | str:
    if is_email_used(new_email):
        return "This email is already used by another user."
    
    DB.execute(f"UPDATE users SET email=? WHERE uuid=?", (new_email, user_uuid))
    return True
    
def update_password(user_uuid: str, new_raw_password: str, current_password: str) -> bool | str:
    if not validate_password(user_uuid, current_password):
        return "Incorrect current password."
    
    encrypted_password = bcrypt.hashpw(new_raw_password.encode(), bcrypt.gensalt()).decode()
    DB.execute(f"UPDATE users SET password=? WHERE uuid=?", (encrypted_password, user_uuid))
    
