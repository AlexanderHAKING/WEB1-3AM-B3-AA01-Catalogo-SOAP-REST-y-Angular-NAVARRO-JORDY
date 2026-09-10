@echo off
cd /d C:\Users\USUARIO\source\repos\ClientesSuap

echo Iniciando backend SOAP en http://localhost:5232 ...
start "CatalogoSuap SOAP" dotnet run --project CatalogoSuap\CatalogoSuap.csproj --no-build

echo Esperando el servicio SOAP...
timeout /t 5 /nobreak > nul

echo Iniciando Angular en http://localhost:4200 ...
cd /d "C:\Users\USUARIO\source\repos\soap 2\CatalogoAngular"
set PATH=C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%
start "CatalogoAngular" C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd exec ng serve --host localhost --port 4200

echo.
echo Abre en el navegador:
echo http://localhost:4200
echo.
pause
