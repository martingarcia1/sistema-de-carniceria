using Carniceria.Application.DTOs;
using Carniceria.Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.IO.Ports;
using System.Text;

namespace Carniceria.Infrastructure.Printing;

public class ReciboThermalService : IReciboService
{
    private readonly ILogger<ReciboThermalService> _logger;

    // Comandos ESC/POS
    private static readonly byte[] ESC_INIT        = { 0x1B, 0x40 };
    private static readonly byte[] CENTER           = { 0x1B, 0x61, 0x01 };
    private static readonly byte[] LEFT             = { 0x1B, 0x61, 0x00 };
    private static readonly byte[] BOLD_ON          = { 0x1B, 0x45, 0x01 };
    private static readonly byte[] BOLD_OFF         = { 0x1B, 0x45, 0x00 };
    private static readonly byte[] DOUBLE_SIZE_ON   = { 0x1D, 0x21, 0x11 };
    private static readonly byte[] DOUBLE_SIZE_OFF  = { 0x1D, 0x21, 0x00 };
    private static readonly byte[] FEED_CUT         = { 0x1B, 0x64, 0x04, 0x1D, 0x56, 0x42, 0x00 };

    public ReciboThermalService(ILogger<ReciboThermalService> logger)
    {
        _logger = logger;
    }

    public async Task ImprimirReciboAsync(ReciboDto recibo)
    {
        // Detectar primer puerto serie disponible con impresora térmica
        // En producción se puede configurar en appsettings
        var nombreImpresora = ObtenerNombreImpresora();

        await Task.Run(() =>
        {
            using var stream = AbrirStream(nombreImpresora);
            var contenido = GenerarContenidoEscPos(recibo);
            stream.Write(contenido, 0, contenido.Length);
            stream.Flush();
        });

        _logger.LogInformation("Recibo impreso para venta {VentaId}", recibo.VentaId);
    }

    private byte[] GenerarContenidoEscPos(ReciboDto r)
    {
        var buf = new List<byte>();
        var enc = Encoding.GetEncoding("ISO-8859-1");

        void Cmd(byte[] cmd) => buf.AddRange(cmd);
        void Texto(string s) => buf.AddRange(enc.GetBytes(s));
        void Linea(string s = "") { Texto(s); buf.Add(0x0A); }

        Cmd(ESC_INIT);
        Cmd(CENTER);
        Cmd(DOUBLE_SIZE_ON);
        Linea(r.NombreNegocio);
        Cmd(DOUBLE_SIZE_OFF);
        Linea(r.Leyenda);
        Linea();
        Cmd(LEFT);
        Linea($"Fecha : {r.Fecha:dd/MM/yyyy HH:mm}");
        Linea($"N° Venta: {r.VentaId}");
        Linea(new string('-', 32));
        Cmd(BOLD_ON);
        Linea($"Producto: {r.ProductoNombre}");
        Linea($"Peso    : {r.Kg:F3} kg");
        Linea($"Precio  : $ {r.PrecioKg:N2} / kg");
        Linea(new string('-', 32));
        Cmd(DOUBLE_SIZE_ON);
        Linea($"TOTAL: $ {r.Total:N2}");
        Cmd(DOUBLE_SIZE_OFF);
        Cmd(BOLD_OFF);
        Linea();
        Cmd(CENTER);
        Linea("Gracias por su compra!");
        Linea();
        Cmd(FEED_CUT);

        return buf.ToArray();
    }

    private static string ObtenerNombreImpresora()
    {
        // Para impresoras térmicas USB que exponen puerto serie virtual
        // o conectadas directamente por RS-232
        return "LPT1"; // configurable en appsettings
    }

    private static Stream AbrirStream(string destino)
    {
        if (destino.StartsWith("COM", StringComparison.OrdinalIgnoreCase))
        {
            var port = new SerialPort(destino, 9600);
            port.Open();
            return port.BaseStream;
        }
        // LPT o nombre de impresora compartida en red
        return new FileStream(destino, FileMode.Open, FileAccess.Write, FileShare.ReadWrite);
    }
}
