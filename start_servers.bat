@echo off
echo Starting MetaLaw Backend...
start cmd /k "cd backend && venv\Scripts\python main.py"

echo Starting MetaLaw Frontend...
start cmd /k "cd frontend && npm run dev"

echo Servers are starting. The backend is at http://localhost:8000 and the frontend is usually at http://localhost:5173 (or 5174).
