@echo off
TITLE DEALFLOW360 Offline Launcher
cd /d "%~dp0"

echo ====================================================
echo  🚀 DEALFLOW360 - Offline Local Demo Engine
echo ====================================================
echo.

echo 0. Checking Docker MongoDB Service...
docker-compose up -d 2>nul || docker compose up -d 2>nul
if %errorlevel% neq 0 (
    echo 💡 Note: Docker container check bypassed. Application will use built-in offline database.
)

echo.
echo 1. Starting Backend Server on http://localhost:5001...
start "DEALFLOW360 Backend" cmd /k "cd /d "%~dp0server" && npm start"

echo.
echo 2. Starting Frontend Client on http://localhost:3000...
start "DEALFLOW360 Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ====================================================
echo  ✅ DEALFLOW360 launched successfully!
echo  Access Platform at: http://localhost:3000
echo ====================================================
echo.
pause
