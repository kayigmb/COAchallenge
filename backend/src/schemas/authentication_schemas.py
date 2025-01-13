from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class SignupSchema(SQLModel):
    name: str
    email: str
    password: str


class LoginSchema(SQLModel):
    email: str
    password: str


class LoginResultSchema(SQLModel):
    access_token: str
    token_type: Optional[str] = Field(default="Bearer")


class SignupResultSchema(SQLModel):
    id: UUID
    name: str
    email: str
