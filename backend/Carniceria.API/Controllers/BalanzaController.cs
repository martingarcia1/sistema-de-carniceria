using Carniceria.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Carniceria.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BalanzaController : ControllerBase
{
    private readonly IBalanzaService _balanza;

    public BalanzaController(IBalanzaService balanza)
    {
        _balanza = balanza;
    }

    [HttpGet("estado")]
    public IActionResult Estado()
        => Ok(new { conectada = _balanza.EstaConectada });

    [HttpPost("conectar")]
    public async Task<IActionResult> Conectar([FromBody] ConectarBalanzaRequest req)
    {
        await _balanza.ConectarAsync(req.Puerto, req.BaudRate);
        return Ok(new { mensaje = $"Conectado en {req.Puerto}" });
    }

    [HttpPost("desconectar")]
    public async Task<IActionResult> Desconectar()
    {
        await _balanza.DesconectarAsync();
        return Ok(new { mensaje = "Desconectado" });
    }
}

public record ConectarBalanzaRequest(string Puerto, int BaudRate = 9600);
