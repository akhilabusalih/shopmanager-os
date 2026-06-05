"""
ShopManager OS — Settings DTOs

Purpose:
    Pydantic schemas for the settings module request and response bodies.

Responsibilities:
    - Validate settings update requests
    - Shape settings responses for the frontend

Notes:
    The settings value is stored as a flexible JSON object.
    The frontend's SettingsData TypeScript type matches this structure.
"""

from typing import Any
from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    """
    Response schema for GET /api/settings.
    Returns the full settings object for the frontend.
    """
    settings: dict[str, Any] = Field(
        description="The complete settings object (matches frontend SettingsData type)."
    )


class UpdateSettingsRequest(BaseModel):
    """
    Request schema for PUT /api/settings.
    The frontend sends the full SettingsData object to be saved.
    """
    settings: dict[str, Any] = Field(
        description="The full settings object to save (matches frontend SettingsData type)."
    )


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
