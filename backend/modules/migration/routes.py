"""
ShopManager OS — Migration Routes
"""

from fastapi import APIRouter, Depends, status

from backend.shared.middleware.auth_guard import get_current_user
from backend.modules.migration.controller import MigrationController
from backend.modules.migration.dto import MigrationPayload, MigrationReport

router = APIRouter(
    prefix="/migrate",
    tags=["Migration"],
    dependencies=[Depends(get_current_user)]
)

@router.post(
    "/import-localstorage",
    response_model=MigrationReport,
    status_code=status.HTTP_200_OK,
    summary="Migrate legacy frontend localStorage data"
)
async def import_localstorage(
    response: MigrationReport = Depends(MigrationController.import_localstorage)
) -> MigrationReport:
    return response
