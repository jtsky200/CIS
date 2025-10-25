@echo off
REM This script runs the API in the background automatically
REM It will auto-start, auto-restart, and run completely automatically

cd /d "%~dp0advanced-troubleshooting-backend"

REM Check if virtual environment exists
if not exist ".venv" (
    echo Auto-setting up advanced troubleshooting system...
    call "%~dp0setup-advanced-troubleshooting.bat"
)

REM Start the API in background
echo Starting Advanced Troubleshooting API in background...
start /B "AdvancedTroubleshootingAPI" cmd /c ".venv\Scripts\activate && uvicorn app:app --host 127.0.0.1 --port 8081 --reload"

echo Advanced Troubleshooting API started in background!
echo The system is now fully automatic - no further action needed.
echo Your webapp will automatically detect and use advanced features.
