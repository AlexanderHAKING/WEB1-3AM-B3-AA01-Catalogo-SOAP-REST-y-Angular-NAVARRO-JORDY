# Guia para ejecutar CatalogoSuap SOAP

Este proyecto contiene un servicio SOAP en ASP.NET Core para trabajar con productos y categorias usando SQL Server, Visual Studio y Postman.

## 1. Requisitos

Antes de ejecutar el proyecto se necesita tener instalado:

- Visual Studio 2022 o superior.
- .NET SDK compatible con el proyecto. En esta maquina se uso .NET `10.0.400-preview.0.26322.102`.
- SQL Server o SQL Server Express.
- Postman.

El proyecto usa esta cadena de conexion:

```json
"CatalogoConnection": "Server=localhost\\SQLEXPRESS;Database=CatalogoSOAPDB;Trusted_Connection=True;TrustServerCertificate=True;"
```

Si la computadora usa LocalDB en vez de SQLEXPRESS, se puede cambiar en:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoSuap\appsettings.json
```

Ejemplo para LocalDB:

```json
"CatalogoConnection": "Server=(localdb)\\MSSQLLocalDB;Database=CatalogoSOAPDB;Trusted_Connection=True;TrustServerCertificate=True;"
```

## 2. Archivos principales

La solucion esta en:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\ClientesSuap.slnx
```

El proyecto del deber esta en:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoSuap
```

Archivos importantes:

```text
CatalogoSuap\Program.cs
CatalogoSuap\Modelos\Categoria.cs
CatalogoSuap\Modelos\Producto.cs
CatalogoSuap\Datos\CatalogoDbContext.cs
CatalogoSuap\Servicios\IProductoService.cs
CatalogoSuap\Servicios\ProductoService.cs
script-catalogosoap.sql
CatalogoSOAP-FUNCIONA.postman_collection.json
CatalogoAngular
```

## 3. Base de datos

Abrir SQL Server Management Studio o una ventana de consulta SQL.

Ejecutar el archivo:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\script-catalogosoap.sql
```

Ese script hace lo siguiente:

- Crea la base de datos `CatalogoSOAPDB`.
- Crea la tabla `Categoria`.
- Crea la tabla `Producto`.
- Crea la relacion entre producto y categoria.
- Inserta datos de prueba.
- Muestra una consulta final para verificar los datos.

Tablas creadas:

```sql
Categoria
Producto
```

Campos de `Categoria`:

```text
IdCategoria
Nombre
Descripcion
Estado
```

Campos de `Producto`:

```text
IdProducto
Nombre
Descripcion
Precio
Stock
Estado
IdCategoria
```

## 4. Comandos usados

Estos son los comandos que se usaron para crear y revisar el proyecto.

Crear proyecto ASP.NET Core vacio:

```powershell
dotnet new web -n CatalogoSuap
```

Compilar toda la solucion:

```powershell
dotnet build
```

Ejecutar el servicio:

```powershell
dotnet run --project CatalogoSuap\CatalogoSuap.csproj
```

Ejecutar sin volver a compilar:

```powershell
dotnet run --project CatalogoSuap\CatalogoSuap.csproj --no-build
```

Ver version de .NET:

```powershell
dotnet --version
```

Probar que el WSDL responde:

```powershell
Invoke-WebRequest -Uri "http://localhost:5232/ProductoService.svc?singleWsdl" -UseBasicParsing
```

Guardar el WSDL en archivo, solo si se necesita una copia local:

```powershell
Invoke-WebRequest -Uri "http://localhost:5232/ProductoService.svc?singleWsdl" -UseBasicParsing -OutFile "CatalogoSuap.wsdl.xml"
```

Guardar el XSD en archivo, solo si se necesita una copia local:

```powershell
Invoke-WebRequest -Uri "http://localhost:5232/ProductoService.svc?xsd=xsd2" -UseBasicParsing -OutFile "CatalogoSuap.xsd.xml"
```

## 5. Ejecutar desde Visual Studio

1. Abrir la solucion:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\ClientesSuap.slnx
```

2. Verificar que el proyecto `CatalogoSuap` este cargado.

3. Revisar la cadena de conexion en:

```text
CatalogoSuap\appsettings.json
```

4. Ejecutar el script SQL antes de iniciar el servicio.

5. Ejecutar el proyecto `CatalogoSuap`.

6. El servicio debe abrir o responder en:

```text
http://localhost:5232/ProductoService.svc?wsdl
```

Tambien se puede revisar:

```text
http://localhost:5232/ProductoService.svc?xsd=xsd2
```

## 6. Operaciones SOAP

El contrato SOAP esta en:

```text
CatalogoSuap\Servicios\IProductoService.cs
```

Operaciones disponibles:

```text
ObtenerCategorias()
ObtenerProductos()
ObtenerProducto(int id)
AgregarProducto(Producto producto)
ActualizarProducto(Producto producto)
EliminarProducto(int id)
ObtenerProductosPorPrecio(decimal precioMinimo, decimal precioMaximo)
ObtenerProductosPorCategoria(int idCategoria)
```

Importante: `EliminarProducto` borra el producto de la tabla `Producto`. No lo deja como inactivo.

La direccion del servicio es:

```text
http://localhost:5232/ProductoService.svc
```

El namespace usado en SOAPAction es:

```text
http://tempuri.org/IProductoService/
```

## 7. Usar Postman

Abrir Postman e importar este archivo:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoSOAP-FUNCIONA.postman_collection.json
```

