"""
ShopManager OS — Customer Database Model

Purpose:
    Defines the SQLAlchemy ORM model for the 'customers' table.
"""

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.shared.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Customer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents a client/customer in ShopManager OS.

    Table: customers
    """

    __tablename__ = "customers"

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    address: Mapped[str] = mapped_column(Text, nullable=False, default="")
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    state_code: Mapped[str] = mapped_column(String(5), nullable=False)
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    gstin: Mapped[str | None] = mapped_column(String(15), nullable=True, index=True)

    def __repr__(self) -> str:
        return f"<Customer id={self.id} name={self.name!r}>"
