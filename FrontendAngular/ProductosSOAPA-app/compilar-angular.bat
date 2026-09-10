@echo off
cd /d "C:\Users\USUARIO\source\repos\soap 2\FrontendAngular\ProductosSOAPA-app"

set PATH=C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%

echo Compilando Angular...
C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd exec ng build

pause
