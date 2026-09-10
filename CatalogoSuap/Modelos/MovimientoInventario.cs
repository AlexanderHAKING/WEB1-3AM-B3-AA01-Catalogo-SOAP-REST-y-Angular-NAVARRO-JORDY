using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CatalogoSuap.Modelos
{
    [Table("Movimiento_Inventario")]
    public class MovimientoInventario
    {
        [Key]
        public int IdMovimiento { get; set; }

        public int IdProducto { get; set; }

        public string TipoMovimiento { get; set; } = "Entrada";

        public int Cantidad { get; set; }

        public string? Observacion { get; set; }

        public DateTime FechaMovimiento { get; set; } = DateTime.Now;
    }
}
