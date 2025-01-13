from fastapi import APIRouter, status

from src.controllers.auth_controller import AuthController, AuthControllerInput
from src.database import database
from src.schemas.authentication_schemas import (
    LoginResultSchema,
    LoginSchema,
    SignupResultSchema,
    SignupSchema,
)
from src.schemas.common_schema import ResponseSchema

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
