"""
ShopManager OS — Analytics Repository
"""

from datetime import date
from typing import Sequence, Any, Tuple

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.invoices.models import Invoice, InvoiceItem


class AnalyticsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_summary(self, start_date: date, end_date: date) -> dict[str, Any]:
        stmt = select(
            func.coalesce(func.sum(Invoice.total), 0).label('total_revenue'),
            func.count(Invoice.id).label('total_invoices'),
            func.count(func.distinct(Invoice.customer_id)).label('customer_count'),
            func.coalesce(func.sum(Invoice.cgst + Invoice.sgst + Invoice.igst), 0).label('total_gst_collected')
        ).where(
            Invoice.status == 'Paid',
            Invoice.invoice_date >= start_date,
            Invoice.invoice_date <= end_date
        )
        
        result = await self.session.execute(stmt)
        row = result.fetchone()
        
        total_revenue = float(row.total_revenue)
        total_invoices = int(row.total_invoices)
        
        avg_value = total_revenue / total_invoices if total_invoices > 0 else 0.0
        
        return {
            "total_revenue": total_revenue,
            "total_invoices": total_invoices,
            "customer_count": int(row.customer_count),
            "average_invoice_value": avg_value,
            "total_gst_collected": float(row.total_gst_collected)
        }

    async def get_sales_trend(self, start_date: date, end_date: date, group_by: str) -> list[dict[str, Any]]:
        # group_by is "day" or "month"
        # Since invoice_date is a DATE, we can just use to_char or date_trunc depending on dialect.
        # SQLAlchemy func.to_char is safe for Postgres.
        
        if group_by == 'month':
            date_col = func.to_char(Invoice.invoice_date, 'YYYY-MM')
        else:
            date_col = func.to_char(Invoice.invoice_date, 'YYYY-MM-DD')
            
        stmt = select(
            date_col.label('date'),
            func.coalesce(func.sum(Invoice.total), 0).label('revenue'),
            func.count(Invoice.id).label('invoice_count')
        ).where(
            Invoice.status == 'Paid',
            Invoice.invoice_date >= start_date,
            Invoice.invoice_date <= end_date
        ).group_by(
            date_col
        ).order_by(
            date_col
        )
        
        result = await self.session.execute(stmt)
        rows = result.fetchall()
        
        return [
            {
                "date": row.date,
                "revenue": float(row.revenue),
                "invoice_count": int(row.invoice_count)
            }
            for row in rows
        ]

    async def get_top_products(self, start_date: date, end_date: date, limit: int) -> list[dict[str, Any]]:
        stmt = select(
            InvoiceItem.description.label('product_name'),
            func.coalesce(func.sum(InvoiceItem.qty), 0).label('quantity_sold'),
            func.coalesce(func.sum(InvoiceItem.qty * InvoiceItem.rate), 0).label('revenue')
        ).join(
            Invoice, InvoiceItem.invoice_id == Invoice.id
        ).where(
            Invoice.status == 'Paid',
            Invoice.invoice_date >= start_date,
            Invoice.invoice_date <= end_date
        ).group_by(
            InvoiceItem.description
        ).order_by(
            desc('quantity_sold'),
            desc('revenue')
        ).limit(limit)
        
        result = await self.session.execute(stmt)
        rows = result.fetchall()
        
        return [
            {
                "product_name": row.product_name,
                "quantity_sold": int(row.quantity_sold),
                "revenue": float(row.revenue)
            }
            for row in rows
        ]

    async def get_top_customers(self, start_date: date, end_date: date, limit: int) -> list[dict[str, Any]]:
        stmt = select(
            Invoice.customer_name.label('customer_name'),
            func.count(Invoice.id).label('invoice_count'),
            func.coalesce(func.sum(Invoice.total), 0).label('total_spent')
        ).where(
            Invoice.status == 'Paid',
            Invoice.customer_id.isnot(None),
            Invoice.invoice_date >= start_date,
            Invoice.invoice_date <= end_date
        ).group_by(
            Invoice.customer_name
        ).order_by(
            desc('total_spent')
        ).limit(limit)
        
        result = await self.session.execute(stmt)
        rows = result.fetchall()
        
        return [
            {
                "customer_name": row.customer_name,
                "invoice_count": int(row.invoice_count),
                "total_spent": float(row.total_spent)
            }
            for row in rows
        ]

    async def get_gst_summary(self, start_date: date, end_date: date) -> dict[str, Any]:
        stmt = select(
            func.coalesce(func.sum(Invoice.subtotal), 0).label('taxable_value'),
            func.coalesce(func.sum(Invoice.cgst), 0).label('cgst'),
            func.coalesce(func.sum(Invoice.sgst), 0).label('sgst'),
            func.coalesce(func.sum(Invoice.igst), 0).label('igst')
        ).where(
            Invoice.status == 'Paid',
            Invoice.invoice_date >= start_date,
            Invoice.invoice_date <= end_date
        )
        
        result = await self.session.execute(stmt)
        row = result.fetchone()
        
        taxable_value = float(row.taxable_value)
        cgst = float(row.cgst)
        sgst = float(row.sgst)
        igst = float(row.igst)
        total_gst = cgst + sgst + igst
        
        return {
            "taxable_value": taxable_value,
            "cgst": cgst,
            "sgst": sgst,
            "igst": igst,
            "total_gst": total_gst
        }
