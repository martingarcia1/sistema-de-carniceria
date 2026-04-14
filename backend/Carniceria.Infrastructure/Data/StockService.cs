using Carniceria.Application.Interfaces;
using Carniceria.Application.Services;
using Microsoft.EntityFrameworkCore;

namespace Carniceria.Infrastructure.Data;

public class StockService : IStockService
{
    private readonly IAppDbContext _db;

    public StockService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<decimal> ObtenerStockAsync(int productoId)
    {
        var producto = await _db.Productos.FindAsync(productoId);
        return producto?.StockKg ?? 0;
    }

    public async Task DescontarStockAsync(int productoId, decimal kg)
    {
        var producto = await _db.Productos.FindAsync(productoId)
            ?? throw new KeyNotFoundException($"Producto {productoId} no encontrado");

        if (producto.StockKg < kg)
            throw new InvalidOperationException($"Stock insuficiente de '{producto.Nombre}'. Disponible: {producto.StockKg:F3} kg");

        producto.StockKg -= kg;
        await _db.SaveChangesAsync();
    }

    public async Task AgregarStockAsync(int productoId, decimal kg)
    {
        var producto = await _db.Productos.FindAsync(productoId)
            ?? throw new KeyNotFoundException($"Producto {productoId} no encontrado");

        producto.StockKg += kg;
        await _db.SaveChangesAsync();
    }
}
