from modules.database import UsersDB
from modules import logs

import hashlib
import bcrypt



def is_email_used(email: str) -> bool:
    return get_user_by_email(email) is not None
    

def hash_ip(raw_ip: str) -> str:
    return hashlib.sha1(raw_ip.encode()).hexdigest()


def get_user_by_email(email: str) -> dict | None:
    email_user = UsersDB.fetch_all_where(lambda user: user["email"].lower() == email.lower())
    if email_user:
        return email_user[0]


def register_user(fullname: str, email: str, raw_password: str, user_ip: str) -> dict | str:
    if is_email_used(email):
        return "This email is already used by another user."
    
    encrypted_password = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
    data = {
        "fullname": fullname,
        "email": email,
        "password": encrypted_password,
        "trusted_ip": hash_ip(user_ip),
        "grading_schemas": []
    }
    
    user = UsersDB.create(data)
    
    logs.info("Users", f"Registered user: `{fullname}` `{email}` ID: <{user['uuid']}>")
    return user


def set_trusted_ip(user_uuid: str, raw_ip: str) -> None:
    UsersDB.update_field(user_uuid, "trusted_ip", hash_ip(raw_ip))


def validate_password(user_uuid: str, raw_password: str) -> bool:
    user = UsersDB.fetch(user_uuid)
    if not user:
        logs.error("Users", f"Failed to validate user password (user not found): <{user_uuid}>")
        return False

    validation_status = bcrypt.checkpw(raw_password.encode(), user["password"].encode())
    if not validation_status:
        logs.warn("Users", f"Invalid user password for: <{user_uuid}>")

    return validation_status


def prepare_user_brief(user_uuid: str) -> dict[str, str]:
    user = UsersDB.fetch(user_uuid)
        
    if user:
        return {
            "uuid": user_uuid,
            "fullname": user["fullname"],
            "email": user["email"],
        }
    

def logout(user_uuid: str) -> None:
    set_trusted_ip(user_uuid, "")
    logs.info("Users", f"Logged out <{user_uuid}>")
    

def update_password(user_uuid: str, new_raw_password: str, current_password: str) -> bool | str:
    if not validate_password(user_uuid, current_password):
        logs.warn("Users", f"Failed to update user password (incorrect current provided) for: <{user_uuid}>")
        return "Incorrect current password."
    
    encrypted_password = bcrypt.hashpw(new_raw_password.encode(), bcrypt.gensalt()).decode()
    UsersDB.update_field(user_uuid, "password", encrypted_password)
    
    logs.info("Users", f"Changed user's password for: <{user_uuid}>")
    return True

