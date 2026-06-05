"""
ShopManager OS — Reports Routes
"""

from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse

from backend.shared.middleware.auth_guard import get_current_user
from backend.modules.reports.controller import ReportsController
from backend.modules.reports.dto import GSTReportItem
from backend.shared.dto.pagination import PaginatedResponse

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
    dependencies=[Depends(get_current_user)]
)

@router.get(
    "/gst",
    response_model=PaginatedResponse[GSTReportItem],
    summary="Get paginated GST transactions"
)
async def get_gst_report(
    response: PaginatedResponse[GSTReportItem] = Depends(ReportsController.get_gst_report)
) -> PaginatedResponse[GSTReportItem]:
    return response


@router.get(
    "/gst/export",
    response_class=PlainTextResponse,
    summary="Export GST transactions to CSV"
)
async def export_gst_report(
    response: PlainTextResponse = Depends(ReportsController.export_gst_report)
) -> PlainTextResponse:
    return response
