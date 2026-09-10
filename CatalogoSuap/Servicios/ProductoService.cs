using CatalogoSuap.Datos;
using CatalogoSuap.Modelos;
using CoreWCF;
using Microsoft.EntityFrameworkCore;

namespace CatalogoSuap.Servicios
{
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class ProductoService : IProductoService
    {
        private readonly CatalogoDbContext _context;

        public ProductoService(CatalogoDbContext context)
        {
            _context = context;
        }

        public List<Categoria> ObtenerCategorias()
        {
            return _context.Categorias
                .AsNoTracking()
                .Where(c => c.Estado)
                .OrderBy(c => c.Nombre)
                .ToList();
        }

        public List<Producto> ObtenerProductos()
        {
            return _context.Productos
                .AsNoTracking()
                .OrderBy(p => p.IdProducto)
                .ToList();
        }

        public Producto? ObtenerProducto(int id)
        {
            return _context.Productos
                .AsNoTracking()
                .FirstOrDefault(p => p.IdProducto == id);
        }

        public Producto? AgregarProducto(Producto producto)
        {
            if (!ProductoValido(producto)) return null;

            producto.IdProducto = 0;
            _context.Productos.Add(producto);
            _context.SaveChanges();

            return producto;
        }

        public Producto? ActualizarProducto(Producto producto)
        {
            if (!ProductoValido(producto)) return null;

            var productoDb = _context.Productos.Find(producto.IdProducto);

            if (productoDb == null) return null;

            productoDb.Nombre = producto.Nombre;
            productoDb.Descripcion = producto.Descripcion;
            productoDb.Precio = producto.Precio;
            productoDb.Stock = producto.Stock;
            productoDb.Estado = producto.Estado;
            productoDb.IdCategoria = producto.IdCategoria;

            _context.SaveChanges();
            return productoDb;
        }

        public bool EliminarProducto(int id)
        {
            var producto = _context.Productos.Find(id);

            if (producto == null) return false;

            _context.Productos.Remove(producto);
            _context.SaveChanges();
            return true;
        }

        public List<Producto> ObtenerProductosPorPrecio(decimal precioMinimo, decimal precioMaximo)
        {
            var menor = Math.Min(precioMinimo, precioMaximo);
            var mayor = Math.Max(precioMinimo, precioMaximo);

            return _context.Productos
                .AsNoTracking()
                .Where(p => p.Precio >= menor && p.Precio <= mayor)
                .OrderBy(p => p.Precio)
                .ToList();
        }

        public List<Producto> ObtenerProductosPorCategoria(int idCategoria)
        {
            return _context.Productos
                .AsNoTracking()
                .Where(p => p.IdCategoria == idCategoria)
                .OrderBy(p => p.Nombre)
                .ToList();
        }

        private bool ProductoValido(Producto producto)
        {
            if (string.IsNullOrWhiteSpace(producto.Nombre)) return false;
            if (producto.Precio < 0) return false;
            if (producto.Stock < 0) return false;

            return _context.Categorias.Any(c => c.IdCategoria == producto.IdCategoria && c.Estado);
        }
    }
}
