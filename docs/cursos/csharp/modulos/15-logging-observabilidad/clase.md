---
sidebar_label: "Clase"
---

## 1. Logging con ILogger

```csharp
using Microsoft.Extensions.Logging;

public class ProcesadorPedidos
{
    private readonly ILogger<ProcesadorPedidos> _logger;

    public ProcesadorPedidos(ILogger<ProcesadorPedidos> logger)
    {
        _logger = logger;
    }

    public async Task ProcesarAsync(Pedido pedido)
    {
        _logger.LogInformation("Procesando pedido para {Cliente}", pedido.Cliente);

        try
        {
            // logica...
            _logger.LogDebug("Items en pedido: {Count}", pedido.Items.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando pedido {Cliente}", pedido.Cliente);
            throw;
        }
    }
}
```

### Niveles de Log

| Nivel | Metodo | Uso |
|-------|--------|-----|
| Trace | `LogTrace` | Diagnostico detallado, solo desarrollo |
| Debug | `LogDebug` | Informacion de depuracion |
| Information | `LogInformation` | Flujo normal del negocio |
| Warning | `LogWarning` | Situacion inesperada no critica |
| Error | `LogError` | Error recuperable |
| Critical | `LogCritical` | Error grave, sistema puede caer |

---

## 2. Estructuracion de Logs (Structured Logging)

Los logs estructurados permiten busquedas y filtros en herramientas como Seq, Elasticsearch o Application Insights.

```csharp
// MAL: interpolacion (pierde estructura)
_logger.LogInformation($"Procesando pedido {pedido.Cliente}");

// BIEN: template con placeholders (preserva estructura)
_logger.LogInformation("Procesando pedido {Cliente} con {Total:C}", pedido.Cliente, pedido.Total);
```

### Serilog (logging estructurado avanzado)

```csharp
using Serilog;

// Configuracion
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/tienda-.log", rollingInterval: RollingInterval.Day)
    .WriteTo.Seq("http://localhost:5341")   // servidor de logs estructurados
    .Enrich.WithProperty("Aplicacion", "Tienda")
    .Enrich.WithEnvironmentName()
    .CreateLogger();

// Usar Serilog como provedor de .NET
var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();
```

---

## 3. App Insights / OpenTelemetry

```csharp
// OpenTelemetry (estandar abierto de observabilidad)
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using OpenTelemetry.Logs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithTracing(tracer =>
    {
        tracer.AddAspNetCoreInstrumentation();
        tracer.AddHttpClientInstrumentation();
        tracer.AddConsoleExporter();
        tracer.AddOtlpExporter();  // para Jaeger, Zipkin, Azure Monitor
    })
    .WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation();
        metrics.AddRuntimeInstrumentation();
        metrics.AddConsoleExporter();
    });
```

---

## 4. Correlation IDs

```csharp
// Middleware para correlation ID
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers["X-Correlation-Id"].FirstOrDefault()
                          ?? Guid.NewGuid().ToString();

        context.Response.Headers["X-Correlation-Id"] = correlationId;

        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
```

---

## 5. Health Checks

```csharp
using Microsoft.Extensions.Diagnostics.HealthChecks;

// Endpoint de health check basico
builder.Services.AddHealthChecks()
    .AddCheck<BaseDatosHealthCheck>("Base de datos")
    .AddCheck<ApiExternaHealthCheck>("API Pagos");

// Endpoint de health check en la API
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                duration = e.Value.Duration
            })
        });
        await context.Response.WriteAsync(result);
    }
});

public class BaseDatosHealthCheck : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context)
    {
        try
        {
            // verificar conexion a BD
            return HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Base de datos no disponible", ex);
        }
    }
}
```

---

## 6. Ejemplo Completo: Aplicacion Observable

```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

try
{
    Log.Information("Iniciando aplicacion");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    builder.Services.AddHealthChecks();
    builder.Services.AddOpenTelemetry()
        .WithTracing(t => t.AddAspNetCoreInstrumentation().AddConsoleExporter());

    var app = builder.Build();
    app.UseSerilogRequestLogging();  // logea cada request
    app.MapHealthChecks("/health");

    app.MapGet("/api/productos", async (ILogger<Program> logger) =>
    {
        logger.LogInformation("Consultando productos");
        return Results.Ok(new[] { "Laptop", "Mouse" });
    });

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Aplicacion termino inesperadamente");
}
finally
{
    Log.CloseAndFlush();
}
```

---

## 7. Buenos Practicas

- Siempre usar logging estructurado (placeholders, no interpolacion)
- No loguear informacion sensible (password, tarjetas, tokens)
- Usar correlation IDs para trazar requests a traves de servicios
- Configurar health checks para todas las dependencias criticas
- OpenTelemetry es el estandar moderno de observabilidad (reemplaza SDKs propietarios)
- Serilog es la libreria de logging mas popular y flexible en .NET
- Los logs en produccion deben ser Information, Warning, Error y Critical (no Debug/Trace)

## Resumen

- ILogger es la abstraccion nativa de logging en .NET.
- Los logs estructurados permiten busquedas y analisis en herramientas modernas.
- Serilog es la libreria mas usada para logging estructurado.
- Correlation IDs permiten trazar requests a traves de microservicios.
- Health Checks exponen el estado de la aplicacion y sus dependencias.
- OpenTelemetry es el estandar abierto para observabilidad (trazas, metricas, logs).
