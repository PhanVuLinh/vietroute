from typing import List, Optional
from pydantic import BaseModel


class DriverMatchRequest(BaseModel):
    orderId: Optional[str] = None
    pickupLat: float
    pickupLng: float
    totalWeightKg: float
    requiredVehicleType: Optional[str] = "TRUCK"
    priority: Optional[str] = "NORMAL"


class RecommendedVehicle(BaseModel):
    id: str
    plateNumber: str
    model: str
    type: str
    maxPayloadKg: float
    utilizationPercent: float


class DriverCandidate(BaseModel):
    driverId: str
    driverName: str
    phone: str
    status: str
    onTimeRate: float
    rating: float
    distanceToPickupKm: float
    matchScore: float
    reasoningTags: List[str]
    recommendedVehicle: Optional[RecommendedVehicle] = None


class DriverMatchResponse(BaseModel):
    totalCandidates: int
    topMatches: List[DriverCandidate]
    evaluatedAt: str
