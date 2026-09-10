@echo off
cd /d C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoAngular

set PATH=C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%

echo Iniciando Angular en http://localhost:4200 ...
C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd exec ng serve --host localhost --port 4200

pause
