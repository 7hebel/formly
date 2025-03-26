import json
import uuid


"""
Saved form format:

{
    "author_uuid": "...",
    "structure": [  (list of pages of components)
        
    ],
    "settings": {
        "title": STRING
        "is_open": True,
        "is_anonymous": True,  (If False and accountless respondent - ask for fullname before form)
        "avb_since": TIMESTAMP | 0 for no limit,
        "avb_to": TIMESTAMP | 0 for no limit,
        "time_limit_m": 60 | 0 for not limit (in minutes), 
        "password": BCRYPT_HEX | False for no password,
        "accounts_only": True  (Allow only user with accounts to answer),
        "switch_pages": True  (Allow users to switch pages manually)
    },
    "answers": [
    ]
}
"""


def insert_form(author_uuid: str, structure: list[list[dict]], settings: dict) -> str:
    form_id = uuid.uuid4().hex
    form_filepath = f"./data/forms/{form_id}.json"

    data = {
        "author_uuid": author_uuid,
        "structure": structure,
        "settings": settings,
        "answers": []
    }

    with open(form_filepath, "a+") as form_file:
        json.dump(data, form_file, indent=2)

    return form_id

