from modules.database import ListsDB, FormsDB, UsersDB
from modules import text_grading
from modules import users
from modules import logs

from dataclasses import dataclass, asdict
from datetime import datetime
import threading
import time
import uuid


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
        "hide_answers": False,
        "grading_schema":  SCHEMA_ID or NULL for %
    },
    "assigned": {
        "lists": [],
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
            "grade": "74%"
        }
    },
}
"""


@dataclass
class FormSettings:
    title: str
    is_active: bool = False
    is_anonymous: bool = False
    time_limit_m: int = 0
    password: str | None = None
    assigned_only: bool = False
    hide_answers: bool = False,
    grading_schema: str | None = None
    
    @staticmethod
    def from_dict(settings: dict) -> "FormSettings":
        return FormSettings(**settings)
        
def get_user_forms(user_uuid: str) -> list[str]:
    forms = FormsDB.fetch_all_where(lambda form: form["author_uuid"] == user_uuid)
    return [form["form_id"] for form in forms]

def get_assigned_to_user(user_uuid: str) -> list[str]:
    user = UsersDB.fetch(user_uuid)
    assigned_forms = []
    
    for form in FormsDB.fetch_all():
        if form["author_uuid"] == user_uuid:
            continue
        
        if user["email"] in form["answers"]:
            continue
        
        if user["email"] in form["assigned"]["emails"]:
            assigned_forms.append(form["form_id"])
            continue
        
        for assigned_list in form["assigned"]["lists"]:
            list_content = ListsDB.fetch(assigned_list)
            if list_content and user["email"] in list_content["emails"]:
                assigned_forms.append(form["form_id"])
                break
                    
    return assigned_forms


def get_responded_by_user(user_uuid: str) -> list[str]:
    user = UsersDB.fetch(user_uuid)
    forms = FormsDB.fetch_all_where(lambda form: user["email"] in form["answers"])
    return [form["form_id"] for form in forms]


def is_assigned_to_user(form_id: str, user_uuid: str) -> bool:
    user = UsersDB.fetch(user_uuid)
    
    form = FormsDB.fetch(form_id)
    if form is None:
        logs.error(f"Failed to check if form: ({form_id}) is assigned to user: <{user_uuid}> (form not found)")
        return False
    
    if form["author_uuid"] == user_uuid:
        return True
    
    if user["email"] in form["assigned"]["emails"]:
        return True
    
    for assigned_list in form["assigned"]["lists"]:
        list_content = ListsDB.fetch(assigned_list)
        if list_content and user["email"] in list_content["emails"]:
            return True
        
    return False


def generate_form_title(user_uuid: str) -> str:
    """ Create title for new form based on amount of already created forms. """
    created_forms = get_user_forms(user_uuid)
    new_form_no = len(created_forms) + 1
    return f"My form #{new_form_no}"


def create_form(author_uuid: str) -> str:
    form_settings = FormSettings(title=generate_form_title(author_uuid))
    data = {
        "author_uuid": author_uuid,
        "structure": [],
        "settings": asdict(form_settings),
        "assigned": {
            "lists": [],
            "emails": []
        },
        "responding": {},
        "answers": {},
    }

    form = FormsDB.create(data)
    return form["form_id"]


def update_form(form_id: str, new_settings: dict, structure: list, assigned: dict[str, list[str]]) -> None:
    form_data = FormsDB.fetch(form_id)
    form_data["settings"] = new_settings
    form_data["structure"] = structure
    form_data["assigned"] = assigned
    FormsDB.save(form_id, form_data)
    reevaluate_form_responses(form_id)
    logs.info("Forms", f"Updated form settings and structure ({form_id})")


def get_grade_from_schema(schema_id: str, user_uuid: str, percentage_value: int) -> str | None:
    user_data = UsersDB.fetch(user_uuid)
    if user_data is None:
        logs.warn("Forms", f"Failed to fetch grade from schema: `{schema_id}` by user: <{user_uuid}> (user not found)")
        return None
    
    schema = user_data["grading_schemas"].get(schema_id)
    if schema is None:
        logs.warn("Forms", f"Failed to fetch grade from schema: `{schema_id}` by user: <{user_uuid}> (schema not found)")
        return None

    steps = schema["steps"] + [101]
    grades = schema["grades"]

    for index, step in enumerate(steps):
        if percentage_value < step:
            return grades[index]

    return None


def format_duration(seconds: int) -> str:
    if seconds < 60:
        return "few seconds"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes:02}:{remaining_seconds:02}"
    else:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        return f"{hours}h {minutes}m"

def get_sharable_form_data(form_id: str, user_uuid: str) -> dict | None:
    form_data = FormsDB.fetch(form_id)
    if form_data is None:
        logs.error("Forms", f"Failed to create form brief as form was not found ({form_id})")
        return
    
    form_settings = form_data["settings"]
    assigned_lists = form_data["assigned"]["lists"]
    assigned_emails = form_data["assigned"]["emails"]
    form_settings["password"] = bool(form_settings["password"])
    
    user_email = None
    user = UsersDB.fetch(user_uuid)
    if user is not None:
        user_email = user["email"]
    
    characteristics = []
    
    # Author only.
    if user_uuid == form_data["author_uuid"]:
        characteristics.append({"type": "author", "content": f"You are the [author]"})
        
        # Author and not answered by author.
        if user_email not in form_data["answers"] and (assigned_lists or assigned_emails):
            if assigned_lists:
                content = f"Assigned to [{len(assigned_lists)} lists]"
                if assigned_emails:
                    content += f" and [{len(assigned_emails)} emails]"
                    
                characteristics.append({"type": "assign", "content": content})
            elif assigned_emails:
                characteristics.append({"type": "assign", "content": f"Assigned to [{len(assigned_emails)}] emails"})
        
    else:
        author_name = UsersDB.fetch(form_data["author_uuid"])["fullname"]
        characteristics.append({"type": "author", "content": f"Made by [{author_name}]"})

    if form_settings["is_anonymous"]:
        characteristics.append({"type": "anonymous", "content": "Answers are [anonymous]"})
    
    if user_email in form_data["answers"]:
        submitted_at_timestamp = form_data["answers"][user_email]["finished_at"]
        started_at_timestamp = form_data["answers"][user_email]["started_at"]
        
        submit_time = datetime.fromtimestamp(submitted_at_timestamp).strftime("%H:%M %d/%m/%Y")

        total_seconds = submitted_at_timestamp - started_at_timestamp
        characteristics.append({"type": "submitted", "content": f"Submitted: [{submit_time}]"})
        characteristics.append({"type": "timelimit", "content": f"Answered in [{format_duration(total_seconds)}]"})

        form_data["graded"] = prepare_grade_info(form_data, user_email)
        form_data["answer"] = form_data["answers"][user_email]
        form_data["answer"]["email"] = user_email
            
    else:
        if form_settings["time_limit_m"] > 0:
            characteristics.append({"type": "timelimit", "content": f"Time limit: [{form_settings['time_limit_m']} minutes]"})
        if form_settings["password"]:
            characteristics.append({"type": "password", "content": f"Form is secured with [password]"})
        if form_settings["hide_answers"]:
            characteristics.append({"type": "hidden_answers", "content": f"Your answers will be [hidden] after submission."})

        form_data["graded"] = None
        form_data["answer"] = None
        form_data.pop("structure")

    form_data.pop("answers")
    form_data["characteristics"] = characteristics
    return form_data
   
   
def create_responder_entry(form_id: str, email: str, fullname: str, host: str) -> tuple[bool, str]:
    form_data = FormsDB.fetch(form_id)
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

    if form_data["settings"]["is_anonymous"]:
        anon_no = len(form_responding) + len(form_data["answers"]) + 1
        fullname = f"Anonymous respondent {anon_no}"

    timestamp = int(time.time())
    response_id = uuid.uuid4().hex
    entry = {
        "fullname": fullname,
        "started_at": timestamp,
        "response_id": response_id,
        "host": users.hash_ip(host),
        "anonymous": form_data["settings"]["is_anonymous"]
    }

    form_data["responding"][email] = entry
    FormsDB.save(form_id, form_data)
    
    logs.info("Forms", f"Created `responding` entry for: {email} - {fullname} at form: ({form_id}). ResponseID: {response_id}")
    return (True, response_id)    
    
    
def auto_grade_answers(form_id: str, email: str) -> None:
    form_data = FormsDB.fetch(form_id)
    structure = form_data["structure"]
    not_fully_gradable = False
    answers = form_data["answers"].get(email)
    if answers is None:
        return logs.error("Forms", f"Failed to auto-grade form: `{form_id}` for: {email} (response not found,)")

    answers = answers.get("answers")
    logs.info("Forms", f"Starting auto-grading response for form: `{form_id}` for: {email}")

    def get_component_data(component_id: str) -> dict | None:
        for component in structure:
            if component["componentId"] == component_id:
                return component
    
    for (component_id, data) in answers.items():
        component = get_component_data(component_id)
        correct_answer = component.get("correct")
        if component.get("points") is None:
            answers[component_id]["grade"] = 0
            not_fully_gradable = True
            continue
            
        points = int(component.get("points", 1) or 1) or 1
        user_answer = data["answer"]

        if not user_answer or correct_answer is None:
            answers[component_id]["grade"] = 0
            not_fully_gradable = True
            continue

        match component["componentType"]:
            case "short-text-answer" | "long-text-answer":
                # grade = text_grading.TextGrader.grade_answer(correct_answer, user_answer, points) or 0
                not_fully_gradable = True
                answers[component_id]["grade"] = 0
                    
            case "numeric-answer":
                if str(user_answer) == str(correct_answer):
                    answers[component_id]["grade"] = points
                else:
                    answers[component_id]["grade"] = 0
                        
            case "truefalse-answer":
                if int(user_answer) == int(correct_answer):
                    answers[component_id]["grade"] = points
                else:
                    answers[component_id]["grade"] = 0

            case "single-select-answer":
                if user_answer == correct_answer:
                    answers[component_id]["grade"] = points
                else:
                    answers[component_id]["grade"] = 0

            case "multi-select-answer":
                points = 0
                for selected_option in user_answer.split(","):
                    if selected_option in correct_answer:
                        points += 1
                    else:
                        points -= 1

                if points < 0:
                    points = 0
                answers[component_id]["grade"] = points
         
    form_data["answers"][email]["answers"] = answers
    
    if not_fully_gradable:
        form_data["answers"][email]["grade"] = "Not graded yet."
    else:
        form_data["answers"][email]["grade"] = get_full_grade(form_id, answers)
    
    FormsDB.save(form_id, form_data)
    logs.info("Forms", f"Finished auto-grading form: `{form_id}` for: {email}")
         

def get_full_grade(form_id: str, answers: dict) -> str | int:
    form_data = FormsDB.fetch(form_id)
    max_points = 0
    user_points = 0
    
    for component_data in form_data["structure"]:
        max_points += float(component_data.get("points", 1) or 1)
    
    for answer_data in answers.values():
        if answer_data["grade"] is None:
            return "Not graded yet."

        user_points += answer_data["grade"]
        
    if max_points == 0:
        return "Not graded."
    percentage_grade = min(round((user_points / max_points) * 100), 100)
    return f"{percentage_grade}%"
    
    
def handle_response(form_id: str, response_id: str, answers: dict) -> bool | str:
    form_data = FormsDB.fetch(form_id)
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

    for (key, value) in answers.items():
        answers[key] = {"answer": value, "grade": None}

    response_data = form_data["responding"].pop(email)
    form_data["answers"][email] = {
        "fullname": response_data["fullname"],
        "started_at": response_data["started_at"],
        "finished_at": int(time.time()),
        "answers": answers,
        "response_id": response_id,
        "grade": get_full_grade(form_id, answers)
    }
    
    FormsDB.save(form_id, form_data)
    threading.Thread(target=auto_grade_answers, args=(form_id, email), daemon=True).start()
    
    logs.info("Forms", f"Saved response: {response_id} at form: ({form_id}) for respondent: {email} - {response_data['fullname']}")
    return True


def remove_response(form_id: str, response_id: str) -> bool | str:
    form_data = FormsDB.fetch(form_id)

    for email in form_data["answers"]:
        if form_data["answers"][email]["response_id"] == response_id:
            break
    else:
        logs.error("Forms", f"Failed to remove response: {response_id} at form: ({form_id}) - response id not found.")
        return "Response not found"

    FormsDB.update_field(form_id, "answers", email, i_pop=True)
    logs.warn("Forms", f"Removed response: {response_id} from form: ({form_id}) for respondent: {email}")
    return True
    
    
def set_grades(form_id: str, response_id: str, grades: dict) -> str:
    form_data = FormsDB.fetch(form_id)
    if form_data is None:
        logs.error("Forms", f"Failed to grade response: {response_id} at form: ({form_id}) - form not found")
        return "Form not found"

    for email in form_data["answers"]:
        if form_data["answers"][email]["response_id"] == response_id:
            break
    else:
        logs.error("Forms", f"Failed to grade response: {response_id} at form: ({form_id}) - response id not found.")
        return "Response not found"
    
    for (component_id, grade) in grades.items():
        form_data["answers"][email]["answers"][component_id]["grade"] = grade
        
    full_grade = get_full_grade(form_id, form_data["answers"][email]["answers"])
    form_data["answers"][email]["grade"] = full_grade
    FormsDB.save(form_id, form_data)
    logs.info("Forms", f"Graded response: {response_id} at form: ({form_id})")
    return prepare_grade_info(FormsDB.fetch(form_id), email)
    
    
def remove_form(form_id: str) -> bool | str:
    FormsDB.remove(form_id)
    logs.warn("Forms", f"Removed form: ({form_id})")
    return True
    

def hide_anonymous_data(form_content: dict) -> dict:
    responding_emails = list(form_content["responding"].keys())
    answered_emails = list(form_content["answers"].keys())
    
    for (index, email) in enumerate(responding_emails, len(answered_emails) + 1):
        form_content["responding"][f"Anon {index + 1}"] = form_content["responding"][email]
        form_content["responding"].pop(email)
    
    for (index, email) in enumerate(answered_emails):
        form_content["answers"][f"Anon {index + 1}"] = form_content["answers"][email]
        form_content["answers"].pop(email)
        
    return form_content


def prepare_grade_info(form_content: dict, email: str) -> dict[str, str]:
    percentage_grade = form_content["answers"][email]["grade"]
    if form_content["settings"]["grading_schema"] and form_content["settings"]["grading_schema"] != "%":
        if percentage_grade.removesuffix("%").isnumeric():
            percentage_grade = int(percentage_grade.removesuffix("%"))
            
        schema_grade = get_grade_from_schema(form_content["settings"]["grading_schema"], form_content["author_uuid"], percentage_grade)
        return {
            "percentage": percentage_grade,
            "schema": schema_grade
        }
    else:
        return {
            "percentage": percentage_grade,
            "schema": ""
        }


def enrich_response_grades(form_content: dict) -> dict:
    for email in form_content["answers"]:
        form_content["answers"][email]["grade"] = prepare_grade_info(form_content, email)
        
    return form_content    
    

def reevaluate_form_responses(form_id: str) -> None:
    form_data = FormsDB.fetch(form_id)
    
    def _is_component_in_form(component_id: str) -> bool:
        for component in form_data["structure"]:
            if component["componentId"] == component_id:
                return True
        return False
    
    for email in form_data["answers"]:
        for component_id in form_data["answers"][email]["answers"]:
            if component_id in form_data["answers"][email] and not _is_component_in_form(component_id):
                form_data["answers"][email].pop(component_id)
                continue
        
        form_data["answers"][email]["grade"] = get_full_grade(form_id, form_data["answers"][email]["answers"])
        
    FormsDB.save(form_id, form_data)
    logs.info("Forms", f"Reevalutaed grades for form: ({form_id})")
        