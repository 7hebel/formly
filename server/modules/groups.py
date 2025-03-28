from modules import users

import uuid
import json
import os


GROUPS_DIR_PATH = "./data/groups/"


def _get_group_content(group_id: str) -> dict | None:
    group_file_path = GROUPS_DIR_PATH + group_id + ".json"
    if not os.path.exists(group_file_path): return None

    with open(group_file_path, "r") as file:
        return json.load(file)

def _save_group_content(group_id: str, content: dict) -> None:
    group_file_path = GROUPS_DIR_PATH + group_id + ".json"
    with open(group_file_path, "w") as file:
        json.dump(content, file)


def create_group(name: str, owner_uuid: str) -> str:
    group_id = uuid.uuid4().hex

    with open(GROUPS_DIR_PATH + group_id + ".json", "a+") as file:
        json.dump({
            "name": name,
            "owner_uuid": owner_uuid,
            "members": [],
            "managers": [owner_uuid],
        }, file)

    return group_id


def delete_group(group_id: str, deleter_uuid: str) -> str | bool:
    group_file_path = GROUPS_DIR_PATH + group_id + ".json"
    with open(group_file_path, "r") as file:
        content = json.load(file)
    
    if content["owner_id"] != deleter_uuid:
        return "Only a group owner can delete group."

    os.remove(group_file_path)
    return True


def add_member_to_group(group_id: str, user_uuid: str) -> None:
    content = _get_group_content(group_id)
    if user_uuid not in content["members"]:
        content["members"].append(user_uuid)
        _save_group_content(group_id, content)


def remove_member_from_group(group_id: str, user_uuid: str) -> bool:
    content = _get_group_content(group_id)

    if user_uuid not in content["members"] and user_uuid not in content["managers"]:
        return False
    
    if user_uuid in content["members"]:
        content["members"].remove(user_uuid)
    if user_uuid in content["managers"]:
        content["managers"].remove(user_uuid)
    
    if user_uuid == content["owner_id"]:
        if content["managers"]:
            content["owner_id"] = content["managers"][0]
        elif content["members"]:
            content["owner_id"] = content["members"][0]
        else:
            return delete_group(group_id, user_uuid)
    
    _save_group_content(group_id, content)
    return True


def promote_group_member(group_id: str, promoted_uuid: str, promoter_uuid: str) -> bool | str:
    content = _get_group_content(group_id)

    if promoted_uuid in content["managers"]:
        return "Promoted member is already a manager."
    if promoted_uuid not in content["members"]:
        return "Promoted member not found in group."
    if promoter_uuid not in content["managers"]:
        return "Promoter is not a group manager."
    
    content["members"].remove(promoted_uuid)
    content["managers"].append(promoted_uuid)
    
    _save_group_content(group_id, content)
    return True


def demote_group_member(group_id: str, demoted_uuid: str, demoter_uuid: str) -> bool | str:
    content = _get_group_content(group_id)

    if demoted_uuid not in content["managers"]:
        return "Demoted member is not a group manager."
    if demoted_uuid == content["owner_uuid"]:
        return "Cannot demote group owner."
    if demoter_uuid not in content["managers"]:
        return "Demoter is not a group manager."
    
    content["managers"].remove(demoted_uuid)
    content["members"].append(demoted_uuid)
    
    _save_group_content(group_id, content)
    return True


def get_group_details(group_id: str, user_uuid: str) -> dict:
    content = _get_group_content(group_id)
    
    managers = []
    members = []
    
    for manager_id in content["managers"]:
        user = users.get_user_by_uuid(manager_id)
        if user:
            managers.append([user.fullname, user.uuid])

    for member_id in content["members"]:
        user = users.get_user_by_uuid(member_id)
        if user:
            members.append([user.fullname, user.uuid])
    
    return {
        "is_owner": user_uuid == content["owner_uuid"],
        "is_manager": user_uuid in content["managers"],
        "managers": managers,
        "members": members,
        "assigned_forms": [],
        "draft_forms": [],
    }
        
        
def fetch_user_groups_names(groups_ids: list[str]) -> list[tuple[str, str]]:
    groups_data = []
    
    for group_id in groups_ids:
        if not group_id: continue
        content = _get_group_content(group_id)
        name = content["name"]
    
        groups_data.append((group_id, name))        
    
    return groups_data
        

def rename_group(group_id: str, new_name: str) -> None:
    if len(new_name) < 3: return
    content = _get_group_content(group_id)
    content["name"] = new_name
    _save_group_content(group_id, content)
    
        
# Invitations

def add_group_invitation(user_uuid: str, group_id: str) -> bool | str:
    if users.get_user_by_uuid(user_uuid) is None:
        return "User not found."

    users.DB.execute("INSERT INTO invitations (user_uuid, group_id) VALUES (?, ?)", (user_uuid, group_id))
    users.db_conn.commit()
    return True

def delete_group_invitation(user_uuid: str, group_id: str) -> None:
    users.DB.execute("DELETE FROM invitations WHERE user_uuid=? AND group_id=?", (user_uuid, group_id))
    users.db_conn.commit()
    return True

def get_user_group_invitations(user_uuid: str) -> list[list[str, str]]:
    users.DB.execute("SELECT group_id FROM invitations WHERE user_uuid=?", (user_uuid,))

    invites = [
        (group_id[0], _get_group_content(group_id[0])["name"])
        for group_id in users.DB.fetchall()
    ]
        
    return invites

def is_user_invited(user_uuid: str, group_id: str) -> bool:
    users.DB.execute("SELECT * FROM invitations WHERE user_uuid=? AND group_id=?", (user_uuid, group_id))
    return len(users.DB.fetchall()) > 0
