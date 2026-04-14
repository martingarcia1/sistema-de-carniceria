using Carniceria.Application.DTOs;

namespace Carniceria.Application.Interfaces;

public interface IReciboService
{
    Task ImprimirReciboAsync(ReciboDto recibo);
}
