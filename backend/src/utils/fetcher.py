from typing import Generic, Optional, TypeVar

from fastapi import HTTPException, status
from sqlmodel import Session, select

T = TypeVar("T")

# Add Able to asc or desc order according to the create date


class Fetcher(Generic[T]):
    def __init__(
        self,
        database: Session,
        table: T,
        where: Optional[tuple] = (),
        error: Optional[str] = "Record not found",
        status_code: int = status.HTTP_404_NOT_FOUND,
    ) -> None:
        self.database = database
        self.table = table
        self.where = where
        self.error = error
        self.status = status_code

    def query(self):
        query = select(self.table).where(
            *self.where,
            getattr(self.table, "is_deleted") == False,
        )

        return query

    def get_one(self):
        get_query = self.query()
        get_single_value = self.database.exec(get_query).first()

        if not get_single_value:
            raise HTTPException(self.status, self.error)

        return get_single_value

    def get_all(self):
        get_query = self.query()

        get_all_values = self.database.exec(get_query).all()
        if not get_all_values:
            raise HTTPException(self.status, self.error)

        return get_all_values

    def get_exist(self):
        get_query = self.query()

        get_single_value = self.database.exec(get_query).first()
        if get_single_value:
            raise HTTPException(self.status, self.error)

        return get_single_value

    def get_value(self):
        get_query = self.query()
        get_single_value = self.database.exec(get_query).first()

        return get_single_value
