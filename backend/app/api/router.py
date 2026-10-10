"""
Master API Router for VANGUARD-LOGIX
"""

from fastapi import APIRouter
from app.api.endpoints import health, locations, supplies, routes, fleet, indents

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(locations.router)
api_router.include_router(supplies.router)
api_router.include_router(routes.router)
api_router.include_router(fleet.router)
api_router.include_router(indents.router)
