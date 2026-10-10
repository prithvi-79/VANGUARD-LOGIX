"""
VANGUARD-LOGIX — Forward Tactical Supply Chain Platform
FastAPI Application Entrypoint & Lifecycle Management
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.services.seed_data import seed_database
from app.api.router import api_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("vanguard.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes database schema and ensures deterministic Northern Command seed data is loaded.
    """
    logger.info(f"Initializing {settings.PROJECT_NAME} v{settings.VERSION}...")
    logger.info(f"Operational Theater: {settings.THEATER}")
    logger.info(f"Database Target: {settings.DATABASE_URL}")

    # 1. Initialize tables
    await init_db()
    logger.info("Database tables verified / created.")

    # 2. Seed initial data if needed
    async with AsyncSessionLocal() as session:
        seed_result = await seed_database(session, seed=settings.SEED, force=False)
        logger.info(f"Database seed status: {seed_result.get('status')}")

    yield

    logger.info("VANGUARD-LOGIX application shutdown completed.")


def create_app() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global Exception Handlers
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected system error occurred within the tactical backend.",
                "path": request.url.path,
                "timestamp": str(exc),
            },
        )

    # Mount API routers
    app.include_router(api_router, prefix=settings.API_PREFIX)

    @app.get("/")
    async def root():
        return {
            "system": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "description": settings.DESCRIPTION,
            "theater": settings.THEATER,
            "headquarters": settings.HEADQUARTERS,
            "docs": "/docs",
            "health": f"{settings.API_PREFIX}/health",
            "db_status": f"{settings.API_PREFIX}/db-status",
        }

    return app


app = create_app()