Tambien se puede abrir automaticamente con:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\abrir-catalogo-postman.bat
```

Importante:

- No usar la coleccion vieja `ClientesSOAPA`.
- No usar el puerto `5093`.
- No poner `Content-Type` en la pestana `Params`.
- Los valores `Content-Type` y `SOAPAction` van en la pestana `Headers`.

La URL debe quedar sola, asi:

```text
http://localhost:5232/ProductoService.svc
```

No debe quedar asi:

```text
http://localhost:5093?content-Type=text/xml;charset=utf-8
```

Esa forma esta mal porque mezcla la URL con el header.

La coleccion ya trae las 8 peticiones necesarias:

```text
1. Obtener categorias
2. Obtener productos
3. Obtener producto por id
4. Agregar producto
5. Actualizar producto
6. Eliminar producto
7. Obtener productos por precio
8. Obtener productos por categoria
```

Todas las peticiones usan:

```text
POST http://localhost:5232/ProductoService.svc
```

Headers:

```text
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://tempuri.org/IProductoService/NOMBRE_OPERACION"
```

Ejemplo de configuracion correcta para `ObtenerProductos`:

Metodo:

```text
POST
```

URL:

```text
http://localhost:5232/ProductoService.svc
```

Pestana `Params`:

```text
Debe estar vacia.
```

Pestana `Headers`:

```text
Content-Type    text/xml; charset=utf-8
SOAPAction      "http://tempuri.org/IProductoService/ObtenerProductos"
```

Pestana `Body`:

```text
raw
XML
```

Ejemplo para obtener productos:

```text
SOAPAction: "http://tempuri.org/IProductoService/ObtenerProductos"
```

Body:

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:temp="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <temp:ObtenerProductos/>
  </soapenv:Body>
</soapenv:Envelope>
```

## 8. Orden recomendado para probar

1. Ejecutar `script-catalogosoap.sql`.
2. Ejecutar el proyecto `CatalogoSuap`.
3. Abrir `http://localhost:5232/ProductoService.svc?wsdl`.
4. Importar `CatalogoSOAP-FUNCIONA.postman_collection.json` en Postman.
5. Probar primero `Obtener categorias`.
6. Probar despues `Obtener productos`.
7. Probar `Agregar producto`.
8. Probar nuevamente `Obtener productos`.
9. Probar `Actualizar producto`.
10. Probar `Eliminar producto`; este paso borra el registro de la base de datos.
11. Probar los filtros por precio y categoria.

## 9. Errores comunes

Si sale error de conexion a SQL Server:

- Revisar si SQL Server Express esta instalado.
- Confirmar que exista la instancia `.\\SQLEXPRESS`.
- Si usa LocalDB, cambiar la cadena de conexion.
- Ejecutar primero el script SQL.

Si sale error porque no existe la tabla:

- Ejecutar otra vez `script-catalogosoap.sql`.
- Revisar que la base sea `CatalogoSOAPDB`.

Si Postman no responde:

- Confirmar que el proyecto este ejecutandose.
- Revisar que el puerto sea `5232`.
- Revisar que la URL sea:

```text
http://localhost:5232/ProductoService.svc
```

Si Postman muestra `ECONNREFUSED 127.0.0.1:5093`:

- Esta usando la peticion vieja de clientes.
- Cambiar la URL a:

```text
http://localhost:5232/ProductoService.svc
```

- Borrar cualquier parametro como `content-Type` en `Params`.
- Importar la coleccion correcta `CatalogoSOAP-FUNCIONA.postman_collection.json`.
- Si las peticiones salen sin URL, borrar esa importacion e importar `CatalogoSOAP-FUNCIONA.postman_collection.json`.

Si Postman muestra error `500 Internal Server Error`:

- El servicio si recibio la peticion, pero fallo al consultar la base.
- Ejecutar primero:

```powershell
sqlcmd -S localhost\SQLEXPRESS -E -i "C:\Users\USUARIO\source\repos\ClientesSuap\script-catalogosoap.sql"
```

Si el WSDL no abre:

- Ejecutar el proyecto otra vez.
- Revisar que no haya otro programa usando el puerto `5232`.
- Probar:

```text
http://localhost:5232/ProductoService.svc?singleWsdl
```

Si al compilar aparece que `CatalogoSuap.exe` esta siendo usado por otro proceso:

- Cerrar la ventana donde se esta ejecutando el proyecto.
- En Visual Studio, detener la ejecucion con el boton rojo de detener.
- Si se ejecuto por consola, presionar `Ctrl + C`.
- Luego volver a compilar.

El error puede verse parecido a esto:

```text
The process cannot access the file 'CatalogoSuap.exe' because it is being used by another process.
```

