from datetime import datetime
from uuid import UUID

from sqlmodel import Session

from src.models.models import (
    Accounts,
    Budgets,
    BudgetStatusTypesEnum,
    BudgetTypesEnum,
    Categories,
    Notifications,
    SubCategories,
    Transactions,
    TransactionTypesEnum,
)
from src.routers.notification_router import manager
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

    account = Fetcher(
        database=db,
        table=Accounts,
        where=(Accounts.id == transaction.account_id,),
        error="Account not found",
    ).get_one()

    budget_overall = Fetcher(
        database=db,
        table=Budgets,
        where=(
            Budgets.status == BudgetStatusTypesEnum.ACTIVE,
            Budgets.user_id == user_id,
            Budgets.type == BudgetTypesEnum.OVERALL,
        ),
    ).get_value()
    budget_account = Fetcher(
        database=db,
        table=Budgets,
        where=(
            Budgets.status == BudgetStatusTypesEnum.ACTIVE,
            Budgets.user_id == user_id,
            Budgets.type == BudgetTypesEnum.ACCOUNT,
            Budgets.account_id == account.id,
        ),
    ).get_value()

    if budget_overall and TransactionTypesEnum.EXPENSE == transaction.type:
        budget_overall.amount += transaction.amount
        if budget_overall.amount > budget_overall.limit:
            await manager.send_personal_message(user_id=user_id, message="transaction")
            db.add(
                Notifications(
                    user_id=user_id, message="Budget limit exceeded for overall budget"
                )
            )

    if budget_account and TransactionTypesEnum.EXPENSE == transaction.type:
        print(budget_account)
        budget_account.amount += transaction.amount
        if budget_account.amount > budget_account.limit:
            await manager.send_personal_message(user_id=user_id, message="transaction")
            db.add(
                Notifications(
                    user_id=user_id,
                    message=f"Budget limit exceeded for account {account.name}",
                )
            )

    if transaction.type == TransactionTypesEnum.INCOME:
        account.balance += transaction.amount
    else:
        account.balance -= transaction.amount

    new_transaction = Transactions(
        user_id=user_id,
        **transaction.model_dump(),
        transaction_time=datetime.now(),
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction
