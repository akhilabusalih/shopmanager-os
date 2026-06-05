"""
ShopManager OS — Analytics Controller
"""

from datetime import date
from typing import List

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.analytics.service import AnalyticsService
from backend.modules.analytics.dto import (
    AnalyticsSummaryResponse,
    SalesTrendItem,
    TopProductItem,
    TopCustomerItem,
    GSTSummaryResponse
)

def get_analytics_service(session: AsyncSession = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(session)

class AnalyticsController:
    @staticmethod
    async def get_summary(
        period: str = Query("month", description="today|week|month|year|all"),
        service: AnalyticsService = Depends(get_analytics_service)
    ) -> AnalyticsSummaryResponse:
        return await service.get_summary(period)

    @staticmethod
    async def get_sales_trend(
        period: str = Query("month", description="week|month|year"),
        service: AnalyticsService = Depends(get_analytics_service)
    ) -> List[SalesTrendItem]:
        return await service.get_sales_trend(period)

    @staticmethod
    async def get_top_products(
        limit: int = Query(10, description="Number of products to return"),
        service: AnalyticsService = Depends(get_analytics_service)
    ) -> List[TopProductItem]:
        return await service.get_top_products(limit)

    @staticmethod
    async def get_top_customers(
        limit: int = Query(10, description="Number of customers to return"),
        service: AnalyticsService = Depends(get_analytics_service)
    ) -> List[TopCustomerItem]:
        return await service.get_top_customers(limit)

    @staticmethod
    async def get_gst_summary(
        start_date: date | None = Query(None, description="Start date YYYY-MM-DD"),
        end_date: date | None = Query(None, description="End date YYYY-MM-DD"),
        service: AnalyticsService = Depends(get_analytics_service)
    ) -> GSTSummaryResponse:
        return await service.get_gst_summary(start_date, end_date)
