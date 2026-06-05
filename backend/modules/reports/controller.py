"""
ShopManager OS — Reports Controller
"""

from datetime import date

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.reports.service import ReportsService
from backend.modules.reports.dto import GSTReportItem
from backend.shared.dto.pagination import PaginatedResponse

def get_reports_service(session: AsyncSession = Depends(get_db)) -> ReportsService:
    return ReportsService(session)

class ReportsController:
    @staticmethod
    async def get_gst_report(
        start_date: date | None = Query(None, description="Start date YYYY-MM-DD"),
        end_date: date | None = Query(None, description="End date YYYY-MM-DD"),
        page: int = Query(1, ge=1, description="Page number"),
        per_page: int = Query(20, ge=1, le=100, description="Items per page"),
        service: ReportsService = Depends(get_reports_service)
    ) -> PaginatedResponse[GSTReportItem]:
        return await service.get_gst_report(start_date, end_date, page, per_page)

    @staticmethod
    async def export_gst_report(
        start_date: date | None = Query(None, description="Start date YYYY-MM-DD"),
        end_date: date | None = Query(None, description="End date YYYY-MM-DD"),
        service: ReportsService = Depends(get_reports_service)
    ) -> str:
        from fastapi.responses import PlainTextResponse
        csv_data = await service.export_gst_report(start_date, end_date)
        return PlainTextResponse(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=gst_report.csv"}
        )
