@echo off
echo 🚀 Setting up Advanced Troubleshooting System
echo ==========================================

echo 📁 Creating backend directory...
if not exist "advanced-troubleshooting-backend" mkdir advanced-troubleshooting-backend

echo 📦 Installing Python dependencies...
cd advanced-troubleshooting-backend
python -m venv .venv
call .venv\Scripts\activate
pip install -r requirements.txt

echo 🔍 Building troubleshooting index...
python build_index.py

echo ✅ Setup complete!
echo.
echo 🚀 To start the API server:
echo    cd advanced-troubleshooting-backend
echo    .venv\Scripts\activate
echo    uvicorn app:app --reload --port 8080
echo.
echo 🧪 To test the system:
echo    python ..\test-advanced-troubleshooting.py

pause
