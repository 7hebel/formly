import os

if not os.path.exists("./data/forms"): os.mkdir("./data/forms/")
if not os.path.exists("./data/"): os.mkdir("./data/")

from modules import accounts
from modules import schemas

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
        print(f"API: {err_msg}")
    
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
        if data:
            uuid = data.uuid
        else:
            uuid = kwargs["uuid"]
            
        request = kwargs["request"]
        caller_ip = request.client.host
        
        user = accounts.Account.from_uuid(uuid)
        if user is None:
            return api_response(False, err_msg=f"Validation failed: provided invalid uuid: `{uuid}` to protected endpoint.")
        
        if accounts.hash_ip(caller_ip) != user.trusted_ip:
            return api_response(False, err_msg=f"Validation failed: called protected endpoint by untrusted host. Relogin.")

        return await endpoint_fn(*args, **kwargs)
    return wrapper


# Login / Register


@api.post("/api/register")
async def post_register(data: schemas.RegisterSchema, request: Request) -> JSONResponse:
    user = accounts.Account.register(data.fullname, data.email, data.password, request.client.host)
    if isinstance(user, str):
        return api_response(False, err_msg=user)
    
    return api_response(True, user.prepare_login_data()) 

@api.post("/api/login")
async def post_login(data: schemas.LoginSchema, request: Request) -> JSONResponse:
    user = accounts.Account.from_email(data.email)
    if user is None:
        return api_response(False, err_msg="There is no registered user with this email.")
    
    status = user.validate_password(data.password)
    if not status:
        return api_response(False, err_msg="Incorrect password.")
    
    user.set_trusted_ip(request.client.host)
    return api_response(True, user.prepare_login_data())
    
@api.get("/api/autologinCheck/{uuid}")
async def get_autologin_check(uuid: str, request: Request) -> JSONResponse:
    user = accounts.Account.from_uuid(uuid)
    if user is None:
        return api_response(False, err_msg="User with this uuid not found.")
    
    if accounts.hash_ip(request.client.host) == user.trusted_ip:
        return api_response(True, user.prepare_login_data())
    
    return api_response(False, err_msg="This host cannot autologin to account.")
    
@api.get("/api/logout/{uuid}")
async def get_logout(uuid: str, request: Request) -> JSONResponse:
    user = accounts.Account.from_uuid(uuid)
    if user is None:
        return api_response(False, err_msg="User with this uuid not found.")

    if accounts.hash_ip(request.client.host) != user.trusted_ip:
        return api_response(False, err_msg="Cannot logout from different host.")
    
    user.logout()
    return api_response(True)



# Account updates.


@api.post("/api/account-update/fullname")
@protected_endpoint
async def post_account_update_fullname(data: schemas.FullnameUpdateSchema, request: Request) -> JSONResponse:
    user = accounts.Account.from_uuid(data.uuid)
    user.update_fullname(data.fullname)
    return api_response(True)

@api.post("/api/account-update/email")
@protected_endpoint
async def post_account_update_email(data: schemas.EmailUpdateSchema, request: Request) -> JSONResponse:
    user = accounts.Account.from_uuid(data.uuid)
    status = user.update_email(data.email)
    if isinstance(status, str):
        return api_response(False, err_msg=status)
    return api_response(True)

@api.post("/api/account-update/password")
@protected_endpoint
async def post_account_update_password(data: schemas.PasswordUpdateSchema, request: Request) -> JSONResponse:
    user = accounts.Account.from_uuid(data.uuid)
    status = user.update_password(data.new_password, data.current_password)
    if isinstance(status, str):
        return api_response(False, err_msg=status)
    return api_response(True)


uvicorn.run(api, host="0.0.0.0", port=50500)
