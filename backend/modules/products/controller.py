"""
ShopManager OS — Product Controller
"""

from typing import Sequence
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.products.dto import ProductCreate, ProductResponse, ProductStockUpdate, ProductUpdate
from backend.modules.products.repository import ProductRepository
from backend.modules.products.service import ProductService


def get_product_service(session: AsyncSession = Depends(get_db)) -> ProductService:
    repository = ProductRepository(session)
    return ProductService(repository)


class ProductController:
    @staticmethod
    async def create_product(
        data: ProductCreate,
        service: ProductService = Depends(get_product_service)
    ) -> ProductResponse:
        return await service.create_product(data)

    @staticmethod
    async def get_all_products(
        service: ProductService = Depends(get_product_service)
    ) -> Sequence[ProductResponse]:
        return await service.get_all_products()

    @staticmethod
    async def get_product(
        product_id: UUID,
        service: ProductService = Depends(get_product_service)
    ) -> ProductResponse:
        return await service.get_product(product_id)

    @staticmethod
    async def update_product(
        product_id: UUID,
        data: ProductUpdate,
        service: ProductService = Depends(get_product_service)
    ) -> ProductResponse:
        return await service.update_product(product_id, data)

    @staticmethod
    async def adjust_stock(
        product_id: UUID,
        data: ProductStockUpdate,
        service: ProductService = Depends(get_product_service)
    ) -> ProductResponse:
        return await service.adjust_stock(product_id, data)

    @staticmethod
    async def delete_product(
        product_id: UUID,
        service: ProductService = Depends(get_product_service)
    ) -> None:
        await service.delete_product(product_id)

    @staticmethod
    async def export_products(
        q: str | None = None,
        service: ProductService = Depends(get_product_service)
    ) -> str:
        from fastapi.responses import PlainTextResponse
        csv_data = await service.export_products(q)
        return PlainTextResponse(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=products.csv"}
        )
