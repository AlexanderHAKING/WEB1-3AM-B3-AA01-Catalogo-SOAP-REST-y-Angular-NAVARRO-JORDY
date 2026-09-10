# Servicio REST - Movimiento_Inventario

Esta carpeta separa la parte REST de la actividad para que el repositorio se revise de forma ordenada.

El servicio REST se implemento dentro del proyecto ASP.NET Core principal:

```text
ServicioSOAP/ProductosSOAP/Program.cs
```

Se dejo en el mismo backend porque usa la misma base de datos `CatalogoSOAPDB` y las mismas entidades `Producto` y `Movimiento_Inventario`.

## Que significa REST

REST es una forma de crear servicios web usando rutas y metodos HTTP. En esta actividad el recurso principal es `Movimiento_Inventario`, por eso las acciones se trabajan con la ruta:

```text
http://localhost:5232/api/movimientos
```

## Metodos implementados

```text
GET    /api/movimientos       Obtener lista
GET    /api/movimientos/{id}  Obtener un registro
POST   /api/movimientos       Guardar un registro
PUT    /api/movimientos/{id}  Actualizar un registro
DELETE /api/movimientos/{id}  Borrar un registro
```

## Tabla usada

```text
Movimiento_Inventario
```

Campos:

- `IdMovimiento`
- `IdProducto`
- `TipoMovimiento`
- `Cantidad`
- `FechaMovimiento`
- `Observacion`

El campo `IdProducto` permite relacionar cada movimiento con un producto guardado por el servicio SOAP.
