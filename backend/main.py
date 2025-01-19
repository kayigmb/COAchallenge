from contextlib import asynccontextmanager
from functools import lru_cache

from fastapi import Depends, FastAPI, Request
from sqlmodel import SQLModel
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from src.config import settings
from src.database import engine
from src.middlewares.auth import auth
from src.middlewares.cronjob import scheduler
from src.routers import (
    account_router,
    auth_router,
    budget_router,
    categories_router,
    notification_router,
    transactions_router,
)
from src.utils.universal_errors import get_universal_errors


@asynccontextmanager
@lru_cache(maxsize=200)
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield
    scheduler.shutdown()


app = FastAPI(
    title="Wallet APP API",
    description="Backend for a wallet app",
    lifespan=lifespan,
    version="0.0.1",
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.add_middleware(BaseHTTPMiddleware, dispatch=get_universal_errors())


# @app.middleware("http")
# async def debug_middleware(request, call_next):
#     print(f"Request path: {request.url.path}")
#     print(f"Request headers: {request.headers}")
#     response = await call_next(request)
#     print(f"Response headers: {response.headers}")
#     return response


@app.get("/", dependencies=[Depends(auth)])
async def root(request: Request):
    user_data = request.session["user"]
    return {"message": user_data}


routes = [
    auth_router.router,
    account_router.router,
    transactions_router.router,
    categories_router.router,
    categories_router.router_sub,
    budget_router.router,
    notification_router.router,
    notification_router.router_notification,
]

for route in routes:
    app.include_router(router=route, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        port=settings.PORT,
        reload=True,
    )
