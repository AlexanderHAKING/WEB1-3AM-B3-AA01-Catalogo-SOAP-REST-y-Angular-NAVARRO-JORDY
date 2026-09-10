# Actividad Autonoma - Catalogo SOAP, REST y Angular

Proyecto para Programacion Web I. La actividad integra el servicio SOAP de categorias y productos, un servicio REST para movimientos de inventario, una aplicacion Angular y una API externa publica para consultar referencias de productos.

## Tema y paralelo

Paralelo: Tercero A Matutina.

Tema asignado:

- SOAP: Categoria y Producto.
- REST: Movimiento_Inventario.
- API externa: catalogo publico de productos.

## Estructura usada

```text
soap 2/
├── FrontendAngular/
│   └── ProductosSOAPA-app/       Aplicacion Angular en dashboard vertical
├── ServicioSOAP/
│   └── ProductosSOAP/            Servicio SOAP de categorias y productos
├── ServicioREST/
│   └── MovimientosRESTA/         Explicacion y separacion del REST
├── SQL/                          Script de base de datos
├── Postman/                      Colecciones para probar SOAP y REST
├── .gitignore
└── README.md
```

## Base de datos

La base de datos se llama:

```text
CatalogoSOAPDB
```

Para crear las tablas y datos de prueba, primero se abre la carpeta del proyecto y luego se ejecuta el script:

```powershell
sqlcmd -S "localhost\SQLEXPRESS" -E -i "SQL\script-catalogosoap.sql"
```

Tablas principales:

- `Categoria`: datos de categorias.
- `Producto`: productos relacionados con una categoria.
- `Movimiento_Inventario`: entradas y salidas relacionadas con un producto.

## Ejecutar el servicio SOAP y REST

Desde la carpeta del proyecto:

```powershell
dotnet run --project ServicioSOAP\ProductosSOAP\CatalogoSuap.csproj
```

El servicio queda en:

```text
http://localhost:5232
```

WSDL del servicio SOAP:

```text
http://localhost:5232/ProductoService.svc?wsdl
```

Endpoint REST:

```text
http://localhost:5232/api/movimientos
```

## Servicio SOAP

El SOAP trabaja con Categoria y Producto. Las operaciones principales son:

- `ObtenerCategorias`
- `ObtenerProductos`
- `ObtenerProducto`
- `AgregarProducto`
- `ActualizarProducto`
- `EliminarProducto`
- `ObtenerProductosPorPrecio`
- `ObtenerProductosPorCategoria`

La coleccion de prueba esta en:

```text
Postman\CatalogoSOAP-FUNCIONA.postman_collection.json
```

## Servicio REST - Movimiento_Inventario

El REST permite trabajar con los movimientos de inventario de cada producto.

Endpoints:

```text
GET    /api/movimientos
GET    /api/movimientos/{id}
POST   /api/movimientos
PUT    /api/movimientos/{id}
DELETE /api/movimientos/{id}
```

Ejemplo para guardar:

```json
{
  "idProducto": 1,
  "tipoMovimiento": "Entrada",
  "cantidad": 5,
  "observacion": "Ingreso por compra"
}
```

Si el movimiento es `Entrada`, aumenta el stock del producto. Si el movimiento es `Salida`, descuenta el stock y valida que exista cantidad suficiente.

La coleccion de prueba REST esta en:

```text
Postman\CatalogoREST-Movimientos.postman_collection.json
```

## Ejecutar Angular

Entrar a la carpeta Angular:

```powershell
cd FrontendAngular\ProductosSOAPA-app
pnpm install
pnpm exec ng serve --host localhost --port 4200
```

Abrir:

```text
http://localhost:4200
```

La pantalla permite:

- Entrar a la seccion SOAP para consultar y administrar productos.
- Entrar a la seccion REST para registrar movimientos de inventario.
- Entrar a la seccion de API externa para buscar productos publicos.
- Comparar un producto local con uno consultado desde la API externa.

## API externa

Se usa DummyJSON Products:

```text
https://dummyjson.com/products/search?q=phone
```

Angular consume esta API directamente desde la pantalla "Catalogo publico de productos". Se muestran productos reales de referencia con nombre, categoria, precio e imagen. Esta consulta no reemplaza al SOAP ni al REST, solo sirve como informacion externa para comparar el catalogo local.

## Separacion en Angular

La aplicacion se organizo en formato dashboard vertical para que se entienda mejor durante la revision:

- `Productos SOAP`: muestra productos y categorias consumidos desde el servicio SOAP.
- `Movimientos REST`: muestra la tabla `Movimiento_Inventario` y permite usar los metodos basicos del REST.
- `Catalogo externo`: consume la API publica y permite comparar un producto local con un producto externo.

REST significa que el servicio trabaja con recursos usando metodos HTTP. En este proyecto el recurso es `Movimiento_Inventario`, por eso se usan rutas como `/api/movimientos` junto con `GET`, `POST`, `PUT` y `DELETE`.

## Orden recomendado para probar

1. Ejecutar el script SQL.
2. Ejecutar `ServicioSOAP\ProductosSOAP`.
3. Abrir el WSDL para confirmar que SOAP responde.
4. Ejecutar Angular.
5. Probar listado y registro de productos.
6. Registrar una entrada o salida en Movimiento_Inventario.
7. Revisar que el stock del producto cambie.
8. Buscar un producto en el catalogo publico externo.

## Evidencia para el video

En el video se puede mostrar:

- La estructura de carpetas del proyecto.
- El WSDL del servicio SOAP.
- La pantalla Angular cargando productos y categorias.
- El formulario de Movimiento_Inventario usando REST.
- La consulta a la API externa.
- La tabla de SQL Server con productos y movimientos guardados.
