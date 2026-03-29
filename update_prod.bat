@echo off
setlocal
echo 🚀 Updating MetaLaw Production...

echo [*] Pulling latest code from GitHub...
git pull origin main

:: Check if frontend build is needed
if exist frontend (
    echo [*] Building frontend...
    npm run build --prefix frontend
)

echo [*] Restarting production server via PM2...
pm2 restart metalaw-unified

echo 🌐 Re-enabling Tailscale Funnel on port 443...
tailscale funnel --https=443 --bg --yes 3001

echo.
echo [!] Production environment updated successfully.
pm2 status metalaw-unified
pause
