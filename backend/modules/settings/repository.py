"""
ShopManager OS — Settings Repository

Purpose:
    Handles all database operations for the settings module.

Responsibilities:
    - Retrieve the current settings object
    - Create or update the settings object
    - Initialize default settings if none exist

Dependencies:
    - SQLAlchemy (AsyncSession)
    - backend.modules.settings.models (AppSettings)
"""

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.settings.models import AppSettings

logger = logging.getLogger(__name__)

# The key used to store the main application settings in the app_settings table.
SHOP_SETTINGS_KEY = "shop_settings"


class SettingsRepository:
    """
    Database access layer for application settings.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_settings(self) -> dict[str, Any] | None:
        """
        Retrieve the current application settings.

        @returns dict: The settings object, or None if not yet configured.
        """
        stmt = select(AppSettings).where(AppSettings.key == SHOP_SETTINGS_KEY)
        result = await self.session.execute(stmt)
        record = result.scalar_one_or_none()

        if record is None:
            return None
        return record.value

    async def save_settings(self, settings_data: dict[str, Any]) -> dict[str, Any]:
        """
        Create or update the application settings.

        Uses PostgreSQL UPSERT pattern:
        - If 'shop_settings' key exists → update the value.
        - If it doesn't exist → create a new record.

        @param settings_data: The full settings object from the frontend.
        @returns dict: The saved settings object.
        """
        stmt = select(AppSettings).where(AppSettings.key == SHOP_SETTINGS_KEY)
        result = await self.session.execute(stmt)
        record = result.scalar_one_or_none()

        if record is None:
            # First time saving settings — create a new record.
            record = AppSettings(
                key=SHOP_SETTINGS_KEY,
                value=settings_data,
                description="Main application settings (shop info, GST, invoice, print, etc.)",
            )
            self.session.add(record)
            logger.info("Created new shop_settings record.")
        else:
            # Settings already exist — update in place.
            record.value = settings_data
            logger.info("Updated existing shop_settings record.")

        await self.session.flush()
        return record.value
