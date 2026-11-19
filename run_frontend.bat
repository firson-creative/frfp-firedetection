@echo off
echo ===================================================
echo   FRFP - Fire Risk Foresight ^& Prioritization v2.0
echo   Menjalankan Frontend Server (Next.js) di :3000
echo ===================================================
cd /d "%~dp0frontend"
npm run dev
pause
