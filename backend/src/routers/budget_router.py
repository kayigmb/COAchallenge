from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Request, status

from src.controllers.budget_controller import BudgetController
from src.database import database
from src.middlewares.auth import auth
from src.models.models import Budgets, BudgetStatusTypesEnum, BudgetTypesEnum
from src.routers.notification_router import manager
from src.schemas.bugdet_schema import BudgetInput, BudgetResult, BudgetUpdate
from src.schemas.common_schema import ResponseSchema
from src.utils.fetcher import Fetcher
from src.utils.paginator import Paginate, PaginationResponse, PaginatorQuery

router = APIRouter(tags=["Budgets"], prefix="/budgets", dependencies=[Depends(auth)])


@router.get(
    "", status_code=status.HTTP_200_OK, response_model=PaginationResponse[BudgetResult]
)
async def get_budgets(
    request: Request,
    db: database,
    input_data: Paginate = Depends(),
    status: Optional[BudgetStatusTypesEnum] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    account: Optional[UUID] = None,
    type: Optional[BudgetTypesEnum] = None,
):
    filter = ()
    if status:
        filter += (Budgets.status == status,)
    if start_date:
        filter += (Budgets.created_at >= start_date,)
    if end_date:
        filter += (Budgets.created_at <= end_date,)
    if type:
        filter += (Budgets.type == type,)
    if account:
        filter += (Budgets.account_id == account,)

    paginate, data = await PaginatorQuery.paginate(
        table_name=Budgets,
        input_data=input_data,
        session=db,
        filters=(Budgets.user_id == request.session["user"]["id"], *filter),
    )
    return PaginationResponse(
        pagination=paginate,
        data=[BudgetResult(**budget.model_dump()) for budget in data or []],
    )


@router.get(
    "/me/active",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[BudgetResult],
)
async def get_budget_active(request: Request, db: database):
    budget = Fetcher(
        database=db,
        table=Budgets,
        where=(
            Budgets.user_id == request.session["user"]["id"],
            Budgets.status == BudgetStatusTypesEnum.ACTIVE,
        ),
        error="Budget Already exist",
        status_code=status.HTTP_401_UNAUTHORIZED,
    ).get_one()
    return ResponseSchema(
        message="Budget found",
        data=BudgetResult(**budget.model_dump()),
    )


@router.get(
    "/{budget_id}",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[BudgetResult],
)
async def get_budget(db: database, budget_id: UUID):
    budget = Fetcher(
        database=db,
        table=Budgets,
        where=(Budgets.id == budget_id,),
        error="Budget Already exist",
        status_code=status.HTTP_401_UNAUTHORIZED,
    ).get_one()
    return ResponseSchema(
        message="Budget found",
        data=BudgetResult(**budget.model_dump()),
    )


@router.get(
    "/{account_id}/budgets",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[BudgetResult],
)
async def get_budget(db: database, request: Request, account_id: UUID):
    budget = Fetcher(
        database=db,
        table=Budgets,
        where=(
            Budgets.status == BudgetStatusTypesEnum.ACTIVE,
            Budgets.account_id == account_id,
            Budgets.user_id == request.session["user"]["id"],
        ),
        error="Budget not found",
        status_code=status.HTTP_401_UNAUTHORIZED,
    ).get_one()
    return ResponseSchema(
        message="Budget found",
        data=BudgetResult(**budget.model_dump()),
    )


@router.post(
    "/{account_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=ResponseSchema[BudgetResult],
)
async def create_budget_account(
    db: database, request: Request, input_data: BudgetInput, account_id: UUID
):
    new_budget = BudgetController(request.session["user"]["id"], db).add_new_budget(
        input_data, account_id
    )
    return ResponseSchema(
        message="Budget created",
        data=BudgetResult(**new_budget.model_dump()),
    )


@router.post(
    "", status_code=status.HTTP_201_CREATED, response_model=ResponseSchema[BudgetResult]
)
async def create_overall_budget(
    db: database, request: Request, input_data: BudgetInput
):
    new_budget = BudgetController(
        request.session["user"]["id"], db
    ).add_new_overall_budget(input_data)
    return ResponseSchema(
        message="Budget created",
        data=BudgetResult(**new_budget.model_dump()),
    )


@router.patch(
    "/{budget_id}",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[BudgetResult],
)
async def update_budget(
    db: database, budget_id: UUID, request: Request, input_data: BudgetUpdate
):
    update = BudgetController(request.session["user"]["id"], db).update_budget(
        input_data, budget_id
    )
    return ResponseSchema(
        message="Budget created",
        data=BudgetResult(**update.model_dump()),
    )


@router.delete("/{budget_id}")
async def delete_budget(budget_id: int):
    return {"message": "Budget deleted"}
