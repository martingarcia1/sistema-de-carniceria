using Carniceria.Application.Services;
using Carniceria.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Carniceria.Infrastructure.Data;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Ingreso> Ingresos => Set<Ingreso>();
    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<Elaboracion> Elaboraciones => Set<Elaboracion>();
    public DbSet<ElaboracionDetalle> ElaboracionDetalles => Set<ElaboracionDetalle>();
    public DbSet<Receta> Recetas => Set<Receta>();
    public DbSet<RecetaIngrediente> RecetaIngredientes => Set<RecetaIngrediente>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Nombre).IsRequired().HasMaxLength(100);
            e.Property(p => p.StockKg).HasPrecision(10, 3);
        });

        modelBuilder.Entity<Ingreso>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Kg).HasPrecision(10, 3);
            e.Property(i => i.PrecioCostoKg).HasPrecision(12, 2);
            e.Property(i => i.PrecioTotalCompra).HasPrecision(14, 2);
            e.HasOne(i => i.Producto).WithMany(p => p.Ingresos).HasForeignKey(i => i.ProductoId);
        });

        modelBuilder.Entity<Venta>(e =>
        {
            e.HasKey(v => v.Id);
            e.Property(v => v.Kg).HasPrecision(10, 3);
            e.Property(v => v.PrecioVentaKg).HasPrecision(12, 2);
            e.Property(v => v.Total).HasPrecision(14, 2);
            e.HasOne(v => v.Producto).WithMany(p => p.Ventas).HasForeignKey(v => v.ProductoId);
        });

        modelBuilder.Entity<Elaboracion>(e =>
        {
            e.HasKey(el => el.Id);
            e.Property(el => el.KgProducidos).HasPrecision(10, 3);
            e.HasOne(el => el.ProductoFinal).WithMany().HasForeignKey(el => el.ProductoFinalId);
        });

        modelBuilder.Entity<ElaboracionDetalle>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.KgConsumidos).HasPrecision(10, 3);
            e.HasOne(d => d.Elaboracion).WithMany(el => el.Detalles).HasForeignKey(d => d.ElaboracionId);
            e.HasOne(d => d.Insumo).WithMany().HasForeignKey(d => d.InsumoId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Receta>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.Producto).WithOne(p => p.Receta).HasForeignKey<Receta>(r => r.ProductoId);
        });

        modelBuilder.Entity<RecetaIngrediente>(e =>
        {
            e.HasKey(ri => ri.Id);
            e.Property(ri => ri.Proporcion).HasPrecision(5, 2);
            e.HasOne(ri => ri.Receta).WithMany(r => r.Ingredientes).HasForeignKey(ri => ri.RecetaId);
            e.HasOne(ri => ri.Insumo).WithMany().HasForeignKey(ri => ri.InsumoId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
