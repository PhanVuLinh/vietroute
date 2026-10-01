import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"🚀 Đang khởi động {settings.PROJECT_NAME} v{settings.VERSION} tại http://{settings.HOST}:{settings.PORT}")
    print(f"📚 Tài liệu API tương tác (Swagger UI): http://localhost:{settings.PORT}/docs")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
