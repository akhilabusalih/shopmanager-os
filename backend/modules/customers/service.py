"""
ShopManager OS — Customer Service
"""

from typing import Sequence
from uuid import UUID

from backend.modules.customers.dto import CustomerCreate, CustomerUpdate
from backend.modules.customers.models import Customer
from backend.modules.customers.repository import CustomerRepository
from backend.shared.exceptions.app_exceptions import NotFoundException


class CustomerService:
    def __init__(self, repository: CustomerRepository):
        self.repository = repository

    async def create_customer(self, data: CustomerCreate) -> Customer:
        customer = Customer(
            name=data.name,
            phone=data.phone,
            email=data.email,
            address=data.address,
            city=data.city,
            state=data.state,
            state_code=data.state_code,
            pincode=data.pincode,
            gstin=data.gstin,
        )
        return await self.repository.create(customer)

    async def get_all_customers(self) -> Sequence[Customer]:
        return await self.repository.get_all()

    async def get_customer(self, customer_id: UUID) -> Customer:
        customer = await self.repository.get_by_id(customer_id)
        if not customer:
            raise NotFoundException("Customer not found")
        return customer

    async def update_customer(self, customer_id: UUID, data: CustomerUpdate) -> Customer:
        customer = await self.get_customer(customer_id)
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(customer, key, value)
            
        return await self.repository.update(customer)

    async def delete_customer(self, customer_id: UUID) -> None:
        customer = await self.get_customer(customer_id)
        await self.repository.delete(customer)

    async def export_customers(self, q: str | None = None) -> str:
        import csv
        import io
        
        customers = await self.repository.get_customers_for_export(q)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(["Customer Name", "Phone Number", "GSTIN", "State", "Total Invoices", "Total Amount Spent"])
        
        # Write data
        for c in customers:
            writer.writerow([
                c["name"],
                c["phone"],
                c["gstin"],
                c["state"],
                c["total_invoices"],
                f"{c['total_spent']:.2f}"
            ])
            
        return output.getvalue()
