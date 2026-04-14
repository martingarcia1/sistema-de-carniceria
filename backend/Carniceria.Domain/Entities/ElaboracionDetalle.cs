namespace Carniceria.Domain.Entities;

public class ElaboracionDetalle
{
    public int Id { get; set; }
    public int ElaboracionId { get; set; }
    public int InsumoId { get; set; }
    public decimal KgConsumidos { get; set; }

    public Elaboracion Elaboracion { get; set; } = null!;
    public Producto Insumo { get; set; } = null!;
}
