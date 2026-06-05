"""
ShopManager OS — Migration Repository
"""

from typing import Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.customers.models import Customer
from backend.modules.invoices.models import Invoice
from backend.modules.backup.repository import BackupRepository

class MigrationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.backup_repo = BackupRepository(session)

    async def is_database_empty(self) -> bool:
        """
        Checks if the database is mostly empty.
        We check Customers and Invoices.
        """
        cust_count = await self.session.scalar(select(func.count(Customer.id)))
        inv_count = await self.session.scalar(select(func.count(Invoice.id)))
        
        return cust_count == 0 and inv_count == 0

    async def clear_database(self) -> None:
        """
        Delegates to BackupRepository to safely wipe all tables in reverse order.
        """
        await self.backup_repo.clear_database()
