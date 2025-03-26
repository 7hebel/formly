import os

if not os.path.exists("./data/forms"): os.mkdir("./data/forms/")
if not os.path.exists("./data/"): os.mkdir("./data/")

from modules import accounts
from modules import schemas
from modules import forms
from modules import db

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request
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
    


uvicorn.run(api, host="0.0.0.0", port=50500)
