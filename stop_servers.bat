@echo off
chcp 65001 >nul
echo ====================================================
echo             DỪNG HỆ THỐNG FARMPRO AI
echo ====================================================
echo.

echo Dang giai phong cong 5000 (Flask)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo Dang giai phong cong 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo Da dung tat ca dich vu FarmPro AI.
pause

