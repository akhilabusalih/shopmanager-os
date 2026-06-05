"""
ShopManager OS — Invoice Controller
"""

from typing import Sequence
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.invoices.dto import InvoiceCreate, InvoiceResponse
from backend.modules.invoices.service import InvoiceService


def get_invoice_service(session: AsyncSession = Depends(get_db)) -> InvoiceService:
    return InvoiceService(session)


from backend.shared.dto.pagination import PaginatedResponse
from fastapi.responses import PlainTextResponse
import csv
import io

class InvoiceController:
    @staticmethod
    async def create_invoice(
        data: InvoiceCreate,
        service: InvoiceService = Depends(get_invoice_service)
    ) -> InvoiceResponse:
        return await service.create_invoice(data)

    @staticmethod
    async def get_all_invoices(
        page: int = 1,
        per_page: int = 20,
        start_date: str | None = None,
        end_date: str | None = None,
        status: str | None = None,
        search: str | None = None,
        service: InvoiceService = Depends(get_invoice_service)
    ) -> PaginatedResponse[InvoiceResponse]:
        items, total = await service.get_paginated_invoices(
            page=page, per_page=per_page, start_date=start_date, end_date=end_date, status=status, search=search
        )
        
        # Serialize
        items_dto = [InvoiceResponse.model_validate(item) for item in items]
        
        import math
        total_pages = math.ceil(total / per_page) if per_page > 0 else 0
        
        return PaginatedResponse(
            items=items_dto,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    @staticmethod
    async def export_invoices(
        start_date: str | None = None,
        end_date: str | None = None,
        status: str | None = None,
        search: str | None = None,
        service: InvoiceService = Depends(get_invoice_service)
    ) -> PlainTextResponse:
        items = await service.get_for_export(start_date=start_date, end_date=end_date, status=status, search=search)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(["Invoice No", "Date", "Customer Name", "Phone", "Status", "Subtotal", "CGST", "SGST", "Total"])
        
        # Data
        for inv in items:
            writer.writerow([
                inv.invoice_no,
                inv.invoice_date,
                inv.customer_name,
                inv.customer_phone or "",
                inv.status,
                f"{inv.subtotal:.2f}",
                f"{inv.cgst:.2f}",
                f"{inv.sgst:.2f}",
                f"{inv.total:.2f}"
            ])
            
        return PlainTextResponse(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=invoices_export.csv"}
        )
        
    @staticmethod
    async def get_next_invoice_number(
        service: InvoiceService = Depends(get_invoice_service)
    ) -> dict[str, str]:
        next_num = await service.get_next_invoice_number()
        return {"next_invoice_number": next_num}

    @staticmethod
    async def get_invoice(
        invoice_id: UUID,
        service: InvoiceService = Depends(get_invoice_service)
    ) -> InvoiceResponse:
        return await service.get_invoice(invoice_id)

    @staticmethod
    async def cancel_invoice(
        invoice_id: UUID,
        service: InvoiceService = Depends(get_invoice_service)
    ) -> InvoiceResponse:
        return await service.cancel_invoice(invoice_id)

    @staticmethod
    async def delete_invoice(
        invoice_id: UUID,
        service: InvoiceService = Depends(get_invoice_service)
    ) -> None:
        await service.delete_invoice(invoice_id)
