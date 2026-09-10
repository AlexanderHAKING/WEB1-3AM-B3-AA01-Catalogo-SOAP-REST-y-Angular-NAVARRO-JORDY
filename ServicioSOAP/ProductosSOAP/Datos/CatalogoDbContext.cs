using CatalogoSuap.Modelos;
using Microsoft.EntityFrameworkCore;

namespace CatalogoSuap.Datos
{
    public class CatalogoDbContext : DbContext
    {
        public CatalogoDbContext(DbContextOptions<CatalogoDbContext> options)
            : base(options)
        {
        }

        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<MovimientoInventario> MovimientosInventario { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Categoria>().ToTable("Categoria");
            modelBuilder.Entity<Producto>().ToTable("Producto");
            modelBuilder.Entity<MovimientoInventario>().ToTable("Movimiento_Inventario");

            modelBuilder.Entity<Producto>()
                .HasOne<Categoria>()
                .WithMany()
                .HasForeignKey(p => p.IdCategoria);

            modelBuilder.Entity<MovimientoInventario>()
                .HasOne<Producto>()
                .WithMany()
                .HasForeignKey(m => m.IdProducto);
        }
    }
}
