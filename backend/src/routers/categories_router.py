from uuid import UUID

from fastapi import APIRouter, Depends, Request, status

from src.controllers.categories_controller import (
    CategoryController,
    SubCategoryController,
)
from src.database import database
from src.middlewares.auth import auth
from src.models.models import Categories, SubCategories
from src.schemas.categories_schema import (
    CategoryFullResponse,
    CategoryInput,
    CategoryResponse,
    SubCategoryFullResponse,
    SubCategoryInput,
    SubCategoryResponse,
    SubCategoryUpdate,
)
from src.schemas.common_schema import ResponseSchema
from src.utils.fetcher import Fetcher
from src.utils.paginator import Paginate, PaginationResponse, PaginatorQuery

router = APIRouter(
    tags=["Categories"], prefix="/categories", dependencies=[Depends(auth)]
)

router_sub = APIRouter(
    tags=["SubCategories"], prefix="/sub_categories", dependencies=[Depends(auth)]
)


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=PaginationResponse[CategoryFullResponse],
)
async def get_categories(
    request: Request, db: database, input_data: Paginate = Depends()
):
    pagination, data = await PaginatorQuery.paginate(
        table_name=Categories,
        input_data=input_data,
        session=db,
        filters=(Categories.user_id == request.session["user"]["id"],),
    )
    return PaginationResponse(
        pagination=pagination,
        data=[
            CategoryFullResponse(
                category=CategoryResponse(**account.model_dump()),
                sub_category=[
                    SubCategoryResponse(**sub_category.model_dump())
                    for sub_category in account.sub_categories or []
                    if not sub_category.is_deleted
                ],
            )
            for account in data or []
        ],
    )


@router.get(
    "/{category_id}",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[CategoryResponse],
)
async def get_category(db: database, category_id: UUID):
    get_category = Fetcher(
        database=db,
        table=Categories,
        where=(Categories.id == category_id,),
        error="Account not found",
    ).get_one()
    return ResponseSchema(
        message="Account found",
        data=CategoryResponse(**get_category.model_dump()),
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ResponseSchema[CategoryResponse],
)
async def create_category(request: Request, db: database, input_data: CategoryInput):
    add_category = CategoryController(db, request.session["user"]["id"]).add_category(
        input_data
    )
    return ResponseSchema(
        message="Category created",
        data=CategoryResponse(**add_category.model_dump()),
    )


@router.patch(
    "/{category_id}",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[CategoryResponse],
)
async def update_category(
    db: database, request: Request, category_id: UUID, input_data: CategoryInput
):
    update_category = CategoryController(
        db, request.session["user"]["id"]
    ).update_category(input_data, category_id)
    return ResponseSchema(
        message="Category updated",
        data=CategoryResponse(**update_category.model_dump()),
    )


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_category(category_id: UUID, db: database):
    get_category = Fetcher(
        database=db,
        table=Categories,
        where=(Categories.id == category_id,),
        error="Category not found",
    ).get_one()

    get_category.is_deleted = True
    db.commit()
    return {"message": "Category deleted"}


@router_sub.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=PaginationResponse[SubCategoryFullResponse],
)
async def get_sub_categories(
    db: database, request: Request, input_data: Paginate = Depends()
):
    pagination, data = await PaginatorQuery.paginate(
        table_name=SubCategories,
        input_data=input_data,
        session=db,
        filters=(SubCategories.user_id == request.session["user"]["id"],),
    )
    return PaginationResponse(
        pagination=pagination,
        data=[
            SubCategoryFullResponse(
                sub_category=SubCategoryResponse(**account.model_dump()),
                category=CategoryResponse(**account.categories.model_dump()),
            )
            for account in data or []
        ],
    )


@router_sub.get(
    "/{sub_category_id}",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[SubCategoryResponse],
)
async def get_sub_category(sub_category_id: UUID, db: database):
    get_category = Fetcher(
        database=db,
        table=SubCategories,
        where=(SubCategories.id == sub_category_id,),
        error="SubCategory not found",
    ).get_one()
    return ResponseSchema(
        message="Account found",
        data=SubCategoryResponse(**get_category.model_dump()),
    )


@router_sub.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ResponseSchema[SubCategoryResponse],
)
async def create_sub_category(
    input_data: SubCategoryInput, db: database, request: Request
):
    add_new_sub_category = SubCategoryController(
        database=db,
        user=request.session["user"]["id"],
    ).add_sub_category(input_data)

    return ResponseSchema(
        message="Subcategory added",
        data=SubCategoryResponse(**add_new_sub_category.model_dump()),
    )


@router_sub.patch(
    "/{sub_category_id}",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[SubCategoryResponse],
)
async def update_sub_category(
    sub_category_id: UUID, request: Request, input_data: SubCategoryUpdate, db: database
):

    update = SubCategoryController(
        database=db,
        user=request.session["user"]["id"],
    ).update_category(input_data, sub_category_id)

    return ResponseSchema(
        message="Subcategory added",
        data=SubCategoryResponse(**update.model_dump()),
    )


@router_sub.delete("/{sub_category_id}", status_code=status.HTTP_200_OK)
async def delete_sub_category(sub_category_id: UUID, db: database):
    get_category = Fetcher(
        database=db,
        table=SubCategories,
        where=(SubCategories.id == sub_category_id,),
        error="SubCategory not found",
    ).get_one()

    get_category.is_deleted = True
    db.commit()
    return {"message": "Subcategory  deleted"}
