@echo off
title VietRoute AI Microservice
echo ====================================================
echo    Starting VietRoute Logistics AI Engine (Python)
echo ====================================================
echo.

if not exist venv (
    echo [INFO] Tao moi truong ao Python venv...
    python -m venv venv
)

echo [INFO] Kich hoat moi truong ao venv...
call venv\Scripts\activate.bat

echo [INFO] Kiem tra cai dat thu vien...
pip install -r requirements.txt

echo.
echo [INFO] Khoi dong FastAPI server tai http://localhost:8000
echo [INFO] Tai lieu Swagger UI: http://localhost:8000/docs
echo.

python run.py
pause
