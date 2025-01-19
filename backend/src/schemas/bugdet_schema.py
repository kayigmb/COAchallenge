from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from sqlmodel import SQLModel


class BudgetResult(SQLModel):
    id: UUID
    user_id: UUID
    account_id: Optional[UUID] = None
    start_date: datetime
    end_date: datetime
    limit: float
    amount: float
    status: str
    type: str


class BudgetInput(BaseModel):
    limit: float
    start_date: datetime
    end_date: datetime


class BudgetUpdate(SQLModel):
    limit: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
