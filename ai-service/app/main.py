from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# 🚀 VietRoute Logistics AI Engine (Standalone Microservice)

Phân hệ trí tuệ nhân tạo độc lập phục vụ nền tảng Quản trị Vận tải & Kho bãi VietRoute TMS & WMS:

- **Tối ưu hóa tuyến đường đa điểm dừng (2-Opt TSP & VRP):** Cắt giảm quãng đường và chi phí xăng dầu.
- **Dự báo thời gian đến (ETA):** Tính toán cự ly thực tế kết hợp hệ số giờ cao điểm giao thông Việt Nam.
- **Ghép nối tài xế & phương tiện thông minh (AI Driver Matching):** Chấm điểm đa tiêu chí tối ưu hóa tải trọng.
- **Dự báo nhu cầu vận tải (Demand Forecasting):** Dự báo lưu lượng đơn hàng và số lượng xe tải cần điều động.
- **Phát hiện bất thường & gian lận (Anomaly Detection):** Giám sát sụt giảm nhiên liệu và xe đi chệch cung đường.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Cấu hình CORS cho phép Frontend và Backend NestJS giao tiếp
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    """Kiểm tra trạng thái hoạt động của AI Engine Microservice."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# Gắn API Router v1
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
