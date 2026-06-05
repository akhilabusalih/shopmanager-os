"""
ShopManager OS — Pagination DTOs
"""

from typing import Generic, Sequence, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: Sequence[T]
    total: int
    page: int
    per_page: int
    total_pages: int
