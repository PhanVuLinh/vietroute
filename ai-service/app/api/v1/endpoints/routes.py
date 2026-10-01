from fastapi import APIRouter
from app.schemas.route import RouteOptimizationRequest, RouteOptimizationResponse
from app.services.vrp_solver import VrpSolver

router = APIRouter()


@router.post("/optimize-route", response_model=RouteOptimizationResponse)
def optimize_route(req: RouteOptimizationRequest):
    """
    Tối ưu hóa thứ tự các điểm dừng giao hàng bằng giải thuật 2-Opt TSP & Nearest Neighbor.
    Giúp giảm quãng đường, tiết kiệm nhiên liệu và tính toán ETA chuẩn xác.
    """
    return VrpSolver.solve_route(req)
