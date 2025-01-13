from datetime import datetime
from enum import Enum
from typing import List
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class CommonBase(SQLModel):
    id: UUID = Field(
        default_factory=uuid4, primary_key=True, unique=True, nullable=False
    )
    is_active: bool = Field(nullable=True, default=True)
    is_deleted: bool = Field(default=False, nullable=True)
    created_at: datetime = Field(default_factory=datetime.now, nullable=False)


class Users(CommonBase, table=True):
    name: str = Field(nullable=True)
    email: str = Field(nullable=True, unique=True, index=True)
    password: str = Field(nullable=True, default=None)

    notifications: List["Notifications"] = Relationship(back_populates="users")
    accounts: List["Accounts"] = Relationship(back_populates="user")
    categories: List["Categories"] = Relationship(back_populates="users")
    sub_categories: List["SubCategories"] = Relationship(back_populates="users")
    budgets: List["Budgets"] = Relationship(back_populates="users")
    transactions: List["Transactions"] = Relationship(back_populates="users")


class Notifications(CommonBase, table=True):
    user_id: UUID = Field(nullable=False, index=True, foreign_key="users.id")
    message: str = Field(nullable=False, default=None)
    is_read: bool = Field(nullable=False, default=False)

    users: Users = Relationship(back_populates="notifications")


class Accounts(CommonBase, table=True):
    user_id: UUID = Field(nullable=False, index=True, foreign_key="users.id")
    name: str = Field(nullable=False, default=None)
    type: str = Field(nullable=False, default=None)
    balance: float = Field(nullable=False, default=0.0)

    user: Users = Relationship(back_populates="accounts")
    budgets: List["Budgets"] = Relationship(back_populates="accounts")
    transactions: List["Transactions"] = Relationship(back_populates="accounts")


class Categories(CommonBase, table=True):
    user_id: UUID = Field(nullable=False, index=True, foreign_key="users.id")
    name: str = Field(nullable=False, index=True)
    description: str = Field(nullable=False, default=None)

    users: Users = Relationship(back_populates="categories")
    sub_categories: List["SubCategories"] = Relationship(back_populates="categories")
    transactions: List["Transactions"] = Relationship(back_populates="categories")


class SubCategories(CommonBase, table=True):
    user_id: UUID = Field(nullable=False, index=True, foreign_key="users.id")
    category_id: UUID = Field(nullable=False, index=True, foreign_key="categories.id")
    name: str = Field(nullable=False, index=True)
    description: str = Field(nullable=False, default=None)

    users: Users = Relationship(back_populates="sub_categories")
    categories: Categories = Relationship(back_populates="sub_categories")
    transactions: List["Transactions"] = Relationship(back_populates="sub_categories")


class BudgetStatusTypesEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

    def __str__(self):
        return str(self.value)


class Budgets(CommonBase, table=True):
    user_id: UUID = Field(nullable=False, index=True, foreign_key="users.id")
    account_id: UUID = Field(nullable=False, index=True, foreign_key="accounts.id")
    amount: float = Field(nullable=True, default=0.0)
    limit: float = Field(nullable=False, default=0.0)
    status: str = Field(nullable=True, default=BudgetStatusTypesEnum.ACTIVE.value)
    start_date: datetime = Field(default_factory=datetime.now, nullable=True)
    end_date: datetime = Field(default_factory=datetime.now, nullable=True)

    users: Users = Relationship(back_populates="budgets")
    accounts: Accounts = Relationship(back_populates="budgets")


class TransactionTypesEnum(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

    def __str__(self):
        return str(self.value)


class Transactions(CommonBase, table=True):
    user_id: UUID = Field(nullable=False, index=True, foreign_key="users.id")
    account_id: UUID = Field(nullable=False, index=True, foreign_key="accounts.id")
    category_id: UUID = Field(nullable=False, index=True, foreign_key="categories.id")
    sub_category_id: UUID = Field(
        nullable=True, index=True, foreign_key="subcategories.id"
    )
    amount: float = Field(nullable=False, default=0.0)
    type: str = Field(nullable=False, default=None)
    description: str = Field(nullable=False, default=None)
    transaction_time: datetime = Field(default_factory=datetime.now, nullable=True)

    users: Users = Relationship(back_populates="transactions")
    accounts: Accounts = Relationship(back_populates="transactions")
    categories: Categories = Relationship(back_populates="transactions")
    sub_categories: SubCategories = Relationship(back_populates="transactions")
