namespace Carniceria.Domain.Entities;

public class Receta
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string Descripcion { get; set; } = string.Empty;

    public Producto Producto { get; set; } = null!;
    public ICollection<RecetaIngrediente> Ingredientes { get; set; } = new List<RecetaIngrediente>();
}
