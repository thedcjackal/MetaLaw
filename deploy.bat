@echo off
setlocal
echo 🚀 Deploying MetaLaw Production Update...

cd frontend
echo 🏗️  Building Frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build Failed! Aborting.
    pause
    exit /b %errorlevel%
)

cd ..
echo 🔄 Restarting Production Service...
pm2 restart metalaw-unified

echo ✅ MetaLaw Production is now up to date!
pause
