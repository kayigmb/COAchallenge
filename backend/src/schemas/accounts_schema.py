from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel


class AccountsInput(SQLModel):
    name: str
    type: str
    balance: float


class AccountsUpdate(SQLModel):
    name: Optional[str] = None
    type: Optional[str] = None
    balance: Optional[float] = None


class AccountsResult(SQLModel):
    id: UUID
    name: str
    type: str
    balance: float
    user_id: UUID
    is_active: bool
    created_at: datetime
