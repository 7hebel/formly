from modules import forms
from modules import logs

import uuid
import json
import os


LISTS_DIR_PATH = "./data/lists/"


def _get_list_content(list_id: str) -> dict | None:
    list_file_path = LISTS_DIR_PATH + list_id + ".json"
    if not os.path.exists(list_file_path): 
        logs.error("Groups", f"Failed to get group content as file was not found `{list_file_path}`: `{list_id}`")
        return None

    with open(list_file_path, "r") as file:
        return json.load(file)

def _save_list_content(list_id: str, content: dict) -> None:
    list_file_path = LISTS_DIR_PATH + list_id + ".json"
    with open(list_file_path, "w") as file:
        json.dump(content, file)


def get_user_lists(user_uuid: str) -> list[str]:
    user_lists = []
    
    for list_file in os.listdir(LISTS_DIR_PATH):
        list_id = list_file.split(".")[0]
        list_content = _get_list_content(list_id)
        if list_content["owner_uuid"] == user_uuid:
            list_content["forms"] = get_forms_in_list(list_id)
            user_lists.append(list_content)
            
    return user_lists

def create_list(user_uuid: str, name: str) -> str:
    list_id = uuid.uuid4().hex
    data = {
        "list_id": list_id,
        "owner_uuid": user_uuid,
        "name": name,
        "emails": []
    }
    
    _save_list_content(list_id, data)
    
    logs.info("Lists", f"Created list: `{name}` for <{user_uuid}>")
    return list_id

def remove_list(list_id: str) -> bool | str:
    os.remove(LISTS_DIR_PATH + list_id + ".json")
    logs.info("Lists", f"Removed list: `{list_id}`")
    return True

def rename_list(list_id: str, new_name: str) -> bool | str:
    list_content = _get_list_content(list_id)
    
    if not new_name or not new_name.strip():
        logs.error("Lists", f"Failed to rename list: `{list_id}` to: `{new_name}` (invalid new name)")
        return "Invalid list name"
    
    list_content["name"] = new_name
    _save_list_content(list_id, list_content)
    
    logs.info("Lists", f"Renamed list: `{list_id}` to: `{new_name}`")
    return True

def add_email_to_list(list_id: str, email: str) -> bool | str:
    list_content = _get_list_content(list_id)
    
    if not email or not email.strip():
        logs.error("Lists", f"Failed to add email: `{email}` to list: `{list_id}` (invalid email)")
        return "Invalid email"
    
    list_content["emails"].append(email)
    _save_list_content(list_id, list_content)
    
    logs.info("Lists", f"Added email: `{email}` to list: `{list_id}`")
    return True

def remove_email_from_list(list_id: str, email: str) -> bool | str:
    list_content = _get_list_content(list_id)

    if email not in list_content["emails"]:
        logs.error("Lists", f"Failed to remove email: `{email}` from list: `{list_id}` (email not found on the list)")
        return "Email not found in list"
    
    list_content["emails"].remove(email)
    _save_list_content(list_id, list_content)
    
    logs.info("Lists", f"Removed email: `{email}` from list: `{list_id}`")
    return True

def get_forms_in_list(list_id: str) -> list[str]:
    assigned_forms = []
    
    for form_file in os.listdir(forms.FORMS_DIR_PATH):
        form_id = form_file.split(".")[0]
        form = forms._get_form_content(form_id)
        if form is not None:
            if list_id in form["assigned"]["lists"]:
                assigned_forms.append(form_id)
                
    return assigned_forms
