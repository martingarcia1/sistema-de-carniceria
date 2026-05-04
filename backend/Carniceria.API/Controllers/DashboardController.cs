using Carniceria.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Carniceria.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> ObtenerResumen([FromQuery] string rango = "hoy")
    {
        var resultado = await _service.ObtenerResumenAsync(rango);
        return Ok(resultado);
    }
}
