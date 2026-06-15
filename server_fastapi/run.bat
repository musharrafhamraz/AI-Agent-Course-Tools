@echo off
echo Starting SkillBridge FastAPI Backend...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run uvicorn server
echo Server running at http://localhost:5000
echo API Docs: http://localhost:5000/api/docs
echo.
uvicorn app.main:app --reload --port 5000
