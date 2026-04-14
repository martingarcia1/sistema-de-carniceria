namespace Carniceria.Domain.Entities;

public class RecetaIngrediente
{
    public int Id { get; set; }
    public int RecetaId { get; set; }
    public int InsumoId { get; set; }
    public decimal Proporcion { get; set; } // porcentaje sobre el total producido

    public Receta Receta { get; set; } = null!;
    public Producto Insumo { get; set; } = null!;
}
