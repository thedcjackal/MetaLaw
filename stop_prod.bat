@echo off
setlocal
echo 🛑 Stopping MetaLaw Production...

:: Turn off funnel first
echo 🌐 Disabling Tailscale Funnel on port 443...
tailscale funnel 443 off

:: Stop PM2 process
pm2 stop metalaw-unified

echo.
pm2 status metalaw-unified
pause
