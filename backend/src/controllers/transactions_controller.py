from datetime import datetime
from uuid import UUID

from sqlmodel import Session

from src.models.models import Accounts, Categories, SubCategories, Transactions
from src.schemas.transactions_schema import TransactionsInput
from src.utils.fetcher import Fetcher


async def add_new_transaction(
    db: Session, transaction: TransactionsInput, user_id: UUID
):
    if transaction.sub_category_id:
        Fetcher(
            database=db,
            table=SubCategories,
            where=(SubCategories.id == transaction.sub_category_id,),
            error="Subcategory not found",
        ).get_one()

    Fetcher(
        database=db,
        table=Categories,
        where=(Categories.id == transaction.category_id,),
        error="Category not found",
    ).get_one()

    Fetcher(
        database=db,
        table=Accounts,
        where=(Accounts.id == transaction.account_id,),
        error="Account not found",
    ).get_one()

    new_transaction = Transactions(
        user_id=user_id,
        **transaction.model_dump(),
        transaction_time=datetime.now(),
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction
