from modules import logs

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
        groups STRING NOT NULL,
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


User = namedtuple("User", ["uuid", "fullname", "email", "password", "groups", "trusted_ip"])



def get_user_by_uuid(user_id: str) -> User | None:
    DB.execute(f"SELECT * FROM users WHERE uuid='{user_id}'")    
    data = DB.fetchone()
    if data is None:
        return logs.warn("Users", f"Failed to get user by uuid (not found) <{user_id}>")
    return User(*data)

def get_user_by_email(email: str) -> User | None:
    DB.execute(f"SELECT * FROM users WHERE email=?", (email.lower(),))
    data = DB.fetchone()
    if not data:
        return logs.warn("Users", f"Failed to get user by email (not found) `{email.lower()}`")
    return User(*data)


def register_user(fullname: str, email: str, raw_password: str, user_ip: str) -> User | str:
    if is_email_used(email):
        return "This email is already used by another user."
    
    encrypted_password = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
    
    user_id = uuid.uuid4().hex
    DB.execute("""
        INSERT INTO users (uuid, fullname, email, password, groups, trusted_ip)
        VALUES (?, ?, ?, ?, '', ?)
    """, (user_id, fullname, email, encrypted_password, hash_ip(user_ip)))
    db_conn.commit()
    
    logs.info("Users", f"Registered user: `{fullname}` `{email}` ID: <{user_id}>")
    return get_user_by_uuid(user_id)


def set_trusted_ip(user_uuid: str, raw_ip: str) -> None:
    DB.execute(f"UPDATE users SET trusted_ip=? WHERE uuid=?", (hash_ip(raw_ip), user_uuid))
    db_conn.commit()


def validate_password(user_uuid: str, raw_password: str) -> bool:
    user = get_user_by_uuid(user_uuid)
    if not user:
        logs.error("Users", f"Failed to validate user password (user not found): <{user_uuid}>")
        return False

    validation_status = bcrypt.checkpw(raw_password.encode(), user.password.encode())
    if not validation_status:
        logs.warn("Users", f"Invalid user password for: <{user_uuid}>")

    return validation_status


def prepare_user_brief(user_uuid: str) -> dict[str, str]:
    user = get_user_by_uuid(user_uuid)
        
    if user:
        return {
            "uuid": user_uuid,
            "fullname": user.fullname,
            "email": user.email,
        }
    

def logout(user_uuid: str) -> None:
    set_trusted_ip(user_uuid, "")
    logs.info("Users", f"Logged out <{user_uuid}>")
    

def update_fullname(user_uuid: str, new_name: str) -> None:
    DB.execute(f"UPDATE users SET fullname=? WHERE uuid=?", (new_name, user_uuid))
    db_conn.commit()
    logs.info("Users", f"Changed user's fullname to: `{new_name}` <{user_uuid}>")


def update_password(user_uuid: str, new_raw_password: str, current_password: str) -> bool | str:
    if not validate_password(user_uuid, current_password):
        logs.warn("Users", f"Failed to update user password (incorrect current provided) for: <{user_uuid}>")
        return "Incorrect current password."
    
    encrypted_password = bcrypt.hashpw(new_raw_password.encode(), bcrypt.gensalt()).decode()
    DB.execute(f"UPDATE users SET password=? WHERE uuid=?", (encrypted_password, user_uuid))
    db_conn.commit()
    
    logs.info("Users", f"Changed user's password. <{user_uuid}>")
    return True


def add_group_to_user_list(user_uuid: str, group_id: str) -> None:
    user = get_user_by_uuid(user_uuid)
    new_groups_list = user.groups + "|" + group_id
    DB.execute("UPDATE users SET groups=? WHERE uuid=?", (new_groups_list, user.uuid))
    db_conn.commit()

    logs.info("Users", f"Added group: [{group_id}] to user's groups-list <{user_uuid}>")

def remove_group_from_user_list(user_uuid: str, group_id: str) -> None:
    user = get_user_by_uuid(user_uuid)
    user_groups = user.groups.split("|")
    new_groups = list(filter(lambda g_id: g_id != group_id, user_groups))
    new_groups_list = "|".join(new_groups)
    DB.execute("UPDATE users SET groups=? WHERE uuid=?", (new_groups_list, user.uuid))
    db_conn.commit()
    
    logs.info("Users", f"Removed group: [{group_id}] from user's groups-list <{user_uuid}>")
    