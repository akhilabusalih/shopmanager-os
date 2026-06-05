"""
ShopManager OS — Invoice Template Model
"""

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.shared.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class InvoiceTemplate(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Stores HTML/Jinja2 templates for rendering invoices.

    Table: invoice_templates
    """

    __tablename__ = "invoice_templates"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    template_type: Mapped[str] = mapped_column(String(20), nullable=False) # e.g. "a4" or "thermal"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    def __repr__(self) -> str:
        return f"<InvoiceTemplate id={self.id} name={self.name!r} type={self.template_type}>"
