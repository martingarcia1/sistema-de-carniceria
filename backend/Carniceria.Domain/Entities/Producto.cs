using Carniceria.Domain.Enums;

namespace Carniceria.Domain.Entities;

public class Producto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public TipoProducto Tipo { get; set; }
    public decimal StockKg { get; set; }
    public bool Activo { get; set; } = true;

    public ICollection<Ingreso> Ingresos { get; set; } = new List<Ingreso>();
    public ICollection<Venta> Ventas { get; set; } = new List<Venta>();
    public Receta? Receta { get; set; }
}
