@echo off
TITLE VANGUARD-LOGIX — Launcher
COLOR 0B

echo =================================================================
echo      VANGUARD-LOGIX — Indian Army Predictive Logistics Engine
echo      Northern Command XIV Corps — SIH 2026 Problem Statement 26251
echo =================================================================
echo.

echo [1/3] Starting FastAPI Backend on http://localhost:8000...
start "VANGUARD-LOGIX Backend (FastAPI)" cmd /k "cd /d %~dp0 && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting Vite Frontend on http://localhost:5173...
start "VANGUARD-LOGIX Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening Command Center in default browser...
start http://localhost:5173

echo.
echo =================================================================
echo   Command Center: http://localhost:5173
echo   Swagger Docs  : http://localhost:8000/docs
echo   Health Status : http://localhost:8000/api/health
echo =================================================================
echo Keep the opened server windows running during evaluation.
pause
