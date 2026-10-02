from app.schemas.eta import PredictEtaRequest, PredictEtaResponse
from app.services.vrp_solver import calculate_haversine_km
from app.ml.model_loader import ModelLoader


class EtaService:
    """Mô hình dự báo thời gian đến (ETA) kết hợp Machine Learning GradientBoosting và hệ số giao thông VN."""

    @staticmethod
    def predict(req: PredictEtaRequest) -> PredictEtaResponse:
        road_km = calculate_haversine_km(
            req.originLat, req.originLng, req.destLat, req.destLng
        )

        # Tốc độ cơ sở (km/h) theo loại phương tiện
        base_speed = 38.0
        v_type = (req.vehicleType or "TRUCK").upper()
        v_code = 2
        if v_type == "MOTORBIKE":
            base_speed = 35.0
            v_code = 0
        elif v_type == "VAN":
            base_speed = 42.0
            v_code = 1
        elif v_type == "TRUCK":
            base_speed = 36.0
            v_code = 2
        elif v_type == "CONTAINER":
            base_speed = 30.0
            v_code = 3

        # Khung giờ cao điểm Việt Nam (7h-9h sáng & 17h-19h chiều)
        now = datetime.now()
        current_hour = now.hour
        is_rush = (7 <= current_hour <= 9) or (17 <= current_hour <= 19)

        if req.trafficMultiplier:
            traffic_mult = req.trafficMultiplier
        else:
            traffic_mult = 1.48 if is_rush else 1.10

        # Thử nghiệm dự báo bằng mô hình Machine Learning GradientBoosting đã huấn luyện
        loader = ModelLoader.get_instance()
        is_weekend = 1 if now.weekday() in [5, 6] else 0
        ml_pred = loader.predict_eta(
            distance_km=road_km,
            hour_of_day=current_hour,
            is_rush=1 if is_rush else 0,
            is_weekend=is_weekend,
            vehicle_code=v_code,
            weight_kg=getattr(req, "totalWeightKg", 500.0) or 500.0,
        )

        if ml_pred is not None:
            duration_minutes = max(5, int(round(ml_pred)))
            confidence = 0.99
        else:
            travel_hours = road_km / base_speed
            duration_minutes = max(5, round(travel_hours * 60.0 * traffic_mult))
            confidence = 0.94

        arrival_dt = now + timedelta(minutes=duration_minutes)
        avg_speed = round(base_speed / traffic_mult, 1)

        return PredictEtaResponse(
            distanceKm=road_km,
            durationMinutes=duration_minutes,
            trafficStatus="HEAVY_CONGESTION" if is_rush else "MODERATE_TRAFFIC",
            trafficMultiplier=traffic_mult,
            averageSpeedKmH=avg_speed,
            estimatedArrival=arrival_dt.isoformat(),
            confidenceScore=confidence,
        )

