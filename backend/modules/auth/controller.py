"""
ShopManager OS — Authentication Controller

Purpose:
    Handles HTTP request/response logic for the auth module.
    The controller sits between routes and the service layer.

Responsibilities:
    - Receive validated request data from routes
    - Call the appropriate AuthService method
    - Return the appropriate response

Dependencies:
    - FastAPI (AsyncSession via Depends)
    - backend.modules.auth.service (AuthService)
    - backend.modules.auth.dto (request/response schemas)

Notes:
    - Controllers do NOT contain business logic. They only coordinate.
    - All business logic lives in the service layer.
    - This separation makes testing and maintenance much easier.
"""

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.auth.dto import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    SessionValidationResponse,
    SetupRequest,
    SetupStatusResponse,
)
from backend.modules.auth.service import AuthService
from backend.shared.middleware.auth_guard import AuthenticatedUser

logger = logging.getLogger(__name__)


class AuthController:
    """
    Coordinates auth HTTP requests with the AuthService.
    """

    def __init__(self, session: AsyncSession):
        self.service = AuthService(session)

    async def login(self, request: LoginRequest) -> LoginResponse:
        """
        Handle POST /api/auth/login.

        @param request: Validated login credentials.
        @returns LoginResponse: JWT token and user info.
        """
        return await self.service.login(
            username=request.username,
            password=request.password,
        )

    async def validate_session(self, current_user: AuthenticatedUser) -> SessionValidationResponse:
        """
        Handle GET /api/auth/validate-session.

        The JWT is already verified by auth_guard before this runs.
        We additionally verify that the user still exists in the database.

        @param current_user: Authenticated user from JWT (via auth_guard).
        @returns SessionValidationResponse: Valid status and user info.
        """
        return await self.service.validate_session(user_id=current_user.user_id)

    async def setup(self, request: SetupRequest) -> LoginResponse:
        """
        Handle POST /api/auth/setup.

        Creates the initial operator account. Disabled after first user is created.

        @param request: Setup data (username + password).
        @returns LoginResponse: Auto-login response after setup.
        """
        return await self.service.setup_initial_user(
            username=request.username,
            password=request.password,
        )

    async def get_setup_status(self) -> SetupStatusResponse:
        """
        Handle GET /api/auth/setup-status.

        @returns SetupStatusResponse: Whether initial setup is needed.
        """
        return await self.service.get_setup_status()

    async def change_password(
        self,
        request: ChangePasswordRequest,
        current_user: AuthenticatedUser,
    ) -> MessageResponse:
        """
        Handle POST /api/auth/change-password.

        @param request: Current and new password.
        @param current_user: Authenticated user from JWT.
        @returns MessageResponse: Success message.
        """
        return await self.service.change_password(
            user_id=current_user.user_id,
            current_password=request.current_password,
            new_password=request.new_password,
        )

    async def logout(self) -> MessageResponse:
        """
        Handle POST /api/auth/logout.

        V1: Stateless JWT — the server simply tells the client the logout succeeded.
        The client is responsible for discarding the token.

        Future V2: Could implement a token blacklist/revocation list.

        @returns MessageResponse: Logout confirmation.
        """
        return MessageResponse(message="Logged out successfully.")
