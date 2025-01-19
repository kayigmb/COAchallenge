from typing import Optional

import jwt
from fastapi import HTTPException, status
from fastapi.openapi.models import HTTPBearer
from passlib.context import CryptContext
from sqlmodel import Session, SQLModel

from src.models.models import Blacklist, Users
from src.utils.fetcher import Fetcher

encrypt_configuration = CryptContext(schemes=["bcrypt"], deprecated="auto")

from datetime import datetime, timedelta, timezone

from src.config import settings

authenticationScheme = HTTPBearer()


class TokenData(SQLModel):
    id: str
    name: str
    email: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expires_delta = timedelta(minutes=float(settings.EXPIRE_MINUTES))
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=10)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


async def decode_access_token(token: str):
    try:
        decoded_token = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": True},
        )
        return decoded_token
    except Exception as e:
        raise HTTPException(
            detail=f"JWT ERROR: {str(e)}", status_code=status.HTTP_400_BAD_REQUEST
        )


def hash_password(password: str) -> str:
    return encrypt_configuration.hash(password)


def compare_password(input_password: str, stored_password) -> bool:
    return encrypt_configuration.verify(input_password, stored_password)


class AuthControllerInput(SQLModel):
    name: Optional[str] = None
    email: str
    password: str


class AuthController:
    def __init__(self, db, input_data: AuthControllerInput):
        self.db = db
        self.input_data = input_data

    def get_user(self):
        get_user = Fetcher(
            database=self.db,
            table=Users,
            where=(Users.email == self.input_data.email,),
            error="Invalid email or password",
        )
        return get_user

    def signup(self):
        get_user = self.get_user().get_value()
        if get_user:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "User is already registered",
            )
        hashed_password = hash_password(self.input_data.password)
        user = Users(
            name=self.input_data.name,
            email=self.input_data.email,
            password=hashed_password,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def login(self):
        get_user = self.get_user().get_one()
        compared_password = compare_password(
            self.input_data.password, get_user.password
        )
        if not compared_password:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "User is already registered",
            )
        create_token = create_access_token(
            TokenData(
                id=str(get_user.id),
                name=get_user.name,
                email=get_user.name,
            ).model_dump()
        )
        return create_token


def logout(token, db: Session):
    Fetcher(
        database=db,
        table=Blacklist,
        where=(Blacklist.token == token,),
        error="Unauthorized access",
        status_code=status.HTTP_401_UNAUTHORIZED,
    ).get_exist()

    add = Blacklist(token=token)
    db.add(add)
    db.commit()

    return {"message": "Logout successful"}
