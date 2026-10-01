from datetime import datetime, timedelta
from typing import List
from app.schemas.anomaly import AnomalyScanResponse, AnomalyItem


class AnomalyService:
    """Động cơ phát hiện bất thường nhiên liệu, lệch tuyến và rủi ro SLA (AI Anomaly Detector)."""

    @staticmethod
    def scan() -> AnomalyScanResponse:
        now = datetime.now()

        anomalies: List[AnomalyItem] = [
            AnomalyItem(
                id="anom-py-01",
                type="FUEL_LEAK",
                severity="CRITICAL",
                title="Cảnh báo tiêu hao nhiên liệu bất thường: Xe 51C-882.14",
                description="Mức sụt giảm bình dầu vượt 18.5% định mức kỹ thuật trong 90 phút di chuyển trên cung đường bằng phẳng.",
                entityRef="51C-882.14",
                detectedAt=(now - timedelta(minutes=18)).isoformat(),
                recommendedAction="Kiểm tra hệ thống kim phun và bình chứa nhiên liệu",
                actionUrl="/vehicles",
            ),
            AnomalyItem(
                id="anom-py-02",
                type="ROUTE_DEVIATION",
                severity="HIGH",
                title="Lệch hành lang tuyến vận tải: Xe 50E-391.22",
                description="Xe đi chệch khỏi cung đường tối ưu Quốc Lộ 1A hơn 4.2 km vào khu vực hạn chế xe tải trọng lớn.",
                entityRef="50E-391.22",
                detectedAt=(now - timedelta(minutes=32)).isoformat(),
                recommendedAction="Liên hệ bộ phận điều phối gọi điện cảnh báo tài xế",
                actionUrl="/dispatch",
            ),
            AnomalyItem(
                id="anom-py-03",
                type="SLA_RISK",
                severity="HIGH",
                title="Đơn hàng VR-2026-001 có nguy cơ trễ hẹn SLA",
                description="Thời gian cam kết giao hàng còn 45 phút nhưng tài xế đang kẹt tại nút giao ngã tư An Sương.",
                entityRef="VR-2026-001",
                detectedAt=(now - timedelta(minutes=12)).isoformat(),
                recommendedAction="Ưu tiên định tuyến vòng tránh hoặc điều động xe hỗ trợ",
                actionUrl="/orders",
            ),
            AnomalyItem(
                id="anom-py-04",
                type="WAREHOUSE_OVERLOAD",
                severity="MEDIUM",
                title="Tổng kho Tân Bình đạt 87% dung lượng lưu bãi",
                description="Số lượng pallet nhập trong ngày tăng 22%, nguy cơ ùn ứ xe tải tại các cửa Dock 3 và Dock 4.",
                entityRef="WH-HCM-01",
                detectedAt=now.isoformat(),
                recommendedAction="Điều phối chuyển tiếp hàng sang Hub Sóng Thần",
                actionUrl="/wms",
            ),
        ]

        crit_count = sum(1 for a in anomalies if a.severity == "CRITICAL")

        return AnomalyScanResponse(
            totalAnomalies=len(anomalies),
            criticalCount=crit_count,
            anomalies=anomalies,
            scannedAt=now.isoformat(),
        )
