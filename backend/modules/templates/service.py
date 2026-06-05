"""
ShopManager OS — Invoice Template Service
"""

from typing import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.templates.default_templates import A4_DEFAULT_TEMPLATE, THERMAL_DEFAULT_TEMPLATE
from backend.modules.templates.models import InvoiceTemplate
from backend.modules.templates.repository import InvoiceTemplateRepository
from backend.shared.exceptions.app_exceptions import NotFoundException


class InvoiceTemplateService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = InvoiceTemplateRepository(session)

    async def seed_default_templates_if_missing(self) -> None:
        """
        Ensures that there is at least one A4 and one Thermal template in the database.
        Runs during application startup or when specifically called.
        """
        a4_templates = await self.repository.get_all(template_type="a4")
        if not a4_templates:
            a4_template = InvoiceTemplate(
                name="Standard A4 GST Invoice",
                template_type="a4",
                content=A4_DEFAULT_TEMPLATE,
                is_default=True
            )
            await self.repository.create(a4_template)

        thermal_templates = await self.repository.get_all(template_type="thermal")
        if not thermal_templates:
            thermal_template = InvoiceTemplate(
                name="Standard Thermal Receipt",
                template_type="thermal",
                content=THERMAL_DEFAULT_TEMPLATE,
                is_default=True
            )
            await self.repository.create(thermal_template)

    async def get_all_templates(self, template_type: str | None = None) -> Sequence[InvoiceTemplate]:
        return await self.repository.get_all(template_type)

    async def get_template(self, template_id: UUID) -> InvoiceTemplate:
        template = await self.repository.get_by_id(template_id)
        if not template:
            raise NotFoundException("Template not found")
        return template

    async def get_default_template(self, template_type: str) -> InvoiceTemplate:
        template = await self.repository.get_default(template_type)
        if not template:
            # Fallback to the first available if no explicit default exists
            templates = await self.repository.get_all(template_type)
            if templates:
                return templates[0]
            raise NotFoundException(f"No {template_type} templates found")
        return template
