@echo off
echo Starting Advanced Troubleshooting API automatically...
cd advanced-troubleshooting-backend
call .venv\Scripts\activate
uvicorn app:app --host 127.0.0.1 --port 8081 --reload
