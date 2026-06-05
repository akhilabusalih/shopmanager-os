"""
ShopManager OS — Global Error Handler Middleware

Purpose:
    Registers FastAPI exception handlers that convert all exceptions
    into safe, consistent HTTP responses.

Responsibilities:
    - Handle AppException subclasses (domain errors) → structured error response
    - Handle Pydantic validation errors → user-friendly validation messages
    - Handle all other unhandled exceptions → generic 500 response
    - Log all errors appropriately (technical details go to logs, not users)

Dependencies:
    - FastAPI
    - backend.shared.exceptions.app_exceptions

Usage:
    from backend.shared.middleware.error_handler import register_exception_handlers
    register_exception_handlers(app)

Notes:
    - Users NEVER see internal error details. Only safe user_message values are returned.
    - Full technical details are always logged for debugging.
    - This module is the single place where error responses are formatted.
"""

import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from backend.shared.exceptions.app_exceptions import AppException

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """
    Registers all global exception handlers on the FastAPI app.

    Call this once during app initialization in main.py.

    @param app: The FastAPI application instance.
    """

    @app.exception_handler(AppException)
    async def handle_app_exception(request: Request, exc: AppException) -> JSONResponse:
        """
        Handles all domain-level AppException subclasses.

        Logs the technical detail internally.
        Returns only the safe user_message to the frontend.
        """
        logger.warning(
            f"AppException [{exc.status_code}] on {request.method} {request.url.path}: {exc.detail}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.user_message},
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        """
        Handles Pydantic request body validation errors.

        Pydantic v2 raises RequestValidationError when the request body doesn't
        match the expected schema. We convert this into a readable error message.
        """
        # Extract the first validation error for a simple user message.
        errors = exc.errors()
        if errors:
            first_error = errors[0]
            field = " → ".join(str(loc) for loc in first_error.get("loc", []))
            message = first_error.get("msg", "Invalid input.")
            user_message = f"Invalid input: {field} — {message}"
        else:
            user_message = "Invalid request data."

        logger.warning(
            f"Validation error on {request.method} {request.url.path}: {exc.errors()}"
        )
        return JSONResponse(
            status_code=422,
            content={"error": user_message, "details": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def handle_generic_exception(request: Request, exc: Exception) -> JSONResponse:
        """
        Catches all unhandled exceptions and returns a generic 500 response.

        This is the last line of defense. It ensures users never see a raw
        Python traceback or database error message.
        """
        logger.error(
            f"Unhandled exception on {request.method} {request.url.path}: {type(exc).__name__}: {exc}",
            exc_info=True,  # Logs the full traceback
        )
        return JSONResponse(
            status_code=500,
            content={"error": "Something went wrong. Please try again."},
        )
