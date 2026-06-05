"""
ShopManager OS — Backup Controller
"""

from fastapi import Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.backup.service import BackupService


def get_backup_service(session: AsyncSession = Depends(get_db)) -> BackupService:
    return BackupService(session)

class BackupController:
    @staticmethod
    async def export_backup(
        service: BackupService = Depends(get_backup_service)
    ) -> str:
        """Returns JSON string of the entire database"""
        import json
        from datetime import datetime
        
        backup_data = await service.create_backup()
        json_str = json.dumps(backup_data)
        
        from fastapi.responses import Response
        filename = f"shopmanager_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        return Response(
            content=json_str,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    @staticmethod
    async def import_backup(
        file: UploadFile,
        service: BackupService = Depends(get_backup_service)
    ) -> dict:
        """Restores database from uploaded JSON file"""
        from backend.shared.exceptions.app_exceptions import BadRequestException
        
        if not file.filename.endswith(".json"):
            raise BadRequestException("Invalid file format. Please upload a JSON backup file.")
            
        content = await file.read()
        try:
            json_str = content.decode("utf-8")
        except UnicodeDecodeError:
            raise BadRequestException("Invalid file encoding. Must be UTF-8 JSON.")
            
        await service.restore_backup(json_str)
        
        return {"status": "success", "message": "Database restored successfully"}
