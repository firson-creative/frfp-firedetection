@echo off
echo ===================================================
echo   FRFP - Fire Risk Foresight ^& Prioritization v2.0
echo   Menjalankan Backend (:8000) ^& Frontend (:3000)
echo ===================================================
start "FRFP Backend (FastAPI :8000)" cmd /k "cd /d %~dp0backend && python run.py"
start "FRFP Frontend (Next.js :3000)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo Layanan FRFP sedang dimulai:
echo - Backend API : http://localhost:8000/docs
echo - Frontend UI : http://localhost:3000
echo.
pause
