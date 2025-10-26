@echo off
:: ============================================
:: PRUFE AUTO-SYNC STATUS
:: ============================================

echo.
echo ================================================
echo   AUTO-SYNC STATUS
echo ================================================
echo.

:: Prufe ob Task existiert
schtasks /query /tn "GitHub-Auto-Sync-CIS" >nul 2>&1
if errorlevel 1 (
    echo [31mSTATUS: NICHT INSTALLIERT[0m
    echo.
    echo Um zu installieren, fuhre aus:
    echo   setup-auto-sync-permanent.bat
    echo.
    pause
    exit /b
)

echo [32mSTATUS: AKTIV[0m
echo.

:: Zeige Task-Details
echo Task-Details:
schtasks /query /tn "GitHub-Auto-Sync-CIS" /fo LIST /v | findstr /C:"Status:" /C:"Last Run Time:" /C:"Next Run Time:"
echo.

:: Zeige Git-Status
echo GitHub-Status:
git fetch origin main >nul 2>&1
git diff --quiet HEAD origin/main
if errorlevel 1 (
    echo [33m  Neue Anderungen verfugbar - wird synchronisiert...[0m
) else (
    echo [32m  Aktuell - keine Anderungen[0m
)
echo.

:: Zeige letzten Log-Eintrag
if exist github-sync-log.txt (
    echo Letzte Aktivitat:
    powershell -Command "Get-Content github-sync-log.txt -Tail 5"
) else (
    echo [33m  Log-Datei noch nicht erstellt[0m
)

echo.
echo ================================================
echo.
echo Verwaltung:
echo   Stoppen:        schtasks /end /tn "GitHub-Auto-Sync-CIS"
echo   Deinstallieren: schtasks /delete /tn "GitHub-Auto-Sync-CIS" /f
echo   Log ansehen:    type github-sync-log.txt
echo.
pause

