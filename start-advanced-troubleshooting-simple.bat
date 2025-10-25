@echo off
echo ========================================
echo   Cadillac EV Advanced Troubleshooting
echo ========================================
echo.
echo Starting advanced AI-powered troubleshooting system...
echo This provides enhanced image analysis capabilities.
echo.
echo The system will automatically:
echo - Detect when advanced API is available
echo - Switch to advanced AI analysis mode
echo - Provide detailed troubleshooting results
echo.
echo Press any key to start the advanced API server...
pause >nul

cd /d "%~dp0advanced-troubleshooting-backend"
call .venv\Scripts\activate
uvicorn app:app --host 127.0.0.1 --port 8081 --reload
