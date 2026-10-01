from fastapi import APIRouter
from app.schemas.forecast import DemandForecastRequest, DemandForecastResponse
from app.services.forecast_service import DemandForecastService

router = APIRouter()


@router.post("/forecast-demand", response_model=DemandForecastResponse)
def forecast_demand(req: DemandForecastRequest):
    """
    Dự báo nhu cầu vận chuyển và lưu lượng hàng hóa cho từng Hub logistics (7-30 ngày).
    Gợi ý số lượng xe tải cần thiết để phòng ngừa thiếu hụt phương tiện.
    """
    return DemandForecastService.forecast(req)
