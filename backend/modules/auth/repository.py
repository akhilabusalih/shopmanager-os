"""
ShopManager OS — Authentication Repository

Purpose:
    Handles all database operations for the auth module.
    Repository is the ONLY layer that talks directly to the database.

Responsibilities:
    - Find a user by username
    - Find a user by ID
    - Create a new user
    - Check if any users exist
    - Update user password

Dependencies:
    - SQLAlchemy (AsyncSession)
    - backend.modules.auth.models (User)

Usage:
    from backend.modules.auth.repository import AuthRepository

    repo = AuthRepository(session)
    user = await repo.find_by_username("admin")

Notes:
    - All methods receive an AsyncSession from the service layer.
    - Repository methods do NOT commit transactions — that's the service's job.
    - This separation makes unit testing easier (can mock the repository).
"""

import logging
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.auth.models import User

logger = logging.getLogger(__name__)


class AuthRepository:
    """
    Database access layer for the auth module.

    Encapsulates all SQL queries related to user authentication.
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize the repository with a database session.

        @param session: AsyncSession from FastAPI's get_db dependency.
        """
        self.session = session

    async def find_by_username(self, username: str) -> User | None:
        """
        Find a user by their username.

        Used during login to retrieve the user record for password verification.

        @param username: The username to search for (case-insensitive)
        @returns User: The user record, or None if not found.
        """
        stmt = select(User).where(func.lower(User.username) == username.lower())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_by_id(self, user_id: uuid.UUID) -> User | None:
        """
        Find a user by their UUID.

        Used during session validation to retrieve user details from JWT payload.

        @param user_id: The user's UUID.
        @returns User: The user record, or None if not found.
        """
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, username: str, password_hash: str) -> User:
        """
        Create a new user record in the database.

        Note: The password must already be hashed before calling this method.
        This method does NOT hash passwords — that's the service's responsibility.

        @param username: The operator's username.
        @param password_hash: bcrypt hash of the password.
        @returns User: The newly created user record.
        """
        user = User(username=username, password_hash=password_hash)
        self.session.add(user)
        await self.session.flush()  # Assigns the UUID without committing
        await self.session.refresh(user)  # Load all columns from DB
        logger.info(f"Created new user: username={username!r}")
        return user

    async def has_any_users(self) -> bool:
        """
        Check if any user accounts exist in the database.

        Used to determine if initial setup is required.
        Returns False when the database is empty (first-time setup).

        @returns bool: True if at least one user exists, False otherwise.
        """
        stmt = select(func.count(User.id))
        result = await self.session.execute(stmt)
        count = result.scalar_one()
        return count > 0

    async def update_password(self, user_id: uuid.UUID, new_password_hash: str) -> bool:
        """
        Update the password hash for a user.

        @param user_id: The user's UUID.
        @param new_password_hash: The new bcrypt password hash.
        @returns bool: True if updated successfully, False if user not found.
        """
        user = await self.find_by_id(user_id)
        if not user:
            return False

        user.password_hash = new_password_hash
        await self.session.flush()
        logger.info(f"Password updated for user_id={user_id}")
        return True
