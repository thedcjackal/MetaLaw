@echo off
setlocal
echo 🛑 Stopping ALL MetaLaw Services...
pm2 stop all
echo.
pm2 status
pause
