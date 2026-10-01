from fastapi import APIRouter
from app.schemas.anomaly import AnomalyScanResponse
from app.services.anomaly_service import AnomalyService

router = APIRouter()


@router.get("/anomalies", response_model=AnomalyScanResponse)
def scan_anomalies():
    """
    Rà soát và phát hiện các rủi ro vận tải: Sụt giảm nhiên liệu bất thường,
    xe lệch hành lang tuyến GPS, đơn hàng trễ cam kết SLA và kho quá tải.
    """
    return AnomalyService.scan()
