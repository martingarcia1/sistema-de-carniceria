using Carniceria.Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.IO.Ports;
using System.Text.RegularExpressions;

namespace Carniceria.Infrastructure.Hardware;

public class BalanzaSerialService : IBalanzaService, IDisposable
{
    private SerialPort? _port;
    private readonly ILogger<BalanzaSerialService> _logger;
    private readonly object _lock = new();

    public bool EstaConectada => _port?.IsOpen ?? false;
    public event EventHandler<decimal>? PesoRecibido;

    public BalanzaSerialService(ILogger<BalanzaSerialService> logger)
    {
        _logger = logger;
    }

    public Task ConectarAsync(string puerto, int baudRate = 9600)
    {
        lock (_lock)
        {
            if (_port?.IsOpen == true) return Task.CompletedTask;

            _port = new SerialPort(puerto, baudRate)
            {
                DataBits = 8,
                Parity = Parity.None,
                StopBits = StopBits.One,
                ReadTimeout = 500,
                NewLine = "\r\n"
            };

            _port.DataReceived += OnDataReceived;
            _port.Open();
            _logger.LogInformation("Balanza conectada en {Puerto} @ {BaudRate}", puerto, baudRate);
        }
        return Task.CompletedTask;
    }

    public Task DesconectarAsync()
    {
        lock (_lock)
        {
            if (_port?.IsOpen == true)
            {
                _port.DataReceived -= OnDataReceived;
                _port.Close();
                _logger.LogInformation("Balanza desconectada");
            }
        }
        return Task.CompletedTask;
    }

    private void OnDataReceived(object sender, SerialDataReceivedEventArgs e)
    {
        try
        {
            var linea = _port!.ReadLine().Trim();
            // La mayoría de balanzas envían algo como: "   0.350 kg" o "ST,GS,+   350g"
            // Extraemos el primer número decimal de la trama
            var match = Regex.Match(linea, @"[\+\-]?\s*(\d+[\.,]\d+)");
            if (match.Success)
            {
                var valorStr = match.Groups[1].Value.Replace(',', '.');
                if (decimal.TryParse(valorStr, System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var peso))
                {
                    // Si la balanza devuelve gramos, convertir a kg
                    if (linea.Contains('g') && !linea.Contains("kg", StringComparison.OrdinalIgnoreCase))
                        peso /= 1000m;

                    PesoRecibido?.Invoke(this, peso);
                }
            }
        }
        catch (TimeoutException) { }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error leyendo trama de balanza");
        }
    }

    public void Dispose()
    {
        _port?.Dispose();
    }
}
