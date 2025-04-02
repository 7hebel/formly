from modules import users
from modules import logs

from dataclasses import dataclass, asdict
from datetime import datetime
import json
import time
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
        "assigned_only": True  (Allow only user with accounts to answer),
        "hide_answers": False 
    },
    "assigned": {
        "groups": [],
        "emails": []
    },
    "responding" {
        EMAIL: {
            fullname: ...
            started_at: timestamp
            response_id: ...
        }
    }
    "answers": {
        EMAIL: {
            fullname: ...
            started_at: ...
            finished_at: timestamp
            answers: []
            response_id: ...
        }
    }
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
    assigned_only: bool = False
    hide_answers: bool = False
    
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


def get_responded_by_user(user_uuid: str) -> list[str]:
    responded_by_user = []
    user = users.get_user_by_uuid(user_uuid)
    if user is None:
        logs.error("Forms", f"Failed to load list of forms responded by user: <{user_uuid}> (user not found)")
        return []

    for form_file in os.listdir(FORMS_DIR_PATH):
        form_id = form_file.split(".")[0]
        form = _get_form_content(form_id)
        if form and user.email in form["answers"]:
            responded_by_user.append(form_id)
    
    return responded_by_user

def is_assigned_to_user(form_id: str, user_uuid: str) -> bool:
    user = users.get_user_by_uuid(user_uuid)
    user_groups = user.groups.split("|")
    
    form = _get_form_content(form_id)
    if form is None:
        logs.error(f"Failed to check if form: ({form_id}) is assigned to user: <{user_uuid}> (form not found)")
        return False
    
    if form["author_uuid"] == user_uuid:
        return True
    
    if user.email in form["assigned"]["emails"]:
        return True
    
    for assigned_group in form["assigned"]["groups"]:
        if assigned_group in user_groups:
            return True
        
    return False


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
        "responding": {},
        "answers": {}
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


def get_sharable_form_data(form_id: str, user_uuid: str) -> dict | None:
    form_data = _get_form_content(form_id)
    if form_data is None:
        logs.error("Forms", f"Failed to create form brief as form was not found ({form_id})")
        return
    
    form_settings = form_data["settings"]
    assigned_groups = form_data["assigned"]["groups"]
    assigned_emails = form_data["assigned"]["emails"]
    form_settings["password"] = bool(form_settings["password"])
    
    user_email = None
    user = users.get_user_by_uuid(user_uuid)
    if user is not None:
        user_email = user.email
    
    characteristics = []
    if user_uuid == form_data["author_uuid"]:
        characteristics.append({"type": "author", "content": f"You are the [author]"})
        
        if assigned_groups or assigned_emails:
            if assigned_groups:
                content = f"Assigned to [{len(assigned_groups)} groups]"
                if assigned_emails:
                    content += f" and [{len(assigned_emails)} emails]"
                    
                characteristics.append({"type": "assign", "content": content})
            elif assigned_emails:
                characteristics.append({"type": "assign", "content": f"Assigned to [{len(assigned_emails)}] emails"})
        
    else:
        author_name = users.get_user_by_uuid(form_data["author_uuid"]).fullname
        characteristics.append({"type": "author", "content": f"Made by [{author_name}]"})
    if form_settings["is_anonymous"]:
        characteristics.append({"type": "anonymous", "content": "Answers are [anonymous]"})
    
    if user_email in form_data["answers"]:
        submitted_at_timestamp = form_data["answers"][user_email]["finished_at"]
        started_at_timestamp = form_data["answers"][user_email]["started_at"]
        
        submit_time = datetime.fromtimestamp(submitted_at_timestamp).strftime("%H:%M %d/%m/%Y")

        total_seconds = submitted_at_timestamp - started_at_timestamp
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        total_time = f"{hours:02}h {minutes:02}m"
        
        characteristics.append({"type": "submitted", "content": f"Submitted: [{submit_time}]"})
        characteristics.append({"type": "timelimit", "content": f"Answered in [{total_time}]"})
        
    else:
        if form_settings["time_limit_m"] > 0:
            characteristics.append({"type": "timelimit", "content": f"Time limit: [{form_settings['time_limit_m']} minutes]"})
        if form_settings["password"]:
            characteristics.append({"type": "password", "content": f"Form is secured with [password]"})
        if form_settings["hide_answers"]:
            characteristics.append({"type": "hidden_answers", "content": f"Your answers will be [hidden] after submission."})

        form_data.pop("structure")

    form_data["characteristics"] = characteristics
    return form_data
   
