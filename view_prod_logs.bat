@echo off
setlocal
echo 🕵️‍♂️ MetaLaw: Live Production (Port 3001) Logs...
echo (Press CTRL+C to stop trailing)
echo.
pm2 logs metalaw-unified --lines 50
pause
