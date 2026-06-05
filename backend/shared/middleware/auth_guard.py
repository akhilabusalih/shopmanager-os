"""
ShopManager OS — JWT Authentication Guard

Purpose:
    Provides a FastAPI dependency that verifies JWT tokens on protected routes.
    Any route that requires a logged-in user uses this dependency.

Responsibilities:
    - Extract the Bearer token from the Authorization header
    - Verify the token signature and expiry
    - Return the authenticated user's payload
    - Raise appropriate exceptions on authentication failure

Dependencies:
    - PyJWT
    - FastAPI (Depends, HTTPBearer)
    - backend.config.settings
    - backend.shared.exceptions.app_exceptions

Usage:
    from backend.shared.middleware.auth_guard import get_current_user

    @router.get("/customers")
    async def list_customers(current_user = Depends(get_current_user)):
        # current_user.user_id and current_user.username are available here
        ...

Notes:
    - Protected routes automatically return 401 if no valid token is provided.
    - Token payload contains: user_id (UUID string), username, exp.
    - For V1, tokens are stateless (no server-side session storage).
"""

import logging
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from backend.config.settings import get_settings
from backend.shared.exceptions.app_exceptions import (
    InvalidTokenException,
    TokenExpiredException,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# HTTPBearer extracts the token from "Authorization: Bearer <token>" header.
# auto_error=False means we handle missing tokens manually with a clearer message.
bearer_scheme = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    """
    Represents the authenticated user payload extracted from a JWT token.

    This is the object injected into protected routes via Depends(get_current_user).
    """

    user_id: str
    username: str


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> AuthenticatedUser:
    """
    FastAPI dependency that validates a JWT Bearer token.

    Extracts and validates the JWT from the Authorization header.
    Returns an AuthenticatedUser with the token payload if valid.
    Raises HTTPException 401 if the token is missing, expired, or invalid.

    @param credentials: HTTP Bearer credentials extracted by FastAPI.
    @returns AuthenticatedUser: The authenticated user data from the token.
    @raises HTTPException: 401 if token is missing, expired, or invalid.
    """

    # Check if the token was provided at all.
    if credentials is None:
        logger.warning("Request received without Authorization header.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        # Decode and verify the JWT token.
        # PyJWT automatically checks the expiry (exp claim).
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )

        user_id: str = payload.get("sub")
        username: str = payload.get("username")

        if not user_id or not username:
            logger.warning("JWT token is missing required claims (sub, username).")
            raise InvalidTokenException()

        return AuthenticatedUser(user_id=user_id, username=username)

    except jwt.ExpiredSignatureError:
        # Token was valid but has expired. User needs to log in again.
        logger.info(f"Expired JWT token received.")
        raise TokenExpiredException()

    except jwt.InvalidTokenError as e:
        # Token is malformed, signature is wrong, or other JWT error.
        logger.warning(f"Invalid JWT token received: {e}")
        raise InvalidTokenException()
