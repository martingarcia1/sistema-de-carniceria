using Carniceria.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Carniceria.Application.Services;

public interface IMetricasService
{
    Task<MetricasDto> ObtenerMetricasAsync(DateTime? desde, DateTime? hasta);
}

public class MetricasService : IMetricasService
{
    private readonly IAppDbContext _db;

    public MetricasService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<MetricasDto> ObtenerMetricasAsync(DateTime? desde, DateTime? hasta)
    {
        desde ??= DateTime.Today.AddMonths(-1);
        hasta ??= DateTime.Now;

        var ventas = await _db.Ventas
            .Include(v => v.Producto)
            .Where(v => v.Fecha >= desde && v.Fecha <= hasta)
            .ToListAsync();

        var ingresos = await _db.Ingresos
            .Where(i => i.Fecha >= desde && i.Fecha <= hasta)
            .ToListAsync();

        var productos = await _db.Productos.Where(p => p.Activo).ToListAsync();

        var totalVentas = ventas.Sum(v => v.Total);
        var totalCosto = ingresos.Sum(i => i.PrecioTotalCompra);

        var gananciaPorProducto = ventas
            .GroupBy(v => v.Producto)
            .Select(g =>
            {
                var ingresosProd = ingresos.Where(i => i.ProductoId == g.Key.Id).ToList();
                var costoPromedio = ingresosProd.Any()
                    ? ingresosProd.Average(i => i.PrecioCostoKg)
                    : 0;
                var precioVentaProm = g.Average(v => v.PrecioVentaKg);
                return new GananciaPorProductoDto
                {
                    Nombre = g.Key.Nombre,
                    PrecioPromedioVenta = precioVentaProm,
                    PrecioPromedioCosto = costoPromedio,
                    GananciaKg = precioVentaProm - costoPromedio,
                    TotalVendidoKg = g.Sum(v => v.Kg)
                };
            }).ToList();

        var stock = productos.Select(p => new StockProductoDto
        {
            ProductoId = p.Id,
            Nombre = p.Nombre,
            StockKg = p.StockKg
        }).ToList();

        return new MetricasDto
        {
            StockTotalKg = productos.Sum(p => p.StockKg),
            VentasTotalesPeriodo = totalVentas,
            GananciaNeta = totalVentas - totalCosto,
            GananciaPorProducto = gananciaPorProducto,
            StockPorProducto = stock
        };
    }
}
