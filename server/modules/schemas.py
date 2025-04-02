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
    assigned: dict[str, list[str]]
    
class FormRespondentSchema(BaseModel):
    form_id: str
    is_account: bool
    uuid: str = None
    fullname: str = None
    email: str = None
    password: str = None
    
class FormResponse(BaseModel):
    form_id: str
    response_id: str
    answers: dict
    
class DeleteFormResponse(ProtectedModel):
    form_id: str
    response_id: str
    
class GradeResponse(ProtectedModel):
    form_id: str
    response_id: str
    grades: dict
    