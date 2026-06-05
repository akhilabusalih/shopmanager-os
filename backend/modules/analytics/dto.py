"""
ShopManager OS — Analytics DTOs
"""

from typing import List
from pydantic import BaseModel


class AnalyticsSummaryResponse(BaseModel):
    total_revenue: float
    total_invoices: int
    customer_count: int
    average_invoice_value: float
    total_gst_collected: float


class SalesTrendItem(BaseModel):
    date: str
    revenue: float
    invoice_count: int


class TopProductItem(BaseModel):
    product_name: str
    quantity_sold: int
    revenue: float


class TopCustomerItem(BaseModel):
    customer_name: str
    invoice_count: int
    total_spent: float


class GSTSummaryResponse(BaseModel):
    taxable_value: float
    cgst: float
    sgst: float
    igst: float
    total_gst: float
