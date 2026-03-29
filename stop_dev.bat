@echo off
setlocal
echo 🛑 Stopping MetaLaw Development API and UI...
pm2 stop metalaw-api-dev metalaw-ui-dev
echo.
pm2 status
pause
