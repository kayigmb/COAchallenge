from typing import Generic, TypeVar

from pydantic import BaseModel
from sqlmodel import Field

T = TypeVar("T")


class ResponseSchema(BaseModel, Generic[T]):
    status: str = Field(default="success", description="Status")
    message: str = Field(default="Request Successfully", description="Message")
    data: T = Field(..., description="Data")
