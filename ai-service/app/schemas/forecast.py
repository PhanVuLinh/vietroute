from typing import List, Optional
from pydantic import BaseModel


class HistoricalDataPoint(BaseModel):
    date: str
    orderCount: int
    totalTonnage: float


class DemandForecastRequest(BaseModel):
    warehouseId: str
    warehouseName: Optional[str] = "Hub"
    history: Optional[List[HistoricalDataPoint]] = None
    forecastDays: Optional[int] = 7


class ForecastDataPoint(BaseModel):
    date: str
    predictedOrderCount: int
    predictedTonnage: float
    confidenceIntervalLower: int
    confidenceIntervalUpper: int
    recommendedTrucks: int


class DemandForecastResponse(BaseModel):
    warehouseId: str
    warehouseName: str
    forecastHorizonDays: int
    trend: str  # INCREASING, STABLE, DECREASING
    dailyForecast: List[ForecastDataPoint]
    totalPredictedOrders: int
    generatedAt: str
