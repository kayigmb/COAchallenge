from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status

from src.controllers.transactions_controller import add_new_transaction
from src.database import database
from src.middlewares.auth import auth
from src.models.models import Transactions, TransactionTypesEnum
from src.schemas.accounts_schema import AccountsResult
from src.schemas.categories_schema import CategoryResponse
from src.schemas.common_schema import ResponseSchema
from src.schemas.transactions_schema import (
    TransactionsFullResponse,
    TransactionsInput,
    TransactionsResponse,
)
from src.utils.fetcher import Fetcher
from src.utils.paginator import Paginate, PaginationResponse, PaginatorQuery

router = APIRouter(
    tags=["transactions"], prefix="/transactions", dependencies=[Depends(auth)]
)


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=PaginationResponse[TransactionsFullResponse],
)
async def get_transactions(
    request: Request,
    db: database,
    input_data: Paginate = Depends(),
    type: Optional[TransactionTypesEnum] = None,
    categories: Optional[List[UUID]] = Query(None),
    accounts: Optional[List[UUID]] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
):
    filters = ()
    if type:
        filters += (Transactions.type == type,)
    if categories:
        filters += (Transactions.category_id.in_(categories),)
    if accounts:
        filters += (Transactions.account_id.in_(accounts),)
    if start_date:
        filters += (Transactions.created_at >= start_date,)
    if end_date:
        filters += (Transactions.created_at <= end_date,)

    pagination, data = await PaginatorQuery.paginate(
        table_name=Transactions,
        input_data=input_data,
        session=db,
        filters=(Transactions.user_id == request.session["user"]["id"],) + filters,
    )
    return PaginationResponse(
        pagination=pagination,
        data=[
            TransactionsFullResponse(
                transaction=TransactionsResponse(**account.model_dump()),
                account=AccountsResult(**account.accounts.model_dump()),
                category=CategoryResponse(**account.categories.model_dump()),
            )
            for account in data or []
        ],
    )


@router.get("/{transaction_id}")
async def get_transaction(transaction_id: UUID, db: database):
    get_single_transaction = Fetcher(
        database=db,
        table=Transactions,
        where=(Transactions.id == transaction_id,),
        error="Transaction not found",
    ).get_one()
    return ResponseSchema(
        message="Transaction found",
        data=TransactionsResponse(**get_single_transaction.model_dump()),
    )


@router.post("")
async def create_transaction(
    request: Request, db: database, input_data: TransactionsInput
):
    new_transaction = await add_new_transaction(
        db, input_data, request.session["user"]["id"]
    )
    return ResponseSchema(
        message="Transaction added successfully",
        data=TransactionsResponse(**new_transaction.model_dump()),
    )
