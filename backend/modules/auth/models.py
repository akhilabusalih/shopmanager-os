"""
ShopManager OS — User Database Model

Purpose:
    Defines the SQLAlchemy ORM model for the 'users' table.
    Stores operator credentials for ShopManager OS authentication.

Responsibilities:
    - Map the users table to a Python class
    - Define all column types and constraints

Dependencies:
    - SQLAlchemy 2.0
    - backend.shared.database.base (Base, UUIDPrimaryKeyMixin, TimestampMixin)

Notes:
    - Passwords are NEVER stored in plain text. Only bcrypt hashes are stored.
    - V1 supports a single operator (no multi-user/RBAC).
    - The username column has a UNIQUE constraint to prevent duplicate logins.
"""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from backend.shared.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an operator account in ShopManager OS.

    Table: users
    """

    __tablename__ = "users"

    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="Login username for the operator. Must be unique.",
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="bcrypt hash of the operator's password. Never store plain text.",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r}>"
