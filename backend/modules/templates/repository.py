"""
ShopManager OS — Invoice Template Repository
"""

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.templates.models import InvoiceTemplate


class InvoiceTemplateRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, template_type: str | None = None) -> Sequence[InvoiceTemplate]:
        stmt = select(InvoiceTemplate).order_by(InvoiceTemplate.created_at.desc())
        if template_type:
            stmt = stmt.where(InvoiceTemplate.template_type == template_type)
        
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, template_id: UUID) -> InvoiceTemplate | None:
        return await self.session.get(InvoiceTemplate, template_id)

    async def get_default(self, template_type: str) -> InvoiceTemplate | None:
        stmt = select(InvoiceTemplate).where(
            InvoiceTemplate.template_type == template_type,
            InvoiceTemplate.is_default == True
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create(self, template: InvoiceTemplate) -> InvoiceTemplate:
        self.session.add(template)
        await self.session.flush()
        await self.session.refresh(template)
        return template
