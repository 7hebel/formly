import os

if not os.path.exists("./data/"): os.mkdir("./data/")
if not os.path.exists("./data/forms"): os.mkdir("./data/forms/")
if not os.path.exists("./data/groups"): os.mkdir("./data/groups/")
if not os.path.exists("./data/logs"): os.mkdir("./data/logs/")

from modules import schemas
from modules import groups
from modules import forms
from modules import users
from modules import logs

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request
from functools import wraps
import fastapi
import uvicorn


api = fastapi.FastAPI()
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def api_response(success: bool, data: str | dict | list | None = None, err_msg: str | None = None) -> JSONResponse:
    if not success:
        logs.error("API", f"Sending unsuccesful response: `{err_msg}`")
    
    status_code = 200 if success else 400
    return JSONResponse({
        "status": success,
        "err_msg": err_msg,
        "data": data
    }, status_code)


def protected_endpoint(endpoint_fn):
    @wraps(endpoint_fn)
    async def wrapper(*args, **kwargs):
        data = kwargs.get("data")
        uuid = data.uuid if data else kwargs.get("uuid")

        request = kwargs["request"]
        caller_ip = request.client.host
        
        user = users.get_user_by_uuid(uuid)
        if user is None:
            return api_response(False, err_msg=f"Validation failed: provided invalid uuid: `{uuid}` to protected endpoint.")
        
        if users.hash_ip(caller_ip) != user.trusted_ip:
            return api_response(False, err_msg=f"Validation failed: called protected endpoint by untrusted host. Relogin.")

        return await endpoint_fn(*args, **kwargs)
    return wrapper


def protect_group_endpoint(manager_only: bool = False, owner_only: bool = False):
    def protect(endpoint_fn):
        @wraps(endpoint_fn)
        async def wrapper(*args, **kwargs):
            data = kwargs.get("data")
            uuid = data.uuid if data else kwargs.get("uuid")
            group_id = data.group_id if data else kwargs.get("group_id")

            user = users.get_user_by_uuid(uuid)
            if user is None:
                return api_response(False, err_msg=f"Validation failed: provided invalid uuid: `{uuid}` to protected group endpoint.")

            group_content = groups._get_group_content(group_id)
            if group_content is None:
                return api_response(False, err_msg=f"Validation failed: provided invalid group_id: `{group_id}` to protected group endpoint.")

            if manager_only and user.uuid not in group_content.get("managers", []):
                return api_response(False, err_msg=f"Validation failed: called manager-only group endpoint as non-manager. Group: `{group_id}` User: `{uuid}`")
                
            if owner_only and user.uuid != group_content.get("owner_uuid"):
                return api_response(False, err_msg=f"Validation failed: called owner-only group endpoint as non-owner. Group: `{group_id}` User: `{uuid}`")
        
            return await endpoint_fn(*args, **kwargs)
        return wrapper
    return protect 


def protect_form_endpoint(author_only: bool = False):
    def protect(endpoint_fn):
        @wraps(endpoint_fn)
        async def wrapper(*args, **kwargs):
            data = kwargs.get("data")
            uuid = data.uuid if data else kwargs.get("uuid")
            form_id = data.form_id if data else kwargs.get("form_id")

            user = users.get_user_by_uuid(uuid)
            if user is None:
                return api_response(False, err_msg=f"Validation failed: provided invalid uuid: `{uuid}` to protected form endpoint.")
        
            form = forms._get_form_content(form_id)
            if form is None:
                return api_response(False, err_msg=f"Validation failed: provided invalid form-id: `{form_id}` to protected form endpoint.")
        
            if author_only and form["author_uuid"] != user.uuid:
                return api_response(False, err_msg=f"Validation failed: called author-only form endpoint as non-author. Form: `{form_id}` User: `{uuid}`")
        
            return await endpoint_fn(*args, **kwargs)
        return wrapper
    return protect 



# Login / Register

@api.post("/api/register")
async def post_register(data: schemas.RegisterSchema, request: Request) -> JSONResponse:
    user = users.register_user(data.fullname, data.email.lower(), data.password, request.client.host)
    if isinstance(user, str):
        return api_response(False, err_msg=user)
    
    return api_response(True, users.prepare_user_brief(user.uuid)) 

