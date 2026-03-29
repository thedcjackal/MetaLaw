@echo off
setlocal
echo 🚀 Starting MetaLaw Production (Port 443)...

:: Ensure PM2 process is running
pm2 start ecosystem.config.js --only metalaw-unified

:: Enable public funnel
echo 🌐 Enabling Tailscale Funnel on port 443...
tailscale funnel --https=443 --bg --yes 3001

echo.
pm2 status metalaw-unified
tailscale funnel status
pause
