from modules import db

import bcrypt


class Account:
    @staticmethod
    def register(fullname: str, email: str, raw_password: str) -> "Account | str":
        encrypted_password = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
        uuid = db.insert_user(fullname, email, encrypted_password)
        data = db.get_user_by_uuid(uuid)
        return Account(*data)
    
    def __init__(self, uuid: str, fullname: str, email: str, password: str, owned_forms: str, answered_forms: str) -> None:
        self.uuid = uuid
        self.fullname = fullname
        self.email = email
        self.password = password
        self.owned_forms = owned_forms.split("|")
        self.answered_forms = answered_forms.split("|")
        
        

