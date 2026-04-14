using Carniceria.Application.DTOs;
using Carniceria.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Carniceria.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ElaboracionController : ControllerBase
{
    private readonly IElaboracionService _service;

    public ElaboracionController(IElaboracionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerElaboraciones(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
        => Ok(await _service.ObtenerElaboracionesAsync(desde, hasta));

    [HttpPost]
    public async Task<IActionResult> RegistrarElaboracion([FromBody] CrearElaboracionDto dto)
        => Ok(await _service.RegistrarElaboracionAsync(dto));

    [HttpGet("recetas")]
    public async Task<IActionResult> ObtenerRecetas()
        => Ok(await _service.ObtenerRecetasAsync());

    [HttpPost("recetas")]
    public async Task<IActionResult> GuardarReceta([FromBody] RecetaDto dto)
        => Ok(await _service.GuardarRecetaAsync(dto));
}
