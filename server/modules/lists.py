from modules.database import ListsDB
from modules import logs


def create_list(user_uuid: str, name: str) -> str:
    data = {
        "owner_uuid": user_uuid,
        "name": name,
        "emails": []
    }
    
    list_data = ListsDB.create(data)
    logs.info("Lists", f"Created list: `{name}` for <{user_uuid}>")
    return list_data["list_id"]

def remove_list(list_id: str) -> bool | str:
    ListsDB.remove(list_id)
    logs.info("Lists", f"Removed list: `{list_id}`")
    return True

def rename_list(list_id: str, new_name: str) -> bool | str:
    if not new_name or not new_name.strip():
        logs.error("Lists", f"Failed to rename list: `{list_id}` to: `{new_name}` (invalid new name)")
        return "Invalid list name"
    
    ListsDB.update_field(list_id, "name", new_name)
    logs.info("Lists", f"Renamed list: `{list_id}` to: `{new_name}`")
    return True

def add_email_to_list(list_id: str, email: str) -> bool | str:
    if not email or not email.strip():
        logs.error("Lists", f"Failed to add email: `{email}` to list: `{list_id}` (invalid email)")
        return "Invalid email"
    
    ListsDB.update_field(list_id, "emails", email, i_push=True)
    logs.info("Lists", f"Added email: `{email}` to list: `{list_id}`")
    return True

def remove_email_from_list(list_id: str, email: str) -> bool | str:
    ListsDB.update_field(list_id, "emails", email, i_pop=True)
    logs.info("Lists", f"Removed email: `{email}` from list: `{list_id}`")
    return True
