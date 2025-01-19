from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlmodel import Session, select

from src.database import engine
from src.models.models import Budgets, BudgetStatusTypesEnum


def change_expired_budgets_status():
    with Session(engine) as session:
        get_all_expired_budget = session.exec(
            select(Budgets)
            .where(Budgets.ending_date <= datetime.now())
            .where(Budgets.is_deleted == False)
        ).all()

        for budget in get_all_expired_budget:
            budget.status = BudgetStatusTypesEnum.INACTIVE
            session.add(budget)

        session.commit()


def cron_job():
    change_expired_budgets_status()
    print("Cron job executed")


scheduler = BackgroundScheduler()

scheduler.add_job(
    cron_job,
    CronTrigger(hour=00, minute=00, second=00),
)

scheduler.start()
