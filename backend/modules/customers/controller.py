"""
ShopManager OS — Customer Controller
"""

from typing import Sequence
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.customers.dto import CustomerCreate, CustomerResponse, CustomerUpdate
from backend.modules.customers.repository import CustomerRepository
from backend.modules.customers.service import CustomerService


def get_customer_service(session: AsyncSession = Depends(get_db)) -> CustomerService:
    repository = CustomerRepository(session)
    return CustomerService(repository)


class CustomerController:
    @staticmethod
    async def create_customer(
        data: CustomerCreate,
        service: CustomerService = Depends(get_customer_service)
    ) -> CustomerResponse:
        return await service.create_customer(data)

    @staticmethod
    async def get_all_customers(
        service: CustomerService = Depends(get_customer_service)
    ) -> Sequence[CustomerResponse]:
        return await service.get_all_customers()

    @staticmethod
    async def get_customer(
        customer_id: UUID,
        service: CustomerService = Depends(get_customer_service)
    ) -> CustomerResponse:
        return await service.get_customer(customer_id)

    @staticmethod
    async def update_customer(
        customer_id: UUID,
        data: CustomerUpdate,
        service: CustomerService = Depends(get_customer_service)
    ) -> CustomerResponse:
        return await service.update_customer(customer_id, data)

    @staticmethod
    async def delete_customer(
        customer_id: UUID,
        service: CustomerService = Depends(get_customer_service)
    ) -> None:
        await service.delete_customer(customer_id)

    @staticmethod
    async def export_customers(
        q: str | None = None,
        service: CustomerService = Depends(get_customer_service)
    ) -> str:
        from fastapi.responses import PlainTextResponse
        csv_data = await service.export_customers(q)
        return PlainTextResponse(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=customers.csv"}
        )
