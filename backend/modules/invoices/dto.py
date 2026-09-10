"""
ShopManager OS — Invoice DTOs
"""

from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class InvoiceItemCreate(BaseModel):
    product_id: UUID | None = Field(default=None)
    description: str = Field(..., min_length=1, max_length=200)
    hsn: str = Field(..., min_length=1, max_length=20)
    qty: int = Field(..., gt=0)
    unit: str | None = Field(default=None, max_length=20)
    rate: float = Field(..., ge=0)
    gst_rate: float = Field(..., ge=0, le=100)


class InvoiceCreate(BaseModel):
    invoice_date: date
    status: str = Field(default="Paid", max_length=20)
    
    customer_id: UUID | None = Field(default=None)
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_phone: str | None = Field(default=None, max_length=20)
    customer_address: str | None = Field(default=None)
    customer_gstin: str | None = Field(default=None, max_length=15)
    customer_state: str | None = Field(default=None, max_length=50)
    customer_state_code: str | None = Field(default=None, max_length=5)
    
    subtotal: float = Field(..., ge=0)
    cgst: float = Field(default=0.0, ge=0)
    sgst: float = Field(default=0.0, ge=0)
    igst: float = Field(default=0.0, ge=0)
    total: float = Field(..., ge=0)
    
    payment_method: str | None = Field(default=None, max_length=50)
    
    items: list[InvoiceItemCreate] = Field(..., min_length=1)


class InvoiceItemResponse(InvoiceItemCreate):
    id: UUID
    invoice_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvoiceResponse(BaseModel):
    id: UUID
    invoice_no: str
    invoice_date: date
    status: str
    customer_id: UUID | None
    customer_name: str
    customer_phone: str | None
    customer_address: str | None
    customer_gstin: str | None
    customer_state: str | None
    customer_state_code: str | None
    subtotal: float
    cgst: float
    sgst: float
    igst: float
    total: float
    payment_method: str | None
    created_at: datetime
    updated_at: datetime
    
    items: list[InvoiceItemResponse]

    model_config = ConfigDict(from_attributes=True)
