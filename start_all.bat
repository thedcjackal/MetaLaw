@echo off
setlocal
echo 🚀 Starting ALL MetaLaw Services (Prod + Dev)...
pm2 start ecosystem.config.js dev.ecosystem.config.js
echo.
pm2 status
pause
