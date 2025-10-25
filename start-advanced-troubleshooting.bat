@echo off
title Advanced Troubleshooting API Server
echo ========================================
echo   Advanced Troubleshooting API Server
echo ========================================
echo.
echo Starting advanced troubleshooting system...
echo This will provide enhanced AI-powered image analysis
echo for your Cadillac EV troubleshooting system.
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0advanced-troubleshooting-backend"
if not exist ".venv" (
    echo ERROR: Virtual environment not found!
    echo Please run setup-advanced-troubleshooting.bat first
    pause
    exit /b 1
)

call .venv\Scripts\activate
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo Starting API server on http://127.0.0.1:8081
echo Advanced troubleshooting features will be available in your webapp
echo.
uvicorn app:app --host 127.0.0.1 --port 8081 --reload
