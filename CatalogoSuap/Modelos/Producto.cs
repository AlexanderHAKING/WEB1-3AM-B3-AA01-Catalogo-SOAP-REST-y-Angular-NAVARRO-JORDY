using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;

namespace CatalogoSuap.Modelos
{
    [DataContract(Namespace = "http://tempuri.org/")]
    [Table("Producto")]
    public class Producto
    {
        [Key]
        [DataMember]
        public int IdProducto { get; set; }

        [DataMember]
        public string Nombre { get; set; } = string.Empty;

        [DataMember]
        public string? Descripcion { get; set; }

        [DataMember]
        public decimal Precio { get; set; }

        [DataMember]
        public int Stock { get; set; }

        [DataMember]
        public bool Estado { get; set; }

        [DataMember]
        public int IdCategoria { get; set; }
    }
}
