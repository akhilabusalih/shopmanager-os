"""
ShopManager OS — Backup Repository
"""

from typing import Dict, List, Any
from sqlalchemy import select, delete, insert
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.settings.models import AppSettings
from backend.modules.templates.models import InvoiceTemplate
from backend.modules.customers.models import Customer
from backend.modules.products.models import Product
from backend.modules.invoices.models import Invoice, InvoiceItem
from backend.modules.inventory.models import InventoryLog


class BackupRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def _dump_table(self, model) -> List[Dict[str, Any]]:
        stmt = select(model)
        result = await self.session.execute(stmt)
        records = result.scalars().all()
        # Convert objects to dicts
        out = []
        for r in records:
            # exclude SQLAlchemy instance state
            d = {c.name: getattr(r, c.name) for c in r.__table__.columns}
            # Handle dates and UUIDs
            for k, v in d.items():
                if hasattr(v, "isoformat"):
                    d[k] = v.isoformat()
                elif hasattr(v, "hex"):
                    d[k] = str(v)
            out.append(d)
        return out

    async def get_all_data(self) -> Dict[str, List[Dict[str, Any]]]:
        return {
            "settings": await self._dump_table(AppSettings),
            "invoice_templates": await self._dump_table(InvoiceTemplate),
            "customers": await self._dump_table(Customer),
            "products": await self._dump_table(Product),
            "invoices": await self._dump_table(Invoice),
            "invoice_items": await self._dump_table(InvoiceItem),
            "inventory_log": await self._dump_table(InventoryLog)
        }

    async def clear_database(self) -> None:
        """
        Deletes all data in reverse dependency order.
        Must be called within a transaction!
        """
        # Order: InventoryLog -> InvoiceItem -> Invoice -> Product -> Customer -> InvoiceTemplate -> Settings
        await self.session.execute(delete(InventoryLog))
        await self.session.execute(delete(InvoiceItem))
        await self.session.execute(delete(Invoice))
        await self.session.execute(delete(Product))
        await self.session.execute(delete(Customer))
        await self.session.execute(delete(InvoiceTemplate))
        await self.session.execute(delete(AppSettings))
        await self.session.flush()

    async def insert_data(self, table_name: str, rows: List[Dict[str, Any]]) -> None:
        """
        Inserts rows into a table using Core inserts for maximum speed and bypassing ORM validation
        which might complain if the schema perfectly matches.
        """
        import uuid
        import datetime
        from sqlalchemy.sql.sqltypes import Date, DateTime, String
        from sqlalchemy.dialects.postgresql import UUID as PGUUID

        if not rows:
            return
            
        model_map = {
            "settings": AppSettings,
            "invoice_templates": InvoiceTemplate,
            "customers": Customer,
            "products": Product,
            "invoices": Invoice,
            "invoice_items": InvoiceItem,
            "inventory_log": InventoryLog
        }
        
        model = model_map.get(table_name)
        if not model:
            raise ValueError(f"Unknown table: {table_name}")
            
        # Convert strings back to UUIDs and Dates for asyncpg strict typing
        columns = {c.name: c for c in model.__table__.columns}
        
        for row in rows:
            for k, v in row.items():
                if v is None:
                    continue
                col = columns.get(k)
                if col is None:
                    continue
                
                # Check column type
                if isinstance(col.type, Date):
                    if isinstance(v, str):
                        row[k] = datetime.datetime.strptime(v, "%Y-%m-%d").date()
                elif isinstance(col.type, DateTime):
                    if isinstance(v, str):
                        try:
                            row[k] = datetime.datetime.fromisoformat(v)
                        except ValueError:
                            pass
                elif 'uuid' in str(col.type).lower():
                    if isinstance(v, str):
                        row[k] = uuid.UUID(v)
                        
        await self.session.execute(insert(model).values(rows))
        await self.session.flush()
