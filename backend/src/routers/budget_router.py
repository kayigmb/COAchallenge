from fastapi import APIRouter, Depends

from src.middlewares.auth import auth

router = APIRouter(tags=["Budgets"], prefix="/budgets", dependencies=[Depends(auth)])


@router.get("/")
async def get_budgets():
    return {"budgets": []}


@router.get("/{budget_id}")
async def get_budget(budget_id: int):
    return {"budget_id": budget_id}


@router.post("/")
async def create_budget():
    return {"message": "Budget created"}


@router.put("/{budget_id}")
async def update_budget(budget_id: int):
    return {"message": "Budget updated"}


@router.delete("/{budget_id}")
async def delete_budget(budget_id: int):
    return {"message": "Budget deleted"}
