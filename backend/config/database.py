"""
ShopManager OS — Database Configuration

Purpose:
    Configures the SQLAlchemy async engine and session factory for PostgreSQL.
    Provides the AsyncSession dependency for use in FastAPI routes.

Responsibilities:
    - Create and configure the async SQLAlchemy engine
    - Provide an AsyncSession factory for database operations
    - Expose a FastAPI dependency for injecting sessions into routes
    - Create all tables on application startup (development convenience)

Dependencies:
    - SQLAlchemy 2.0 (async)
    - asyncpg (async PostgreSQL driver)
    - backend.config.settings (for DATABASE_URL)

Usage:
    # In a FastAPI route or service:
    from backend.config.database import get_db
    from sqlalchemy.ext.asyncio import AsyncSession

    async def my_route(db: AsyncSession = Depends(get_db)):
        result = await db.execute(select(User))
        ...

Notes:
    - Each request gets its own database session via the get_db dependency.
    - Sessions are automatically closed after each request.
    - Use transactions explicitly in billing workflows.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from backend.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# -----------------------------------------------------------------------------
# Async Engine
# -----------------------------------------------------------------------------
# The engine manages the connection pool to PostgreSQL.
# echo=True logs all SQL statements — useful for debugging, disable in production.

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.is_development,  # Log SQL only in development
    pool_pre_ping=True,            # Verify connections are alive before using them
    pool_size=10,                  # Maximum number of connections in the pool
    max_overflow=20,               # Additional connections allowed beyond pool_size
)


# -----------------------------------------------------------------------------
# Session Factory
# -----------------------------------------------------------------------------
# AsyncSessionLocal creates new AsyncSession instances.
# expire_on_commit=False prevents attributes from being expired after commit,
# which avoids lazy loading errors in async contexts.

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# -----------------------------------------------------------------------------
# FastAPI Dependency
# -----------------------------------------------------------------------------

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session for each request.

    Yields an AsyncSession that is automatically closed when the request ends.
    If an exception occurs, the session is rolled back to prevent partial commits.

    Usage:
        async def my_route(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# -----------------------------------------------------------------------------
# Table Creation (Development Utility)
# -----------------------------------------------------------------------------

async def create_tables() -> None:
    """
    Creates all database tables if they don't exist.

    This is called on application startup as a convenience for development.
    In production, use Alembic migrations instead:
        alembic upgrade head

    Note:
        This imports all models to ensure they are registered with SQLAlchemy's
        metadata before create_all is called.
    """
    # Import all models here so they register with SQLAlchemy Base metadata.
    # This must happen before create_all() is called.
    from backend.shared.database.base import Base  # noqa: F401
    import backend.modules.auth.models  # noqa: F401
    import backend.modules.settings.models  # noqa: F401

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.critical(f"Failed to create database tables: {e}")
        raise
