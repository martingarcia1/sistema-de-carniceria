namespace Carniceria.Application.DTOs;

public class CrearElaboracionDto
{
    public int ProductoFinalId { get; set; }
    public decimal KgProducidos { get; set; }
    public string? Observacion { get; set; }
    public List<DetalleElaboracionDto> Detalles { get; set; } = new();
}

public class DetalleElaboracionDto
{
    public int InsumoId { get; set; }
    public decimal KgConsumidos { get; set; }
}

public class ElaboracionDto
{
    public int Id { get; set; }
    public int ProductoFinalId { get; set; }
    public string ProductoFinalNombre { get; set; } = string.Empty;
    public decimal KgProducidos { get; set; }
    public DateTime Fecha { get; set; }
    public string? Observacion { get; set; }
    public List<DetalleElaboracionDto> Detalles { get; set; } = new();
}

public class RecetaDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public List<RecetaIngredienteDto> Ingredientes { get; set; } = new();
}

public class RecetaIngredienteDto
{
    public int InsumoId { get; set; }
    public string InsumoNombre { get; set; } = string.Empty;
    public decimal Proporcion { get; set; }
}
