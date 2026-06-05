"""
ShopManager OS — Custom Application Exceptions

Purpose:
    Defines all custom exception classes used across the backend.
    Provides a consistent error structure that maps to HTTP responses.

Responsibilities:
    - Define base AppException class
    - Define domain-specific exceptions for each module
    - Separate user-facing messages from technical details

Dependencies:
    - None (pure Python)

Usage:
    from backend.shared.exceptions.app_exceptions import (
        NotFoundException,
        DuplicatePhoneException,
        InsufficientStockException,
    )

    raise NotFoundException("Customer not found", resource="customer", resource_id=customer_id)

Notes:
    - user_message is what gets sent to the frontend (safe, generic).
    - detail is logged internally (technical, specific).
    - HTTP status codes follow REST conventions.
"""

from typing import Optional


# =============================================================================
# Base Exception
# =============================================================================

class AppException(Exception):
    """
    Base exception for all ShopManager OS business errors.

    Every domain exception inherits from this class.
    The error handler middleware catches AppException and converts it
    into a proper HTTP response using the status_code and user_message.
    """

    def __init__(
        self,
        user_message: str,
        detail: Optional[str] = None,
        status_code: int = 400,
    ):
        """
        Initialize an application exception.

        @param user_message: Safe message to send to the frontend user.
        @param detail: Technical detail for logging (never sent to frontend).
        @param status_code: HTTP status code for the response.
        """
        self.user_message = user_message
        self.detail = detail or user_message
        self.status_code = status_code
        super().__init__(self.detail)


# =============================================================================
# General Exceptions
# =============================================================================

class NotFoundException(AppException):
    """
    Raised when a requested resource does not exist.
    Maps to HTTP 404.

    Example: Customer with given ID not found in the database.
    """

    def __init__(
        self,
        user_message: str = "The requested record was not found.",
        resource: Optional[str] = None,
        resource_id: Optional[str] = None,
    ):
        detail = f"{resource} with id={resource_id} not found." if resource else user_message
        super().__init__(user_message=user_message, detail=detail, status_code=404)


class ValidationException(AppException):
    """
    Raised when business rule validation fails (beyond Pydantic schema validation).
    Maps to HTTP 422.

    Example: GSTIN format is invalid.
    """

    def __init__(self, user_message: str, detail: Optional[str] = None):
        super().__init__(user_message=user_message, detail=detail, status_code=422)


class BadRequestException(AppException):
    """
    Raised when a request is malformed or invalid.
    Maps to HTTP 400.
    """

    def __init__(self, user_message: str, detail: Optional[str] = None):
        super().__init__(user_message=user_message, detail=detail, status_code=400)


class ConflictException(AppException):
    """
    Raised when an operation would violate a uniqueness constraint.
    Maps to HTTP 409.

    Example: A customer with the same phone number already exists.
    """

    def __init__(self, user_message: str, detail: Optional[str] = None):
        super().__init__(user_message=user_message, detail=detail, status_code=409)


class DatabaseException(AppException):
    """
    Raised when an unexpected database error occurs.
    Maps to HTTP 500.

    Note: The user_message should always be generic. Never expose DB details to users.
    """

    def __init__(
        self,
        user_message: str = "A database error occurred. Please try again.",
        detail: Optional[str] = None,
    ):
        super().__init__(user_message=user_message, detail=detail, status_code=500)


# =============================================================================
# Authentication Exceptions
# =============================================================================

class AuthException(AppException):
    """
    Raised for authentication failures.
    Maps to HTTP 401.
    """

    def __init__(
        self,
        user_message: str = "Authentication failed. Please log in again.",
        detail: Optional[str] = None,
    ):
        super().__init__(user_message=user_message, detail=detail, status_code=401)


class InvalidCredentialsException(AuthException):
    """
    Raised when login credentials are incorrect.
    Maps to HTTP 401.

    Note: Always use the same generic message to prevent user enumeration attacks.
    """

    def __init__(self):
        super().__init__(
            user_message="Invalid username or password.",
            detail="Login failed: username not found or password mismatch.",
        )


class TokenExpiredException(AuthException):
    """
    Raised when a JWT token has expired.
    Maps to HTTP 401.
    """

    def __init__(self):
        super().__init__(
            user_message="Your session has expired. Please log in again.",
            detail="JWT token has expired.",
        )


class InvalidTokenException(AuthException):
    """
    Raised when a JWT token is malformed or invalid.
    Maps to HTTP 401.
    """

    def __init__(self):
        super().__init__(
            user_message="Invalid session. Please log in again.",
            detail="JWT token is invalid or malformed.",
        )


# =============================================================================
# Customer Exceptions
# =============================================================================

class DuplicatePhoneException(ConflictException):
    """
    Raised when a customer with the same phone number already exists.
    Phone numbers must be unique across all customers.
    """

    def __init__(self, phone: str):
        super().__init__(
            user_message="A customer with this phone number already exists.",
            detail=f"Duplicate customer phone number: {phone}",
        )


# =============================================================================
# Billing / Inventory Exceptions
# =============================================================================

class InsufficientStockException(AppException):
    """
    Raised when an invoice tries to sell more quantity than available in stock.
    Maps to HTTP 400.
    """

    def __init__(self, product_name: str, requested: float, available: float):
        super().__init__(
            user_message=f"Insufficient stock for '{product_name}'. Requested: {requested}, Available: {available}.",
            detail=f"Stock check failed for product '{product_name}': requested={requested}, available={available}",
            status_code=400,
        )


class InvoiceAlreadyCancelledException(AppException):
    """
    Raised when trying to cancel an invoice that is already cancelled.
    Maps to HTTP 400.
    """

    def __init__(self, invoice_no: str):
        super().__init__(
            user_message=f"Invoice {invoice_no} has already been cancelled.",
            detail=f"Attempted to cancel already-cancelled invoice: {invoice_no}",
            status_code=400,
        )
