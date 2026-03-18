@echo off
setlocal
cd /d "%~dp0"

echo =====================================
echo Short Video Script Web UI
echo This window runs the local web server.
echo Keep it open while using the website.
echo =====================================
echo.

python src\web_app.py --open

if errorlevel 1 (
  echo.
  echo Failed to start the web UI.
  echo Please check that Python is installed and available.
)

echo.
pause
endlocal
