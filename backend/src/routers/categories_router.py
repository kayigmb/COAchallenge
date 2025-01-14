from fastapi import APIRouter, Depends

from src.middlewares.auth import auth

router = APIRouter(
    tags=["Categories"], prefix="/categories", dependencies=[Depends(auth)]
)

router_sub = APIRouter(
    tags=["SubCategories"], prefix="/sub_categories", dependencies=[Depends(auth)]
)


@router.get("/")
async def get_categories():
    return {"categories": []}


@router.get("/{category_id}")
async def get_category(category_id: int):
    return {"category_id": category_id}


@router.post("/")
async def create_category():
    return {"message": "Category created"}


@router.put("/{category_id}")
async def update_category(category_id: int):
    return {"message": "Category updated"}


@router.delete("/{category_id}")
async def delete_category(category_id: int):
    return {"message": "Category deleted"}


@router_sub.get("/")
async def get_sub_categories():
    return {"sub_categories": []}


@router_sub.get("/{sub_category_id}")
async def get_sub_category(sub_category_id: int):
    return {"sub_category_id": sub_category_id}


@router_sub.post("/")
async def create_sub_category():
    return {"message": "SubCategory created"}


@router_sub.put("/{sub_category_id}")
async def update_sub_category(sub_category_id: int):
    return {"message": "SubCategory updated"}


@router_sub.delete("/{sub_category_id}")
async def delete_sub_category(sub_category_id: int):
    return {"message": "SubCategory deleted"}
