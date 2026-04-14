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
    Task<List<ProductoDto>> ObtenerProductosAsync();
    Task<ProductoDto> CrearProductoAsync(CrearProductoDto dto);
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

    public async Task<List<ProductoDto>> ObtenerProductosAsync()
    {
        var lista = await _db.Productos.Where(p => p.Activo).ToListAsync();
        return _mapper.Map<List<ProductoDto>>(lista);
    }

    public async Task<ProductoDto> CrearProductoAsync(CrearProductoDto dto)
    {
        var producto = _mapper.Map<Producto>(dto);
        _db.Productos.Add(producto);
        await _db.SaveChangesAsync();
        return _mapper.Map<ProductoDto>(producto);
    }
}
