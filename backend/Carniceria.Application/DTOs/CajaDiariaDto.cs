namespace Carniceria.Application.DTOs;

public class CajaDiariaDto
{
    public DateTime FechaConsulta { get; set; }
    public decimal TotalEfectivo { get; set; }
    public decimal TotalTarjeta { get; set; }
    public decimal TotalMercadoPago { get; set; }
    public decimal TotalTransferencia { get; set; }
    public decimal TotalGeneral { get; set; }
}
