"""
Health & System Status Schemas
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    version: str
    project: str
    theater: str
    database: str
    environment: str
    timestamp: str


class DBStatusResponse(BaseModel):
    database_url: str
    database_type: str
    is_connected: bool
    tables_count: int
    locations_count: int
    supplies_count: int
    routes_count: int
    passes_count: int
    vehicles_count: int
    inventory_records_count: int
    details: Optional[Dict[str, Any]] = None
