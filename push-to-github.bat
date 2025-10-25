@echo off
echo.
echo ============================================
echo   PUSHING TO GITHUB
echo ============================================
echo.
echo Repository: https://github.com/jtsky200/CIS
echo.
echo Please enter your GitHub credentials:
echo.
set /p USERNAME="GitHub Username: "
set /p TOKEN="GitHub Personal Access Token (create at github.com/settings/tokens): "

echo.
echo Pushing code to GitHub...
echo.

git remote remove origin 2>nul
git remote add origin https://%USERNAME%:%TOKEN%@github.com/jtsky200/CIS.git
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo   ✅ SUCCESS! Code uploaded to GitHub
    echo ============================================
    echo.
    echo Your repository is now available at:
    echo https://github.com/jtsky200/CIS
    echo.
) else (
    echo.
    echo ❌ Push failed. Please check your credentials.
    echo.
    echo Make sure you have:
    echo 1. Valid GitHub username
    echo 2. Personal Access Token with 'repo' permissions
    echo    Create one at: https://github.com/settings/tokens
    echo.
)

pause

