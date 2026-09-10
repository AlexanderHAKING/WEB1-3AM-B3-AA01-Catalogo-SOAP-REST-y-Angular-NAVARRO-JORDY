using CatalogoSuap.Datos;
using CatalogoSuap.Modelos;
using CatalogoSuap.Servicios;
using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AccesoWeb", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<CatalogoDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("CatalogoConnection"));
});

builder.Services.AddScoped<ProductoService>();

builder.Services
    .AddServiceModelServices()
    .AddServiceModelMetadata();

builder.Services.AddSingleton<IServiceBehavior, UseRequestHeadersForMetadataAddressBehavior>();

builder.WebHost.ConfigureKestrel(options =>
{
    options.AllowSynchronousIO = true;
});

var app = builder.Build();

app.Use(async (context, next) =>
{
    context.Response.Headers["Access-Control-Allow-Origin"] = "*";
    context.Response.Headers["Access-Control-Allow-Headers"] = "*";
    context.Response.Headers["Access-Control-Allow-Methods"] = "*";

    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync("OK");
        return;
    }

    await next();
});

app.UseRouting();
app.UseCors("AccesoWeb");

app.MapGet("/", () => Results.Redirect("/ver"));

app.MapGet("/ver", () => Results.Content("""
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>CatalogoSuap SOAP</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 32px; color: #202124; }
        h1 { color: #0b3d75; }
        code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; }
        li { margin: 8px 0; }
        a { color: #0b57d0; }
    </style>
</head>
<body>
    <h1>CatalogoSuap SOAP</h1>
    <p>Servicio SOAP de productos y categorias ejecutandose correctamente.</p>

    <h2>Enlaces</h2>
    <ul>
        <li><a href="/ProductoService.svc">Pantalla del servicio</a></li>
        <li><a href="/ProductoService.svc?wsdl">WSDL</a></li>
        <li><a href="/ProductoService.svc?singleWsdl">Single WSDL</a></li>
        <li><a href="/ProductoService.svc?xsd=xsd2">XSD</a></li>
    </ul>

    <h2>Operaciones SOAP</h2>
    <ul>
        <li><code>ObtenerCategorias()</code></li>
        <li><code>ObtenerProductos()</code></li>
        <li><code>ObtenerProducto(int id)</code></li>
        <li><code>AgregarProducto(Producto producto)</code></li>
        <li><code>ActualizarProducto(Producto producto)</code></li>
        <li><code>EliminarProducto(int id)</code></li>
        <li><code>ObtenerProductosPorPrecio(decimal precioMinimo, decimal precioMaximo)</code></li>
        <li><code>ObtenerProductosPorCategoria(int idCategoria)</code></li>
    </ul>

    <p>Para ejecutar las operaciones se usa Postman con la coleccion <code>CatalogoSOAP-FUNCIONA.postman_collection.json</code>.</p>
</body>
</html>
""", "text/html"));

var movimientos = app.MapGroup("/api/movimientos");

movimientos.MapGet("/", async (CatalogoDbContext context) =>
{
    var datos = await (
        from movimiento in context.MovimientosInventario.AsNoTracking()
        join producto in context.Productos.AsNoTracking()
            on movimiento.IdProducto equals producto.IdProducto
        orderby movimiento.FechaMovimiento descending, movimiento.IdMovimiento descending
        select new
        {
            movimiento.IdMovimiento,
            movimiento.IdProducto,
            Producto = producto.Nombre,
            movimiento.TipoMovimiento,
            movimiento.Cantidad,
            movimiento.Observacion,
            movimiento.FechaMovimiento
        }
    ).ToListAsync();

    return Results.Ok(datos);
});

movimientos.MapGet("/{id:int}", async (int id, CatalogoDbContext context) =>
{
    var dato = await (
        from movimiento in context.MovimientosInventario.AsNoTracking()
        join producto in context.Productos.AsNoTracking()
            on movimiento.IdProducto equals producto.IdProducto
        where movimiento.IdMovimiento == id
        select new
        {
            movimiento.IdMovimiento,
            movimiento.IdProducto,
            Producto = producto.Nombre,
            movimiento.TipoMovimiento,
            movimiento.Cantidad,
            movimiento.Observacion,
            movimiento.FechaMovimiento
        }
    ).FirstOrDefaultAsync();

    return dato is null ? Results.NotFound() : Results.Ok(dato);
});