@api.post("/api/login")
async def post_login(data: schemas.LoginSchema, request: Request) -> JSONResponse:
    user = users.get_user_by_email(data.email.lower())
    if user is None:
        return api_response(False, err_msg="There is no registered user with this email.")
    
    status = users.validate_password(user.uuid, data.password)
    if not status:
        return api_response(False, err_msg="Incorrect password.")
    
    users.set_trusted_ip(user.uuid, request.client.host)
    return api_response(True, users.prepare_user_brief(user.uuid))
    
@api.get("/api/autologinCheck/{uuid}")
async def get_autologin_check(uuid: str, request: Request) -> JSONResponse:
    user = users.get_user_by_uuid(uuid)
    if user is None:
        return api_response(False, err_msg="User with this uuid not found.")
    
    if users.hash_ip(request.client.host) == user.trusted_ip:
        return api_response(True, users.prepare_user_brief(user.uuid))
    
    return api_response(False, err_msg="This host cannot autologin to account.")
    
@api.get("/api/logout/{uuid}")
async def get_logout(uuid: str, request: Request) -> JSONResponse:
    user = users.get_user_by_uuid(uuid)
    if user is None:
        return api_response(False, err_msg="User with this uuid not found.")

    if users.hash_ip(request.client.host) != user.trusted_ip:
        return api_response(False, err_msg="Cannot logout from different host.")
    
    users.logout(user.uuid)
    return api_response(True)



# Account updates.

@api.post("/api/account-update/fullname")
@protected_endpoint
async def post_account_update_fullname(data: schemas.FullnameUpdateSchema, request: Request) -> JSONResponse:
    users.update_fullname(data.uuid, data.fullname)
    return api_response(True)

@api.post("/api/account-update/password")
@protected_endpoint
async def post_account_update_password(data: schemas.PasswordUpdateSchema, request: Request) -> JSONResponse:
    status = users.update_password(data.uuid, data.new_password, data.current_password)
    if isinstance(status, str):
        return api_response(False, err_msg=status)
    return api_response(True)



# Groups.

@api.post("/api/groups/create")
@protected_endpoint
async def post_group_create(data: schemas.GroupCreateSchema, request: Request) -> JSONResponse:
    group_id = groups.create_group(data.name, data.uuid)
    users.add_group_to_user_list(data.uuid, group_id)
    return api_response(True)

@api.post("/api/groups/my-groups")
@protected_endpoint
async def post_fetch_my_groups(data: schemas.ProtectedModel, request: Request) -> JSONResponse:
    user = users.get_user_by_uuid(data.uuid)
    user_groups = groups.fetch_user_groups_names(user.groups.split("|"))
    invites = groups.get_user_group_invitations(user.uuid)
    return api_response(True, {
        "groups": user_groups,
        "invites": invites
    })

@api.post("/api/groups/fetch")
@protected_endpoint
@protect_group_endpoint()
async def post_fecth_group(data: schemas.GroupIdSchema, request: Request) -> JSONResponse:
    group_data = groups.get_group_details(data.group_id, data.uuid)
    return api_response(True, group_data)

@api.post("/api/groups/invite")
@protected_endpoint
@protect_group_endpoint()
async def post_group_invite(data: schemas.GroupInviteSchema, request: Request) -> JSONResponse:
    invited_user = users.get_user_by_email(data.invite_email)
    if invited_user is None:
        return api_response(False, err_msg="No user with this email found.")
    
    status = groups.add_group_invitation(invited_user.uuid, data.group_id)
    if isinstance(status, str):
        return api_response(False, err_msg=status)
    
    return api_response(True, invited_user.fullname)

@api.post("/api/groups/accept-invite")
@protected_endpoint
@protect_group_endpoint()
async def post_accept_invite(data: schemas.GroupIdSchema, request: Request) -> JSONResponse:
    if not groups.is_user_invited(data.uuid, data.group_id):
        return api_response(False, err_msg="You are not invited :(")

    groups.add_member_to_group(data.group_id, data.uuid)
    groups.delete_group_invitation(data.uuid, data.group_id)
    users.add_group_to_user_list(data.uuid, data.group_id)
    return api_response(True)

