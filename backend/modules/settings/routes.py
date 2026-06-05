"""
ShopManager OS — Settings Routes

Purpose:
    Defines FastAPI route handlers for the settings module.

Endpoints:
    GET /api/settings  → Retrieve current settings (protected)
    PUT /api/settings  → Update settings (protected)
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.settings.controller import SettingsController
from backend.modules.settings.dto import MessageResponse, SettingsResponse, UpdateSettingsRequest
from backend.shared.middleware.auth_guard import AuthenticatedUser, get_current_user

router = APIRouter()


@router.get(
    "",
    response_model=SettingsResponse,
    summary="Get application settings",
    description=(
        "Returns the current application settings. "
        "If no settings have been saved yet, returns sensible defaults."
    ),
)
async def get_settings(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
):
    controller = SettingsController(db)
    return await controller.get_settings()


@router.put(
    "",
    response_model=MessageResponse,
    summary="Update application settings",
    description=(
        "Saves the complete settings object to the database. "
        "The frontend sends the full SettingsData object."
    ),
)
async def update_settings(
    request: UpdateSettingsRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
):
    controller = SettingsController(db)
    return await controller.update_settings(request)
