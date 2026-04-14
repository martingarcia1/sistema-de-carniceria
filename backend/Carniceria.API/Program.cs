using Carniceria.Application.Interfaces;
using Carniceria.Application.Mappers;
using Carniceria.Application.Services;
using Carniceria.API.Hubs;
using Carniceria.API.Middleware;
using Carniceria.Infrastructure.Data;
using Carniceria.Infrastructure.Hardware;
using Carniceria.Infrastructure.Printing;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- Base de datos ---
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

// --- Servicios de aplicación ---
builder.Services.AddScoped<IMercaderiaService, MercaderiaService>();
builder.Services.AddScoped<IVentaService, VentaService>();
builder.Services.AddScoped<IElaboracionService, ElaboracionService>();
builder.Services.AddScoped<IMetricasService, MetricasService>();
builder.Services.AddScoped<IStockService, StockService>();

// --- Hardware ---
builder.Services.AddSingleton<IBalanzaService, BalanzaSerialService>();
builder.Services.AddHostedService<BalanzaBroadcastService>();

// --- Impresión ---
builder.Services.AddScoped<IReciboService, ReciboThermalService>();

// --- AutoMapper ---
builder.Services.AddAutoMapper(typeof(MappingProfile));

// --- SignalR ---
builder.Services.AddSignalR();

// --- Controllers + Swagger ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- CORS para React dev server ---
builder.Services.AddCors(opt =>
    opt.AddPolicy("React", p =>
        p.WithOrigins("http://localhost:5173")
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials()));

var app = builder.Build();

// --- Aplicar migraciones automáticamente al iniciar ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("React");
app.MapControllers();
app.MapHub<BalanzaHub>("/hubs/balanza");

app.Run();
