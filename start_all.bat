@echo off
echo ====================================================
echo      INICIANDO SISTEMA SHEPHERD GARDE
echo ====================================================

echo Iniciando Backend (Django) en el puerto 8000...
start "Backend Shepherd Garde" cmd /k "python manage.py runserver"

echo Iniciando Admin Core en el puerto 3001...
start "Admin Core" cmd /k "cd shepherd_admin_core && npm run dev"

echo Iniciando Frontend (Next.js) en el puerto 3000...
start "Frontend Shepherd Garde" cmd /k "cd frontend && npm run dev"

echo.
echo Todos los servicios han sido lanzados en nuevas ventanas.
echo Presiona cualquier tecla para cerrar esta ventana.
pause >nul
