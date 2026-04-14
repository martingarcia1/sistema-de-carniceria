using Carniceria.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Carniceria.Application.Services;

public interface IAppDbContext
{
    DbSet<Producto> Productos { get; }
    DbSet<Ingreso> Ingresos { get; }
    DbSet<Venta> Ventas { get; }
    DbSet<Elaboracion> Elaboraciones { get; }
    DbSet<ElaboracionDetalle> ElaboracionDetalles { get; }
    DbSet<Receta> Recetas { get; }
    DbSet<RecetaIngrediente> RecetaIngredientes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    DatabaseFacade Database { get; }

    Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry<TEntity> Entry<TEntity>(TEntity entity)
        where TEntity : class;
}
