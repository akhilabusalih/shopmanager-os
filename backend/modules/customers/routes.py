"""
ShopManager OS — Customer Routes
"""

from typing import Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, status

from backend.modules.customers.controller import CustomerController
from backend.modules.customers.dto import CustomerCreate, CustomerResponse, CustomerUpdate
from backend.shared.middleware.auth_guard import get_current_user


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
    dependencies=[Depends(get_current_user)]
)

@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer"
)
async def create_customer(
    data: CustomerCreate,
    response: CustomerResponse = Depends(CustomerController.create_customer)
) -> CustomerResponse:
    return response


@router.get(
    "",
    response_model=Sequence[CustomerResponse],
    summary="Get all customers"
)
async def get_all_customers(
    response: Sequence[CustomerResponse] = Depends(CustomerController.get_all_customers)
) -> Sequence[CustomerResponse]:
    return response

from fastapi.responses import PlainTextResponse

@router.get(
    "/export",
    response_class=PlainTextResponse,
    summary="Export customers to CSV"
)
async def export_customers(
    q: str | None = None,
    response: PlainTextResponse = Depends(CustomerController.export_customers)
) -> PlainTextResponse:
    return response


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get a customer by ID"
)
async def get_customer(
    customer_id: UUID,
    response: CustomerResponse = Depends(CustomerController.get_customer)
) -> CustomerResponse:
    return response


@router.patch(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update a customer"
)
async def update_customer(
    customer_id: UUID,
    data: CustomerUpdate,
    response: CustomerResponse = Depends(CustomerController.update_customer)
) -> CustomerResponse:
    return response


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer"
)
async def delete_customer(
    customer_id: UUID,
    _: None = Depends(CustomerController.delete_customer)
) -> None:
    return None
