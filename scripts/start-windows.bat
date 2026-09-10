@echo off
title JurisDraft SaaS Launcher
cls
echo ==========================================================
echo   JURISDRAFT - ENTERPRISE CONTRACT REPOSITORY ^& STUDIO
echo   Saylani Mass IT Training (SMIT) - Classes 9 ^& 10
echo ==========================================================
echo.

cd /d "%~dp0\.."

if not exist "backend\venv\Scripts\python.exe" (
    echo [*] Setting up Python virtual environment...
    py -m venv backend\venv
    call backend\venv\Scripts\pip.exe install -r backend\requirements.txt
)

echo [*] Launching FastAPI Backend on http://localhost:8000...
set PYTHONPATH=.
start "JurisDraft Backend" cmd /k "backend\venv\Scripts\uvicorn.exe backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [*] Launching Next.js Frontend on http://localhost:3000...
cd frontend
if not exist "node_modules" (
    echo [*] Installing frontend dependencies...
    call npm install
)

start http://localhost:3000
npm run dev
