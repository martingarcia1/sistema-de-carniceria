using AutoMapper;
using Carniceria.Application.DTOs;
using Carniceria.Application.Interfaces;
using Carniceria.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Carniceria.Application.Services;

public interface IVentaService
{
    Task<List<VentaDto>> ObtenerVentasAsync(DateTime? desde, DateTime? hasta, int? productoId);
    Task<VentaDto> RegistrarVentaAsync(CrearVentaDto dto);
    Task<ReciboDto> ObtenerReciboAsync(int ventaId);
}

public class VentaService : IVentaService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;
    private readonly IStockService _stock;

    public VentaService(IAppDbContext db, IMapper mapper, IStockService stock)
    {
        _db = db;
        _mapper = mapper;
        _stock = stock;
    }

    public async Task<List<VentaDto>> ObtenerVentasAsync(DateTime? desde, DateTime? hasta, int? productoId)
    {
        var query = _db.Ventas.Include(v => v.Producto).AsQueryable();
        if (desde.HasValue) query = query.Where(v => v.Fecha >= desde);
        if (hasta.HasValue) query = query.Where(v => v.Fecha <= hasta);
        if (productoId.HasValue) query = query.Where(v => v.ProductoId == productoId);
        var lista = await query.OrderByDescending(v => v.Fecha).ToListAsync();
        return _mapper.Map<List<VentaDto>>(lista);
    }

    public async Task<VentaDto> RegistrarVentaAsync(CrearVentaDto dto)
    {
        var venta = _mapper.Map<Venta>(dto);
        venta.Fecha = DateTime.Now;
        _db.Ventas.Add(venta);
        await _stock.DescontarStockAsync(dto.ProductoId, dto.Kg);
        await _db.SaveChangesAsync();

        await _db.Entry(venta).Reference(v => v.Producto).LoadAsync();
        return _mapper.Map<VentaDto>(venta);
    }

    public async Task<ReciboDto> ObtenerReciboAsync(int ventaId)
    {
        var venta = await _db.Ventas.Include(v => v.Producto).FirstOrDefaultAsync(v => v.Id == ventaId)
            ?? throw new KeyNotFoundException($"Venta {ventaId} no encontrada");

        return new ReciboDto
        {
            VentaId = venta.Id,
            ProductoNombre = venta.Producto.Nombre,
            Kg = venta.Kg,
            PrecioKg = venta.PrecioVentaKg,
            Total = venta.Total,
            Fecha = venta.Fecha
        };
    }
}
