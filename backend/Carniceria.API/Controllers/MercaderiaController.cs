using Carniceria.Application.DTOs;
using Carniceria.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Carniceria.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MercaderiaController : ControllerBase
{
    private readonly IMercaderiaService _service;

    public MercaderiaController(IMercaderiaService service)
    {
        _service = service;
    }

    [HttpGet("productos")]
    public async Task<IActionResult> ObtenerProductos()
        => Ok(await _service.ObtenerProductosAsync());

    [HttpPost("productos")]
    public async Task<IActionResult> CrearProducto([FromBody] CrearProductoDto dto)
        => Ok(await _service.CrearProductoAsync(dto));

    [HttpGet("ingresos")]
    public async Task<IActionResult> ObtenerIngresos(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
        => Ok(await _service.ObtenerIngresosAsync(desde, hasta));

    [HttpPost("ingresos")]
    public async Task<IActionResult> RegistrarIngreso([FromBody] MercaderiaIngresoDto dto)
        => Ok(await _service.RegistrarIngresoAsync(dto));
}
