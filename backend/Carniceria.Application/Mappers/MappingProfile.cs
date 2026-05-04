using AutoMapper;
using Carniceria.Application.DTOs;
using Carniceria.Domain.Entities;

namespace Carniceria.Application.Mappers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Producto, ProductoDto>();
        CreateMap<CrearProductoDto, Producto>();

        CreateMap<Ingreso, IngresoDto>()
            .ForMember(d => d.ProductoNombre, o => o.MapFrom(s => s.Producto.Nombre));

        CreateMap<Venta, VentaDto>()
            .ForMember(d => d.ProductoNombre, o => o.MapFrom(s => s.Producto.Nombre))
            .ForMember(d => d.MetodoPagoDescripcion, o => o.MapFrom(s => s.MetodoPago.ToString()));

        CreateMap<CrearVentaDto, Venta>()
            .ForMember(d => d.Total, o => o.MapFrom(s => s.Kg * s.PrecioVentaKg));

        CreateMap<Elaboracion, ElaboracionDto>()
            .ForMember(d => d.ProductoFinalNombre, o => o.MapFrom(s => s.ProductoFinal.Nombre))
            .ForMember(d => d.Detalles, o => o.MapFrom(s => s.Detalles));

        CreateMap<ElaboracionDetalle, DetalleElaboracionDto>();

        CreateMap<Receta, RecetaDto>()
            .ForMember(d => d.ProductoNombre, o => o.MapFrom(s => s.Producto.Nombre))
            .ForMember(d => d.Ingredientes, o => o.MapFrom(s => s.Ingredientes));

        CreateMap<RecetaIngrediente, RecetaIngredienteDto>()
            .ForMember(d => d.InsumoNombre, o => o.MapFrom(s => s.Insumo.Nombre));
    }
}
