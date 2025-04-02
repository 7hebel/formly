from modules import forms
from modules import users
from modules import logs

import uuid
import json
import os


GROUPS_DIR_PATH = "./data/groups/"


def _get_group_content(group_id: str) -> dict | None:
    group_file_path = GROUPS_DIR_PATH + group_id + ".json"
    if not os.path.exists(group_file_path): 
        logs.error("Groups", f"Failed to get group content as file was not found `{group_file_path}` [{group_id}]")
        return None

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

    logs.info("Groups", f"User <{owner_uuid}> created new group: `{name}` [{group_id}]")
    return group_id


def delete_group(group_id: str, deleter_uuid: str) -> str | bool:
    group_file_path = GROUPS_DIR_PATH + group_id + ".json"
    with open(group_file_path, "r") as file:
        content = json.load(file)
    
    if content["owner_uuid"] != deleter_uuid:
        logs.error("Groups", f"User <{deleter_uuid}> tried to delete group [{group_id}] but is not a owner. (owner: <{content['owner_uuid']}>)")
        return "Only a group owner can delete group."
    
    for user_uuid in content["members"]:
        users.remove_group_from_user_list(user_uuid, group_id)
    for user_uuid in content["managers"]:
        users.remove_group_from_user_list(user_uuid, group_id)

    if not os.path.exists(group_file_path):
        logs.error("Groups", f"Failed to delete group [{group_id}] by the owner <{content['owner_uuid']}> (group file no longer exists?)")
        return "Group is already removed."

    os.remove(group_file_path)
    logs.warn("Groups", f"Deleted group [{group_id}] by <{deleter_uuid}>")
    return True


def add_member_to_group(group_id: str, user_uuid: str) -> None:
    content = _get_group_content(group_id)
    if user_uuid not in content["members"] and user_uuid not in content["managers"]:
        content["members"].append(user_uuid)
        _save_group_content(group_id, content)
        logs.info("Groups", f"Added member <{user_uuid}> to group [{group_id}]")


def remove_member_from_group(group_id: str, user_uuid: str) -> bool:
    content = _get_group_content(group_id)

    if user_uuid not in content["members"] and user_uuid not in content["managers"]:
        logs.error("Groups", f"Failed to remove <{user_uuid}> from group [{group_id}]. User not found as member nor manager")
        return False
    
    if user_uuid == content["owner_uuid"]:
        logs.warn("Groups", f"Group owner <{user_uuid}> left the group [{group_id}]. Deleting group...")
        return delete_group(group_id, user_uuid)
        
    if user_uuid in content["members"]:
        logs.warn("Groups", f"Removed member <{user_uuid}> from group [{group_id}]")
        content["members"].remove(user_uuid)
    if user_uuid in content["managers"]:
        logs.warn("Groups", f"Removed manager <{user_uuid}> from group [{group_id}]")
        content["managers"].remove(user_uuid)
    
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
    logs.info("Groups", f"Promoted group member: <{promoted_uuid}> to a manager by: <{promoter_uuid}> in group [{group_id}]")
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
    logs.info("Groups", f"Demoted group manager: <{demoted_uuid}> to a member by: <{demoter_uuid}> in group [{group_id}]")
    return True


def get_group_details(group_id: str, user_uuid: str) -> dict | None:
    content = _get_group_content(group_id)
    if content is None:
        return 
    
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
    
    assigned, drafts = forms.get_forms_in_group(group_id, user_uuid)
    return {
        "name": content["name"],
        "is_owner": user_uuid == content["owner_uuid"],
        "is_manager": user_uuid in content["managers"],
        "managers": managers,
        "members": members,
        "assigned_forms": assigned,
        "draft_forms": drafts
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
    logs.info("Groups", f"Renamed group [{group_id}] to: `{new_name}`")
    
        
# Invitations

def add_group_invitation(user_uuid: str, group_id: str) -> bool | str:
    user = users.get_user_by_uuid(user_uuid) 
    if user is None:
        return "User not found."
        
    if group_id in user.groups.split("|"):
        return "User is already a member of this group."

    users.DB.execute("INSERT INTO invitations (user_uuid, group_id) VALUES (?, ?)", (user_uuid, group_id))
    users.db_conn.commit()

    logs.info("Groups", f"Invited user <{user_uuid}> to group [{group_id}]")
    return True

def delete_group_invitation(user_uuid: str, group_id: str) -> None:
    users.DB.execute("DELETE FROM invitations WHERE user_uuid=? AND group_id=?", (user_uuid, group_id))
    users.db_conn.commit()
    
    logs.info("Groups", f"Removed user invitation <{user_uuid}> to group [{group_id}] (either accepted or rejected)")
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
