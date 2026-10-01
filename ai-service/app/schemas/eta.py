from typing import Optional
from pydantic import BaseModel


class PredictEtaRequest(BaseModel):
    originLat: float
    originLng: float
    destLat: float
    destLng: float
    vehicleType: Optional[str] = "TRUCK"
    trafficMultiplier: Optional[float] = None


class PredictEtaResponse(BaseModel):
    distanceKm: float
    durationMinutes: int
    trafficStatus: str
    trafficMultiplier: float
    averageSpeedKmH: float
    estimatedArrival: str
    confidenceScore: float
