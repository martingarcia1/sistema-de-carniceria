using AutoMapper;
using Carniceria.Application.DTOs;
using Carniceria.Application.Interfaces;
using Carniceria.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Carniceria.Application.Services;

public interface IMercaderiaService
{
    Task<List<IngresoDto>> ObtenerIngresosAsync(DateTime? desde, DateTime? hasta);
    Task<IngresoDto> RegistrarIngresoAsync(MercaderiaIngresoDto dto);
    Task<List<IngresoDto>> RegistrarIngresoLoteAsync(List<MercaderiaIngresoDto> dtos);
    Task<List<ProductoDto>> ObtenerProductosAsync();
    Task<ProductoDto> CrearProductoAsync(CrearProductoDto dto);
    Task RegistrarDesposteAsync(DesposteRequestDto dto);
    Task SeedCortesDesposteAsync();
}

public class MercaderiaService : IMercaderiaService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;
    private readonly IStockService _stock;

    public MercaderiaService(IAppDbContext db, IMapper mapper, IStockService stock)
    {
        _db = db;
        _mapper = mapper;
        _stock = stock;
    }

    public async Task<List<IngresoDto>> ObtenerIngresosAsync(DateTime? desde, DateTime? hasta)
    {
        var query = _db.Ingresos.Include(i => i.Producto).AsQueryable();
        if (desde.HasValue) query = query.Where(i => i.Fecha >= desde);
        if (hasta.HasValue) query = query.Where(i => i.Fecha <= hasta);
        var lista = await query.OrderByDescending(i => i.Fecha).ToListAsync();
        return _mapper.Map<List<IngresoDto>>(lista);
    }

    public async Task<IngresoDto> RegistrarIngresoAsync(MercaderiaIngresoDto dto)
    {
        var ingreso = new Ingreso
        {
            ProductoId = dto.ProductoId,
            Kg = dto.Kg,
            PrecioTotalCompra = dto.PrecioTotalCompra,
            PrecioCostoKg = dto.Kg > 0 ? dto.PrecioTotalCompra / dto.Kg : 0,
            Observacion = dto.Observacion,
            Fecha = DateTime.Now
        };
        _db.Ingresos.Add(ingreso);
        await _stock.AgregarStockAsync(dto.ProductoId, dto.Kg);
        await _db.SaveChangesAsync();

        await _db.Entry(ingreso).Reference(i => i.Producto).LoadAsync();
        return _mapper.Map<IngresoDto>(ingreso);
    }

    public async Task<List<IngresoDto>> RegistrarIngresoLoteAsync(List<MercaderiaIngresoDto> dtos)
    {
        var ingresos = new List<Ingreso>();
        foreach(var dto in dtos)
        {
            var ingreso = new Ingreso
            {
                ProductoId = dto.ProductoId,
                Kg = dto.Kg,
                PrecioTotalCompra = dto.PrecioTotalCompra,
                PrecioCostoKg = dto.Kg > 0 ? dto.PrecioTotalCompra / dto.Kg : 0,
                Observacion = dto.Observacion,
                Fecha = DateTime.Now
            };
            _db.Ingresos.Add(ingreso);
            await _stock.AgregarStockAsync(dto.ProductoId, dto.Kg);

            if (dto.PrecioVentaKg.HasValue && dto.PrecioVentaKg.Value > 0)
            {
                var p = await _db.Productos.FindAsync(dto.ProductoId);
                if (p != null) p.PrecioVentaKg = dto.PrecioVentaKg.Value;
            }

            ingresos.Add(ingreso);
        }
        await _db.SaveChangesAsync();

        foreach(var i in ingresos) 
        { 
            await _db.Entry(i).Reference(x => x.Producto).LoadAsync(); 
        }
        return _mapper.Map<List<IngresoDto>>(ingresos);
    }

    public async Task<List<ProductoDto>> ObtenerProductosAsync()
    {
        var lista = await _db.Productos.Where(p => p.Activo).ToListAsync();
        return _mapper.Map<List<ProductoDto>>(lista);
    }

    public async Task<ProductoDto> CrearProductoAsync(CrearProductoDto dto)
    {
        var producto = _mapper.Map<Producto>(dto);
        _db.Productos.Add(producto);
        if(dto.PrecioVentaKg.HasValue && dto.PrecioVentaKg.Value > 0)
        {
            producto.PrecioVentaKg = dto.PrecioVentaKg.Value;
        }

        await _db.SaveChangesAsync();

        return _mapper.Map<ProductoDto>(producto);
    }

    public async Task RegistrarDesposteAsync(DesposteRequestDto dto)
    {
        var costoPorKg = dto.PesoTotalMediaRes > 0 ? dto.CostoTotal / dto.PesoTotalMediaRes : 0;
        
        foreach (var corte in dto.Cortes)
        {
            var costoCorte = corte.KgCalculado * costoPorKg;
            var ingreso = new Ingreso
            {
                ProductoId = corte.ProductoId,
                Kg = corte.KgCalculado,
                PrecioTotalCompra = costoCorte,
                PrecioCostoKg = costoPorKg,
                Observacion = dto.Observacion ?? "Desposte Automático",
                Fecha = DateTime.Now
            };
            _db.Ingresos.Add(ingreso);
            await _stock.AgregarStockAsync(corte.ProductoId, corte.KgCalculado);
        }
        await _db.SaveChangesAsync();
    }

    public async Task SeedCortesDesposteAsync()
    {
        // 1. Cortes de Media Res (MateriaPrima)
        await SeedCategory(new[] { "Tortuguita", "Cuadrada", "Picana", "Peceto", "Bola de lomo", "Filet", "Nalga", 
            "Tapa de nalga", "Verija", "Punta de verija", "Osobuco", "Costeleta chata", "Vacio", 
            "Matambre", "Jamon de paleta", "Paleta chata", "Paleta royiza", "Entraña", 
            "Tapa de asado", "Poncho", "Alita", "Costeletas royiza", "Falda parrillera", 
            "Costilla palomita", "Costilla especial", "Primo", "Molida", "Punta de lomo", 
            "Puchero comun", "Hueso", "Grasa", "Desperdicio Faena" }, Carniceria.Domain.Enums.TipoProducto.MateriaPrima);

        // 2. Achuras
        await SeedCategory(new[] { "Corazón", "Molleja", "Mondongo", "Riñon", "Chinchulin", "Higado", 
            "Lengua", "Bofe", "Pajarilla", "Cuajo", "Ubre", "Colita / Rabo" }, Carniceria.Domain.Enums.TipoProducto.Achura);

        // 3. Pollo Variedad
        await SeedCategory(new[] { "Pata muslo", "Pollo Entero", "File de pollo", "Alita de Pollo", 
            "Carcaza", "Suprema", "Pollo Molido", "Pechuga", "Muslo", "Patita" }, Carniceria.Domain.Enums.TipoProducto.Pollo);

        // 4. Cerdo Variedad
        await SeedCategory(new[] { "Costilla de Cerdo", "Costeletas de Cerdo", "Bondiola", "Matambre de Cerdo", 
            "Vacio de Cerdo", "Pierna de Cerdo", "Paleta de Cerdo", "Cuerito", "Patita de Cerdo", 
            "Grasa de Cerdo", "Codito", "Bondiola sin hueso", "Carne de Cerdo sin hueso", "Solomillo", 
            "Huesito", "Cabeza de Cerdo" }, Carniceria.Domain.Enums.TipoProducto.Cerdo);

        // 5. Congelados
        await SeedCategory(new[] { "Hamburguesa de carne (Congelado)", "Hamburguesa de pollo (Congelado)", 
            "Rebozados Tradicional", "Rebozados de Jamon y queso", "Rebozados Tradicional Patita", 
            "Rebozados Jamon y queso Patita", "Rebozados Medallon de merluza", "Milanesa de soja", 
            "File de merluza", "File de atun" }, Carniceria.Domain.Enums.TipoProducto.Congelado);

        // 6. Embutidos
        await SeedCategory(new[] { "Chorizo Parrillero", "Chorizo Criollo", "Salchicha", "Morcilla" }, Carniceria.Domain.Enums.TipoProducto.Embutido);

        // 7. Elaboración Propia
        await SeedCategory(new[] { "Kipe", "Milanesa de carne", "Milanesa de pollo (Suprema)", "Milanesa de cerdo", 
            "Hamburguesa Fresca", "Hamburguesa Fresca Pollo", "Huevos" }, Carniceria.Domain.Enums.TipoProducto.Elaboracion);
    }

    private async Task SeedCategory(string[] nombres, Carniceria.Domain.Enums.TipoProducto tipo)
    {
        foreach(var nombre in nombres)
        {
            var exists = await _db.Productos.AnyAsync(p => p.Nombre.ToLower() == nombre.ToLower());
            if(!exists)
            {
                _db.Productos.Add(new Producto { Nombre = nombre, Tipo = tipo, Activo = true });
            }
        }
        await _db.SaveChangesAsync();
    }
}
