"""
ShopManager OS — Analytics Service
"""

from datetime import date, timedelta
from typing import Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.analytics.repository import AnalyticsRepository
from backend.modules.analytics.dto import (
    AnalyticsSummaryResponse,
    SalesTrendItem,
    TopProductItem,
    TopCustomerItem,
    GSTSummaryResponse
)


class AnalyticsService:
    def __init__(self, session: AsyncSession):
        self.repository = AnalyticsRepository(session)

    def _get_date_range(self, period: str) -> Tuple[date, date]:
        today = date.today()
        
        if period == 'today':
            return today, today
        elif period == 'week':
            # Last 7 days
            start_date = today - timedelta(days=6)
            return start_date, today
        elif period == 'month':
            # This month (1st to today)
            start_date = today.replace(day=1)
            return start_date, today
        elif period == 'year':
            # This year (Jan 1 to today)
            start_date = today.replace(month=1, day=1)
            return start_date, today
        elif period == 'all':
            # A sufficiently old date
            return date(2000, 1, 1), today
        else:
            # Default to month
            start_date = today.replace(day=1)
            return start_date, today

    async def get_summary(self, period: str) -> AnalyticsSummaryResponse:
        start_date, end_date = self._get_date_range(period)
        data = await self.repository.get_summary(start_date, end_date)
        return AnalyticsSummaryResponse(**data)

    async def get_sales_trend(self, period: str) -> list[SalesTrendItem]:
        start_date, end_date = self._get_date_range(period)
        group_by = 'month' if period == 'year' else 'day'
        
        data = await self.repository.get_sales_trend(start_date, end_date, group_by)
        return [SalesTrendItem(**item) for item in data]

    async def get_top_products(self, limit: int) -> list[TopProductItem]:
        # Top products usually makes sense for 'all' or 'year', let's use a wide range or no range.
        # Requirements didn't specify period for top products, so let's default to all time.
        start_date, end_date = self._get_date_range('all')
        data = await self.repository.get_top_products(start_date, end_date, limit)
        return [TopProductItem(**item) for item in data]

    async def get_top_customers(self, limit: int) -> list[TopCustomerItem]:
        start_date, end_date = self._get_date_range('all')
        data = await self.repository.get_top_customers(start_date, end_date, limit)
        return [TopCustomerItem(**item) for item in data]

    async def get_gst_summary(self, start_date: date | None = None, end_date: date | None = None) -> GSTSummaryResponse:
        if not start_date:
            start_date = date(2000, 1, 1)
        if not end_date:
            end_date = date.today()
            
        data = await self.repository.get_gst_summary(start_date, end_date)
        return GSTSummaryResponse(**data)
