from typing import List, Optional
from pydantic import BaseModel, Field


class RouteStopItem(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    demandKg: Optional[float] = 0.0
    timeWindow: Optional[str] = None


class RouteOptimizationRequest(BaseModel):
    originLat: float
    originLng: float
    stops: List[RouteStopItem]
    returnToOrigin: Optional[bool] = True


class OptimizedStopItem(RouteStopItem):
    sequence: int
    distanceFromPreviousKm: float
    cumulativeDistanceKm: float
    estimatedEtaMinutes: int


class RouteOptimizationResponse(BaseModel):
    originalDistanceKm: float
    optimizedDistanceKm: float
    savedKm: float
    savedPercent: float
    fuelSavedLiters: float
    costSavedVND: int
    timeSavedMinutes: int
    optimizedStops: List[OptimizedStopItem]