def create_responder_entry(form_id: str, email: str, fullname: str, host: str) -> tuple[bool, str]:
    form_data = _get_form_content(form_id)
    if form_data is None:
        logs.error("Forms", f"Failed to create responder entry for: {email} - {fullname} at form: ({form_id}) - form not found")
        return (False, "Form not found")
    
    form_responding = form_data["responding"]
    if email in form_responding:
        if form_responding[email]["host"] != users.hash_ip(host):
            logs.error("Forms", f"Failed to create responder entry for: {email} - {fullname} at form: ({form_id}) - email already responding...")
            return (False, "Person with this email is already responding.")

        logs.warn("Forms", f"Allowed respondent: {email} - {fullname} re-entrace to the form: ({form_id}) as the host is the same as previous.")

    if email in form_data["answers"]:
        logs.error("Forms", f"Failed to create responder entry for: {email} - {fullname} at form: ({form_id}) - email already responded...")
        return (False, "Person with this email has already answered this form.")

    timestamp = int(time.time())
    response_id = uuid.uuid4().hex
    entry = {
        "fullname": fullname,
        "started_at": timestamp,
        "response_id": response_id,
        "host": users.hash_ip(host)
    }

    form_data["responding"][email] = entry
    _save_form_content(form_id, form_data)
    logs.info("Forms", f"Created `responding` entry for: {email} - {fullname} at form: ({form_id}). ResponseID: {response_id}")
    return (True, response_id)    
    
def handle_response(form_id: str, response_id: str, answers: dict) -> bool | str:
    form_data = _get_form_content(form_id)
    if form_data is None:
        logs.error("Forms", f"Failed to handle response: {response_id} at form: ({form_id}) - form not found")
        return "Form not found"
    
    form_responding = form_data["responding"]
    for email in form_responding:
        if form_responding[email]["response_id"] == response_id:
            break
    else:
        logs.error("Forms", f"Failed to handle response: {response_id} at form: ({form_id}) - response id not found.")
        return "Response not found"

    response_data = form_data["responding"].pop(email)
    form_data["answers"][email] = {
        "fullname": response_data["fullname"],
        "started_at": response_data["started_at"],
        "finished_at": int(time.time()),
        "answers": answers,
        "response_id": response_id
    }
    
    _save_form_content(form_id, form_data)
    logs.info("Forms", f"Saved response: {response_id} at form: ({form_id}) for respondent: {email} - {response_data['fullname']}")
    return True

def remove_response(form_id: str, response_id: str) -> bool | str:
    form_data = _get_form_content(form_id)
    if form_data is None:
        logs.error("Forms", f"Failed to remove response: {response_id} at form: ({form_id}) - form not found")
        return "Form not found"

    for email in form_data["answers"]:
        if form_data["answers"][email]["response_id"] == response_id:
            break
    else:
        logs.error("Forms", f"Failed to remove response: {response_id} at form: ({form_id}) - response id not found.")
        return "Response not found"

    form_data["answers"].pop(email)
    _save_form_content(form_id, form_data)
    logs.warn("Forms", f"Removed response: {response_id} from form: ({form_id}) for respondent: {email}")
    return True
    
def remove_form(form_id: str) -> bool | str:
    if _get_form_content(form_id) is None:
        return "Form not found."
    
    os.remove(FORMS_DIR_PATH + form_id + ".json")
    logs.warn("Forms", f"Removed form: ({form_id})")
    return True
    
    