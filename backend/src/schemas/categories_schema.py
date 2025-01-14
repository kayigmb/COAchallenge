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
