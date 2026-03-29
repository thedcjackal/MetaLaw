@echo off
setlocal
echo 🚀 Starting MetaLaw Development Environment...
pm2 start dev.ecosystem.config.js
echo.
pm2 status
pause
