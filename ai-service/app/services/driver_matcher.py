from datetime import datetime
import random
from typing import List
from app.schemas.driver import (
    DriverMatchRequest,
    DriverMatchResponse,
    DriverCandidate,
    RecommendedVehicle,
)
from app.services.vrp_solver import calculate_haversine_km

# Danh sách hồ sơ tài xế & phương tiện mẫu chuẩn hóa
SAMPLE_DRIVERS = [
    {
        "id": "drv-01",
        "name": "Hoàng Đức Thắng",
        "phone": "0983112233",
        "status": "AVAILABLE",
        "onTimeRate": 99.1,
        "rating": 4.9,
        "baseLat": 10.8142,
        "baseLng": 106.6578,
        "vehicle": {
            "id": "veh-01",
            "plate": "51C-882.14",
            "model": "Hino 300 Series",
            "type": "TRUCK",
            "capacity": 3500.0,
        },
    },
    {
        "id": "drv-02",
        "name": "Nguyễn Văn Hùng",
        "phone": "0912445566",
        "status": "AVAILABLE",
        "onTimeRate": 98.4,
        "rating": 4.8,
        "baseLat": 10.7769,
        "baseLng": 106.7009,
        "vehicle": {
            "id": "veh-02",
            "plate": "50E-391.22",
            "model": "Isuzu Forward FVR",
            "type": "TRUCK",
            "capacity": 5000.0,
        },
    },
    {
        "id": "drv-03",
        "name": "Trần Quốc Bảo",
        "phone": "0908778899",
        "status": "AVAILABLE",
        "onTimeRate": 97.6,
        "rating": 4.7,
        "baseLat": 10.9025,
        "baseLng": 106.7582,
        "vehicle": {
            "id": "veh-03",
            "plate": "61C-412.09",
            "model": "Ford Transit Cargo",
            "type": "VAN",
            "capacity": 1500.0,
        },
    },
    {
        "id": "drv-04",
        "name": "Lê Tuấn Anh",
        "phone": "0933221100",
        "status": "BUSY",
        "onTimeRate": 96.2,
        "rating": 4.6,
        "baseLat": 10.8505,
        "baseLng": 106.7718,
        "vehicle": {
            "id": "veh-04",
            "plate": "51D-771.65",
            "model": "Hyundai Porter H150",
            "type": "TRUCK",
            "capacity": 1500.0,
        },
    },
]


class DriverMatcher:
    """Động cơ tính toán điểm tương thích đa tiêu chí (Multi-factor AI Matching Engine)."""

    @staticmethod
    def match(req: DriverMatchRequest) -> DriverMatchResponse:
        candidates: List[DriverCandidate] = []

        for d in SAMPLE_DRIVERS:
            dist = calculate_haversine_km(
                d["baseLat"], d["baseLng"], req.pickupLat, req.pickupLng
            )
            # Điểm khoảng cách (càng gần càng cao)
            prox_score = max(0.0, min(100.0, 100.0 - dist * 3.5))

            # Điểm OTD
            otd_score = min(100.0, float(d["onTimeRate"]))

            # Điểm Rating sao
            rating_score = min(100.0, (float(d["rating"]) / 5.0) * 100.0)

            # Điểm tải trọng
            v_info = d["vehicle"]
            cap = v_info["capacity"]
            util_pct = round((req.totalWeightKg / cap) * 100.0, 1)

            cap_score = 80.0
            if 50.0 <= util_pct <= 90.0:
                cap_score = 100.0
            elif util_pct > 95.0:
                cap_score = 25.0  # Quá tải

            # Điểm sẵn sàng
            is_avail = d["status"] == "AVAILABLE"
            avail_score = 100.0 if is_avail else 50.0

            # Tổng hợp Match Score theo trọng số thực tế
            match_score = round(
                prox_score * 0.35
                + otd_score * 0.25
                + rating_score * 0.15
                + cap_score * 0.15
                + avail_score * 0.10,
                1,
            )
            match_score = min(99.4, match_score)

            reasoning = []
            if dist <= 5.0:
                reasoning.append(f"Gần kho lấy hàng ({dist} km)")
            if d["onTimeRate"] >= 98.0:
                reasoning.append(f"OTD vượt trội ({d['onTimeRate']}%)")
            if d["rating"] >= 4.8:
                reasoning.append(f"Đánh giá xuất sắc ({d['rating']}/5★)")
            if is_avail:
                reasoning.append("Trực tuyến sẵn sàng")
            if 60.0 <= util_pct <= 85.0:
                reasoning.append(f"Lấp đầy tải tối ưu ({util_pct}%)")

            rec_veh = RecommendedVehicle(
                id=v_info["id"],
                plateNumber=v_info["plate"],
                model=v_info["model"],
                type=v_info["type"],
                maxPayloadKg=cap,
                utilizationPercent=util_pct,
            )

            candidates.append(
                DriverCandidate(
                    driverId=d["id"],
                    driverName=d["name"],
                    phone=d["phone"],
                    status=d["status"],
                    onTimeRate=d["onTimeRate"],
                    rating=d["rating"],
                    distanceToPickupKm=dist,
                    matchScore=match_score,
                    reasoningTags=reasoning,
                    recommendedVehicle=rec_veh,
                )
            )

        candidates.sort(key=lambda c: c.matchScore, reverse=True)

        return DriverMatchResponse(
            totalCandidates=len(candidates),
            topMatches=candidates[:5],
            evaluatedAt=datetime.now().isoformat(),
        )
