@echo off
title CineVibe Backend Server
cd /d "%~dp0backend"
echo ========================================================
echo   Starting CineVibe FastAPI Backend (Port 8000)...
echo ========================================================
python run_server.py
pause
