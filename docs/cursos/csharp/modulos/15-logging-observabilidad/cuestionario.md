---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M15 - Logging, Configuracion y Observabilidad

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] Serilog y ILogger usan *destructuring* para serializar objetos complejos en logs. Explica como funciona `@` en Serilog (`{@Usuario}`), la diferencia entre `ToString()`, serializacion JSON, y destructuring, y como evitar loguear datos sensibles accidentalmente.

**Respuesta**: Sin `@`, Serilog llama a `ToString()` en el objeto. Con `{@Usuario}`, Serilog serializa las propiedades del objeto (destructuring) en una estructura que herramientas como Seq pueden mostrar como JSON expandible. Esto permite busquedas por propiedades (`Usuario.Nombre = "Juan"`) en vez de solo texto plano. Para evitar datos sensibles: (1) usar `[Sensor]` attribute en propiedades (Serilog.Filters.Expressions), (2) crear operadores de destructuring personalizados que filtren campos, (3) nunca loguear objetos completos de dominio que puedan contener datos personales. La regla: loguear solo lo necesario para diagnosticar, nunca datos de tarjetas, passwords o PII.

**Por que**: El destructuring de Serilog (Nicholas Blumhardt) fue uno de los avances que popularizo el logging estructurado en .NET. Herramientas como Seq (tambien de Nicholas Blumhardt) permiten consultas SQL-like sobre logs estructurados. Fuente: "Structured Logging in .NET" - Nicholas Blumhardt, y Serilog documentation.

---

### 2. [Investigar] OpenTelemetry esta reemplazando a Application Insights SDK, Jaeger y Zipkin como estandar unificado de observabilidad. Explica como funciona el modelo de señales (traces, metrics, logs), el concepto de *baggage* y *context propagation*, y como OpenTelemetry permite la correlacion entre microservicios.

**Respuesta**: OpenTelemetry define tres señales: (1) Traces (trazas distribuidas): seguimiento de una request a traves de multiples servicios usando span context propagation via W3C TraceContext headers. (2) Metrics: mediciones numericas (counters, histograms, gauges) de rendimiento y operaciones. (3) Logs: eventos estructurados con contexto (traceId, spanId). *Baggage* permite propagar pares clave-valor (como tenantId, userId) a traves de servicios sin incluirlos en cada mensaje. *Context propagation* pasa el contexto de tracing via HTTP headers (traceparent, tracestate) o message headers (Kafka, RabbitMQ).

**Por que**: OpenTelemetry es el proyecto de CNCF (Cloud Native Computing Foundation) que unifico los esfuerzos de OpenTracing y OpenCensus. Microsoft, Google, AWS y todos los proveedores cloud lo adoptaron. La ventaja es vendor-neutral: puedes recolectar datos con OpenTelemetry y exportarlos a cualquier backend. Fuente: opentelemetry.io/docs, y "OpenTelemetry in .NET" - docs.microsoft.com.

---

### 3. [Investigar] Los health checks en ASP.NET Core tambien soportan *liveness* y *readiness* probes para Kubernetes. Explica la diferencia entre liveness (el app esta viva?), readiness (el app puede recibir trafico?) y startup (el app termino de iniciar?), y como configurarlos en .NET.

**Respuesta**: Liveness probe: determina si la aplicacion esta funcionando (si falla, Kubernetes reinicia el pod). Readiness probe: determina si la aplicacion puede recibir trafico (si falla, Kubernetes remueve el pod del service load balancer). Startup probe: protege liveness durante inicio lento (Kubernetes espera a que startup pase antes de empezar liveness). En .NET se configuran con `MapHealthChecks` en diferentes rutas: `/health/live`, `/health/ready`, `/health/startup`. Se pueden filtrar checks por tags: `builder.Services.AddHealthChecks().AddCheck<LivenessCheck>("live", tags: ["live"])`. `app.MapHealthChecks("/health/live", new() { Predicate = check => check.Tags.Contains("live") })`.

**Por que**: Kubernetes usa estos probes para orquestar pods. Sin readiness probe, los pods reciben trafico antes de estar listos (causando 503 masivos). Sin liveness, los pods colgados no se reinician. La configuracion por tags permite que `/ready` verifique BD y cache, mientras `/live` solo verifica que el proceso responda. Fuente: Kubernetes probes documentation, y "Health Checks in ASP.NET Core" - docs.microsoft.com.

---

### 4. [Conectar] Los logs estructurados permiten trazabilidad, pero tambien generan volumen de datos que puede ser costoso de almacenar (especialmente en cloud). Explica estrategias para manejar el volumen de logs: sampling, niveles dinamicos, retention por ambiente y filtrado de campos.

**Respuesta**: (1) Sampling: loguear solo un porcentaje de requests (10% en produccion, 100% en desarrollo) usando Serilog.Sampling o filtros probabilisticos. (2) Niveles dinamicos: en produccion, logging Information por defecto, pero subir a Debug temporalmente para diagnosticar un problema especifico usando Feature Management o config dinamica. (3) Retention por ambiente: logs de desarrollo se borran en 7 dias, staging en 30, produccion en 90-365 segun compliance. (4) Filtrado de campos: eliminar campos de PII, tarjetas, tokens antes de persistir usando Serilog.Filters.Expressions o `destructuring policies`. (5) Logs estructurados vs texto plano: los estructurados son mas utiles pero mas grandes; comprimirlos (gzip) antes de almacenar y usar indices minimos en Elasticsearch.

**Por que**: El costo de logs en cloud (Azure Log Analytics, AWS CloudWatch, Datadog) puede superar el costo de computo en aplicaciones de alto trafico. Las estrategias de sampling y retention son esenciales para controlar costos sin perder capacidad de diagnostico. Fuente: "Logging cost optimization" - blogs de ingenieria de empresas cloud, y Serilog best practices.

---

### 5. [Cuestionar] Algunos equipos consideran que tener logs estructurados y trazas distribuidas (OpenTelemetry) es redundante: si tienes trazas, no necesitas logs. Defiende la posicion de que ambas son necesarias y cual es el rol de cada una en una estrategia de observabilidad.

**Respuesta**: Trazas (traces) y logs cumplen roles complementarios: las trazas muestran el "que" (que servicios atraveso una request, cuanto tardo cada uno) mientras los logs muestran el "por que" (que datos se procesaron, que decision se tomo, cual fue el error). Una traza te dice que el servicio de pedidos tardo 500ms; el log te dice que el proveedor de pagos devolvio "fondo insuficiente". Sin trazas, no sabes donde buscar; sin logs, no sabes que ocurrio. La estrategia correcta es: trazas para la vista general y deteccion de cuellos de botella, logs para el detalle de cada decision y error. OpenTelemetry unifica ambas al correlacionar logs con traceId/spanId.
