using AutoMapper;
using Carniceria.Application.DTOs;
using Carniceria.Application.Interfaces;
using Carniceria.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Carniceria.Application.Services;

public interface IElaboracionService
{
    Task<List<ElaboracionDto>> ObtenerElaboracionesAsync(DateTime? desde, DateTime? hasta);
    Task<ElaboracionDto> RegistrarElaboracionAsync(CrearElaboracionDto dto);
    Task<List<RecetaDto>> ObtenerRecetasAsync();
    Task<RecetaDto> GuardarRecetaAsync(RecetaDto dto);
}

public class ElaboracionService : IElaboracionService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;
    private readonly IStockService _stock;

    public ElaboracionService(IAppDbContext db, IMapper mapper, IStockService stock)
    {
        _db = db;
        _mapper = mapper;
        _stock = stock;
    }

    public async Task<List<ElaboracionDto>> ObtenerElaboracionesAsync(DateTime? desde, DateTime? hasta)
    {
        var query = _db.Elaboraciones
            .Include(e => e.ProductoFinal)
            .Include(e => e.Detalles)
            .AsQueryable();
        if (desde.HasValue) query = query.Where(e => e.Fecha >= desde);
        if (hasta.HasValue) query = query.Where(e => e.Fecha <= hasta);
        var lista = await query.OrderByDescending(e => e.Fecha).ToListAsync();
        return _mapper.Map<List<ElaboracionDto>>(lista);
    }

    public async Task<ElaboracionDto> RegistrarElaboracionAsync(CrearElaboracionDto dto)
    {
        var elaboracion = new Elaboracion
        {
            ProductoFinalId = dto.ProductoFinalId,
            KgProducidos = dto.KgProducidos,
            Observacion = dto.Observacion,
            Fecha = DateTime.Now
        };

        foreach (var detalle in dto.Detalles)
        {
            elaboracion.Detalles.Add(new ElaboracionDetalle
            {
                InsumoId = detalle.InsumoId,
                KgConsumidos = detalle.KgConsumidos
            });
            await _stock.DescontarStockAsync(detalle.InsumoId, detalle.KgConsumidos);
        }

        await _stock.AgregarStockAsync(dto.ProductoFinalId, dto.KgProducidos);
        _db.Elaboraciones.Add(elaboracion);
        await _db.SaveChangesAsync();

        await _db.Entry(elaboracion).Reference(e => e.ProductoFinal).LoadAsync();
        return _mapper.Map<ElaboracionDto>(elaboracion);
    }

    public async Task<List<RecetaDto>> ObtenerRecetasAsync()
    {
        var lista = await _db.Recetas
            .Include(r => r.Producto)
            .Include(r => r.Ingredientes).ThenInclude(i => i.Insumo)
            .ToListAsync();
        return _mapper.Map<List<RecetaDto>>(lista);
    }

    public async Task<RecetaDto> GuardarRecetaAsync(RecetaDto dto)
    {
        var receta = await _db.Recetas
            .Include(r => r.Ingredientes)
            .FirstOrDefaultAsync(r => r.ProductoId == dto.ProductoId);

        if (receta is null)
        {
            receta = new Receta { ProductoId = dto.ProductoId, Descripcion = dto.Descripcion };
            _db.Recetas.Add(receta);
        }
        else
        {
            receta.Descripcion = dto.Descripcion;
            receta.Ingredientes.Clear();
        }

        foreach (var ing in dto.Ingredientes)
        {
            receta.Ingredientes.Add(new RecetaIngrediente
            {
                InsumoId = ing.InsumoId,
                Proporcion = ing.Proporcion
            });
        }

        await _db.SaveChangesAsync();

        await _db.Entry(receta).Reference(r => r.Producto).LoadAsync();
        foreach (var ing in receta.Ingredientes)
            await _db.Entry(ing).Reference(i => i.Insumo).LoadAsync();

        return _mapper.Map<RecetaDto>(receta);
    }
}
