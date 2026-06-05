"""
ShopManager OS — Invoice Routes
"""

from typing import Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, status

from backend.modules.invoices.controller import InvoiceController
from backend.modules.invoices.dto import InvoiceCreate, InvoiceResponse
from backend.shared.middleware.auth_guard import get_current_user


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"],
    dependencies=[Depends(get_current_user)]
)

@router.post(
    "",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new invoice"
)
async def create_invoice(
    data: InvoiceCreate,
    response: InvoiceResponse = Depends(InvoiceController.create_invoice)
) -> InvoiceResponse:
    return response


from backend.shared.dto.pagination import PaginatedResponse
from fastapi.responses import PlainTextResponse

@router.get(
    "/export",
    response_class=PlainTextResponse,
    summary="Export invoices to CSV"
)
async def export_invoices(
    response: PlainTextResponse = Depends(InvoiceController.export_invoices)
) -> PlainTextResponse:
    return response

@router.get(
    "/next-number",
    summary="Get next invoice number"
)
async def get_next_invoice_number(
    response: dict = Depends(InvoiceController.get_next_invoice_number)
) -> dict:
    return response

@router.get(
    "",
    response_model=PaginatedResponse[InvoiceResponse],
    summary="Get all invoices"
)
async def get_all_invoices(
    response: PaginatedResponse[InvoiceResponse] = Depends(InvoiceController.get_all_invoices)
) -> PaginatedResponse[InvoiceResponse]:
    return response


from fastapi import Query
from fastapi.responses import HTMLResponse
from backend.modules.templates.service import InvoiceTemplateService
from backend.modules.templates.rendering_service import TemplateRenderingService
from backend.config.database import get_db

@router.get(
    "/{invoice_id}/html",
    response_class=HTMLResponse,
    summary="Get invoice as rendered HTML (A4)"
)
async def get_invoice_html(
    invoice_id: UUID,
    template_type: str = Query("a4", description="a4 or thermal"),
    session = Depends(get_db)
) -> HTMLResponse:
    # 1. Get Invoice
    from backend.modules.invoices.service import InvoiceService
    inv_service = InvoiceService(session)
    invoice = await inv_service.get_invoice(invoice_id)
    
    # 2. Get Settings
    from backend.modules.settings.service import AppSettingsService
    settings_service = AppSettingsService(session)
    settings = await settings_service.get_settings()
    
    # 3. Get Template
    template_service = InvoiceTemplateService(session)
    template = await template_service.get_default_template(template_type)
    
    # 4. Render
    html_content = TemplateRenderingService.render_html(template, invoice, settings)
    return HTMLResponse(content=html_content)

@router.get(
    "/{invoice_id}/thermal",
    response_class=HTMLResponse,
    summary="Get invoice as rendered HTML (Thermal)"
)
async def get_invoice_thermal(
    invoice_id: UUID,
    session = Depends(get_db)
) -> HTMLResponse:
    # Delegate to the same logic, forcing template_type="thermal"
    return await get_invoice_html(invoice_id=invoice_id, template_type="thermal", session=session)

@router.get(
    "/{invoice_id}",
    response_model=InvoiceResponse,
    summary="Get an invoice by ID"
)
async def get_invoice(
    invoice_id: UUID,
    response: InvoiceResponse = Depends(InvoiceController.get_invoice)
) -> InvoiceResponse:
    return response


@router.post(
    "/{invoice_id}/cancel",
    response_model=InvoiceResponse,
    summary="Cancel an invoice"
)
async def cancel_invoice(
    invoice_id: UUID,
    response: InvoiceResponse = Depends(InvoiceController.cancel_invoice)
) -> InvoiceResponse:
    return response


@router.delete(
    "/{invoice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an invoice"
)
async def delete_invoice(
    invoice_id: UUID,
    _: None = Depends(InvoiceController.delete_invoice)
) -> None:
    return None
