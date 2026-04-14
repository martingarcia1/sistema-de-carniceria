namespace Carniceria.Infrastructure.Hardware;

public class BalanzaConfig
{
    public string Puerto { get; set; } = "COM1";
    public int BaudRate { get; set; } = 9600;
    public int DataBits { get; set; } = 8;
    public string Paridad { get; set; } = "None";
    public string BitStop { get; set; } = "One";
}
