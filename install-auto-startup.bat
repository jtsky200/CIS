@echo off
echo ========================================
echo   Installing Automatic Startup
echo ========================================
echo.
echo This will install the advanced troubleshooting API
echo to start automatically when Windows starts.
echo.
echo The system will:
echo - Start automatically with Windows
echo - Run completely in the background
echo - Auto-restart if it crashes
echo - Require ZERO manual intervention
echo.
echo Press any key to install...
pause >nul

echo Installing automatic startup...

REM Create startup folder shortcut
set "startupFolder=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "scriptPath=%~dp0auto-start-when-needed.bat"

REM Create a VBS script that runs the batch file silently
echo Set WshShell = CreateObject("WScript.Shell") > "%TEMP%\start-advanced-api.vbs"
echo WshShell.Run """%scriptPath%""", 0, False >> "%TEMP%\start-advanced-api.vbs"

REM Copy to startup folder
copy "%TEMP%\start-advanced-api.vbs" "%startupFolder%\AdvancedTroubleshootingAPI.vbs"

REM Clean up
del "%TEMP%\start-advanced-api.vbs"

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo The Advanced Troubleshooting API is now:
echo - Installed to start automatically with Windows
echo - Set to run completely in the background
echo - Configured to auto-restart if it crashes
echo - Requiring ZERO manual intervention
echo.
echo Your webapp will now automatically detect
echo and use the advanced AI features!
echo.
echo The system will start automatically on next reboot.
echo You can also start it now by running:
echo auto-start-when-needed.bat
echo.
echo Press any key to continue...
pause >nul
