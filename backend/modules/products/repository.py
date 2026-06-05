"""
ShopManager OS — Product Repository
"""

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.products.models import Product


class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, product: Product) -> Product:
        self.session.add(product)
        await self.session.flush()
        await self.session.refresh(product)
        return product

    async def get_by_id(self, product_id: UUID) -> Product | None:
        return await self.session.get(Product, product_id)

    async def get_all(self) -> Sequence[Product]:
        stmt = select(Product).order_by(Product.name.asc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, product: Product) -> Product:
        await self.session.flush()
        await self.session.refresh(product)
        return product

    async def delete(self, product: Product) -> None:
        await self.session.delete(product)
        await self.session.flush()

    async def get_products_for_export(self, q: str | None = None) -> Sequence[Product]:
        stmt = select(Product).order_by(Product.name.asc())
        if q:
            search = f"%{q}%"
            stmt = stmt.where(
                (Product.name.ilike(search)) |
                (Product.hsn_code.ilike(search)) |
                (Product.category.ilike(search))
            )
        result = await self.session.execute(stmt)
        return result.scalars().all()
