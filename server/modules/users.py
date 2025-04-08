from modules import logs

import hashlib
import bcrypt
import uuid
import json
import os


USERS_DIR_PATH = "./data/users/"


def _get_user_content(user_uuid: str) -> dict | None:
    user_file_path = USERS_DIR_PATH + user_uuid + ".json"
    if not os.path.exists(user_file_path): 
        logs.error("Groups", f"Failed to get user content as file was not found `{user_file_path}` <{user_uuid}>")
        return None

    with open(user_file_path, "r") as file:
        return json.load(file)

def _save_user_content(user_uuid: str, content: dict) -> None:
    user_file_path = USERS_DIR_PATH + user_uuid + ".json"
    with open(user_file_path, "w") as file:
        json.dump(content, file)


def is_email_used(email: str) -> bool:
    return get_user_by_email(email) is not None
    

def hash_ip(raw_ip: str) -> str:
    return hashlib.sha1(raw_ip.encode()).hexdigest()


def get_user_by_uuid(uuid: str) -> dict | None:
    user_data = _get_user_content(uuid)
    if user_data is None:
        return logs.warn("Users", f"Failed to get user by uuid (not found) <{uuid}>")
    return user_data


def get_user_by_email(email: str) -> dict | None:
    for user_file in os.listdir(USERS_DIR_PATH):
        user_uuid = user_file.split(".")[0]
        user = _get_user_content(user_uuid)
        if user and user["email"].lower() == email.lower():
            return user


def register_user(fullname: str, email: str, raw_password: str, user_ip: str) -> dict | str:
    if is_email_used(email):
        return "This email is already used by another user."
    
    encrypted_password = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
    
    user_uuid = uuid.uuid4().hex
    data = {
        "uuid": user_uuid,
        "fullname": fullname,
        "email": email,
        "password": encrypted_password,
        "trusted_ip": hash_ip(user_ip),
    }
    
    _save_user_content(user_uuid, data)
    
    logs.info("Users", f"Registered user: `{fullname}` `{email}` ID: <{user_uuid}>")
    return get_user_by_uuid(user_uuid)


def set_trusted_ip(user_uuid: str, raw_ip: str) -> None:
    user = _get_user_content(user_uuid)
    user["trusted_ip"] = hash_ip(raw_ip)
    _save_user_content(user_uuid, user)


def validate_password(user_uuid: str, raw_password: str) -> bool:
    user = get_user_by_uuid(user_uuid)
    if not user:
        logs.error("Users", f"Failed to validate user password (user not found): <{user_uuid}>")
        return False

    validation_status = bcrypt.checkpw(raw_password.encode(), user["password"].encode())
    if not validation_status:
        logs.warn("Users", f"Invalid user password for: <{user_uuid}>")

    return validation_status


def prepare_user_brief(user_uuid: str) -> dict[str, str]:
    user = get_user_by_uuid(user_uuid)
        
    if user:
        return {
            "uuid": user_uuid,
            "fullname": user["fullname"],
            "email": user["email"],
        }
    

def logout(user_uuid: str) -> None:
    set_trusted_ip(user_uuid, "")
    logs.info("Users", f"Logged out <{user_uuid}>")
    

def update_fullname(user_uuid: str, new_name: str) -> None:
    user = _get_user_content(user_uuid)
    old_name = user["fullname"]
    user["fullname"] = new_name
    _save_user_content(user_uuid, user)
    logs.info("Users", f"Changed user's fullname from: `{old_name}` to: `{new_name}` <{user_uuid}>")


def update_password(user_uuid: str, new_raw_password: str, current_password: str) -> bool | str:
    if not validate_password(user_uuid, current_password):
        logs.warn("Users", f"Failed to update user password (incorrect current provided) for: <{user_uuid}>")
        return "Incorrect current password."
    
    encrypted_password = bcrypt.hashpw(new_raw_password.encode(), bcrypt.gensalt()).decode()
    
    user = _get_user_content(user_uuid)
    user["password"] = encrypted_password
    _save_user_content(user_uuid, user)
    
    logs.info("Users", f"Changed user's password for: <{user_uuid}>")
    return True

