"""
ShopManager OS — Customer DTOs
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.shared.validators.gstin_validator import validate_gstin


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: str | None = Field(default=None, max_length=100)
    
    address: str = Field(default="")
    city: str | None = Field(default=None, max_length=100)
    state: str = Field(..., min_length=1, max_length=50)
    state_code: str = Field(..., min_length=1, max_length=5)
    pincode: str | None = Field(default=None, max_length=20)
    
    gstin: str | None = Field(default=None, max_length=15)

    @field_validator("gstin")
    @classmethod
    def validate_gstin_format(cls, v: str | None) -> str | None:
        if v:
            v = v.strip().upper()
            if not validate_gstin(v):
                raise ValueError("Invalid GSTIN format")
        return v


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, min_length=10, max_length=20)
    email: str | None = Field(default=None, max_length=100)
    
    address: str | None = Field(default=None)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, min_length=1, max_length=50)
    state_code: str | None = Field(default=None, min_length=1, max_length=5)
    pincode: str | None = Field(default=None, max_length=20)
    
    gstin: str | None = Field(default=None, max_length=15)

    @field_validator("gstin")
    @classmethod
    def validate_gstin_format(cls, v: str | None) -> str | None:
        if v:
            v = v.strip().upper()
            if not validate_gstin(v):
                raise ValueError("Invalid GSTIN format")
        return v


class CustomerResponse(CustomerBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
