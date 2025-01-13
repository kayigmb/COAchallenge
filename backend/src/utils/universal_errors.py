import traceback

from fastapi import Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from src.schemas.common_schema import ResponseSchema


def get_universal_errors():
    async def handle_middleware(req: Request, call_next):
        try:
            forwarded = req.headers.get("X-Forwarded-For")
            if forwarded:
                return await call_next(req)

            return await call_next(req)
        except Exception as e:

            error_response = ResponseSchema(
                message=f"{str(e)}",
                status="error",
                data=jsonable_encoder(traceback.format_exc().split("\n")[-10:]),
            ).model_dump()
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=error_response,
            )

    return handle_middleware
