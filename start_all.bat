@echo off
title Launch CineVibe Application
echo ========================================================
echo   Launching CineVibe AI Movie Recommendation System
echo ========================================================
start "CineVibe Backend (FastAPI)" cmd /c "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "CineVibe Frontend (React+Vite)" cmd /c "%~dp0start_frontend.bat"
echo.
echo Both servers have been launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo - Swagger:  http://localhost:5000/docs
echo.
pause
