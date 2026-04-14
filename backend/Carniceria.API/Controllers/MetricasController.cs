using Carniceria.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Carniceria.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetricasController : ControllerBase
{
    private readonly IMetricasService _service;

    public MetricasController(IMetricasService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerMetricas(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
        => Ok(await _service.ObtenerMetricasAsync(desde, hasta));
}
