import json
import uuid


"""
Saved form format:

{
    "author_uuid": "...",
    "structure": [  (list of pages of components)
        
    ],
    "settings": {
        "is_open": True,
        "avb_since": TIMESTAMP | 0 for no limit,
        "avb_to": TIMESTAMP | 0 for no limit,
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

insert_form("abc123", [[{"test": 123}]], {"isopen": 123123})
