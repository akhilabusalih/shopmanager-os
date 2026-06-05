"""
ShopManager OS — Reports Repository
"""

from datetime import date
from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.invoices.models import Invoice


class ReportsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_gst_report(self, start_date: date | None, end_date: date | None, limit: int | None = None, offset: int | None = None) -> Sequence[dict]:
        stmt = select(
            Invoice.invoice_no,
            Invoice.invoice_date,
            Invoice.customer_name,
            Invoice.customer_gstin,
            Invoice.place_of_supply,
            Invoice.subtotal.label('taxable_amount'),
            Invoice.cgst.label('cgst_amount'),
            Invoice.sgst.label('sgst_amount'),
            Invoice.igst.label('igst_amount'),
            Invoice.total.label('grand_total')
        ).where(
            Invoice.status == 'Paid'
        ).order_by(
            Invoice.invoice_date.desc(),
            Invoice.invoice_no.desc()
        )
        
        if start_date:
            stmt = stmt.where(Invoice.invoice_date >= start_date)
        if end_date:
            stmt = stmt.where(Invoice.invoice_date <= end_date)
            
        if limit is not None:
            stmt = stmt.limit(limit)
        if offset is not None:
            stmt = stmt.offset(offset)
            
        result = await self.session.execute(stmt)
        return [
            {
                "invoice_number": row.invoice_no,
                "invoice_date": row.invoice_date,
                "customer_name": row.customer_name,
                "customer_gstin": row.customer_gstin or "",
                "place_of_supply": row.place_of_supply or "",
                "taxable_amount": float(row.taxable_amount),
                "cgst_amount": float(row.cgst_amount),
                "sgst_amount": float(row.sgst_amount),
                "igst_amount": float(row.igst_amount),
                "grand_total": float(row.grand_total)
            }
            for row in result.fetchall()
        ]

    async def get_gst_report_count(self, start_date: date | None, end_date: date | None) -> int:
        stmt = select(func.count(Invoice.id)).where(Invoice.status == 'Paid')
        
        if start_date:
            stmt = stmt.where(Invoice.invoice_date >= start_date)
        if end_date:
            stmt = stmt.where(Invoice.invoice_date <= end_date)
            
        result = await self.session.execute(stmt)
        return result.scalar_one()
