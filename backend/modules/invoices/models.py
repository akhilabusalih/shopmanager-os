"""
ShopManager OS — Invoice Database Model
"""

import uuid
from sqlalchemy import Float, ForeignKey, Integer, String, Text, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.shared.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Invoice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents a finalized or pending invoice.

    Table: invoices
    """

    __tablename__ = "invoices"

    invoice_no: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    invoice_date: Mapped[str] = mapped_column(Date, nullable=False) # Maps to PostgreSQL DATE
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Paid")
    
    # Customer Snapshot
    # Why? We store a snapshot of the customer details at the time of billing.
    customer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    customer_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    customer_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    customer_gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)
    customer_state: Mapped[str | None] = mapped_column(String(50), nullable=True)
    customer_state_code: Mapped[str | None] = mapped_column(String(5), nullable=True)

    # Financials
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)
    cgst: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    sgst: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    igst: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total: Mapped[float] = mapped_column(Float, nullable=False)

    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Optional foreign key to Customers table if it was an existing customer
    customer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("customers.id"), nullable=True)

    items: Mapped[list["InvoiceItem"]] = relationship(
        "InvoiceItem", back_populates="invoice", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Invoice id={self.id} invoice_no={self.invoice_no!r}>"


class InvoiceItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents a line item in an invoice.

    Table: invoice_items
    """

    __tablename__ = "invoice_items"

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True
    )

    product_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    hsn: Mapped[str] = mapped_column(String(20), nullable=False)
    qty: Mapped[int] = mapped_column(Integer, nullable=False)
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    rate: Mapped[float] = mapped_column(Float, nullable=False)
    gst_rate: Mapped[float] = mapped_column(Float, nullable=False)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")

    def __repr__(self) -> str:
        return f"<InvoiceItem id={self.id} invoice_id={self.invoice_id}>"
