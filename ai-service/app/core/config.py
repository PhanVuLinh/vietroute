from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "VietRoute Logistics AI Engine"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:3001",
        "*",
    ]
    VIETROUTE_BACKEND_URL: str = "http://localhost:3001/api/v1"

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
