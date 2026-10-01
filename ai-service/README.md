# 🚀 VietRoute Logistics AI Engine (Python Microservice)

Hệ thống Microservice trí tuệ nhân tạo chuyên sâu độc lập dành riêng cho nền tảng Quản trị Vận tải & Kho bãi **VietRoute Logistics TMS & WMS**.

Dịch vụ này được thiết kế theo kiến trúc phi tập trung, cho phép bạn tự do phát triển, huấn luyện và triển khai các thuật toán Machine Learning / Deep Learning mà không phụ thuộc vào Backend chính.

---

## 📂 Cấu Trúc Thư Mục

```
ai-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── routes.py      # POST /api/v1/optimize-route (Tối ưu hóa đa điểm dừng)
│   │       │   ├── eta.py         # POST /api/v1/predict-eta (Dự báo thời gian đến ETA)
│   │       │   ├── drivers.py     # POST /api/v1/match-driver (Động cơ ghép xe & tài xế)
│   │       │   ├── forecast.py    # POST /api/v1/forecast-demand (Dự báo nhu cầu đơn & xe)
│   │       │   └── anomalies.py   # GET /api/v1/anomalies (Phát hiện gian lận & bất thường)
│   │       └── router.py          # Tổng hợp router v1
│   ├── core/
│   │   └── config.py              # Cấu hình môi trường (Host, Port, CORS)
│   ├── schemas/                   # Pydantic models xác thực dữ liệu vào/ra
│   │   ├── route.py
│   │   ├── eta.py
│   │   ├── driver.py
│   │   ├── forecast.py
│   │   └── anomaly.py
│   ├── services/                  # Lõi thuật toán & mô hình AI
│   │   ├── vrp_solver.py          # 2-Opt TSP & Nearest Neighbor Heuristic
│   │   ├── eta_service.py         # Haversine & Hệ số giờ cao điểm giao thông VN
│   │   ├── driver_matcher.py      # Multi-factor Matching Score Engine
│   │   ├── forecast_service.py    # Time-series Demand Forecasting
│   │   └── anomaly_service.py     # Giám sát bất thường nhiên liệu & GPS
│   └── main.py                    # Khởi tạo ứng dụng FastAPI
├── requirements.txt               # Thư viện phụ thuộc
├── run.py                         # File chạy server nhanh (python run.py)
├── Dockerfile                     # Docker containerization
└── README.md                      # Hướng dẫn chi tiết
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dịch Vụ

### Bước 1: Khởi tạo môi trường ảo Python (Khuyến nghị)
Mở terminal tại thư mục `d:\vietroute\ai-service`:
```bash
python -m venv venv
# Trên Windows:
.\venv\Scripts\activate
# Trên Linux/Mac:
source venv/bin/activate
```

### Bước 2: Cài đặt thư viện phụ thuộc
```bash
pip install -r requirements.txt
```

### Bước 3: Khởi động AI Microservice
```bash
python run.py
```
Hoặc dùng Uvicorn trực tiếp:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Sau khi khởi động, bạn có thể truy cập:
- **Tài liệu API tương tác (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Tài liệu chuẩn hóa ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Kiểm tra trạng thái (Health Check):** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧠 Hướng Dẫn Tự Phát Triển Thêm Mô Hình AI Của Riêng Bạn

### 1. Tích hợp Google OR-Tools cho bài toán VRP nâng cao
Nếu muốn giải bài toán VRP có ràng buộc khung giờ giao hàng (VRPTW) hoặc nhiều xe xuất bến cùng lúc:
1. Cài đặt: `pip install ortools`
2. Mở tệp [`app/services/vrp_solver.py`](file:///d:/vietroute/ai-service/app/services/vrp_solver.py), tích hợp `routing_enums_pb2` và `pywrapcp` của OR-Tools.

### 2. Tích hợp Mô hình Ngôn ngữ Lớn Cục bộ (Local LLM qua Ollama)
Nếu muốn chạy Chatbot AI hoàn toàn offline bảo mật nội bộ:
1. Cài đặt Ollama: `https://ollama.com` và tải model: `ollama run qwen2.5:7b` hoặc `llama3.1:8b`
2. Cài đặt thư viện Python: `pip install langchain-community httpx`
3. Thêm endpoint mới tại `app/api/v1/endpoints/copilot.py` gửi prompt trực tiếp tới Ollama tại `http://localhost:11434/api/generate`.

### 3. Huấn luyện mô hình Dự báo Nhu cầu (Demand Forecasting) bằng Deep Learning
- Sử dụng **PyTorch** hoặc **Prophet** / **LightGBM** trên tệp [`app/services/forecast_service.py`](file:///d:/vietroute/ai-service/app/services/forecast_service.py).
- Kết nối trực tiếp vào cơ sở dữ liệu PostgreSQL của VietRoute để lấy dữ liệu đơn hàng lịch sử qua `SQLAlchemy` hoặc `psycopg2`.

### 4. Nhận diện hư hại kiện hàng qua ảnh chụp e-POD (Computer Vision)
- Tích hợp mô hình YOLOv8 (`pip install ultralytics`) để tự động phân tích vết rách/móp méo thùng carton từ ảnh tài xế chụp lúc giao hàng.

---

## 🔗 Cơ Chế Kết Nối Giữa Backend NestJS Và AI Engine

Backend NestJS của VietRoute đã được cấu hình cơ chế **Zero-Downtime Smart Gateway**:
1. Khi `ai-service` chạy tại cổng `8000`, NestJS sẽ tự động ủy quyền (proxy) các tác vụ tính toán nặng sang Python AI Engine.
2. Nếu `ai-service` tạm thời tắt hoặc đang bảo trì, NestJS sẽ tự động chuyển sang cơ chế dự phòng nội bộ (Internal Fallback) mà không gây gián đoạn hệ thống.
