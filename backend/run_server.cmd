@echo off
cd /d "%~dp0"
echo Starting SmartLighting Server...

call .venv\Scripts\activate.bat
python simple_start.py

pause 