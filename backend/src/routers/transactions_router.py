from fastapi import APIRouter, Depends

from src.middlewares.auth import auth

router = APIRouter(
    tags=["transactions"], prefix="/transactions", dependencies=[Depends(auth)]
)


@router.get("/")
async def get_transactions():
    """should return a list of transactions and favarious filters"""
    return {"transactions": []}


@router.get("/{transaction_id}")
async def get_transaction(transaction_id: int):
    return {"transaction_id": transaction_id}


@router.post("/")
async def create_transaction():
    return {"message": "Transaction created"}
