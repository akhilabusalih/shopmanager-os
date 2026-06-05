"""
ShopManager OS — Authentication Service

Purpose:
    Contains all business logic for authentication in ShopManager OS.
    This is the heart of the auth module.

Responsibilities:
    - Verify login credentials (username + password)
    - Generate JWT access tokens on successful login
    - Validate existing JWT tokens (session check)
    - Create the initial operator account (first-time setup)
    - Change operator password

Dependencies:
    - bcrypt (password hashing)
    - PyJWT (token generation and validation)
    - backend.modules.auth.repository (AuthRepository)
    - backend.shared.exceptions.app_exceptions

Usage:
    from backend.modules.auth.service import AuthService
    from backend.config.database import get_db

    service = AuthService(session)
    response = await service.login("admin", "password123")

Notes:
    Password Hashing:
    - bcrypt is used for password hashing. It is slow by design.
    - Slowness prevents brute-force attacks.
    - Never use MD5, SHA-1, or SHA-256 for password hashing.

    JWT Token Design:
    - Tokens expire after ACCESS_TOKEN_EXPIRE_HOURS (default: 8 hours).
    - Tokens are stateless — no server-side session storage in V1.
    - Payload contains: sub (user_id), username, iat, exp.

    Security Note:
    - Login failures always return the same generic error message.
    - This prevents user enumeration (attacker can't tell if username exists).
"""

import logging
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from backend.config.settings import get_settings
from backend.modules.auth.dto import (
    LoginResponse,
    SessionValidationResponse,
    SetupStatusResponse,
    UserResponse,
    MessageResponse,
)
from backend.modules.auth.repository import AuthRepository
from backend.shared.exceptions.app_exceptions import (
    AuthException,
    InvalidCredentialsException,
    NotFoundException,
)
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    """
    Business logic layer for authentication.

    Orchestrates password verification, token generation, and user management.
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize the service with a database session.

        @param session: AsyncSession injected from FastAPI's get_db dependency.
        """
        self.session = session
        self.repo = AuthRepository(session)

    async def login(self, username: str, password: str) -> LoginResponse:
        """
        Authenticate an operator and return a JWT access token.

        Steps:
            1. Find the user by username.
            2. Verify the provided password against the stored hash.
            3. Generate a JWT token with user info and expiry.
            4. Return the token and user info.

        Note: Steps 1 and 2 return the SAME error message on failure.
        This prevents an attacker from learning which step failed (user enumeration).

        @param username: The operator's login username.
        @param password: The operator's plain text password.
        @returns LoginResponse: JWT token and user info on success.
        @raises InvalidCredentialsException: If credentials are wrong.
        """
        # Step 1: Find the user by username.
        user = await self.repo.find_by_username(username)
        if not user:
            # Log the technical detail internally, but return a generic error.
            logger.warning(f"Login failed: username={username!r} not found.")
            raise InvalidCredentialsException()

        # Step 2: Verify the password against the stored bcrypt hash.
        password_matches = bcrypt.checkpw(
            password.encode("utf-8"),
            user.password_hash.encode("utf-8"),
        )
        if not password_matches:
            logger.warning(f"Login failed: password mismatch for username={username!r}.")
            raise InvalidCredentialsException()

        # Step 3: Generate a JWT access token.
        access_token = self._create_access_token(
            user_id=str(user.id),
            username=user.username,
        )

        logger.info(f"Login successful: username={username!r}, user_id={user.id}")

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    async def validate_session(self, user_id: str) -> SessionValidationResponse:
        """
        Validates that a session is still active and the user still exists.

        Called by the frontend on startup to check if the stored token is valid.
        The JWT signature is already verified by the auth_guard middleware before
        this method is called.

        @param user_id: The user ID from the verified JWT payload.
        @returns SessionValidationResponse: Valid status and user info.
        """
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            return SessionValidationResponse(valid=False, user=None)

        user = await self.repo.find_by_id(user_uuid)
        if not user:
            return SessionValidationResponse(valid=False, user=None)

        return SessionValidationResponse(
            valid=True,
            user=UserResponse.model_validate(user),
        )

    async def setup_initial_user(self, username: str, password: str) -> LoginResponse:
        """
        Creates the first operator account during initial application setup.

        This can only be called when NO users exist in the database.
        After the first user is created, this endpoint returns an error.

        Steps:
            1. Check that no users exist yet.
            2. Hash the password with bcrypt.
            3. Create the user in the database.
            4. Return a login response (auto-login after setup).

        @param username: Username for the new operator.
        @param password: Plain text password (will be hashed).
        @returns LoginResponse: JWT token (auto-logged in after setup).
        @raises AuthException: If a user already exists.
        """
        # Safety check: only allow setup if no users exist.
        if await self.repo.has_any_users():
            logger.warning("Setup attempted but users already exist.")
            raise AuthException(
                user_message="Setup has already been completed.",
                detail="POST /api/auth/setup called but users already exist.",
                status_code=409,
            )

        # Hash the password with bcrypt.
        # The cost factor (12) controls how slow the hash is.
        # Slower = harder to brute-force. 12 is a good balance for 2024.
        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt(rounds=12),
        ).decode("utf-8")

        # Create the user in the database.
        async with self.session.begin():
            user = await self.repo.create(username=username, password_hash=password_hash)

        # Generate a JWT token (auto-login after setup).
        access_token = self._create_access_token(
            user_id=str(user.id),
            username=user.username,
        )

        logger.info(f"Initial user created: username={username!r}, user_id={user.id}")

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    async def change_password(
        self,
        user_id: str,
        current_password: str,
        new_password: str,
    ) -> MessageResponse:
        """
        Changes an operator's password after verifying their current password.

        @param user_id: The user's UUID string from JWT payload.
        @param current_password: The current plain text password (for verification).
        @param new_password: The new plain text password (will be hashed).
        @returns MessageResponse: Success message.
        @raises InvalidCredentialsException: If current password is wrong.
        @raises NotFoundException: If user is not found.
        """
        user = await self.repo.find_by_id(uuid.UUID(user_id))
        if not user:
            raise NotFoundException("User not found.", resource="user", resource_id=user_id)

        # Verify current password before allowing the change.
        if not bcrypt.checkpw(
            current_password.encode("utf-8"),
            user.password_hash.encode("utf-8"),
        ):
            raise InvalidCredentialsException()

        # Hash the new password.
        new_hash = bcrypt.hashpw(
            new_password.encode("utf-8"),
            bcrypt.gensalt(rounds=12),
        ).decode("utf-8")

        # Update in database.
        async with self.session.begin():
            await self.repo.update_password(user.id, new_hash)

        logger.info(f"Password changed for user_id={user_id}")
        return MessageResponse(message="Password changed successfully.")

    async def get_setup_status(self) -> SetupStatusResponse:
        """
        Checks whether initial setup has been completed.

        Returns needs_setup=True if no users exist yet.
        The frontend uses this to decide whether to show the setup screen.

        @returns SetupStatusResponse: Whether setup is needed.
        """
        has_users = await self.repo.has_any_users()
        return SetupStatusResponse(needs_setup=not has_users)

    def _create_access_token(self, user_id: str, username: str) -> str:
        """
        Creates a signed JWT access token.

        Token payload:
            sub      → user_id (UUID string) — standard JWT 'subject' claim
            username → operator's username
            iat      → issued at timestamp
            exp      → expiry timestamp

        @param user_id: The user's UUID as a string.
        @param username: The operator's username.
        @returns str: Signed JWT token string.
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)

        payload = {
            "sub": user_id,
            "username": username,
            "iat": now,
            "exp": expire,
        }

        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
