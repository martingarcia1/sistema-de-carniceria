using Carniceria.Application.DTOs;
using Carniceria.Application.Interfaces;
using Carniceria.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Carniceria.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VentasController : ControllerBase
{
    private readonly IVentaService _service;
    private readonly IReciboService _recibo;

    public VentasController(IVentaService service, IReciboService recibo)
    {
        _service = service;
        _recibo = recibo;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerVentas(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] int? productoId)
        => Ok(await _service.ObtenerVentasAsync(desde, hasta, productoId));

    [HttpPost]
    public async Task<IActionResult> RegistrarVenta([FromBody] CrearVentaDto dto)
        => Ok(await _service.RegistrarVentaAsync(dto));

    [HttpPost("{id}/recibo")]
    public async Task<IActionResult> ImprimirRecibo(int id)
    {
        var recibo = await _service.ObtenerReciboAsync(id);
        await _recibo.ImprimirReciboAsync(recibo);
        return Ok(new { mensaje = "Recibo enviado a impresora" });
    }

    [HttpGet("{id}/recibo")]
    public async Task<IActionResult> ObtenerRecibo(int id)
        => Ok(await _service.ObtenerReciboAsync(id));
}
