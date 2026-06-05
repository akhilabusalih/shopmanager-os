"""
ShopManager OS — Settings Service

Purpose:
    Business logic for application settings management.

Responsibilities:
    - Retrieve settings, returning defaults if none are saved yet
    - Save updated settings to the database
    - Provide sensible defaults matching the frontend's SettingsData structure

Dependencies:
    - backend.modules.settings.repository (SettingsRepository)
    - backend.modules.settings.dto
"""

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.settings.dto import MessageResponse, SettingsResponse, UpdateSettingsRequest
from backend.modules.settings.repository import SettingsRepository

logger = logging.getLogger(__name__)

# =============================================================================
# Default Settings
# These match the DEFAULT constant in the frontend's Settings.tsx.
# They are returned when no settings have been saved yet.
# =============================================================================
DEFAULT_SETTINGS: dict[str, Any] = {
    "shop": {
        "businessName": "ShopManager OS",
        "ownerName": "Admin User",
        "phone": "",
        "altPhone": "",
        "email": "",
        "address": "",
        "city": "",
        "state": "Kerala",
        "pinCode": "",
    },
    "gst": {
        "gstin": "",
        "pan": "",
        "state": "Kerala",
        "stateCode": "32",
    },
    "invoice": {
        "prefix": "INV",
        "startingNumber": 1,
        "terms": (
            "1. Goods once sold will not be taken back or exchanged.\n"
            "2. Interest @18% p.a. will be charged if payment is delayed beyond due date.\n"
            "3. Subject to local jurisdiction only."
        ),
        "signatureText": "Authorized Signatory",
        "bankName": "",
        "accountNumber": "",
        "ifsc": "",
        "upiId": "",
    },
    "print": {
        "defaultOutput": "a4",
        "thermalWidth": "80mm",
        "printBehavior": "ask",
    },
    "customerDefaults": {
        "defaultState": "Kerala",
        "defaultStateCode": "32",
        "requirePhone": True,
        "requireGSTIN": False,
        "requireAddress": False,
    },
    "productDefaults": {
        "defaultGSTRate": 18,
        "defaultUnit": "pcs",
        "lowStockThreshold": 10,
        "priceIncludesGST": False,
    },
    "branding": {
        "logoUrl": "",
        "signatureUrl": "",
        "stampUrl": "",
    },
    "security": {
        "username": "admin",
        "requirePasswordOnStartup": False,
        "autoLock": "never",
    },
}


class SettingsService:
    """
    Business logic for managing application settings.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = SettingsRepository(session)

    async def get_settings(self) -> SettingsResponse:
        """
        Retrieve the current application settings.

        If no settings have been saved yet, returns the DEFAULT_SETTINGS.
        This ensures the frontend always receives a complete settings object.

        @returns SettingsResponse: The current settings object.
        """
        saved = await self.repo.get_settings()
        if saved is None:
            logger.info("No settings found in database. Returning defaults.")
            return SettingsResponse(settings=DEFAULT_SETTINGS)

        # Merge saved settings with defaults to handle missing keys
        # (in case new settings fields were added after initial setup).
        merged = self._merge_with_defaults(saved)
        return SettingsResponse(settings=merged)

    async def update_settings(self, request: UpdateSettingsRequest) -> MessageResponse:
        """
        Save updated application settings to the database.

        The frontend sends the complete SettingsData object.
        We store it directly as JSONB in PostgreSQL.

        @param request: The settings update request with new settings values.
        @returns MessageResponse: Success confirmation.
        """
        async with self.session.begin():
            await self.repo.save_settings(request.settings)

        logger.info("Application settings updated successfully.")
        return MessageResponse(message="Settings saved successfully.")

    def _merge_with_defaults(self, saved: dict[str, Any]) -> dict[str, Any]:
        """
        Merges saved settings with defaults to handle new settings fields.

        WHY: If a new settings field is added in a future update, saved settings
        won't have that field. This merge ensures all fields are always present.

        Only top-level keys are merged. Nested objects use saved values if present.

        @param saved: The settings object from the database.
        @returns dict: Merged settings with all default keys present.
        """
        merged = {**DEFAULT_SETTINGS}
        for key, value in saved.items():
            if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
                # Merge nested objects (e.g., 'shop', 'gst', 'invoice')
                merged[key] = {**merged[key], **value}
            else:
                merged[key] = value
        return merged
