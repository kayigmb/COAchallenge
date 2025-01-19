from uuid import UUID

from fastapi import APIRouter, Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import SQLModel

from src.controllers.auth_controller import AuthController, AuthControllerInput, logout
from src.database import database
from src.middlewares.auth import BearerToken, auth
from src.models.models import Users
from src.schemas.authentication_schemas import (
    LoginResultSchema,
    LoginSchema,
    SignupResultSchema,
    SignupSchema,
)
from src.schemas.common_schema import ResponseSchema
from src.utils.fetcher import Fetcher

router = APIRouter(
    tags=["Auth"],
    prefix="/auth",
)


@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    response_model=ResponseSchema[SignupResultSchema],
)
async def signup(input_data: SignupSchema, db: database):
    signup_ = AuthController(
        db, AuthControllerInput(**input_data.model_dump())
    ).signup()
    return ResponseSchema(
        message="Signup successful",
        data=SignupResultSchema(**signup_.model_dump()),
    )


@router.post(
    "/signin",
    response_model=ResponseSchema[LoginResultSchema],
    status_code=status.HTTP_200_OK,
)
async def login(input_data: LoginSchema, db: database):
    login_ = AuthController(
        db,
        AuthControllerInput(**input_data.model_dump()),
    ).login()
    return ResponseSchema(
        message="Login successful",
        data=LoginResultSchema(access_token=login_),
    )


class User(SQLModel):
    id: UUID
    name: str
    email: str


@router.get("/me", status_code=status.HTTP_200_OK, dependencies=[Depends(auth)])
async def profile_me(request: Request, db: database):
    get_accounts = Fetcher(
        database=db,
        table=Users,
        where=(Users.id == request.session["user"]["id"],),
        error="User not found",
    ).get_one()

    return ResponseSchema(
        message="Profile fetched successfully",
        data=User(**get_accounts.model_dump()),
    )


@router.get("/logout", status_code=status.HTTP_200_OK, dependencies=[Depends(auth)])
async def logout_(
    db: database, token: HTTPAuthorizationCredentials = Depends(BearerToken)
):
    logout(token.credentials, db)
    return {"message": "Logout successful"}
