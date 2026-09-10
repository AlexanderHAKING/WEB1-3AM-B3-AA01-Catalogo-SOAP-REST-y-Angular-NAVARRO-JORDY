using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;

namespace CatalogoSuap.Modelos
{
    [DataContract(Namespace = "http://tempuri.org/")]
    [Table("Categoria")]
    public class Categoria
    {
        [Key]
        [DataMember]
        public int IdCategoria { get; set; }

        [DataMember]
        public string Nombre { get; set; } = string.Empty;

        [DataMember]
        public string? Descripcion { get; set; }

        [DataMember]
        public bool Estado { get; set; }
    }
}
