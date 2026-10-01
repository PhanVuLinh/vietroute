from fastapi import APIRouter
from app.schemas.driver import DriverMatchRequest, DriverMatchResponse
from app.services.driver_matcher import DriverMatcher

router = APIRouter()


@router.post("/match-driver", response_model=DriverMatchResponse)
def match_driver(req: DriverMatchRequest):
    """
    Động cơ AI phân bổ tài xế & xe tải: Chấm điểm đa tiêu chí (Proximity, OTD, Rating, Capacity).
    Trả về danh sách ứng viên tối ưu nhất để điều phối viên gán đơn 1-chạm.
    """
    return DriverMatcher.match(req)
