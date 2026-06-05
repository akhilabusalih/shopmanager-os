"""
ShopManager OS — Migration DTOs
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class LegacySettings(BaseModel):
    business_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None
    invoice_prefix: Optional[str] = None
    default_gst_rate: Optional[float] = None

class LegacyCustomer(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None

class LegacyProduct(BaseModel):
    id: str
    name: str
    hsn: Optional[str] = None
    price: float
    stock: int
    unit: Optional[str] = None
    gst_rate: Optional[float] = None

class LegacyInvoiceItem(BaseModel):
    product_id: Optional[str] = None
    description: str
    hsn: Optional[str] = None
    qty: int
    unit: Optional[str] = None
    rate: float
    gst_rate: Optional[float] = None

class LegacyInvoice(BaseModel):
    id: str
    invoice_no: str
    invoice_date: str # YYYY-MM-DD expected
    status: str
    
    # Customer snapshot
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    customer_gstin: Optional[str] = None
    customer_state: Optional[str] = None
    customer_state_code: Optional[str] = None
    
    # Financials
    subtotal: float
    cgst: float
    sgst: float
    igst: float
    total: float
    payment_method: Optional[str] = None
    
    items: List[LegacyInvoiceItem]

class MigrationPayload(BaseModel):
    settings: Optional[LegacySettings] = None
    customers: List[LegacyCustomer] = Field(default_factory=list)
    products: List[LegacyProduct] = Field(default_factory=list)
    invoices: List[LegacyInvoice] = Field(default_factory=list)

class MigrationReport(BaseModel):
    success: bool
    customers_imported: int
    products_imported: int
    invoices_imported: int
    warnings: List[str]
