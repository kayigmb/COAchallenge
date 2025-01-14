from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel


class TransactionsInput(SQLModel):
    amount: float
    type: str
    description: str
    category: Optional[UUID] = None
    sub_category: Optional[UUID] = None


class TransactionsResponse(SQLModel):
    id: UUID
    amount: float
    type: str
    description: str
    category: Optional[UUID] = None
    sub_category: Optional[UUID] = None
    account_id: UUID
    user_id: UUID
    transactions_time: datetime
    is_active: bool
