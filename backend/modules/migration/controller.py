"""
ShopManager OS — Migration Controller
"""

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.migration.service import MigrationService
from backend.modules.migration.dto import MigrationPayload, MigrationReport

def get_migration_service(session: AsyncSession = Depends(get_db)) -> MigrationService:
    return MigrationService(session)

class MigrationController:
    @staticmethod
    async def import_localstorage(
        payload: MigrationPayload,
        force: bool = Query(False, description="Set to true to clear existing DB first"),
        service: MigrationService = Depends(get_migration_service)
    ) -> MigrationReport:
        return await service.run_migration(payload, force)
