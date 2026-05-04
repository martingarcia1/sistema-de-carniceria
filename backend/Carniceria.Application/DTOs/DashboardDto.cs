namespace Carniceria.Application.DTOs;

public class DashboardSummaryDto
{
    public decimal IngresosTotales { get; set; }
    public decimal CostoMercaderiaVendida { get; set; }
    public decimal GananciaNeta { get; set; }
    public decimal MargenGananciaPromedio { get; set; }
    public List<TopProductoDto> TopProductos { get; set; } = new();
}

public class TopProductoDto
{
    public int ProductoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal TotalKgVendidos { get; set; }
    public decimal TotalIngresosGenerados { get; set; }
}
