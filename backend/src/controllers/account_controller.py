from typing import Generic, TypeVar
from uuid import UUID

from fastapi import status
from sqlmodel import Session

from src.models.models import Accounts
from src.schemas.accounts_schema import AccountsInput, AccountsUpdate
from src.utils.fetcher import Fetcher

T = TypeVar("T")


class AccountController(Generic[T]):
    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user_id = user_id

    def get_account_exist(self, name):
        get_accounts = Fetcher(
            database=self.db,
            table=Accounts,
            where=(
                Accounts.name == name,
                Accounts.user_id == self.user_id,
            ),
            error="Accounts already Exists",
            status_code=status.HTTP_400_BAD_REQUEST,
        ).get_exist()
        return get_accounts

    def update_accounts(self, input_data: AccountsUpdate, account_id: UUID):
        get_accounts = Fetcher(
            database=self.db,
            table=Accounts,
            where=(Accounts.id == account_id,),
            error="Accounts doesnot exists",
        ).get_one()
        update_record = input_data.model_dump(exclude_none=True, exclude_unset=True)
        get_accounts.sqlmodel_update(update_record)
        self.db.commit()
        self.db.refresh(get_accounts)
        return get_accounts

    def add_accounts(self, input_data: AccountsInput):
        self.get_account_exist(input_data.name)
        account = Accounts(
            user_id=self.user_id,
            **input_data.model_dump(),
        )
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        return account
