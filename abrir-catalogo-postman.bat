@echo off
cd /d "C:\Users\USUARIO\source\repos\soap 2"

echo Iniciando servicio CatalogoSuap en http://localhost:5232 ...
start "CatalogoSuap SOAP" dotnet run --project CatalogoSuap\CatalogoSuap.csproj --no-build

echo Esperando unos segundos para que el servicio levante...
timeout /t 5 /nobreak > nul

echo Abriendo Postman con la coleccion correcta...
start "" "C:\ProgramData\USUARIO\Postman\app-12.24.4\Postman.exe" "C:\Users\USUARIO\source\repos\soap 2\Postman\CatalogoSOAP-FUNCIONA.postman_collection.json"

echo.
echo Si Postman no importa automaticamente, usar Import y seleccionar:
echo C:\Users\USUARIO\source\repos\soap 2\Postman\CatalogoSOAP-FUNCIONA.postman_collection.json
echo.
echo URL correcta:
echo http://localhost:5232/ProductoService.svc
echo.
pause
