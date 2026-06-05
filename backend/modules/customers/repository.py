"""
ShopManager OS — Customer Repository
"""

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.customers.models import Customer


class CustomerRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, customer: Customer) -> Customer:
        self.session.add(customer)
        await self.session.flush()
        await self.session.refresh(customer)
        return customer

    async def get_by_id(self, customer_id: UUID) -> Customer | None:
        return await self.session.get(Customer, customer_id)

    async def get_all(self) -> Sequence[Customer]:
        stmt = select(Customer).order_by(Customer.name.asc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, customer: Customer) -> Customer:
        await self.session.flush()
        await self.session.refresh(customer)
        return customer

    async def delete(self, customer: Customer) -> None:
        await self.session.delete(customer)
        await self.session.flush()

    async def get_customers_for_export(self, q: str | None = None) -> Sequence[dict]:
        from sqlalchemy import func
        from backend.modules.invoices.models import Invoice
        
        stmt = select(
            Customer.name,
            Customer.phone,
            Customer.gstin,
            Customer.state,
            func.count(Invoice.id).label('total_invoices'),
            func.coalesce(func.sum(Invoice.total), 0).label('total_spent')
        ).outerjoin(
            Invoice, 
            (Customer.id == Invoice.customer_id) & (Invoice.status == 'Paid')
        ).group_by(
            Customer.id, Customer.name, Customer.phone, Customer.gstin, Customer.state
        ).order_by(
            Customer.name.asc()
        )
        
        if q:
            search = f"%{q}%"
            stmt = stmt.where(
                (Customer.name.ilike(search)) |
                (Customer.phone.ilike(search)) |
                (Customer.gstin.ilike(search))
            )
            
        result = await self.session.execute(stmt)
        return [
            {
                "name": row.name,
                "phone": row.phone or "",
                "gstin": row.gstin or "",
                "state": row.state or "",
                "total_invoices": int(row.total_invoices),
                "total_spent": float(row.total_spent)
            }
            for row in result.fetchall()
        ]
