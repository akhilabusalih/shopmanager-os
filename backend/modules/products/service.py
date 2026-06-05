"""
ShopManager OS — Product Service
"""

from typing import Sequence
from uuid import UUID

from backend.modules.products.dto import ProductCreate, ProductStockUpdate, ProductUpdate
from backend.modules.products.models import Product
from backend.modules.products.repository import ProductRepository
from backend.shared.exceptions.app_exceptions import NotFoundException


class ProductService:
    def __init__(self, repository: ProductRepository):
        self.repository = repository

    async def create_product(self, data: ProductCreate) -> Product:
        product = Product(
            name=data.name,
            hsn=data.hsn,
            price=data.price,
            stock=data.stock,
            unit=data.unit,
            gst_rate=data.gst_rate,
        )
        return await self.repository.create(product)

    async def get_all_products(self) -> Sequence[Product]:
        return await self.repository.get_all()

    async def get_product(self, product_id: UUID) -> Product:
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        return product

    async def update_product(self, product_id: UUID, data: ProductUpdate) -> Product:
        product = await self.get_product(product_id)
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
            
        return await self.repository.update(product)
        
    async def adjust_stock(self, product_id: UUID, data: ProductStockUpdate) -> Product:
        """
        Adjust stock levels.
        This is typically called after an invoice is saved or canceled.
        """
        product = await self.get_product(product_id)
        product.stock += data.stock_delta
        return await self.repository.update(product)

    async def delete_product(self, product_id: UUID) -> None:
        product = await self.get_product(product_id)
        await self.repository.delete(product)

    async def export_products(self, q: str | None = None) -> str:
        import csv
        import io
        
        products = await self.repository.get_products_for_export(q)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(["Product Name", "HSN Code", "Category", "Current Stock", "Unit", "Base Price", "GST Rate"])
        
        # Write data
        for p in products:
            writer.writerow([
                p.name,
                p.hsn,
                "", # No category field in model currently
                p.stock,
                p.unit or "",
                f"{p.price:.2f}",
                f"{p.gst_rate:.2f}" if p.gst_rate is not None else "0.00"
            ])
            
        return output.getvalue()
