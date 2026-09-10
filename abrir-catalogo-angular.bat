@echo off
cd /d "C:\Users\USUARIO\source\repos\soap 2"

echo Iniciando backend SOAP en http://localhost:5232 ...
start "CatalogoSuap SOAP REST" dotnet run --project ServicioSOAP\ProductosSOAP\CatalogoSuap.csproj --no-build

echo Esperando el servicio SOAP...
timeout /t 5 /nobreak > nul

echo Iniciando Angular en http://localhost:4200 ...
cd /d "C:\Users\USUARIO\source\repos\soap 2\FrontendAngular\ProductosSOAPA-app"
set PATH=C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%
start "CatalogoAngular" C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd exec ng serve --host localhost --port 4200

echo.
echo Abre en el navegador:
echo http://localhost:4200
echo.
pause
