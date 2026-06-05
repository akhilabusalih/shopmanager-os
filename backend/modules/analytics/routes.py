"""
ShopManager OS — Analytics Routes
"""

from typing import List

from fastapi import APIRouter, Depends

from backend.shared.middleware.auth_guard import get_current_user
from backend.modules.analytics.controller import AnalyticsController
from backend.modules.analytics.dto import (
    AnalyticsSummaryResponse,
    SalesTrendItem,
    TopProductItem,
    TopCustomerItem,
    GSTSummaryResponse
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
    dependencies=[Depends(get_current_user)]
)

@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
    summary="Get top-level KPI metrics"
)
async def get_summary(
    response: AnalyticsSummaryResponse = Depends(AnalyticsController.get_summary)
) -> AnalyticsSummaryResponse:
    return response


@router.get(
    "/sales-trend",
    response_model=List[SalesTrendItem],
    summary="Get sales trend over time"
)
async def get_sales_trend(
    response: List[SalesTrendItem] = Depends(AnalyticsController.get_sales_trend)
) -> List[SalesTrendItem]:
    return response


@router.get(
    "/top-products",
    response_model=List[TopProductItem],
    summary="Get best selling products"
)
async def get_top_products(
    response: List[TopProductItem] = Depends(AnalyticsController.get_top_products)
) -> List[TopProductItem]:
    return response


@router.get(
    "/top-customers",
    response_model=List[TopCustomerItem],
    summary="Get top spending customers"
)
async def get_top_customers(
    response: List[TopCustomerItem] = Depends(AnalyticsController.get_top_customers)
) -> List[TopCustomerItem]:
    return response


@router.get(
    "/gst-summary",
    response_model=GSTSummaryResponse,
    summary="Get GST breakdown summary"
)
async def get_gst_summary(
    response: GSTSummaryResponse = Depends(AnalyticsController.get_gst_summary)
) -> GSTSummaryResponse:
    return response
