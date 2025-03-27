from pydantic import BaseModel


class ProtectedModel(BaseModel):
    uuid: str
    

#  Accounts.

class RegisterSchema(BaseModel):
    fullname: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class FullnameUpdateSchema(ProtectedModel):
    fullname: str

class EmailUpdateSchema(ProtectedModel):
    email: str

class PasswordUpdateSchema(ProtectedModel):
    new_password: str
    current_password: str


#  Groups.

class GroupCreateSchema(ProtectedModel):
    name: str

class FetchGroupSchema(ProtectedModel):
    group_id: str