Esto no significa que el codigo este mal. Solo significa que el servicio esta abierto mientras se intenta compilar de nuevo.

Si aparece error de CORS desde Angular:

- El proyecto ya tiene configurado CORS en `Program.cs`.
- Revisar que Angular este apuntando a:

```text
http://localhost:5232/ProductoService.svc
```

## 10. Comprobacion final

Se comprobo con:

```powershell
dotnet build
```

Resultado:

```text
Compilacion correcta.
0 Advertencia(s)
0 Errores
```

Tambien se comprobo que el servicio responda:

```text
http://localhost:5232/ProductoService.svc?singleWsdl
```

Estado obtenido:

```text
STATUS=200
```

## 11. Ejecutar Angular

La aplicacion Angular esta en:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoAngular
```

Esta parte se puede abrir con Visual Studio Code.

Comando para abrir la carpeta en VS Code:

```powershell
code C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoAngular
```

Si `code` no funciona, abrir Visual Studio Code manualmente y luego usar:

```text
File > Open Folder > C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoAngular
```

Para instalar dependencias se uso `pnpm` porque en esta maquina `npm` no estaba en el PATH:

```powershell
pnpm install
pnpm approve-builds --all
```

Para compilar Angular:

```powershell
pnpm exec ng build
```

Para ejecutar Angular:

```powershell
pnpm exec ng serve --host localhost --port 4200
```

Si PowerShell muestra un error diciendo que `pnpm.ps1` esta bloqueado por la politica de scripts, usar el archivo `.bat`:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoAngular\iniciar-angular.bat
```

O ejecutar el comando con `.cmd` completo:

```powershell
C:\Users\USUARIO\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd exec ng serve --host localhost --port 4200
```

Luego abrir:

```text
http://localhost:4200
```

Tambien se puede abrir automaticamente con:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\abrir-catalogo-angular.bat
```

Orden correcto para que funcione Angular:

1. Ejecutar SQL Server y tener creada la base `CatalogoSOAPDB`.
2. Ejecutar el backend `CatalogoSuap`.
3. Verificar que responda:

```text
http://localhost:5232/ProductoService.svc?wsdl
```

4. Ejecutar Angular.
5. Abrir:

```text
http://localhost:4200
```

Angular consume este endpoint SOAP:

```text
http://localhost:5232/ProductoService.svc
```

Si Angular muestra error al cargar productos:

- Revisar que el backend este ejecutandose.
- Revisar que el puerto sea `5232`.
- Revisar que la base de datos ya fue creada con `script-catalogosoap.sql`.

Si Angular se queda en `Guardando...` o falla al actualizar:

- Revisar primero que `http://localhost:5232/ProductoService.svc?wsdl` abra en el navegador.
- En SOAP el orden de los campos importa. Para `ActualizarProducto`, el XML debe enviar el producto en este orden:

```text
Descripcion
Estado
IdCategoria
IdProducto
Nombre
Precio
Stock
```

- La aplicacion Angular ya usa ese orden en:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoAngular\src\app\catalogo-soap.service.ts
```

- La coleccion de Postman correcta tambien usa ese orden:

```text
C:\Users\USUARIO\source\repos\ClientesSuap\CatalogoSOAP-FUNCIONA.postman_collection.json
```

## 12. Verificar en SQL Server

Para revisar los ultimos productos guardados en la base de datos:

```powershell
sqlcmd -S "localhost\SQLEXPRESS" -E -d CatalogoSOAPDB -Q "SELECT TOP 10 p.IdProducto, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.Estado, p.IdCategoria, c.Nombre AS Categoria FROM Producto p INNER JOIN Categoria c ON c.IdCategoria = p.IdCategoria ORDER BY p.IdProducto DESC;"
```

Para ver las categorias disponibles y usar un `IdCategoria` correcto en Postman:

```powershell
sqlcmd -S "localhost\SQLEXPRESS" -E -d CatalogoSOAPDB -Q "SELECT IdCategoria, Nombre, Descripcion, Estado FROM Categoria ORDER BY IdCategoria;"
```

Ejemplo: si se usa `IdCategoria` con un valor que no existe, como `30`, el producto no se debe guardar porque no tiene categoria valida.

## 13. Agregar producto desde Postman

En Postman usar:

```text
POST http://localhost:5232/ProductoService.svc
```

Headers:

```text
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://tempuri.org/IProductoService/AgregarProducto"
```

Body > raw > XML:

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:temp="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <temp:AgregarProducto>
      <temp:producto>
        <temp:Descripcion>Manzana roja para prueba desde Postman</temp:Descripcion>
        <temp:Estado>true</temp:Estado>
        <temp:IdCategoria>3</temp:IdCategoria>
        <temp:Nombre>Manzana Jordy</temp:Nombre>
        <temp:Precio>0.75</temp:Precio>
        <temp:Stock>30</temp:Stock>
      </temp:producto>
    </temp:AgregarProducto>
  </soapenv:Body>
</soapenv:Envelope>
```

Despues de enviar, volver a ejecutar `Obtener productos` o usar el SQL de verificacion para confirmar que se guardo.
