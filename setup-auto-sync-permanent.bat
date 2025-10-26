@echo off
:: ============================================
:: VOLLAUTOMATISCHE GITHUB SYNC INSTALLATION
:: Keine manuelle Interaktion mehr notig!
:: ============================================

echo.
echo ================================================
echo   VOLLAUTOMATISCHE SYNC INSTALLATION
echo ================================================
echo.
echo Dies richtet ein:
echo [32m- Automatischer Start mit Windows[0m
echo [32m- Pruft alle 2 Minuten GitHub[0m
echo [32m- Synchronisiert automatisch[0m
echo [32m- Lauft komplett im Hintergrund[0m
echo [32m- Keine Benutzer-Interaktion notwendig[0m
echo.

:: Hole aktuellen Pfad
set CURRENT_DIR=%CD%
set SERVICE_SCRIPT=%CURRENT_DIR%\github-auto-sync-service.vbs

:: Erstelle VBS-Script fur unsichtbaren Start
echo Set WshShell = CreateObject("WScript.Shell") > "%SERVICE_SCRIPT%"
echo WshShell.Run "cmd /c cd /d ""%CURRENT_DIR%"" && node github-sync-service.js", 0, False >> "%SERVICE_SCRIPT%"

echo Erstelle Windows Task...
echo.

:: Losche alten Task falls vorhanden
schtasks /delete /tn "GitHub-Auto-Sync-CIS" /f >nul 2>&1

:: Erstelle neuen Task
schtasks /create ^
  /tn "GitHub-Auto-Sync-CIS" ^
  /tr "\"%SERVICE_SCRIPT%\"" ^
  /sc onstart ^
  /ru "%USERNAME%" ^
  /rl HIGHEST ^
  /f

if errorlevel 1 (
    echo.
    echo [31mFehler: Bitte als Administrator ausfuhren![0m
    echo Rechtsklick auf diese Datei - "Als Administrator ausfuhren"
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   INSTALLATION ERFOLGREICH!
echo ================================================
echo.
echo [32mDas System ist jetzt vollautomatisch aktiv![0m
echo.
echo Was passiert jetzt:
echo - Service startet JETZT sofort
echo - Pruft alle 30 Sekunden GitHub
echo - Synchronisiert automatisch alle Anderungen
echo - Startet automatisch mit Windows
echo - Lauft komplett unsichtbar im Hintergrund
echo.
echo Log-Datei: github-sync-log.txt
echo.

:: Starte Service jetzt sofort
echo Starte Service...
schtasks /run /tn "GitHub-Auto-Sync-CIS" >nul 2>&1

timeout /t 2 /nobreak >nul

echo.
echo [32mService lauft jetzt![0m
echo.
echo Verwaltung:
echo - Status prufen: schtasks /query /tn "GitHub-Auto-Sync-CIS"
echo - Service stoppen: schtasks /end /tn "GitHub-Auto-Sync-CIS"
echo - Service deinstallieren: schtasks /delete /tn "GitHub-Auto-Sync-CIS" /f
echo.
echo [32mDu musst nichts mehr tun - alles lauft automatisch![0m
echo.
pause

