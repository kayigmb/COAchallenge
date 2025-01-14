from uuid import UUID

from sqlmodel import Session

from src.models.models import Categories, SubCategories
from src.schemas.categories_schema import CategoryInput, SubCategoryInput
from src.utils.fetcher import Fetcher


class CategoryController:
    def __init__(self, database: Session, user: UUID) -> None:
        self.database = database
        self.user = user

    def get_controller(self, name):
        get_accounts = Fetcher(
            database=self.database,
            table=Categories,
            where=(Categories.name == name,),
            error="Category already Exists",
        ).get_exist()

        return get_accounts

    def add_category(self, input_data: CategoryInput):
        self.get_controller(input_data.name)
        category = Categories(
            user_id=self.user,
            name=input_data.name,
            description=input_data.description,
        )
        self.database.add(category)
        self.database.commit()
        self.database.refresh(category)
        return category

    def update_category(self, input_data: CategoryInput, category_id: UUID):
        get_category = Fetcher(
            database=self.database,
            table=Categories,
            where=(Categories.id == category_id,),
            error="Category not found",
        ).get_one()
        update_record = input_data.model_dump(exclude_none=True, exclude_unset=True)
        get_category.sqlmodel_update(update_record)
        self.database.commit()
        self.database.refresh(get_category)
        return get_category


class SubCategoryController:
    def __init__(self, database: Session, user: UUID) -> None:
        self.database = database
        self.user = user

    def get_controller(self, name):
        get_accounts = Fetcher(
            database=self.database,
            table=SubCategories,
            where=(SubCategories.name == name,),
            error="Subcategory already Exists",
        ).get_exist()

        return get_accounts

    def add_sub_category(self, input_data: SubCategoryInput):
        self.get_controller(input_data.name)
        category = SubCategories(
            category_id=input_data.category_id,
            user_id=self.user,
            name=input_data.name,
            description=input_data.description,
        )
        self.database.add(category)
        self.database.commit()
        self.database.refresh(category)
        return category

    def update_category(self, input_data: SubCategoryInput, category_id: UUID):
        get_category = Fetcher(
            database=self.database,
            table=SubCategories,
            where=(SubCategories.id == category_id,),
            error="Category not found",
        ).get_one()

        update_record = input_data.model_dump(exclude_none=True, exclude_unset=True)
        get_category.sqlmodel_update(update_record)
        self.database.commit()
        self.database.refresh(get_category)
        return get_category
