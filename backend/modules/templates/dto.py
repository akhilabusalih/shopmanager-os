"""
ShopManager OS — Invoice Template DTOs
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class InvoiceTemplateResponse(BaseModel):
    id: UUID
    name: str
    template_type: str
    content: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
