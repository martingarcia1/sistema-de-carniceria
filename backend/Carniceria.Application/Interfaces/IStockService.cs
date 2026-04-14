namespace Carniceria.Application.Interfaces;

public interface IStockService
{
    Task<decimal> ObtenerStockAsync(int productoId);
    Task DescontarStockAsync(int productoId, decimal kg);
    Task AgregarStockAsync(int productoId, decimal kg);
}
