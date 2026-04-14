using Carniceria.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace Carniceria.API.Hubs;

public class BalanzaHub : Hub
{
    // El cliente se suscribe a "PesoActualizado"
    // El servidor emite desde BalanzaBroadcastService
}

/// <summary>
/// Servicio background que escucha la balanza y hace broadcast por SignalR
/// </summary>
public class BalanzaBroadcastService : BackgroundService
{
    private readonly IBalanzaService _balanza;
    private readonly IHubContext<BalanzaHub> _hub;

    public BalanzaBroadcastService(IBalanzaService balanza, IHubContext<BalanzaHub> hub)
    {
        _balanza = balanza;
        _hub = hub;
        _balanza.PesoRecibido += OnPesoRecibido;
    }

    private void OnPesoRecibido(object? sender, decimal peso)
    {
        _ = _hub.Clients.All.SendAsync("PesoActualizado", peso);
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken) => Task.CompletedTask;

    public override void Dispose()
    {
        _balanza.PesoRecibido -= OnPesoRecibido;
        base.Dispose();
    }
}
