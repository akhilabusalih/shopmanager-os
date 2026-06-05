"""
ShopManager OS — Invoice Template Routes
"""

from typing import Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from backend.modules.templates.controller import InvoiceTemplateController
from backend.modules.templates.dto import InvoiceTemplateResponse
from backend.shared.middleware.auth_guard import get_current_user


router = APIRouter(
    prefix="/templates",
    tags=["Templates"],
    dependencies=[Depends(get_current_user)]
)

@router.get(
    "",
    response_model=Sequence[InvoiceTemplateResponse],
    summary="Get all templates"
)
async def get_all_templates(
    template_type: str | None = Query(None, description="Filter by 'a4' or 'thermal'"),
    response: Sequence[InvoiceTemplateResponse] = Depends(InvoiceTemplateController.get_all_templates)
) -> Sequence[InvoiceTemplateResponse]:
    return response

@router.get(
    "/{template_id}",
    response_model=InvoiceTemplateResponse,
    summary="Get a template by ID"
)
async def get_template(
    template_id: UUID,
    response: InvoiceTemplateResponse = Depends(InvoiceTemplateController.get_template)
) -> InvoiceTemplateResponse:
    return response
