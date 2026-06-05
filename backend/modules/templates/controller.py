"""
ShopManager OS — Invoice Template Controller
"""

from typing import Sequence
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.templates.dto import InvoiceTemplateResponse
from backend.modules.templates.service import InvoiceTemplateService


def get_template_service(session: AsyncSession = Depends(get_db)) -> InvoiceTemplateService:
    return InvoiceTemplateService(session)


class InvoiceTemplateController:
    @staticmethod
    async def get_all_templates(
        template_type: str | None = None,
        service: InvoiceTemplateService = Depends(get_template_service)
    ) -> Sequence[InvoiceTemplateResponse]:
        return await service.get_all_templates(template_type)

    @staticmethod
    async def get_template(
        template_id: UUID,
        service: InvoiceTemplateService = Depends(get_template_service)
    ) -> InvoiceTemplateResponse:
        return await service.get_template(template_id)
