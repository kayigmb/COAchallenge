from uuid import UUID

from fastapi import status
from sqlmodel import Session

from src.models.models import Accounts, Budgets, BudgetStatusTypesEnum, BudgetTypesEnum
from src.schemas.bugdet_schema import BudgetInput, BudgetUpdate
from src.utils.fetcher import Fetcher


class BudgetController:
    def __init__(self, user: UUID, database: Session):
        self.user = user
        self.database = database

    def get_budgets(self, account_id: UUID):
        budget = Fetcher(
            database=self.database,
            table=Budgets,
            where=(
                Budgets.status == BudgetStatusTypesEnum.ACTIVE,
                Budgets.account_id == account_id,
                Budgets.type == BudgetTypesEnum.ACCOUNT,
                Budgets.user_id == self.user,
            ),
            error="Budget Already exist",
            status_code=status.HTTP_409_CONFLICT,
        ).get_exist()
        return budget

    def add_new_budget(self, input_data: BudgetInput, account_id: UUID):
        Fetcher(
            database=self.database,
            table=Accounts,
            where=(Accounts.id == account_id,),
            error="Account doesn't exist",
        ).get_one()

        self.get_budgets(account_id)

        budget = Budgets(
            **input_data.model_dump(),
            user_id=self.user,
            type=BudgetTypesEnum.ACCOUNT,
            account_id=account_id
        )
        self.database.add(budget)
        self.database.commit()
        self.database.refresh(budget)

        return budget

    def add_new_overall_budget(self, input_data: BudgetInput):
        Fetcher(
            database=self.database,
            table=Budgets,
            where=(
                Budgets.status == BudgetStatusTypesEnum.ACTIVE,
                Budgets.type == BudgetTypesEnum.OVERALL,
                Budgets.user_id == self.user,
            ),
            error="Budget Already exist",
            status_code=status.HTTP_409_CONFLICT,
        ).get_exist()

        budget = Budgets(
            **input_data.model_dump(), user_id=self.user, type=BudgetTypesEnum.OVERALL
        )

        self.database.add(budget)
        self.database.commit()
        self.database.refresh(budget)

        return budget

    def update_budget(self, input_data: BudgetUpdate, budget_id: UUID):
        budget = Fetcher(
            database=self.database,
            table=Budgets,
            where=(Budgets.id == budget_id,),
            error="Budget not found",
            status_code=status.HTTP_401_UNAUTHORIZED,
        ).get_one()

        update_record = input_data.model_dump(exclude_none=True, exclude_unset=True)
        budget.sqlmodel_update(update_record)

        self.database.commit()
        self.database.refresh(budget)

        return budget
