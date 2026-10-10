"""
Quantile Demand Forecasting API Endpoints
"""

from dataclasses import asdict
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.supply import InventoryRecord
from app.services.forecasting import (
    ForecastSeriesInput,
    QuantileForecastResult,
    train_and_forecast_quantiles,
)

router = APIRouter(prefix="/forecast", tags=["Quantile Demand Forecasting"])


class CustomForecastRequest(BaseModel):
    location_id: str = Field(..., examples=["LOC-KUMAR"])
    location_name: str = Field(..., examples=["Kumar Base (Siachen)"])
    supply_id: str = Field(..., examples=["SUP-POL-DIESEL-ARCTIC"])
    supply_name: str = Field(..., examples=["Arctic Diesel Fuel"])
    supply_class: str = Field(default="CLASS_III", examples=["CLASS_III"])
    historical_consumption: List[float] = Field(..., min_length=7, examples=[[85.0, 92.0, 88.0, 95.0, 90.0, 87.0, 93.0, 96.0, 98.0, 91.0, 89.0, 94.0, 102.0, 99.0]])
    temperatures: Optional[List[float]] = Field(default=None, examples=[[-22.0, -24.0, -23.0, -25.0, -26.0, -24.0, -25.0, -28.0, -27.0, -26.0, -25.0, -29.0, -31.0, -30.0]])
    snowfall_cm: Optional[List[float]] = Field(default=None, examples=[[15.0, 18.0, 20.0, 22.0, 25.0, 28.0, 30.0, 32.0, 35.0, 38.0, 40.0, 45.0, 50.0, 55.0]])
    headcount: int = Field(default=65, examples=[65])
    elevation_m: float = Field(default=4850.0, examples=[4850.0])
    horizon_days: int = Field(default=14, ge=3, le=30, examples=[14])


@router.get("/quantile")
async def get_outpost_quantile_forecast(
    location_id: str = Query(..., description="Target forward post ID (e.g. LOC-KUMAR, LOC-DBO)"),
    supply_id: str = Query(..., description="Target strategic supply ID (e.g. SUP-POL-DIESEL-ARCTIC)"),
    horizon: int = Query(default=14, ge=5, le=30, description="Forecast horizon in days"),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates P10 (conservative burn), P50 (expected median), and P90 (tactical surge)
    quantile forecasts for a forward post supply inventory with walk-forward WAPE metrics.
    """
    result = await db.execute(
        select(InventoryRecord)
        .options(selectinload(InventoryRecord.supply), selectinload(InventoryRecord.location))
        .where(InventoryRecord.location_id == location_id, InventoryRecord.supply_id == supply_id)
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail=f"Inventory record for {location_id} and {supply_id} not found")

    loc = rec.location
    sup = rec.supply
    base_rate = rec.daily_consumption_rate

    # Generate realistic historical sequence (45 days) with seasonal cold wave variability
    elev = loc.elevation_m if loc else 3500.0
    temps = [-12.0 - (elev - 3000.0) * 0.006 - (i * 0.2) for i in range(45)]
    snow = [10.0 + (i * 0.8) for i in range(45)]

    # Historical consumption incorporating temperature sensitivity
    hist_consumption = [
        round(base_rate * (1.0 + max(0.0, -temps[i] - 10.0) * 0.015 + 0.05 * (i % 7 == 0)), 1)
        for i in range(45)
    ]

    forecast_input = ForecastSeriesInput(
        location_id=location_id,
        location_name=loc.name if loc else location_id,
        supply_id=supply_id,
        supply_name=sup.name if sup else supply_id,
        supply_class=sup.supply_class if sup else "CLASS_III",
        historical_consumption=hist_consumption,
        temperatures=temps,
        snowfall_cm=snow,
        headcount=loc.current_headcount if loc else 50,
        elevation_m=elev,
        forecast_horizon_days=horizon,
    )

    forecast_res = train_and_forecast_quantiles(forecast_input)
    return asdict(forecast_res)


@router.post("/custom")
async def generate_custom_quantile_forecast(
    request: CustomForecastRequest,
):
    """
    Trains quantile models and generates P10/P50/P90 projections for custom historical series.
    """
    forecast_input = ForecastSeriesInput(
        location_id=request.location_id,
        location_name=request.location_name,
        supply_id=request.supply_id,
        supply_name=request.supply_name,
        supply_class=request.supply_class,
        historical_consumption=request.historical_consumption,
        temperatures=request.temperatures,
        snowfall_cm=request.snowfall_cm,
        headcount=request.headcount,
        elevation_m=request.elevation_m,
        forecast_horizon_days=request.horizon_days,
    )

    forecast_res = train_and_forecast_quantiles(forecast_input)
    return asdict(forecast_res)
