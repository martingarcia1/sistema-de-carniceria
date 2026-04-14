namespace Carniceria.Domain.Entities;

public class Elaboracion
{
    public int Id { get; set; }
    public int ProductoFinalId { get; set; }
    public decimal KgProducidos { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string? Observacion { get; set; }

    public Producto ProductoFinal { get; set; } = null!;
    public ICollection<ElaboracionDetalle> Detalles { get; set; } = new List<ElaboracionDetalle>();
}
