import os

if not os.path.exists("./data/"): os.mkdir("./data/")
if not os.path.exists("./data/logs"): os.mkdir("./data/logs/")

from modules.database import ListsDB, UsersDB, FormsDB
from modules import text_grading  # Starts background AI models initialization.
from modules import schemas
from modules import lists
from modules import forms
from modules import users
from modules import logs
from modules import cdn

from fastapi import Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
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
        
        user = UsersDB.fetch(uuid)
        if user is None:
            return api_response(False, err_msg=f"Validation failed: provided invalid uuid: `{uuid}` to protected endpoint.")
        
        if users.hash_ip(caller_ip) != user["trusted_ip"]:
            return api_response(False, err_msg=f"Validation failed: called protected endpoint by untrusted host. Relogin.")

        return await endpoint_fn(*args, **kwargs)
    return wrapper


def protected_list_endpoint(endpoint_fn):
    @wraps(endpoint_fn)
    async def wrapper(*args, **kwargs):
        data = kwargs.get("data")
        uuid = data.uuid if data else kwargs.get("uuid")
        list_id = data.list_id if data else kwargs.get("list_id")

        user = UsersDB.fetch(uuid)
        if user is None:
            return api_response(False, err_msg=f"Validation failed: provided invalid uuid: `{uuid}` to protected list endpoint.")

        list_content = ListsDB.fetch(list_id)
        if list_content is None:
            return api_response(False, err_msg=f"Validation failed: provided invalid list_id: `{list_id}` to protected list endpoint.")

        if list_content["owner_uuid"] != uuid:
            return api_response(False, err_msg=f"Validation failed: called owner-only list endpoint as non-owner. List: `{list_id}` User: `{uuid}`")
            
        return await endpoint_fn(*args, **kwargs)
    return wrapper


def protected_form_endpoint(author_only: bool = False):
    def protect(endpoint_fn):
        @wraps(endpoint_fn)
        async def wrapper(*args, **kwargs):
            data = kwargs.get("data")
            uuid = data.uuid if data else kwargs.get("uuid")
            form_id = data.form_id if data else kwargs.get("form_id")

            user = UsersDB.fetch(uuid)
            if user is None:
                return api_response(False, err_msg=f"Validation failed: provided invalid uuid: `{uuid}` to protected form endpoint.")
        
            form = FormsDB.fetch(form_id)
            if form is None:
                return api_response(False, err_msg=f"Validation failed: provided invalid form-id: `{form_id}` to protected form endpoint.")
        
            if author_only and form["author_uuid"] != uuid:
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
    
    return api_response(True, users.prepare_user_brief(user["uuid"])) 

@api.post("/api/login")
async def post_login(data: schemas.LoginSchema, request: Request) -> JSONResponse:
    user = users.get_user_by_email(data.email.lower())
    if user is None:
        return api_response(False, err_msg="There is no registered user with this email.")
    
    status = users.validate_password(user["uuid"], data.password)
    if not status:
        return api_response(False, err_msg="Incorrect password.")
    
    users.set_trusted_ip(user["uuid"], request.client.host)
    return api_response(True, users.prepare_user_brief(user["uuid"]))
    
@api.get("/api/autologinCheck/{uuid}")
async def get_autologin_check(uuid: str, request: Request) -> JSONResponse:
    user = UsersDB.fetch(uuid)
    if user is None:
        return api_response(False, err_msg="User with this uuid not found.")
    
    if users.hash_ip(request.client.host) == user["trusted_ip"]:
        return api_response(True, users.prepare_user_brief(user["uuid"]))
    
    return api_response(False, err_msg="This host cannot autologin to account.")
    
@api.get("/api/logout/{uuid}")
async def get_logout(uuid: str, request: Request) -> JSONResponse:
    user = UsersDB.fetch(uuid)
    if user is None:
        return api_response(False, err_msg="User with this uuid not found.")

    if users.hash_ip(request.client.host) != user["trusted_ip"]:
        return api_response(False, err_msg="Cannot logout from different host.")
    
    users.logout(user["uuid"])
    return api_response(True)



# Account updates.

@api.post("/api/account-update/fullname")
@protected_endpoint
async def post_account_update_fullname(data: schemas.FullnameUpdateSchema, request: Request) -> JSONResponse:
    UsersDB.update_field(data.uuid, "fullname", data.fullname)
    logs.info("Users", f"Changed user's fullname to: `{data.fullname}` <{data.uuid}>")
    return api_response(True)

@api.post("/api/account-update/password")
@protected_endpoint
async def post_account_update_password(data: schemas.PasswordUpdateSchema, request: Request) -> JSONResponse:
    status = users.update_password(data.uuid, data.new_password, data.current_password)
    if isinstance(status, str):
        return api_response(False, err_msg=status)
    return api_response(True)



