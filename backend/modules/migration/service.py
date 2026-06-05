"""
ShopManager OS — Migration Service
"""

import uuid
from datetime import datetime
from typing import Dict, List, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.migration.repository import MigrationRepository
from backend.modules.migration.dto import MigrationPayload, MigrationReport
from backend.shared.exceptions.app_exceptions import BadRequestException

# Models
from backend.modules.settings.models import AppSettings
from backend.modules.customers.models import Customer
from backend.modules.products.models import Product
from backend.modules.invoices.models import Invoice, InvoiceItem

class MigrationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = MigrationRepository(session)

    async def run_migration(self, payload: MigrationPayload, force: bool = False) -> MigrationReport:
        # 1. Check if database is empty
        is_empty = await self.repository.is_database_empty()
        if not is_empty and not force:
            raise BadRequestException("Migration is only allowed on an empty database. Use ?force=true to overwrite.")
            
        warnings: List[str] = []
        customer_id_map: Dict[str, uuid.UUID] = {}
        product_id_map: Dict[str, uuid.UUID] = {}
        
        customers_imported = 0
        products_imported = 0
        invoices_imported = 0
        
        # 2. Begin Transaction
        async with self.session.begin():
            if force and not is_empty:
                await self.repository.clear_database()
                
            # 3. Settings
            if payload.settings:
                # Merge settings
                # For simplicity, we just create a new settings row or update the first one
                # Usually there's only one row in Settings table.
                # Actually, let's just insert one since force cleared it
                s = payload.settings
                setting_obj = AppSettings(
                    key="shop_settings",
                    value={
                        "shop": {
                            "business_name": s.business_name or "My Business",
                            "address": s.address or "",
                            "phone": s.phone or "",
                            "email": s.email or "",
                            "gstin": s.gstin or ""
                        },
                        "invoice": {
                            "prefix": s.invoice_prefix or "INV-",
                            "default_gst_rate": s.default_gst_rate or 18.0
                        }
                    },
                    description="Main application settings migrated from frontend."
                )
                self.session.add(setting_obj)
            
            # 4. Customers
            for c_data in payload.customers:
                new_id = uuid.uuid4()
                customer_id_map[c_data.id] = new_id
                
                c_obj = Customer(
                    id=new_id,
                    name=c_data.name,
                    phone=c_data.phone,
                    email=c_data.email,
                    address=c_data.address,
                    city=c_data.city,
                    state=c_data.state,
                    state_code=c_data.state_code,
                    pincode=c_data.pincode,
                    gstin=c_data.gstin
                )
                self.session.add(c_obj)
                customers_imported += 1
                
            # 5. Products
            for p_data in payload.products:
                new_id = uuid.uuid4()
                product_id_map[p_data.id] = new_id
                
                hsn = p_data.hsn
                if not hsn:
                    warnings.append(f"Product '{p_data.name}' missing HSN code. Set to NULL.")
                    
                p_obj = Product(
                    id=new_id,
                    name=p_data.name,
                    hsn=hsn,
                    price=p_data.price,
                    stock=p_data.stock,
                    unit=p_data.unit,
                    gst_rate=p_data.gst_rate
                )
                self.session.add(p_obj)
                products_imported += 1
                
            # 6. Invoices
            for inv_data in payload.invoices:
                inv_id = uuid.uuid4()
                
                # Parse date carefully
                try:
                    inv_date = datetime.strptime(inv_data.invoice_date, "%Y-%m-%d").date()
                except ValueError:
                    inv_date = datetime.now().date()
                    warnings.append(f"Invoice '{inv_data.invoice_no}' had invalid date format. Defaulted to today.")
                    
                # Map customer if it exists
                mapped_cust_id = None
                if inv_data.customer_id and inv_data.customer_id in customer_id_map:
                    mapped_cust_id = customer_id_map[inv_data.customer_id]
                
                inv_obj = Invoice(
                    id=inv_id,
                    invoice_no=inv_data.invoice_no,
                    invoice_date=inv_date,
                    status=inv_data.status,
                    customer_name=inv_data.customer_name,
                    customer_phone=inv_data.customer_phone,
                    customer_address=inv_data.customer_address,
                    customer_gstin=inv_data.customer_gstin,
                    customer_state=inv_data.customer_state,
                    customer_state_code=inv_data.customer_state_code,
                    subtotal=inv_data.subtotal,
                    cgst=inv_data.cgst,
                    sgst=inv_data.sgst,
                    igst=inv_data.igst,
                    total=inv_data.total,
                    payment_method=inv_data.payment_method,
                    customer_id=mapped_cust_id
                )
                self.session.add(inv_obj)
                
                # 7. Invoice Items
                for item_data in inv_data.items:
                    mapped_prod_id = None
                    if item_data.product_id and item_data.product_id in product_id_map:
                        mapped_prod_id = product_id_map[item_data.product_id]
                        
                    item_obj = InvoiceItem(
                        id=uuid.uuid4(),
                        invoice_id=inv_id,
                        product_id=mapped_prod_id,
                        description=item_data.description,
                        hsn=item_data.hsn or "",
                        qty=item_data.qty,
                        unit=item_data.unit,
                        rate=item_data.rate,
                        gst_rate=item_data.gst_rate or 0.0
                    )
                    self.session.add(item_obj)
                    
                invoices_imported += 1
                
        return MigrationReport(
            success=True,
            customers_imported=customers_imported,
            products_imported=products_imported,
            invoices_imported=invoices_imported,
            warnings=warnings
        )
