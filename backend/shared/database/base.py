"""
ShopManager OS — SQLAlchemy Declarative Base and Shared Mixins

Purpose:
    Provides the SQLAlchemy Base class that all database models inherit from.
    Provides reusable mixins for common column patterns.

Responsibilities:
    - Define the DeclarativeBase for all ORM models
    - Provide TimestampMixin (created_at, updated_at) for all models
    - Provide UUIDPrimaryKeyMixin for UUID primary keys

Dependencies:
    - SQLAlchemy 2.0

Usage:
    from backend.shared.database.base import Base, TimestampMixin

    class Customer(Base, TimestampMixin):
        __tablename__ = "customers"
        id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
        name: Mapped[str] = mapped_column(String(255), nullable=False)

Notes:
    - ALL models must inherit from Base so SQLAlchemy can track them.
    - TimestampMixin must be listed after Base in the class definition.
    - updated_at uses onupdate to auto-update on every row change.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    SQLAlchemy Declarative Base.

    All database models in ShopManager OS inherit from this class.
    This allows SQLAlchemy to discover and manage all table definitions.
    """
    pass


class TimestampMixin:
    """
    Adds created_at and updated_at columns to any model.

    - created_at: Set automatically when a row is first inserted.
    - updated_at: Set automatically when a row is first inserted,
                  and updated automatically whenever the row is modified.

    Usage:
        class Customer(Base, TimestampMixin):
            __tablename__ = "customers"
            ...
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when this record was created",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp when this record was last updated",
    )


class UUIDPrimaryKeyMixin:
    """
    Adds a UUID primary key column to any model.

    Generates a new UUID automatically if not provided.

    Usage:
        class Customer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
            __tablename__ = "customers"
            name: Mapped[str] = ...
    """

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Unique identifier for this record",
    )
