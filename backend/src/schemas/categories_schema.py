from typing import List, Optional
from uuid import UUID

from sqlmodel import SQLModel


class CategoryResponse(SQLModel):
    id: UUID
    user_id: UUID
    name: str
    description: str


class CategoryInput(SQLModel):
    name: str
    description: str


class SubCategoryInput(CategoryInput):
    category_id: UUID


class SubCategoryResponse(CategoryResponse):
    category_id: UUID
    is_deleted: bool


class SubCategoryFullResponse(SQLModel):
    sub_category: SubCategoryResponse
    category: CategoryResponse


class SubCategoryUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryFullResponse(SQLModel):
    category: CategoryResponse
    sub_category: List[SubCategoryResponse]
