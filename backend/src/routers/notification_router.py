from datetime import datetime
from typing import Dict
from uuid import UUID

from fastapi import APIRouter, Depends, Request, WebSocket, WebSocketDisconnect, status
from sqlmodel import SQLModel

from src.database import database
from src.middlewares.auth import auth
from src.models.models import Notifications
from src.schemas.common_schema import ResponseSchema
from src.utils.fetcher import Fetcher
from src.utils.paginator import Paginate, PaginationResponse, PaginatorQuery

router_notification = APIRouter(
    tags=["Notification"],
    prefix="/notifications",
)

router = APIRouter(
    tags=["Notification"],
    prefix="/notifications",
    dependencies=[Depends(auth)],
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[UUID, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: UUID):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: UUID):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: UUID):
        websocket = self.active_connections.get(UUID(user_id))
        if websocket:
            await websocket.send_text(message)


manager = ConnectionManager()


@router_notification.websocket("/{user_id}")
async def websocket_connection(websocket: WebSocket, user_id: UUID):
    await manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id)


class NotificationResponseSchema(SQLModel):
    id: UUID
    user_id: UUID
    message: str
    is_read: bool
    created_at: datetime


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=PaginationResponse[NotificationResponseSchema],
)
async def get_user_notification(
    request: Request, db: database, input_data: Paginate = Depends()
):
    all_notifications, data = await PaginatorQuery.paginate(
        table_name=Notifications,
        input_data=input_data,
        session=db,
        filters=(Notifications.user_id == request.session["user"]["id"],),
    )
    return PaginationResponse(
        pagination=all_notifications,
        data=[
            NotificationResponseSchema(**account.model_dump()) for account in data or []
        ],
    )


@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[NotificationResponseSchema],
)
async def remove_notification(request: Request, db: database, notification_id: UUID):
    get_notifications = Fetcher(
        database=db,
        table=Notifications,
        where=(Notifications.id == notification_id,),
        error="Notification not found",
    ).get_one()

    get_notifications.is_deleted = True
    db.commit()
    db.refresh(get_notifications)

    return ResponseSchema(
        message="Notification read",
        data=NotificationResponseSchema(**get_notifications.model_dump()),
    )


@router.patch(
    "/{notification_id}/read",
    status_code=status.HTTP_200_OK,
    response_model=ResponseSchema[NotificationResponseSchema],
)
async def get_user_notification(request: Request, db: database, notification_id: UUID):
    get_notifications = Fetcher(
        database=db,
        table=Notifications,
        where=(Notifications.id == notification_id,),
        error="Notification not found",
    ).get_one()

    get_notifications.is_read = True
    db.commit()
    db.refresh(get_notifications)

    return ResponseSchema(
        message="Notification read",
        data=NotificationResponseSchema(**get_notifications.model_dump()),
    )
