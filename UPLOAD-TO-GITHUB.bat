@echo off
echo ============================================
echo   GITHUB UPLOAD SCRIPT
echo ============================================
echo.
echo This script will upload your code to GitHub
echo.

:input_username
set /p USERNAME="Enter your GitHub username: "
if "%USERNAME%"=="" (
    echo Username cannot be empty!
    goto input_username
)

:input_token
set /p TOKEN="Enter your GitHub Personal Access Token (from github.com/settings/tokens): "
if "%TOKEN%"=="" (
    echo Token cannot be empty!
    goto input_token
)

echo.
echo Creating repository on GitHub...
echo.

curl -X POST https://api.github.com/user/repos ^
  -H "Authorization: token %TOKEN%" ^
  -H "Accept: application/vnd.github.v3+json" ^
  -d "{\"name\":\"cadillac-ev-assistant\",\"description\":\"Cadillac EV Assistant - AI-powered customer support application\",\"private\":false,\"auto_init\":false}"

echo.
echo.
echo Pushing code to GitHub...
echo.

git remote remove origin 2>nul
git remote add origin https://%USERNAME%:%TOKEN%@github.com/%USERNAME%/cadillac-ev-assistant.git
git branch -M main
git push -u origin main

echo.
echo ============================================
echo   ✅ UPLOAD COMPLETE!
echo ============================================
echo.
echo Your repository is now available at:
echo https://github.com/%USERNAME%/cadillac-ev-assistant
echo.
pause

