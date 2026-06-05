"""
ShopManager OS — Backup Service
"""

import json
from datetime import datetime, timezone
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.backup.repository import BackupRepository
from backend.shared.exceptions.app_exceptions import BadRequestException


class BackupService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = BackupRepository(session)

    async def create_backup(self) -> Dict[str, Any]:
        """
        Generates a complete JSON backup of the database.
        """
        data = await self.repository.get_all_data()
        
        # Add metadata
        backup_dict = {
            "metadata": {
                "application": "ShopManager OS",
                "backup_version": "1.0",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        }
        
        # Merge data
        backup_dict.update(data)
        return backup_dict

    async def restore_backup(self, backup_json_str: str) -> None:
        """
        Restores a database from a JSON backup.
        Replaces all existing data inside a single transaction.
        """
        try:
            data = json.loads(backup_json_str)
        except json.JSONDecodeError:
            raise BadRequestException("Invalid backup file: Not valid JSON")
            
        # 1. Validate Metadata
        metadata = data.get("metadata")
        if not metadata:
            raise BadRequestException("Invalid backup file: Missing metadata section")
            
        if metadata.get("application") != "ShopManager OS":
            raise BadRequestException("Invalid backup file: Not a ShopManager OS backup")
            
        if metadata.get("backup_version") != "1.0":
            raise BadRequestException(f"Unsupported backup version: {metadata.get('backup_version')}")
            
        # 2. Validate Required Tables
        required_tables = [
            "settings", "invoice_templates", "customers", 
            "products", "invoices", "invoice_items", "inventory_log"
        ]
        
        for table in required_tables:
            if table not in data:
                raise BadRequestException(f"Invalid backup file: Missing table '{table}'")
                
        # 3. Perform Restore in Transaction
        # AsyncSession.begin() returns an async context manager that commits on success
        # and rolls back on exception.
        async with self.session.begin():
            # Delete in reverse order
            await self.repository.clear_database()
            
            # Insert in correct order
            await self.repository.insert_data("settings", data["settings"])
            await self.repository.insert_data("invoice_templates", data["invoice_templates"])
            await self.repository.insert_data("customers", data["customers"])
            await self.repository.insert_data("products", data["products"])
            await self.repository.insert_data("invoices", data["invoices"])
            await self.repository.insert_data("invoice_items", data["invoice_items"])
            await self.repository.insert_data("inventory_log", data["inventory_log"])
