using Carniceria.Application.DTOs;
using Carniceria.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Carniceria.Application.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> ObtenerResumenAsync(string rango);
}

public class DashboardService : IDashboardService
{
    private readonly IAppDbContext _db;

    public DashboardService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardSummaryDto> ObtenerResumenAsync(string rango)
    {
        var fechaInicio = DateTime.Today;
        
        if (rango == "semana") fechaInicio = DateTime.Today.AddDays(-7);
        else if (rango == "mes") fechaInicio = DateTime.Today.AddDays(-30);
        else if (rango == "ano") fechaInicio = DateTime.Today.AddDays(-365);
        else fechaInicio = DateTime.Today;

        var ventas = await _db.Ventas
            .Include(v => v.Producto)
            .Where(v => v.Fecha >= fechaInicio)
            .ToListAsync();

        var ingresosTotales = ventas.Sum(v => v.Total);
        var costoMercaderiaVendida = ventas.Sum(v => v.Kg * v.PrecioCostoKg);
        var gananciaNeta = ingresosTotales - costoMercaderiaVendida;
        var margen = ingresosTotales > 0 ? (gananciaNeta / ingresosTotales) * 100 : 0;

        var topProductos = ventas
            .GroupBy(v => v.ProductoId)
            .Select(g => new TopProductoDto
            {
                ProductoId = g.Key,
                Nombre = g.First().Producto.Nombre,
                TotalKgVendidos = g.Sum(x => x.Kg),
                TotalIngresosGenerados = g.Sum(x => x.Total)
            })
            .OrderByDescending(x => x.TotalKgVendidos)
            .Take(5)
            .ToList();

        return new DashboardSummaryDto
        {
            IngresosTotales = ingresosTotales,
            CostoMercaderiaVendida = costoMercaderiaVendida,
            GananciaNeta = gananciaNeta,
            MargenGananciaPromedio = margen,
            TopProductos = topProductos
        };
    }
}
