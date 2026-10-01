import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"[INFO] Khoi dong {settings.PROJECT_NAME} v{settings.VERSION} tai http://{settings.HOST}:{settings.PORT}")
    print(f"[DOCS] Swagger UI interactive API: http://localhost:{settings.PORT}/docs")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
