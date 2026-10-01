from fastapi import APIRouter
from app.api.v1.endpoints import routes, eta, drivers, forecast, anomalies

api_router = APIRouter()

api_router.include_router(routes.router, tags=["Route Optimization"])
api_router.include_router(eta.router, tags=["ETA Prediction"])
api_router.include_router(drivers.router, tags=["Driver Matching"])
api_router.include_router(forecast.router, tags=["Demand Forecasting"])
api_router.include_router(anomalies.router, tags=["Anomaly Detection"])
