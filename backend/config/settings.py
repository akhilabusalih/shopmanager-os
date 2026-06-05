"""
ShopManager OS — Backend Configuration

Purpose:
    Loads and validates all environment variables for the application.
    Provides a single source of truth for configuration values.

Responsibilities:
    - Read environment variables from .env file
    - Validate required settings on startup
    - Expose configuration to all other modules

Dependencies:
    - pydantic-settings (for typed env var loading)
    - python-dotenv (for .env file support)

Usage:
    from backend.config.settings import get_settings
    settings = get_settings()
    print(settings.DATABASE_URL)

Notes:
    - Uses lru_cache so settings are only loaded once.
    - All settings have sensible defaults for development.
    - CORS_ORIGINS is a comma-separated string that gets parsed into a list.
"""

from functools import lru_cache
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables and .env file.

    All values can be overridden by setting the corresponding environment variable.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "ShopManager OS"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/shopmanager"

    # ── Security ─────────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-this-in-production"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 8

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Stored as a comma-separated string in .env, parsed into a list by the validator below.
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ── Logging ──────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = ""

    # ── Invoice Numbering ────────────────────────────────────────────────────
    INVOICE_PREFIX: str = "INV"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str) -> str:
        """
        CORS_ORIGINS is stored as a comma-separated string in .env.
        We keep it as a string here and provide a helper property to access it as a list.
        """
        return value

    @property
    def cors_origins_list(self) -> List[str]:
        """
        Returns CORS_ORIGINS as a list of stripped origin strings.
        Example: "http://localhost:5173, http://localhost:3000"
                 → ["http://localhost:5173", "http://localhost:3000"]
        """
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_development(self) -> bool:
        """Returns True if the application is running in development mode."""
        return self.ENVIRONMENT.lower() == "development"

    @property
    def sync_database_url(self) -> str:
        """
        Returns a synchronous database URL for Alembic migrations.
        Alembic does not support async drivers, so we replace asyncpg with psycopg2.
        """
        return self.DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")


@lru_cache
def get_settings() -> Settings:
    """
    Returns the cached application settings instance.

    Uses lru_cache to ensure settings are only loaded from disk once,
    regardless of how many modules call this function.
    """
    return Settings()
