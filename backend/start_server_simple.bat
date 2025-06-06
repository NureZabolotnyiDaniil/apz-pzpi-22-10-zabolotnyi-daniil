@echo off
echo Starting SmartLighting Backend Server (Production Mode)...
echo.

cd /d "%~dp0"

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Testing imports...
python -c "print('Python is working'); import main; print('Main module imported successfully')"

echo.
echo Starting FastAPI server...
echo Server will be available at: http://localhost:8000
echo API documentation at: http://localhost:8000/docs
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000

pause 