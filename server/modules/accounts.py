from modules import db

import hashlib
import bcrypt


def hash_ip(raw_ip: str) -> str:
    return hashlib.sha1(raw_ip.encode()).hexdigest()


class Account:
    @staticmethod
    def register(fullname: str, email: str, raw_password: str, user_ip: str) -> "Account | str":
        if db.is_email_used(email):
            return "This email is already used by another user."
        
        encrypted_password = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
        uuid = db.insert_user(fullname, email, encrypted_password, hash_ip(user_ip))
        data = db.get_user_by_uuid(uuid)
        return Account(*data)
    
    @staticmethod
    def from_email(email: str) -> "Account | None":
        db.DB.execute(f"SELECT * FROM users WHERE email=?", (email,))
        data = db.DB.fetchone()
        if data:
            return Account(*data)
    
    @staticmethod
    def from_uuid(uuid: str) -> "Account | None":
        data = db.get_user_by_uuid(uuid)
        if data is not None:
            return Account(*data)
    
    def __init__(self, uuid: str, fullname: str, email: str, password: str, owned_forms: str, answered_forms: str, trusted_ip: str) -> None:
        self.uuid = uuid
        self.fullname = fullname
        self.email = email
        self.password = password
        self.owned_forms = owned_forms.split("|")
        self.answered_forms = answered_forms.split("|")
        self.trusted_ip = trusted_ip
        
    def set_trusted_ip(self, raw_ip: str) -> None:
        self.trusted_ip = hash_ip(raw_ip)
        db.DB.execute(f"UPDATE users SET trusted_ip=? WHERE uuid=?", (self.trusted_ip, self.uuid))

    def validate_password(self, raw_password: str) -> bool:
        return bcrypt.checkpw(raw_password.encode(), self.password.encode())

    def prepare_login_data(self) -> dict[str, str]:
        return {
            "uuid": self.uuid,
            "fullname": self.fullname,
            "email": self.email
        }
        
    def logout(self) -> None:
        self.set_trusted_ip("")
        
    def update_fullname(self, new_name: str) -> None:
        self.fullname = new_name
        db.DB.execute(f"UPDATE users SET fullname=? WHERE uuid=?", (new_name, self.uuid))
        
    def update_email(self, new_email: str) -> bool | str:
        if db.is_email_used(new_email):
            return "This email is already used by another user."
        
        self.email = new_email
        db.DB.execute(f"UPDATE users SET email=? WHERE uuid=?", (new_email, self.uuid))
        return True
        
    def update_password(self, new_raw_password: str, current_password) -> bool | str:
        if not self.validate_password(current_password):
            return "Incorrect current password."
        
        encrypted_password = bcrypt.hashpw(new_raw_password.encode(), bcrypt.gensalt()).decode()
        self.password = encrypted_password
        db.DB.execute(f"UPDATE users SET password=? WHERE uuid=?", (encrypted_password, self.uuid))
        
 
