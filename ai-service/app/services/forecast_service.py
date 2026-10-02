from datetime import datetime, timedelta
import math
from app.schemas.forecast import (
    DemandForecastRequest,
    DemandForecastResponse,
    ForecastDataPoint,
)
from app.ml.model_loader import ModelLoader


class DemandForecastService:
    """Mô hình dự báo nhu cầu vận tải và lưu lượng kho bãi bằng Machine Learning Random Forest."""

    @staticmethod
    def forecast(req: DemandForecastRequest) -> DemandForecastResponse:
        days = req.forecastDays or 7
        now = datetime.now()
        start_date = now + timedelta(days=1)
        loader = ModelLoader.get_instance()

        # Mã hóa Hub
        wh_code = 0
        wh_name = req.warehouseName or ""
        if "Cát Lái" in wh_name:
            wh_code = 1
        elif "Long Biên" in wh_name:
            wh_code = 2
        elif "Đà Nẵng" in wh_name or "Da Nang" in wh_name:
            wh_code = 3
        elif "Cần Thơ" in wh_name or "Can Tho" in wh_name:
            wh_code = 4

        # Baseline volume theo từng Hub
        base_orders = 180
        if wh_code == 0:
            base_orders = 240
        elif wh_code == 1:
            base_orders = 310
        elif wh_code == 2:
            base_orders = 210

        day_weights = {
            0: 1.25, 1: 1.05, 2: 1.00, 3: 1.10, 4: 1.30, 5: 0.85, 6: 0.60
        }

        daily_points: List[ForecastDataPoint] = []
        total_orders = 0

        for i in range(days):
            target_date = start_date + timedelta(days=i)
            weekday = target_date.weekday()
            day_of_month = target_date.day
            month = target_date.month
            is_month_end = 1 if day_of_month >= 25 else 0

            # Dự báo bằng Machine Learning Random Forest
            ml_orders = loader.predict_demand(
                wh_code=wh_code,
                weekday=weekday,
                day_of_month=day_of_month,
                month=month,
                is_month_end=is_month_end,
            )

            if ml_orders is not None:
                pred_orders = ml_orders
            else:
                weight = day_weights.get(weekday, 1.0)
                variance = 1.0 + (math.sin(i * 0.8) * 0.05)
                pred_orders = int(base_orders * weight * variance)

            total_orders += pred_orders
            pred_tonnage = round(pred_orders * 0.42, 1)  # Trung bình 420kg / đơn
            lower_bound = int(pred_orders * 0.92)
            upper_bound = int(pred_orders * 1.10)
            trucks_needed = max(2, math.ceil(pred_orders / 14))


            daily_points.append(
                ForecastDataPoint(
                    date=target_date.strftime("%Y-%m-%d"),
                    predictedOrderCount=pred_orders,
                    predictedTonnage=pred_tonnage,
                    confidenceIntervalLower=lower_bound,
                    confidenceIntervalUpper=upper_bound,
                    recommendedTrucks=trucks_needed,
                )
            )

        return DemandForecastResponse(
            warehouseId=req.warehouseId,
            warehouseName=req.warehouseName or "Trung tâm Logistics",
            forecastHorizonDays=days,
            trend="INCREASING" if daily_points[-1].predictedOrderCount > daily_points[0].predictedOrderCount else "STABLE",
            dailyForecast=daily_points,
            totalPredictedOrders=total_orders,
            generatedAt=now.isoformat(),
        )
