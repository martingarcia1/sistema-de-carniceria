namespace Carniceria.Application.DTOs;

public class CrearVentaDto
{
    public int ProductoId { get; set; }
    public decimal Kg { get; set; }
    public decimal PrecioVentaKg { get; set; }
    public string? Observacion { get; set; }
    public int MetodoPago { get; set; } = 1;
}

public class VentaDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal Kg { get; set; }
    public decimal PrecioVentaKg { get; set; }
    public decimal Total { get; set; }
    public DateTime Fecha { get; set; }
    public string? Observacion { get; set; }
    public string MetodoPagoDescripcion { get; set; } = string.Empty;
}
