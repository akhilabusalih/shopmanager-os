"""
ShopManager OS — Reports DTOs
"""

from datetime import date
from pydantic import BaseModel

class GSTReportItem(BaseModel):
    invoice_number: str
    invoice_date: date
    customer_name: str
    customer_gstin: str
    place_of_supply: str
    taxable_amount: float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    grand_total: float