movimientos.MapPost("/", async (MovimientoInventario movimiento, CatalogoDbContext context) =>
{
    var producto = await context.Productos.FindAsync(movimiento.IdProducto);
    if (producto is null) return Results.BadRequest("El producto no existe.");

    var error = AplicarMovimiento(producto, movimiento.TipoMovimiento, movimiento.Cantidad);
    if (error is not null) return Results.BadRequest(error);

    movimiento.IdMovimiento = 0;
    movimiento.TipoMovimiento = NormalizarTipo(movimiento.TipoMovimiento);
    movimiento.FechaMovimiento = DateTime.Now;

    context.MovimientosInventario.Add(movimiento);
    await context.SaveChangesAsync();

    return Results.Created($"/api/movimientos/{movimiento.IdMovimiento}", movimiento);
});

movimientos.MapPut("/{id:int}", async (int id, MovimientoInventario entrada, CatalogoDbContext context) =>
{
    var movimiento = await context.MovimientosInventario.FindAsync(id);
    if (movimiento is null) return Results.NotFound();

    var productoAnterior = await context.Productos.FindAsync(movimiento.IdProducto);
    var productoNuevo = await context.Productos.FindAsync(entrada.IdProducto);
    if (productoAnterior is null || productoNuevo is null) return Results.BadRequest("El producto no existe.");

    var errorReverso = RevertirMovimiento(productoAnterior, movimiento.TipoMovimiento, movimiento.Cantidad);
    if (errorReverso is not null) return Results.BadRequest(errorReverso);

    var errorNuevo = AplicarMovimiento(productoNuevo, entrada.TipoMovimiento, entrada.Cantidad);
    if (errorNuevo is not null)
    {
        AplicarMovimiento(productoAnterior, movimiento.TipoMovimiento, movimiento.Cantidad);
        return Results.BadRequest(errorNuevo);
    }

    movimiento.IdProducto = entrada.IdProducto;
    movimiento.TipoMovimiento = NormalizarTipo(entrada.TipoMovimiento);
    movimiento.Cantidad = entrada.Cantidad;
    movimiento.Observacion = entrada.Observacion;
    movimiento.FechaMovimiento = DateTime.Now;

    await context.SaveChangesAsync();
    return Results.Ok(movimiento);
});

movimientos.MapDelete("/{id:int}", async (int id, CatalogoDbContext context) =>
{
    var movimiento = await context.MovimientosInventario.FindAsync(id);
    if (movimiento is null) return Results.NotFound();

    var producto = await context.Productos.FindAsync(movimiento.IdProducto);
    if (producto is null) return Results.BadRequest("El producto no existe.");

    var error = RevertirMovimiento(producto, movimiento.TipoMovimiento, movimiento.Cantidad);
    if (error is not null) return Results.BadRequest(error);

    context.MovimientosInventario.Remove(movimiento);
    await context.SaveChangesAsync();

    return Results.NoContent();
});

app.UseServiceModel(serviceBuilder =>
{
    serviceBuilder
        .AddService<ProductoService>()
        .AddServiceEndpoint<ProductoService, IProductoService>(
            new BasicHttpBinding(),
            "/ProductoService.svc"
        );
});

var metadata = app.Services.GetRequiredService<ServiceMetadataBehavior>();
metadata.HttpGetEnabled = true;

app.Run("http://localhost:5232");

static string? AplicarMovimiento(CatalogoSuap.Modelos.Producto producto, string tipo, int cantidad)
{
    tipo = NormalizarTipo(tipo);
    if (cantidad <= 0) return "La cantidad debe ser mayor que cero.";

    if (tipo == "Entrada")
    {
        producto.Stock += cantidad;
        return null;
    }

    if (tipo == "Salida")
    {
        if (producto.Stock < cantidad) return "No hay stock suficiente para registrar la salida.";
        producto.Stock -= cantidad;
        return null;
    }

    return "El tipo debe ser Entrada o Salida.";
}

static string? RevertirMovimiento(CatalogoSuap.Modelos.Producto producto, string tipo, int cantidad)
{
    tipo = NormalizarTipo(tipo);

    if (tipo == "Entrada")
    {
        if (producto.Stock < cantidad) return "No se puede revertir porque el stock quedaria negativo.";
        producto.Stock -= cantidad;
        return null;
    }

    if (tipo == "Salida")
    {
        producto.Stock += cantidad;
        return null;
    }

    return "El tipo debe ser Entrada o Salida.";
}

static string NormalizarTipo(string? tipo)
{
    return string.Equals(tipo, "Salida", StringComparison.OrdinalIgnoreCase) ? "Salida" : "Entrada";
}