@api.post("/api/groups/reject-invite")
@protected_endpoint
@protect_group_endpoint()
async def post_reject_invite(data: schemas.GroupIdSchema, request: Request) -> JSONResponse:
    if not groups.is_user_invited(data.uuid, data.group_id):
        return api_response(False, err_msg="You are not invited :(")
    
    groups.delete_group_invitation(data.uuid, data.group_id)
    return api_response(True)

@api.post("/api/groups/rename")
@protected_endpoint
@protect_group_endpoint(manager_only=True)
async def post_group_rename(data: schemas.GroupRenameSchema, request: Request) -> JSONResponse:
    groups.rename_group(data.group_id, data.new_name)
    return api_response(True)

@api.post("/api/groups/leave")
@protected_endpoint
@protect_group_endpoint()
async def post_leave_group(data: schemas.GroupIdSchema, request: Request) -> JSONResponse:
    groups.remove_member_from_group(data.group_id, data.uuid)
    users.remove_group_from_user_list(data.uuid, data.group_id)
    return api_response(True)

@api.post("/api/groups/kick")
@protected_endpoint
@protect_group_endpoint(manager_only=True)
async def post_kick_member(data: schemas.GroupMemberSchema, request: Request) -> JSONResponse:
    if data.member_uuid == groups._get_group_content(data.group_id)["owner_uuid"]:
        return api_response(False, err_msg="Cannot kick a owner.")
    
    groups.remove_member_from_group(data.group_id, data.member_uuid)
    users.remove_group_from_user_list(data.member_uuid, data.group_id)
    return api_response(True)

@api.post("/api/groups/promote")
@protected_endpoint
@protect_group_endpoint(manager_only=True)
async def post_promote_member(data: schemas.GroupMemberSchema, request: Request) -> JSONResponse:
    status = groups.promote_group_member(data.group_id, data.member_uuid, data.uuid)
    if isinstance(status, str):
        return api_response(False, err_msg=status)
    return api_response(True)

@api.post("/api/groups/demote")
@protected_endpoint
@protect_group_endpoint(manager_only=True)
async def post_demote_member(data: schemas.GroupMemberSchema, request: Request) -> JSONResponse:
    status = groups.demote_group_member(data.group_id, data.member_uuid, data.uuid)
    if isinstance(status, str):
        return api_response(False, err_msg=status)
    return api_response(True)

@api.post("/api/groups/get-assignable")
@protected_endpoint
async def post_get_assignable(data: schemas.ProtectedModel, request: Request) -> JSONResponse:
    user = users.get_user_by_uuid(data.uuid)
    user_groups_ids = user.groups.split("|")
    assignable = []
    
    for group_id in user_groups_ids:
        if not group_id: continue
        group_data = groups.get_group_details(group_id, data.uuid)
        
        if group_data is not None and group_data["is_manager"]:
            assignable.append((group_id, group_data["name"]))

    return api_response(True, assignable)



# Forms.

@api.post("/api/forms/create")
@protected_endpoint
async def post_create_form(data: schemas.ProtectedModel, request: Request) -> JSONResponse:
    form_id = forms.create_form(data.uuid)
    return api_response(True, form_id)

@api.post("/api/forms/load-list")
@protected_endpoint
async def post_load_forms(data: schemas.ProtectedModel, request: Request) -> JSONResponse:
    user_forms = {
        "assigned": forms.get_assigned_to_user(data.uuid),
        "my_forms": forms.get_user_forms(data.uuid),
        "answered": []    
    }
    return api_response(True, user_forms)
    
@api.post("/api/forms/fetch-form")
@protected_endpoint
@protect_form_endpoint()
async def post_fetch_form(data: schemas.FormIdSchema, request: Request) -> JSONResponse:
    enriched_content = forms.get_enriched_form_data(data.form_id, data.uuid)
    return api_response(True, enriched_content)

@api.post("/api/forms/update-form")
@protected_endpoint
@protect_form_endpoint(author_only=True)
async def post_update_form(data: schemas.UpdateFormSchema, request: Request) -> JSONResponse:
    forms.update_form(data.form_id, data.settings, data.structure, data.assigned)
    return api_response(True)


uvicorn.run(api, host="0.0.0.0", port=50500)
