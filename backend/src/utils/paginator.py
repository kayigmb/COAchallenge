import math
from dataclasses import dataclass
from typing import Annotated, Generic, List, Type, TypeVar

from fastapi.params import Query
from pydantic import BaseModel
from sqlmodel import Session, SQLModel, func, or_, select

T = TypeVar("T")


@dataclass
class Paginate:
    page: Annotated[int, Query(ge=1)] = 1
    per_page: Annotated[int, Query(ge=1, lte=100)] = 10


M = TypeVar("M")


class PaginatorSchema(SQLModel):
    total_count: int
    total_pages: int
    page: int
    per_page: int


class PaginationResponse(BaseModel, Generic[M]):
    pagination: PaginatorSchema
    data: List[M]


Q = TypeVar("Q", bound="CommonBase")


class PaginatorQuery(Generic[Q]):
    @staticmethod
    async def paginate(
        table_name: Type[Q],
        input_data: Paginate,
        session: Session,
        filters: tuple = (),
    ):
        offset = (input_data.page - 1) * input_data.per_page

        is_deleted_column = getattr(table_name, "is_deleted", None)
        if is_deleted_column is not None:
            filters = (
                *filters,
                or_(is_deleted_column == False, is_deleted_column.is_(None)),
            )
        fetching_query = (
            select(table_name)
            .where(
                *filters,
            )
            .offset(offset)
            .limit(input_data.per_page)
            .order_by(table_name.created_at.desc())
        )

        total_data = session.exec(fetching_query).all()

        get_count_query = select(func.count()).select_from(table_name).where(*filters)
        count = session.exec(get_count_query).one()

        page_page_total: int = math.ceil(count / input_data.per_page)

        return (
            PaginatorSchema(
                total_count=count,
                total_pages=page_page_total,
                page=input_data.page,
                per_page=input_data.per_page,
            ),
            total_data,
        )
