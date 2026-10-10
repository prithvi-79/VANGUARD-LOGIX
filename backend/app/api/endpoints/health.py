"""
Health and Database Status Endpoints
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.config import settings
from app.core.database import get_db, is_sqlite
from app.models.location import Location
from app.models.supply import SupplyItem, InventoryRecord
from app.models.route import Route, StrategicPass
from app.models.vehicle import Vehicle
from app.schemas.health import HealthResponse, DBStatusResponse
from app.services.seed_data import seed_database

router = APIRouter(tags=["Health & Diagnostics"])


@router.get("/health", response_model=HealthResponse)
async def check_health() -> HealthResponse:
    """
    Standard health check endpoint.
    Returns service name, version, operational theater, and timestamp.
    """
    return HealthResponse(
        status="HEALTHY",
        version=settings.VERSION,
        project=settings.PROJECT_NAME,
        theater=settings.THEATER,
        database="SQLite (Embedded Portable)" if is_sqlite else "PostgreSQL / PostGIS",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/db-status", response_model=DBStatusResponse)
async def check_database_status(db: AsyncSession = Depends(get_db)) -> DBStatusResponse:
    """
    Diagnostic database verification endpoint.
    Queries row counts across all military entity tables.
    """
    loc_count = (await db.execute(select(func.count(Location.id)))).scalar_one()
    sup_count = (await db.execute(select(func.count(SupplyItem.id)))).scalar_one()
    rte_count = (await db.execute(select(func.count(Route.id)))).scalar_one()
    pas_count = (await db.execute(select(func.count(StrategicPass.id)))).scalar_one()
    veh_count = (await db.execute(select(func.count(Vehicle.id)))).scalar_one()
    inv_count = (await db.execute(select(func.count(InventoryRecord.id)))).scalar_one()

    return DBStatusResponse(
        database_url=settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL,
        database_type="SQLite (aiosqlite)" if is_sqlite else "PostgreSQL (asyncpg)",
        is_connected=True,
        tables_count=6,
        locations_count=loc_count,
        supplies_count=sup_count,
        routes_count=rte_count,
        passes_count=pas_count,
        vehicles_count=veh_count,
        inventory_records_count=inv_count,
        details={
            "theater": settings.THEATER,
            "headquarters": settings.HEADQUARTERS,
            "seed": settings.SEED,
        },
    )


@router.post("/seed")
async def trigger_seed(
    force: bool = Query(default=False, description="Force re-seeding even if tables are populated"),
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger deterministic database seeding for Northern Command XIV Corps (seed 26251).
    """
    summary = await seed_database(db, seed=settings.SEED, force=force)
    return summary
