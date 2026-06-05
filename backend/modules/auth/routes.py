"""
ShopManager OS — Authentication Routes

Purpose:
    Defines all FastAPI route handlers for the auth module.
    Routes map HTTP endpoints to controller methods.

Endpoints:
    GET  /api/auth/setup-status    → Check if setup is needed (public)
    POST /api/auth/setup           → Create initial operator (public, once only)
    POST /api/auth/login           → Login and get JWT token (public)
    POST /api/auth/logout          → Logout (protected)
    GET  /api/auth/validate-session → Validate current session (protected)
    POST /api/auth/change-password → Change password (protected)

Dependencies:
    - FastAPI
    - backend.config.database (get_db)
    - backend.modules.auth.controller (AuthController)
    - backend.shared.middleware.auth_guard (get_current_user)

Notes:
    - Public routes do NOT use the auth_guard dependency.
    - Protected routes use Depends(get_current_user) which verifies the JWT.
    - The router is included in main.py with prefix="/api/auth".
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.modules.auth.controller import AuthController
from backend.modules.auth.dto import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    SessionValidationResponse,
    SetupRequest,
    SetupStatusResponse,
)
from backend.shared.middleware.auth_guard import AuthenticatedUser, get_current_user

router = APIRouter()


# =============================================================================
# Public Routes (No authentication required)
# =============================================================================

@router.get(
    "/setup-status",
    response_model=SetupStatusResponse,
    summary="Check if initial setup is needed",
    description=(
        "Returns whether the application needs initial setup. "
        "If needs_setup=true, the frontend should redirect to the setup screen. "
        "This endpoint is public and does not require authentication."
    ),
)
async def get_setup_status(db: Annotated[AsyncSession, Depends(get_db)]):
    controller = AuthController(db)
    return await controller.get_setup_status()


@router.post(
    "/setup",
    response_model=LoginResponse,
    status_code=201,
    summary="Create initial operator account",
    description=(
        "Creates the first operator account. Can only be called once — "
        "when no users exist. Returns a login token (auto-login after setup)."
    ),
)
async def setup(
    request: SetupRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    controller = AuthController(db)
    return await controller.setup(request)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Operator login",
    description=(
        "Authenticates the operator with username and password. "
        "Returns a JWT access token on success. "
        "Include this token as 'Authorization: Bearer <token>' in future requests."
    ),
)
async def login(
    request: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    controller = AuthController(db)
    return await controller.login(request)


# =============================================================================
# Protected Routes (JWT token required)
# =============================================================================

@router.get(
    "/validate-session",
    response_model=SessionValidationResponse,
    summary="Validate current session",
    description=(
        "Checks if the current JWT token is valid and the user still exists. "
        "The frontend calls this on startup to decide if re-login is needed."
    ),
)
async def validate_session(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
):
    controller = AuthController(db)
    return await controller.validate_session(current_user)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout current session",
    description=(
        "Logs out the current operator. "
        "V1: Stateless JWT — the client should discard the token after this call."
    ),
)
async def logout(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
):
    controller = AuthController(db)
    return await controller.logout()


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change operator password",
    description="Changes the current operator's password. Requires the current password.",
)
async def change_password(
    request: ChangePasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
):
    controller = AuthController(db)
    return await controller.change_password(request, current_user)
