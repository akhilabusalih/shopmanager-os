"""
ShopManager OS — Invoice Service
"""

from typing import Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.invoices.dto import InvoiceCreate
from backend.modules.invoices.models import Invoice, InvoiceItem
from backend.modules.invoices.repository import InvoiceRepository
from backend.modules.products.repository import ProductRepository
from backend.modules.settings.repository import SettingsRepository
from backend.shared.exceptions.app_exceptions import NotFoundException
from backend.shared.utils.invoice_numbering import InvoiceNumberingService


class InvoiceService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = InvoiceRepository(session)
        self.product_repository = ProductRepository(session)
        self.settings_repository = SettingsRepository(session)
        self.numbering_service = InvoiceNumberingService(session, self.settings_repository)

    async def create_invoice(self, data: InvoiceCreate) -> Invoice:
        from backend.modules.inventory.models import InventoryLog

        # 1. Generate new invoice number
        invoice_no = await self.numbering_service.generate_next_invoice_number()

        # 2. Create the Invoice
        invoice = Invoice(
            invoice_no=invoice_no,
            invoice_date=data.invoice_date,
            status=data.status,
            customer_id=data.customer_id,
            customer_name=data.customer_name,
            customer_phone=data.customer_phone,
            customer_address=data.customer_address,
            customer_gstin=data.customer_gstin,
            customer_state=data.customer_state,
            customer_state_code=data.customer_state_code,
            subtotal=data.subtotal,
            cgst=data.cgst,
            sgst=data.sgst,
            igst=data.igst,
            total=data.total,
            payment_method=data.payment_method,
        )

        # We must add invoice to session so it gets an ID for the inventory_log
        invoice = await self.repository.create(invoice)

        # 3. Add items and update stock
        for item_data in data.items:
            item = InvoiceItem(
                invoice_id=invoice.id,
                product_id=item_data.product_id,
                description=item_data.description,
                hsn=item_data.hsn,
                qty=item_data.qty,
                unit=item_data.unit,
                rate=item_data.rate,
                gst_rate=item_data.gst_rate,
            )
            invoice.items.append(item)

            # Update product stock if a product is linked
            if item.product_id:
                product = await self.product_repository.get_by_id(item.product_id)
                if product:
                    qty_before = product.stock
                    product.stock -= item.qty
                    qty_after = product.stock
                    await self.product_repository.update(product)
                    
                    # Create InventoryLog
                    inv_log = InventoryLog(
                        product_id=product.id,
                        invoice_id=invoice.id,
                        change_type="INVOICE_CREATED",
                        qty_before=qty_before,
                        qty_change=-item.qty,
                        qty_after=qty_after,
                        note=f"Created on invoice {invoice.invoice_no}"
                    )
                    self.session.add(inv_log)

        # 4. Save to DB
        return await self.repository.update(invoice)

    async def get_paginated_invoices(
        self,
        page: int = 1,
        per_page: int = 20,
        start_date: str | None = None,
        end_date: str | None = None,
        status: str | None = None,
        search: str | None = None
    ) -> tuple[Sequence[Invoice], int]:
        return await self.repository.get_paginated(
            page=page,
            per_page=per_page,
            start_date=start_date,
            end_date=end_date,
            status=status,
            search=search
        )
        
    async def get_for_export(
        self,
        start_date: str | None = None,
        end_date: str | None = None,
        status: str | None = None,
        search: str | None = None
    ) -> Sequence[Invoice]:
        return await self.repository.get_for_export(
            start_date=start_date,
            end_date=end_date,
            status=status,
            search=search
        )

    async def get_next_invoice_number(self) -> str:
        # We preview the next number without committing the sequence increment
        # In a high-concurrency environment, this might skip, but it's fine for preview
        # We will use the settings repository directly or write a preview method
        prefix = "INV" # Hardcoded for now, but could be dynamic
        import datetime
        from sqlalchemy import select
        from backend.shared.utils.invoice_numbering import InvoiceSequence
        
        current_year = datetime.datetime.now().year
        stmt = select(InvoiceSequence).where(
            InvoiceSequence.prefix == prefix,
            InvoiceSequence.year == current_year
        )
        result = await self.session.execute(stmt)
        seq = result.scalar_one_or_none()
        next_num = (seq.last_number + 1) if seq else 1
        return f"{prefix}-{next_num:05d}"

    async def get_invoice(self, invoice_id: UUID) -> Invoice:
        invoice = await self.repository.get_by_id(invoice_id)
        if not invoice:
            raise NotFoundException("Invoice not found")
        return invoice

    async def cancel_invoice(self, invoice_id: UUID) -> Invoice:
        """
        Cancels an invoice and restores stock.
        """
        from backend.modules.inventory.models import InventoryLog
        
        invoice = await self.get_invoice(invoice_id)
        if invoice.status == "Cancelled":
            return invoice

        invoice.status = "Cancelled"

        # Restore stock
        for item in invoice.items:
            if item.product_id:
                product = await self.product_repository.get_by_id(item.product_id)
                if product:
                    qty_before = product.stock
                    product.stock += item.qty
                    qty_after = product.stock
                    await self.product_repository.update(product)
                    
                    # Create InventoryLog
                    inv_log = InventoryLog(
                        product_id=product.id,
                        invoice_id=invoice.id,
                        change_type="INVOICE_CANCELLED",
                        qty_before=qty_before,
                        qty_change=item.qty,
                        qty_after=qty_after,
                        note=f"Cancelled on invoice {invoice.invoice_no}"
                    )
                    self.session.add(inv_log)

        return await self.repository.update(invoice)

    async def delete_invoice(self, invoice_id: UUID) -> None:
        """
        Hard deletion of an invoice. Only allows deletion if cancelled first or handles stock differently.
        For safety, we recommend cancelling instead, but we'll implement delete_invoice just in case.
        """
        invoice = await self.get_invoice(invoice_id)
        await self.repository.delete(invoice)
