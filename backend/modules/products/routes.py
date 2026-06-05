"""
ShopManager OS — Product Routes
"""

from typing import Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, status

from backend.modules.products.controller import ProductController
from backend.modules.products.dto import ProductCreate, ProductResponse, ProductStockUpdate, ProductUpdate
from backend.shared.middleware.auth_guard import get_current_user


router = APIRouter(
    prefix="/products",
    tags=["Products"],
    dependencies=[Depends(get_current_user)]
)

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product"
)
async def create_product(
    data: ProductCreate,
    response: ProductResponse = Depends(ProductController.create_product)
) -> ProductResponse:
    return response


@router.get(
    "",
    response_model=Sequence[ProductResponse],
    summary="Get all products"
)
async def get_all_products(
    response: Sequence[ProductResponse] = Depends(ProductController.get_all_products)
) -> Sequence[ProductResponse]:
    return response

from fastapi.responses import PlainTextResponse

@router.get(
    "/export",
    response_class=PlainTextResponse,
    summary="Export products to CSV"
)
async def export_products(
    q: str | None = None,
    response: PlainTextResponse = Depends(ProductController.export_products)
) -> PlainTextResponse:
    return response


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get a product by ID"
)
async def get_product(
    product_id: UUID,
    response: ProductResponse = Depends(ProductController.get_product)
) -> ProductResponse:
    return response


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update a product"
)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    response: ProductResponse = Depends(ProductController.update_product)
) -> ProductResponse:
    return response


@router.post(
    "/{product_id}/stock",
    response_model=ProductResponse,
    summary="Adjust product stock"
)
async def adjust_stock(
    product_id: UUID,
    data: ProductStockUpdate,
    response: ProductResponse = Depends(ProductController.adjust_stock)
) -> ProductResponse:
    return response


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product"
)
async def delete_product(
    product_id: UUID,
    _: None = Depends(ProductController.delete_product)
) -> None:
    return None
