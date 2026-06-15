@echo off
echo ========================================
echo SkillBridge FastAPI Backend Setup
echo ========================================
echo.

echo [1/4] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    echo Make sure Python 3.9+ is installed
    pause
    exit /b 1
)
echo ✓ Virtual environment created
echo.

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated
echo.

echo [3/4] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Edit .env file with your database credentials
echo 2. Ensure PostgreSQL is running
echo 3. Run: uvicorn app.main:app --reload --port 5000
echo 4. Visit: http://localhost:5000/api/docs
echo.
echo To activate the environment later, run:
echo    venv\Scripts\activate
echo.
pause
