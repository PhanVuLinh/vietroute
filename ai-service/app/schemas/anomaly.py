from typing import List, Optional
from pydantic import BaseModel


class AnomalyItem(BaseModel):
    id: str
    type: str  # FUEL_LEAK, ROUTE_DEVIATION, UNPLANNED_STOP, SLA_RISK, WAREHOUSE_OVERLOAD
    severity: str  # CRITICAL, HIGH, MEDIUM
    title: str
    description: str
    entityRef: str
    detectedAt: str
    recommendedAction: str
    actionUrl: str


class AnomalyScanResponse(BaseModel):
    totalAnomalies: int
    criticalCount: int
    anomalies: List[AnomalyItem]
    scannedAt: str
