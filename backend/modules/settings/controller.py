"""
ShopManager OS — Settings Controller

Purpose:
    Handles HTTP request/response logic for the settings module.

Responsibilities:
    - Receive validated requests
    - Call SettingsService
    - Return responses
"""

from sqlalchemy.ext.asyncio import AsyncSession
from backend.modules.settings.dto import MessageResponse, SettingsResponse, UpdateSettingsRequest
from backend.modules.settings.service import SettingsService


class SettingsController:
    """Coordinates settings HTTP requests with SettingsService."""

    def __init__(self, session: AsyncSession):
        self.service = SettingsService(session)

    async def get_settings(self) -> SettingsResponse:
        """Handle GET /api/settings."""
        return await self.service.get_settings()

    async def update_settings(self, request: UpdateSettingsRequest) -> MessageResponse:
        """Handle PUT /api/settings."""
        return await self.service.update_settings(request)
