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


