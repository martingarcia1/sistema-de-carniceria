using Carniceria.Domain.Enums;

namespace Carniceria.Application.DTOs;

public class ProductoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public TipoProducto Tipo { get; set; }
    public decimal StockKg { get; set; }
    public bool Activo { get; set; }
}

public class CrearProductoDto
{
    public string Nombre { get; set; } = string.Empty;
    public TipoProducto Tipo { get; set; }
}

public class MercaderiaIngresoDto
{
    public int ProductoId { get; set; }
    public decimal Kg { get; set; }
    public decimal PrecioTotalCompra { get; set; }
    public string? Observacion { get; set; }
}

public class IngresoDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal Kg { get; set; }
    public decimal PrecioCostoKg { get; set; }
    public decimal PrecioTotalCompra { get; set; }
    public DateTime Fecha { get; set; }
    public string? Observacion { get; set; }
}
