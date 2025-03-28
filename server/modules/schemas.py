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

class GroupIdSchema(ProtectedModel):
    group_id: str
    
class GroupMemberSchema(ProtectedModel):
    group_id: str
    member_uuid: str
    
class GroupCreateSchema(ProtectedModel):
    name: str

class GroupInviteSchema(ProtectedModel):
    invite_email: str
    group_id: str

class GroupRenameSchema(ProtectedModel):
    group_id: str
    new_name: str
    

# Forms.

class FormIdSchema(ProtectedModel):
    form_id: str
    
class UpdateFormSchema(ProtectedModel):
    form_id: str
    settings: dict
    structure: list
    
    