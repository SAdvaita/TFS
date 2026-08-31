@echo off
echo ===================================================
echo   TRUE FIRE SOLUTION (TFS) - APPLICATION LAUNCHER
echo ===================================================
echo.
echo Starting TFS Backend Server (Port 5000)...
start "TFS Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

echo Starting TFS Web Application (Port 5173)...
start "TFS Web App" cmd /k "cd /d %~dp0web && npm run dev"

echo.
echo Both servers started!
echo Open your browser at: http://localhost:5173
echo Login with: admin@truefiresolution.com / admin123
echo.
pause
