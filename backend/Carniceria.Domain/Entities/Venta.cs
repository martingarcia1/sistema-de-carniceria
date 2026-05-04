namespace Carniceria.Domain.Entities;

public class Venta
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public decimal Kg { get; set; }
    public decimal PrecioCostoKg { get; set; }
    public decimal PrecioVentaKg { get; set; }
    public decimal Total { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string? Observacion { get; set; }

    public Producto Producto { get; set; } = null!;
}
