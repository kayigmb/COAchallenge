import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from src.config import settings
from src.database import engine
from src.models.models import Blacklist
from src.utils.fetcher import Fetcher

BearerToken = HTTPBearer()


async def auth(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(BearerToken),
):
    request.session.clear()
    token = credentials.credentials

    try:
        users_data = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if not users_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No payload Found",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT ERROR: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    with Session(engine) as session:
        Fetcher(
            database=session,
            table=Blacklist,
            where=(Blacklist.token == token,),
            error="Unauthorized access",
            status_code=status.HTTP_401_UNAUTHORIZED,
        ).get_exist()

    request.session["user"] = users_data
    yield users_data
