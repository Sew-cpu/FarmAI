@echo off
chcp 65001 >nul
echo ====================================================
echo          KHỞI ĐỘNG HỆ THỐNG FARMPRO AI
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/2] Đang khởi động Backend Python Flask (Port 5000)...
if exist "..\venv\Scripts\python.exe" (
    start "FarmPro AI - Flask Backend (5000)" cmd /k "set PYTHONIOENCODING=utf-8 && set PYTHONUTF8=1 && ..\venv\Scripts\python.exe backend_flask\app.py"
) else (
    start "FarmPro AI - Flask Backend (5000)" cmd /k "set PYTHONIOENCODING=utf-8 && set PYTHONUTF8=1 && python backend_flask\app.py"
)

timeout /t 2 /nobreak >nul

echo [2/2] Đang khởi động Frontend React & Node Server (Port 3000)...
start "FarmPro AI - Frontend Server (3000)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ====================================================
echo  Đã khởi động thành công!
echo  - Giao diện: http://localhost:3000
echo  - Backend:   http://localhost:5000
echo ====================================================
start http://localhost:3000

