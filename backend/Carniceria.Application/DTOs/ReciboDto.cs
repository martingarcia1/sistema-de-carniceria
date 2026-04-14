namespace Carniceria.Application.DTOs;

public class ReciboDto
{
    public int VentaId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal Kg { get; set; }
    public decimal PrecioKg { get; set; }
    public decimal Total { get; set; }
    public DateTime Fecha { get; set; }
    public string NombreNegocio { get; set; } = "Carnicería";
    public string Leyenda { get; set; } = "*** NO VÁLIDO COMO FACTURA ***";
}

public class MetricasDto
{
    public decimal StockTotalKg { get; set; }
    public decimal VentasTotalesPeriodo { get; set; }
    public decimal GananciaNeta { get; set; }
    public List<GananciaPorProductoDto> GananciaPorProducto { get; set; } = new();
    public List<StockProductoDto> StockPorProducto { get; set; } = new();
}

public class GananciaPorProductoDto
{
    public string Nombre { get; set; } = string.Empty;
    public decimal PrecioPromedioVenta { get; set; }
    public decimal PrecioPromedioCosto { get; set; }
    public decimal GananciaKg { get; set; }
    public decimal TotalVendidoKg { get; set; }
}

public class StockProductoDto
{
    public int ProductoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal StockKg { get; set; }
}
