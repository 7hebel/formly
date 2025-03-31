from modules import users
from modules import logs

from dataclasses import dataclass, asdict
import json
import uuid
import os


"""
Saved form format:

{
    "author_uuid": "...",
    "structure": [  (list of pages of components)
        
    ],
    "settings": {
        "title": STRING
        "is_active": True,
        "is_anonymous": True,  (If False and accountless respondent - ask for fullname before form)
        "time_limit_m": 60 | 0 for not limit (in minutes), 
        "password": BCRYPT_HEX | False for no password,
        "accounts_only": True  (Allow only user with accounts to answer),
    },
    "assigned": {
        "groups": [],
        "emails": []
    }
    "answers": [
    ]
}
"""

FORMS_DIR_PATH = "./data/forms/"


@dataclass
class FormSettings:
    title: str
    is_active: bool = False
    is_anonymous: bool = False
    time_limit_m: int = 0
    password: str | None = None
    accounts_only: bool = False
    
    @staticmethod
    def from_dict(settings: dict) -> "FormSettings":
        return FormSettings(**settings)
        
    
def _get_form_content(form_id: str) -> dict | None:
    filepath = FORMS_DIR_PATH + form_id + ".json"
    if not os.path.exists(filepath):
        logs.error("Forms", f"Failed to get content of form: ({form_id}) as file was not found: {filepath}")
        return None
    
    with open(filepath, "r") as file:
        return json.load(file)
    
    
def _save_form_content(form_id: str, content: dict) -> None:
    filepath = FORMS_DIR_PATH + form_id + ".json"
    if not os.path.exists(filepath):
        logs.error("Forms", f"Failed to save content of form: ({form_id}) as file was not found")
        return None
    
    with open(filepath, "w") as file:
        return json.dump(content, file, indent=2)
    

def get_user_forms(user_uuid: str) -> list[str]:
    """ Get list form ids created by user.   """
    user_forms = []
    
    for form_file in os.listdir(FORMS_DIR_PATH):
        form_id = form_file.split(".")[0]
        form = _get_form_content(form_id)
        if form and form["author_uuid"] == user_uuid:
            user_forms.append(form_id)

    return user_forms


def get_assigned_to_user(user_uuid: str) -> list[str]:
    user = users.get_user_by_uuid(user_uuid)
    user_groups = user.groups.split("|")
    assigned_forms = []
    
    for form_file in os.listdir(FORMS_DIR_PATH):
        form_id = form_file.split(".")[0]
        form = _get_form_content(form_id)
        if form is not None:
            if form["author_uuid"] == user_uuid:
                continue
            
            if user.email in form["assigned"]["emails"]:
                assigned_forms.append(form_id)
                continue
            
            for assigned_group in form["assigned"]["groups"]:
                if assigned_group in user_groups:
                    assigned_forms.append(form_id)
                    break

    return assigned_forms


def get_forms_in_group(group_id: str, author_uuid: str) -> tuple[list[str], list[str]]:
    assigned_forms = []
    draft_forms = []
    
    for form_file in os.listdir(FORMS_DIR_PATH):
        form_id = form_file.split(".")[0]
        form = _get_form_content(form_id)
        if form is not None:
            for assigned_group in form["assigned"]["groups"]:
                if assigned_group == group_id:
                    if form["author_uuid"] == author_uuid:
                        draft_forms.append(form_id)
                        break
                    
                    else:
                        assigned_forms.append(form_id)
                        break

    return (assigned_forms, draft_forms)


def generate_form_title(user_uuid: str) -> str:
    """ Create title for new form based on amount of already created forms. """
    created_forms = get_user_forms(user_uuid)
    new_form_no = len(created_forms) + 1
    return f"My form #{new_form_no}"


def create_form(author_uuid: str) -> str:
    form_id = uuid.uuid4().hex
    form_filepath = f"./data/forms/{form_id}.json"

    form_settings = FormSettings(
        title=generate_form_title(author_uuid)
    )

    data = {
        "author_uuid": author_uuid,
        "structure": [],
        "settings": asdict(form_settings),
        "assigned": {
            "groups": [],
            "emails": []
        },
        "answers": []
    }

    with open(form_filepath, "a+") as form_file:
        json.dump(data, form_file, indent=2)

    return form_id


def update_form(form_id: str, new_settings: dict, structure: list, assigned: dict[str, list[str]]) -> None:
    form_data = _get_form_content(form_id)
    form_settings = FormSettings.from_dict(form_data["settings"])
    
    for (key, value) in new_settings.items():
        setattr(form_settings, key, value)
        
    form_data["settings"] = asdict(form_settings)
    form_data["structure"] = structure
    form_data["assigned"] = assigned
    _save_form_content(form_id, form_data)
    logs.info("Forms", f"Updated form settings and structure ({form_id})")


def get_enriched_form_data(form_id: str, user_uuid: str) -> dict:
    form_data = _get_form_content(form_id)
    form_settings = form_data["settings"]
    assigned_groups = form_data["assigned"]["groups"]
    assigned_emails = form_data["assigned"]["emails"]
    if user_uuid != form_data["author_uuid"]:
        form_settings["password"] = bool(form_settings["password"])
    
    characteristics = []
    if user_uuid == form_data["author_uuid"]:
        characteristics.append({"type": "author", "content": f"You are the [author]"})
    else:
        author_name = users.get_user_by_uuid(user_uuid).fullname
        characteristics.append({"type": "author", "content": f"Made by [{author_name}]"})
    if form_settings["is_anonymous"]:
        characteristics.append({"type": "anonymous", "content": "Answers are [anonymous]"})
    if form_settings["time_limit_m"] > 0:
        characteristics.append({"type": "timelimit", "content": f"Time limit: [{form_settings['time_limit_m']} minutes]"})
    if form_settings["password"]:
        characteristics.append({"type": "password", "content": f"Form is secured with [password]"})
    if assigned_groups or assigned_emails:
        if assigned_groups:
            content = f"Assigned to [{len(assigned_groups)} groups]"
            if assigned_emails:
                content += f" and [{len(assigned_emails)} emails]"
                
            characteristics.append({"type": "assign", "content": content})
        elif assigned_emails:
            characteristics.append({"type": "assign", "content": f"Assigned to [{len(assigned_emails)}] emails"})
        
    
    form_data["characteristics"] = characteristics
    return form_data
    
    