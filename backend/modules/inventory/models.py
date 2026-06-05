"""
ShopManager OS — Inventory Log Model
"""

import uuid
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.shared.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class InventoryLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Tracks all changes to product inventory.

    Table: inventory_log
    """

    __tablename__ = "inventory_log"

    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    invoice_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("invoices.id"), nullable=True, index=True)
    
    # "INVOICE_CREATED", "INVOICE_CANCELLED", "MANUAL_ADJUSTMENT"
    change_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    qty_before: Mapped[int] = mapped_column(Integer, nullable=False)
    qty_change: Mapped[int] = mapped_column(Integer, nullable=False) # negative = reduction
    qty_after: Mapped[int] = mapped_column(Integer, nullable=False)
    
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<InventoryLog id={self.id} product_id={self.product_id} change={self.qty_change}>"
