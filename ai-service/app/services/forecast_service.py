from datetime import datetime, timedelta
import math
from typing import List
from app.schemas.forecast import (
    DemandForecastRequest,
    DemandForecastResponse,
    ForecastDataPoint,
)


class DemandForecastService:
    """Mô hình dự báo nhu cầu vận tải và lưu lượng kho bãi (Demand Forecasting & Fleet Sizing)."""

    @staticmethod
    def forecast(req: DemandForecastRequest) -> DemandForecastResponse:
        days = req.forecastDays or 7
        now = datetime.now()
        start_date = now + timedelta(days=1)

        # Baseline volume theo từng Hub
        base_orders = 180
        if "Tân Bình" in (req.warehouseName or ""):
            base_orders = 240
        elif "Cát Lái" in (req.warehouseName or ""):
            base_orders = 310
        elif "Long Biên" in (req.warehouseName or ""):
            base_orders = 210

        # Hệ số chu kỳ ngày trong tuần (Thứ Hai & Thứ Sáu thường cao tải hơn)
        day_weights = {
            0: 1.25,  # Thứ 2 (Đầu tuần dồn đơn)
            1: 1.05,  # Thứ 3
            2: 1.00,  # Thứ 4
            3: 1.10,  # Thứ 5
            4: 1.30,  # Thứ 6 (Giao trước cuối tuần)
            5: 0.85,  # Thứ 7
            6: 0.60,  # Chủ nhật
        }

        daily_points: List[ForecastDataPoint] = []
        total_orders = 0

        for i in range(days):
            target_date = start_date + timedelta(days=i)
            weekday = target_date.weekday()
            weight = day_weights.get(weekday, 1.0)

            # Mô phỏng phương sai ngẫu nhiên nhỏ (±5%)
            variance = 1.0 + (math.sin(i * 0.8) * 0.05)
            pred_orders = int(base_orders * weight * variance)
            total_orders += pred_orders

            pred_tonnage = round(pred_orders * 0.42, 1)  # Trung bình 420kg / đơn
            lower_bound = int(pred_orders * 0.90)
            upper_bound = int(pred_orders * 1.12)
            # 1 xe tải 3.5T chở trung bình 12-15 đơn
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
