using System.Net;
using System.Text.Json;

namespace Carniceria.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (KeyNotFoundException ex)
        {
            await Responder(context, HttpStatusCode.NotFound, ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            await Responder(context, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no manejado");
            await Responder(context, HttpStatusCode.InternalServerError, "Error interno del servidor");
        }
    }

    private static Task Responder(HttpContext ctx, HttpStatusCode code, string mensaje)
    {
        ctx.Response.StatusCode = (int)code;
        ctx.Response.ContentType = "application/json";
        var body = JsonSerializer.Serialize(new { error = mensaje });
        return ctx.Response.WriteAsync(body);
    }
}
