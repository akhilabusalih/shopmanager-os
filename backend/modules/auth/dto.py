"""
ShopManager OS — Authentication DTOs (Data Transfer Objects)

Purpose:
    Defines Pydantic schemas for authentication request and response bodies.
    These schemas validate all incoming data and shape all outgoing responses.

Responsibilities:
    - Validate login request data (username, password)
    - Validate initial user setup data
    - Shape login response (access token, user info)
    - Shape session validation response

Dependencies:
    - Pydantic v2

Usage:
    from backend.modules.auth.dto import LoginRequest, LoginResponse

Notes:
    - Input schemas validate the request body before it reaches the service.
    - Output schemas control exactly what gets returned to the frontend.
    - Passwords are never included in response schemas.
"""

import uuid
from pydantic import BaseModel, Field, field_validator


# =============================================================================
# Request Schemas (Frontend → Backend)
# =============================================================================

class LoginRequest(BaseModel):
    """
    Request body for POST /api/auth/login.

    The frontend sends this when the operator clicks "Login".
    """

    username: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Operator's login username",
        examples=["admin"],
    )
    password: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Operator's password (plain text — hashed on backend)",
        examples=["securepassword123"],
    )

    @field_validator("username", mode="before")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        """Strip whitespace from username to prevent login issues."""
        return value.strip().lower()


class SetupRequest(BaseModel):
    """
    Request body for POST /api/auth/setup.

    Used ONCE during initial setup to create the first operator account.
    This endpoint is disabled after the first user is created.
    """

    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Username for the operator account",
        examples=["admin"],
    )
    password: str = Field(
        ...,
        min_length=4,
        max_length=100,
        description="Password for the operator account",
        examples=["securepassword123"],
    )

    @field_validator("username", mode="before")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        """Strip and lowercase username."""
        return value.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        """
        Ensures minimum password quality.
        V1 requirement: at least 4 characters.
        """
        if len(value) < 4:
            raise ValueError("Password must be at least 4 characters long.")
        return value


class ChangePasswordRequest(BaseModel):
    """
    Request body for POST /api/auth/change-password.
    """

    current_password: str = Field(..., description="The current password")
    new_password: str = Field(..., min_length=4, max_length=100, description="The new password")

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        if len(value) < 4:
            raise ValueError("New password must be at least 4 characters long.")
        return value


# =============================================================================
# Response Schemas (Backend → Frontend)
# =============================================================================

class UserResponse(BaseModel):
    """
    User information returned to the frontend.

    Note: password_hash is never included in responses.
    """

    id: uuid.UUID
    username: str

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    """
    Response for a successful POST /api/auth/login.

    The frontend should store the access_token and include it in all
    subsequent requests as: Authorization: Bearer <access_token>
    """

    access_token: str = Field(
        description="JWT Bearer token. Include in Authorization header for protected routes.",
    )
    token_type: str = Field(
        default="bearer",
        description="Always 'bearer' for JWT authentication.",
    )
    user: UserResponse = Field(
        description="Basic information about the authenticated operator.",
    )


class SessionValidationResponse(BaseModel):
    """
    Response for GET /api/auth/validate-session.

    Used by the frontend on startup to check if the stored token is still valid.
    """

    valid: bool = Field(description="True if the session token is still valid.")
    user: UserResponse | None = Field(
        default=None,
        description="User info if session is valid, null if invalid.",
    )


class SetupStatusResponse(BaseModel):
    """
    Response for GET /api/auth/setup-status.

    Tells the frontend whether initial setup has been completed.
    If needs_setup=True, the frontend should show the setup screen.
    """

    needs_setup: bool = Field(
        description="True if no operator accounts exist and initial setup is required.",
    )


class MessageResponse(BaseModel):
    """Generic response for operations that return a simple message."""

    message: str
