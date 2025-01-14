from uuid import UUID

from fastapi import APIRouter, Depends, Request, status

from src.controllers.account_controller import AccountController
from src.database import database
from src.middlewares.auth import auth
from src.models.models import Accounts
from src.schemas.accounts_schema import AccountsInput, AccountsResult, AccountsUpdate
from src.schemas.common_schema import ResponseSchema
from src.utils.fetcher import Fetcher
from src.utils.paginator import Paginate, PaginationResponse, PaginatorQuery

router = APIRouter(tags=["Accounts"], prefix="/accounts", dependencies=[Depends(auth)])


@router.get("", response_model=PaginationResponse[AccountsResult])
async def get_accounts(
    request: Request, db: database, input_data: Paginate = Depends()
):
    all_accounts, data = await PaginatorQuery.paginate(
        table_name=Accounts,
        input_data=input_data,
        session=db,
        filters=(Accounts.user_id == request.session["user"]["id"],),
    )
    return PaginationResponse(
        pagination=all_accounts,
        data=[AccountsResult(**account.model_dump()) for account in data or []],
    )


@router.get(
    "/{account_id}",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[AccountsResult],
)
async def get_account(db: database, account_id: UUID):
    get_accounts = Fetcher(
        database=db,
        table=Accounts,
        where=(Accounts.id == account_id,),
        error="Account not found",
    ).get_one()
    return ResponseSchema(
        message="Account created",
        data=AccountsResult(**get_accounts.model_dump()),
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ResponseSchema[AccountsResult],
)
async def create_account(
    request: Request,
    db: database,
    input_data: AccountsInput,
):
    new_account = AccountController(db, request.session["user"]["id"]).add_accounts(
        AccountsInput(**input_data.model_dump())
    )
    return ResponseSchema(
        message="Account created",
        data=AccountsResult(**new_account.model_dump()),
    )


@router.patch(
    "/{account_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=ResponseSchema[AccountsResult],
)
async def update_account(
    request: Request, input_data: AccountsUpdate, account_id: UUID, db: database
):
    update_account = AccountController(
        db, request.session["user"]["id"]
    ).update_accounts(AccountsUpdate(**input_data.model_dump()), account_id)
    return ResponseSchema(
        message="Account created",
        data=AccountsResult(**update_account.model_dump()),
    )


@router.delete("/{account_id}")
async def delete_account(db: database, account_id: UUID):
    get_accounts = Fetcher(
        database=db,
        table=Accounts,
        where=(Accounts.id == account_id,),
        error="Account not found",
    ).get_one()
    get_accounts.is_deleted = True
    db.commit()
    return {"message": "Account deleted"}
