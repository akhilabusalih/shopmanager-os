"""
ShopManager OS — Reports Service
"""

import math
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.reports.repository import ReportsRepository
from backend.modules.reports.dto import GSTReportItem
from backend.shared.dto.pagination import PaginatedResponse


class ReportsService:
    def __init__(self, session: AsyncSession):
        self.repository = ReportsRepository(session)

    async def get_gst_report(self, start_date: date | None, end_date: date | None, page: int, per_page: int) -> PaginatedResponse[GSTReportItem]:
        offset = (page - 1) * per_page
        
        total_items = await self.repository.get_gst_report_count(start_date, end_date)
        data = await self.repository.get_gst_report(start_date, end_date, limit=per_page, offset=offset)
        
        items = [GSTReportItem(**item) for item in data]
        total_pages = math.ceil(total_items / per_page) if total_items > 0 else 1
        
        return PaginatedResponse(
            items=items,
            total=total_items,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )

    async def export_gst_report(self, start_date: date | None, end_date: date | None) -> str:
        import csv
        import io
        
        data = await self.repository.get_gst_report(start_date, end_date)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow([
            "Invoice Number", "Invoice Date", "Customer Name", "Customer GSTIN", 
            "Place of Supply", "Taxable Amount", "CGST Amount", "SGST Amount", 
            "IGST Amount", "Grand Total"
        ])
        
        for row in data:
            writer.writerow([
                row["invoice_number"],
                row["invoice_date"],
                row["customer_name"],
                row["customer_gstin"],
                row["place_of_supply"],
                f"{row['taxable_amount']:.2f}",
                f"{row['cgst_amount']:.2f}",
                f"{row['sgst_amount']:.2f}",
                f"{row['igst_amount']:.2f}",
                f"{row['grand_total']:.2f}"
            ])
            
        return output.getvalue()
