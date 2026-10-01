@echo off
title VietRoute AI Microservice
echo ====================================================
echo    Starting VietRoute Logistics AI Engine (Python)
echo ====================================================
echo.

if not exist venv (
    echo [INFO] Tao moi truong ao Python venv...
    python -m venv venv
    echo [INFO] Kich hoat va cai dat thu vien lan dau...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
)

echo [INFO] Khoi dong FastAPI server tai http://localhost:8000
echo [INFO] Tai lieu Swagger UI: http://localhost:8000/docs
echo.

venv\Scripts\python.exe run.py
pause