# Grading schemas.

@api.post("/api/grading-schemas/fetch")
@protected_endpoint
async def post_fetch_grading_schemas(data: schemas.ProtectedModel, request: Request) -> JSONResponse:
    grading_schemas = UsersDB.fetch(data.uuid)["grading_schemas"]
    return api_response(True, grading_schemas)

@api.post("/api/grading-schemas/create")
@protected_endpoint
async def post_create_grading_schema(data: schemas.ProtectedModel, request: Request) -> JSONResponse:
    status = users.create_grading_schema(data.uuid)
    if isinstance(status, str):
        return api_response(False, status)
    return api_response(True, status)
    
@api.post("/api/grading-schemas/rename")
@protected_endpoint
async def post_rename_grading_schema(data: schemas.RenameGradingSchema, request: Request) -> JSONResponse:
    status = users.rename_grading_schema(data.uuid, data.schema_id, data.new_title)
    if isinstance(status, str):
        return api_response(False, status)
    return api_response(True)

@api.post("/api/grading-schemas/edit")
@protected_endpoint
async def post_edit_grading_schema(data: schemas.EditGradingSchema, request: Request) -> JSONResponse:
    status = users.update_grading_schema(data.uuid, data.schema_id, data.steps, data.grades)
    if isinstance(status, str):
        return api_response(False, status)
    return api_response(True)

@api.post("/api/grading-schemas/remove")
@protected_endpoint
async def post_edit_grading_schema(data: schemas.RemoveGradingSchema, request: Request) -> JSONResponse:
    status = users.remove_grading_schema(data.uuid, data.schema_id)
    if isinstance(status, str):
        return api_response(False, status)
    return api_response(True)



# Lists.

@api.post("/api/lists/fetch")
@protected_endpoint
async def post_fetch_lists(data: schemas.ProtectedModel, request: Request) -> JSONResponse:
    user_lists = ListsDB.fetch_all_where(lambda l: l['owner_uuid'] == data.uuid)
    for user_list in user_lists:
        user_list["forms"] = [form["form_id"] for form in FormsDB.fetch_all_where(lambda form: user_list["list_id"] in form["assigned"]["lists"])]
    
    return api_response(True, user_lists)

@api.post("/api/lists/create")
@protected_endpoint
async def post_create_list(data: schemas.CreateList, request: Request) -> JSONResponse:
    list_id = lists.create_list(data.uuid, data.name)
    return api_response(True, list_id)

@api.post("/api/lists/remove")
@protected_endpoint
@protected_list_endpoint
async def post_remove_list(data: schemas.RemoveList, request: Request) -> JSONResponse:
    status = lists.remove_list(data.list_id)
    if isinstance(status, str):
        return api_response(False, status)
    
    return api_response(True)

@api.post("/api/lists/rename")
@protected_endpoint
@protected_list_endpoint
async def post_rename_list(data: schemas.RenameList, request: Request) -> JSONResponse:
    status = lists.rename_list(data.list_id, data.new_name)
    if isinstance(status, str):
        return api_response(False, status)
    
    return api_response(True)

@api.post("/api/lists/insert-email")
@protected_endpoint
@protected_list_endpoint
async def post_insert_to_list(data: schemas.ListUpdate, request: Request) -> JSONResponse:
    status = lists.add_email_to_list(data.list_id, data.email)
    if isinstance(status, str):
        return api_response(False, status)
    
    return api_response(True)

@api.post("/api/lists/remove-email")
@protected_endpoint
@protected_list_endpoint
async def post_remove_from_list(data: schemas.ListUpdate, request: Request) -> JSONResponse:
    status = lists.remove_email_from_list(data.list_id, data.email)
    if isinstance(status, str):
        return api_response(False, status)
    
    return api_response(True)



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
        "answered": forms.get_responded_by_user(data.uuid)    
    }
    return api_response(True, user_forms)
    
@api.post("/api/forms/fetch-form")
@protected_endpoint
@protected_form_endpoint(author_only=True)
async def post_fetch_form(data: schemas.FormIdSchema, request: Request) -> JSONResponse:
    content = FormsDB.fetch(data.form_id)
    content = forms.enrich_response_grades(content)
    if content["settings"]["is_anonymous"]:
        content = forms.hide_anonymous_data(content)
    
    return api_response(True, content)

@api.post("/api/forms/update-form")
@protected_endpoint
@protected_form_endpoint(author_only=True)
async def post_update_form(data: schemas.UpdateFormSchema, request: Request) -> JSONResponse:
    forms.update_form(data.form_id, data.settings, data.structure, data.assigned)
    return api_response(True)

