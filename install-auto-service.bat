@echo off
echo ========================================
echo   Installing Automatic API Service
echo ========================================
echo.
echo This will install the advanced troubleshooting API
echo to run automatically in the background.
echo.
echo The system will:
echo - Auto-start when Windows starts
echo - Auto-restart if it crashes
echo - Run completely in the background
echo - Require zero manual intervention
echo.
echo Press any key to install...
pause >nul

echo Installing automatic service...

REM Create a Windows service using NSSM (Non-Sucking Service Manager)
REM Download NSSM if not present
if not exist "nssm.exe" (
    echo Downloading NSSM service manager...
    powershell -Command "Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'nssm.zip'"
    powershell -Command "Expand-Archive -Path 'nssm.zip' -DestinationPath '.' -Force"
    copy "nssm-2.24\win64\nssm.exe" "nssm.exe"
    del "nssm.zip"
    rmdir /s /q "nssm-2.24"
)

REM Install the service
echo Installing Advanced Troubleshooting API service...
nssm install "AdvancedTroubleshootingAPI" "node" "%~dp0auto-start-api-service.js"
nssm set "AdvancedTroubleshootingAPI" "DisplayName" "Advanced Troubleshooting API"
nssm set "AdvancedTroubleshootingAPI" "Description" "Automatic advanced troubleshooting API for Cadillac EV Assistant"
nssm set "AdvancedTroubleshootingAPI" "Start" "SERVICE_AUTO_START"
nssm set "AdvancedTroubleshootingAPI" "AppStdout" "%~dp0api-service.log"
nssm set "AdvancedTroubleshootingAPI" "AppStderr" "%~dp0api-service-error.log"

REM Start the service
echo Starting service...
nssm start "AdvancedTroubleshootingAPI"

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo The Advanced Troubleshooting API is now:
echo - Installed as a Windows service
echo - Set to start automatically with Windows
echo - Running in the background
echo - Requiring zero manual intervention
echo.
echo Your webapp will now automatically detect
echo and use the advanced AI features!
echo.
echo Press any key to continue...
pause >nul
