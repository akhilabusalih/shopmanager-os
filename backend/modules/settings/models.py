"""
ShopManager OS — App Settings Database Model

Purpose:
    Defines the SQLAlchemy ORM model for the 'app_settings' table.
    Stores all application configuration as flexible key-value pairs.

Responsibilities:
    - Store settings as JSONB key-value pairs in PostgreSQL
    - Allow flexible, schema-free settings storage

Design Decision:
    WHY use JSONB key-value pairs instead of individual columns?
    - The settings structure (SettingsData) is complex and nested.
    - Using JSONB allows the frontend's full SettingsData object to be stored
      and retrieved without complex column mapping.
    - Future settings additions don't require database migrations.
    - The frontend's existing SettingsData TypeScript type maps directly.

    The primary settings record is stored with key='shop_settings' and contains
    the full JSON matching the frontend's SettingsData type.

Dependencies:
    - SQLAlchemy 2.0
    - PostgreSQL JSONB type

Notes:
    - JSONB is PostgreSQL's binary JSON type. It's indexable and queryable.
    - The value column accepts any valid JSON (dict, list, string, number).
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from backend.shared.database.base import Base, UUIDPrimaryKeyMixin


class AppSettings(Base, UUIDPrimaryKeyMixin):
    """
    Stores application configuration as flexible key-value pairs.

    Table: app_settings

    Each row represents one configuration namespace.
    Example:
        key   = "shop_settings"
        value = { "shop": {...}, "gst": {...}, "invoice": {...}, ... }
    """

    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        comment="Configuration namespace key (e.g., 'shop_settings')",
    )

    value: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        comment="Configuration value as JSON. Stores the full settings object.",
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Human-readable description of what this setting controls.",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp of the last update to this settings record.",
    )

    def __repr__(self) -> str:
        return f"<AppSettings id={self.id} key={self.key!r}>"
