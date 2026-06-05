"""
ShopManager OS — Product DTOs
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    hsn: str = Field(..., min_length=1, max_length=20)
    price: float = Field(..., ge=0)
    stock: int = Field(default=0)
    unit: str | None = Field(default=None, max_length=20)
    gst_rate: float | None = Field(default=None, ge=0, le=100)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    hsn: str | None = Field(default=None, min_length=1, max_length=20)
    price: float | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None)
    unit: str | None = Field(default=None, max_length=20)
    gst_rate: float | None = Field(default=None, ge=0, le=100)


class ProductStockUpdate(BaseModel):
    stock_delta: int = Field(...)
    reason: str | None = Field(default=None)


class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
