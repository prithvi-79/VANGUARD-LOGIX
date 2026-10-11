"""
Master API Router for VANGUARD-LOGIX
"""

from fastapi import APIRouter
from app.api.endpoints import (
    health,
    locations,
    supplies,
    routes,
    fleet,
    indents,
    risk,
    priority,
    terrain,
    forecast,
    optimize,
    explain,
    disruption,
    telemetry,
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(locations.router)
api_router.include_router(supplies.router)
api_router.include_router(routes.router)
api_router.include_router(fleet.router)
api_router.include_router(indents.router)
api_router.include_router(risk.router)
api_router.include_router(priority.router)
api_router.include_router(terrain.router)
api_router.include_router(forecast.router)
api_router.include_router(optimize.router)
api_router.include_router(explain.router)
api_router.include_router(disruption.router)
api_router.include_router(telemetry.router)

