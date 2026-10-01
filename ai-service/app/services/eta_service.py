from datetime import datetime, timedelta
from app.schemas.eta import PredictEtaRequest, PredictEtaResponse
from app.services.vrp_solver import calculate_haversine_km


class EtaService:
    """Mô hình dự báo thời gian đến (ETA) tích hợp yếu tố giờ cao điểm giao thông Việt Nam."""

    @staticmethod
    def predict(req: PredictEtaRequest) -> PredictEtaResponse:
        road_km = calculate_haversine_km(
            req.originLat, req.originLng, req.destLat, req.destLng
        )

        # Tốc độ cơ sở (km/h) theo loại phương tiện
        base_speed = 38.0
        v_type = (req.vehicleType or "TRUCK").upper()
        if v_type == "MOTORBIKE":
            base_speed = 35.0
        elif v_type == "VAN":
            base_speed = 42.0
        elif v_type == "TRUCK":
            base_speed = 36.0

        # Khung giờ cao điểm Việt Nam (7h-9h sáng & 17h-19h chiều)
        current_hour = datetime.now().hour
        is_rush = (7 <= current_hour <= 9) or (17 <= current_hour <= 19)

        if req.trafficMultiplier:
            traffic_mult = req.trafficMultiplier
        else:
            traffic_mult = 1.45 if is_rush else 1.10

        travel_hours = road_km / base_speed
        duration_minutes = max(5, round(travel_hours * 60.0 * traffic_mult))

        arrival_dt = datetime.now() + timedelta(minutes=duration_minutes)
        avg_speed = round(base_speed / traffic_mult, 1)

        return PredictEtaResponse(
            distanceKm=road_km,
            durationMinutes=duration_minutes,
            trafficStatus="HEAVY_CONGESTION" if is_rush else "MODERATE_TRAFFIC",
            trafficMultiplier=traffic_mult,
            averageSpeedKmH=avg_speed,
            estimatedArrival=arrival_dt.isoformat(),
            confidenceScore=0.94,
        )