@api.post("/api/forms/start")
@protected_endpoint
@protected_form_endpoint(author_only=True)
async def post_form_start(data: schemas.FormIdSchema, request: Request) -> JSONResponse:
    FormsDB.update_field(data.form_id, "settings", deep_field="is_active", value=True)
    logs.info("Forms", f"Manually activated form: ({data.form_id}) by <{data.uuid}>")
    return api_response(True)

@api.post("/api/forms/end")
@protected_endpoint
@protected_form_endpoint(author_only=True)
async def post_form_end(data: schemas.FormIdSchema, request: Request) -> JSONResponse:
    FormsDB.update_field(data.form_id, "settings", deep_field="is_active", value=False)
    logs.info("Forms", f"Manually deactivated form: ({data.form_id}) by <{data.uuid}>")
    return api_response(True)

@api.post("/api/forms/delete-response")
@protected_endpoint
@protected_form_endpoint(author_only=True)
async def post_remove_response(data: schemas.DeleteFormResponse, request: Request) -> JSONResponse:
    status = forms.remove_response(data.form_id, data.response_id)
    if isinstance(status, str):
        return api_response(False, err_msg=status)

    return api_response(True)

@api.post("/api/forms/remove-form")
@protected_endpoint
@protected_form_endpoint(author_only=True)
async def post_remove_response(data: schemas.FormIdSchema, request: Request) -> JSONResponse:
    status = forms.remove_form(data.form_id)
    if isinstance(status, str):
        return api_response(False, err_msg=status)

    return api_response(True)

@api.post("/api/forms/grade-response")
@protected_endpoint
@protected_form_endpoint(author_only=True)
async def post_grade_response(data: schemas.GradeResponse, request: Request) -> JSONResponse:
    status = forms.set_grades(data.form_id, data.response_id, data.grades)
    if isinstance(status["percentage"], str) and not status["percentage"].endswith("%") and status["percentage"] != "Not graded yet.":
        return api_response(False, err_msg=status)
    return api_response(True, status)

@api.post("/api/forms/get-brief")
async def post_get_brief_form(data: schemas.FormIdSchema, request: Request) -> JSONResponse:
    enriched_content = forms.get_sharable_form_data(data.form_id, data.uuid)
    if enriched_content is None:
        return api_response(False, err_msg="Form not found.")
    return api_response(True, enriched_content)

@api.post("/api/forms/validate-respondent")
async def post_validate_respondent(data: schemas.FormRespondentSchema, request: Request) -> JSONResponse:
    form_data = FormsDB.fetch(data.form_id)
    if form_data is None:
        return api_response(False, err_msg="Form not found.")

    if not form_data["settings"]["is_active"]:
        return api_response(False, err_msg="This form is not active yet.")

    user = None
    if data.is_account:
        user = UsersDB.fetch(data.uuid)
        if user is None:
            return api_response(False, err_msg="User not found.")
    
    if form_data["settings"]["assigned_only"]:
        if data.is_account and not forms.is_assigned_to_user(data.form_id, data.uuid):
            return api_response(False, err_msg="This form is not assigned to Your account.")
        if not data.is_account and data.email not in form_data["assigned"]["emails"]:
            return api_response(False, err_msg="Provided email has not been assigned to this form.")
        
    if form_data["settings"]["password"]:
        if data.password != form_data["settings"]["password"]:
            return api_response(False, err_msg="Incorrect password.")
    
    email = data.email
    fullname = data.fullname
    if data.is_account:
        email = user["email"]
        fullname = user["fullname"]
    
    status, id_or_err = forms.create_responder_entry(data.form_id, email, fullname, request.client.host)
    if not status:
        return api_response(False, err_msg=id_or_err)

    return api_response(True, {"response_id": id_or_err, "structure": form_data["structure"]})

@api.post("/api/forms/respond")
async def post_form_answer(data: schemas.FormResponse, request: Request) -> JSONResponse:
    status = forms.handle_response(data.form_id, data.response_id, data.answers)
    if isinstance(status, str):
        return api_response(False, err_msg=status)

    return api_response(True)




# Content delivery.

api.mount("/api/cdn/fetch", StaticFiles(directory="./data/cdn/"), name="forms-cdn")

@api.post("/api/cdn/upload")
@protected_endpoint
async def post_upload_cdn_file(uuid: str = Form(...), file: UploadFile = File(...), request: Request = None) -> JSONResponse:
    file_content = await file.read()
    if len(file_content) > cdn.MAX_FILE_SIZE:
        return api_response(False, err_msg="Maximum upload size is 10mb.")
    
    file.file.seek(0)
    (status, content) = cdn.upload_object(file_content)
    if not status:
        return api_response(False, err_msg=content)
    
    return api_response(True, content)


uvicorn.run(api, host="0.0.0.0", port=50500)
