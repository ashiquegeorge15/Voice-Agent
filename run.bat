@echo off
title Lexi Voice Vocabulary Agent
cd /d "%~dp0"
echo ===================================================
echo   Starting Lexi - Voice Vocabulary Coach Local Server
echo ===================================================
echo.
echo Opening http://localhost:8080 in your default browser...
start http://localhost:8080
echo.
echo Press Ctrl+C in this window to stop the server.
echo.
python -m http.server 8080
pause
