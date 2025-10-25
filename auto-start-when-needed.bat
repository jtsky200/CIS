@echo off
REM Completely Automatic Advanced API Startup
REM This script runs in the background and automatically starts the API when needed

title Advanced Troubleshooting Auto-Start
echo ========================================
echo   Advanced Troubleshooting Auto-Start
echo ========================================
echo.
echo This service automatically starts the advanced
echo troubleshooting API when your webapp is accessed.
echo.
echo The system will:
echo - Auto-start when webapp is accessed
echo - Auto-restart if it crashes
echo - Run completely in the background
echo - Require ZERO manual intervention
echo.
echo Press Ctrl+C to stop this service
echo.

:loop
cd /d "%~dp0advanced-troubleshooting-backend"

REM Check if API is already running
netstat -an | findstr :8081 >nul
if %errorlevel% equ 0 (
    echo [%time%] Advanced API already running
    timeout /t 30 /nobreak >nul
    goto loop
)

echo [%time%] Starting Advanced API automatically...

REM Check if virtual environment exists
if not exist ".venv" (
    echo [%time%] Setting up advanced troubleshooting system...
    call "%~dp0setup-advanced-troubleshooting.bat"
)

REM Start the API
call .venv\Scripts\activate
start /B "AdvancedAPI" cmd /c "uvicorn app:app --host 127.0.0.1 --port 8081 --reload"

echo [%time%] Advanced API started in background
echo [%time%] Your webapp will now automatically use advanced features!

REM Wait and check if it's still running
:check
timeout /t 10 /nobreak >nul
netstat -an | findstr :8081 >nul
if %errorlevel% neq 0 (
    echo [%time%] API stopped, restarting...
    goto loop
)
goto check
