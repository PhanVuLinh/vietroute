from fastapi import APIRouter
from app.schemas.eta import PredictEtaRequest, PredictEtaResponse
from app.services.eta_service import EtaService

router = APIRouter()


@router.post("/predict-eta", response_model=PredictEtaResponse)
def predict_eta(req: PredictEtaRequest):
    """
    Dự báo thời gian hành trình và thời điểm đến (ETA) dựa trên cự ly đường bộ,
    loại phương tiện và hệ số giờ cao điểm giao thông thực tế tại Việt Nam.
    """
    return EtaService.predict(req)
