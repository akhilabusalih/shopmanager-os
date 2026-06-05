"""
ShopManager OS — Backend Application Entry Point

Purpose:
    Creates and configures the FastAPI application instance.
    This is the single file that wires everything together.

Responsibilities:
    - Create FastAPI app with metadata
    - Configure CORS middleware for the React frontend
    - Register all module routers under /api prefix
    - Register global exception handlers
    - Handle application lifecycle (startup/shutdown)

Dependencies:
    - FastAPI
    - All module routers
    - backend.config.settings
    - backend.config.database
    - backend.shared.middleware.error_handler

Usage:
    # Start development server:
    uvicorn backend.main:app --reload --port 8000

    # Access API documentation:
    http://localhost:8000/docs        (Swagger UI)
    http://localhost:8000/redoc       (ReDoc)
    http://localhost:8000/api/health  (Health check)

Notes:
    - Run from the project root (d:\\POS Softwrae), not from inside backend/.
    - The CORS configuration allows the Vite dev server (port 5173) to connect.
    - New module routers are added here as phases are completed.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config.database import create_tables
from backend.config.settings import get_settings
from backend.shared.middleware.error_handler import register_exception_handlers

# ── Module routers (Phase 1) ──────────────────────────────────────────────────
from backend.modules.auth.routes import router as auth_router
from backend.modules.settings.routes import router as settings_router

from backend.modules.customers.routes import router as customers_router    # Phase 2
from backend.modules.products.routes import router as products_router      # Phase 2
from backend.modules.invoices.routes import router as invoices_router      # Phase 3
from backend.modules.templates.routes import router as templates_router    # Phase 5
from backend.modules.analytics.routes import router as analytics_router    # Phase 6
from backend.modules.reports.routes import router as reports_router        # Phase 8
from backend.modules.backup.routes import router as backup_router          # Phase 9
from backend.modules.migration.routes import router as migration_router    # Phase 10

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)


# =============================================================================
# Application Lifecycle
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.

    Startup:
        - Log application start.
        - Create database tables if they don't exist.
          (In production, use 'alembic upgrade head' instead.)
    """
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} [{settings.ENVIRONMENT}]")

    # Create tables on startup (development convenience).
    # In production, run migrations with: alembic upgrade head
    await create_tables()
    
    # Seed default templates
    from backend.config.database import async_session_maker
    from backend.modules.templates.service import InvoiceTemplateService
    async with async_session_maker() as session:
        template_service = InvoiceTemplateService(session)
        await template_service.seed_default_templates_if_missing()

    logger.info("ShopManager OS backend is ready.")
    yield

    logger.info("ShopManager OS backend is shutting down.")


# =============================================================================
# FastAPI Application
# =============================================================================

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description=(
        "REST API for ShopManager OS — Indian GST Billing and Shop Management System.\n\n"
        "**Authentication:** Most endpoints require a Bearer token. "
        "Use POST /api/auth/login to get a token."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# =============================================================================
# Middleware
# =============================================================================

# CORS — allows the React frontend to communicate with this API.
# In development, the Vite dev server runs on port 5173.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global exception handlers — converts errors into safe HTTP responses.
register_exception_handlers(app)


# =============================================================================
# Routes
# =============================================================================

# Health check — always public, no auth required.
@app.get("/api/health", tags=["Health"], summary="Health check")
async def health_check():
    """
    Returns the current health status of the API.
    Used for monitoring and verifying the server is running.
    """
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Phase 1 — Auth and Settings
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(settings_router, prefix="/api/settings", tags=["Settings"])

# Phase 2+
app.include_router(customers_router, prefix="/api", tags=["Customers"])
app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(invoices_router, prefix="/api", tags=["Invoices"])
app.include_router(templates_router, prefix="/api", tags=["Templates"])
app.include_router(analytics_router, prefix="/api", tags=["Analytics"])
app.include_router(reports_router, prefix="/api", tags=["Reports"])
app.include_router(backup_router, prefix="/api", tags=["Backup"])
app.include_router(migration_router, prefix="/api", tags=["Migration"])
