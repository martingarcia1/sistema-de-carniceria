namespace Carniceria.Application.Interfaces;

public interface IBalanzaService
{
    bool EstaConectada { get; }
    Task ConectarAsync(string puerto, int baudRate = 9600);
    Task DesconectarAsync();
    event EventHandler<decimal> PesoRecibido;
}
