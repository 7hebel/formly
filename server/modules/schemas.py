from pydantic import BaseModel


class RegisterSchema(BaseModel):
    fullname: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class FullnameUpdateSchema(BaseModel):
    uuid: str
    fullname: str

class EmailUpdateSchema(BaseModel):
    uuid: str
    email: str

class PasswordUpdateSchema(BaseModel):
    uuid: str
    new_password: str
    current_password: str
