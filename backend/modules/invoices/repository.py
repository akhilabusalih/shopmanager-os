"""
ShopManager OS — Invoice Repository
"""

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.modules.invoices.models import Invoice


class InvoiceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, invoice: Invoice) -> Invoice:
        self.session.add(invoice)
        await self.session.flush()
        await self.session.refresh(invoice)
        return invoice

    async def get_by_id(self, invoice_id: UUID) -> Invoice | None:
        stmt = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_invoice_no(self, invoice_no: str) -> Invoice | None:
        stmt = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.invoice_no == invoice_no)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self) -> Sequence[Invoice]:
        stmt = select(Invoice).options(selectinload(Invoice.items)).order_by(Invoice.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_paginated(
        self,
        page: int = 1,
        per_page: int = 20,
        start_date: str | None = None,
        end_date: str | None = None,
        status: str | None = None,
        search: str | None = None
    ) -> tuple[Sequence[Invoice], int]:
        from sqlalchemy import or_, func

        stmt = select(Invoice).options(selectinload(Invoice.items))
        
        if start_date:
            stmt = stmt.where(Invoice.invoice_date >= start_date)
        if end_date:
            stmt = stmt.where(Invoice.invoice_date <= end_date)
        if status:
            stmt = stmt.where(Invoice.status == status)
        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Invoice.invoice_no.ilike(search_term),
                    Invoice.customer_name.ilike(search_term)
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        # Paginate
        stmt = stmt.order_by(Invoice.invoice_date.desc(), Invoice.created_at.desc())
        stmt = stmt.limit(per_page).offset((page - 1) * per_page)
        
        result = await self.session.execute(stmt)
        items = result.scalars().all()
        
        return items, total

    async def get_for_export(
        self,
        start_date: str | None = None,
        end_date: str | None = None,
        status: str | None = None,
        search: str | None = None
    ) -> Sequence[Invoice]:
        from sqlalchemy import or_

        stmt = select(Invoice).options(selectinload(Invoice.items))
        
        if start_date:
            stmt = stmt.where(Invoice.invoice_date >= start_date)
        if end_date:
            stmt = stmt.where(Invoice.invoice_date <= end_date)
        if status:
            stmt = stmt.where(Invoice.status == status)
        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Invoice.invoice_no.ilike(search_term),
                    Invoice.customer_name.ilike(search_term)
                )
            )

        stmt = stmt.order_by(Invoice.invoice_date.desc(), Invoice.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, invoice: Invoice) -> Invoice:
        await self.session.flush()
        await self.session.refresh(invoice)
        return invoice

    async def delete(self, invoice: Invoice) -> None:
        await self.session.delete(invoice)
        await self.session.flush()
