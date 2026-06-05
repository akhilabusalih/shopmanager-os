"""
ShopManager OS — Backup Routes
"""

from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import Response

from backend.shared.middleware.auth_guard import get_current_user
from backend.modules.backup.controller import BackupController


router = APIRouter(
    prefix="/backup",
    tags=["Backup"],
    dependencies=[Depends(get_current_user)]
)

@router.get(
    "/export",
    response_class=Response,
    summary="Export entire database as JSON backup"
)
async def export_backup(
    response: Response = Depends(BackupController.export_backup)
) -> Response:
    return response


@router.post(
    "/import",
    summary="Restore database from JSON backup"
)
async def import_backup(
    file: UploadFile = File(...),
    result: dict = Depends(BackupController.import_backup)
) -> dict:
    return result
