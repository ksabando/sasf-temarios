---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Prometheus + Grafana

### Objetivo
Configurar Prometheus para scrape métricas de Actuator y visualizarlas en Grafana.

### Requisitos
1. **Prometheus** (prometheus.yml):
   - Scrape job que apunte a `localhost:8080/actuator/prometheus`
   - Scrape interval: 15 segundos

2. **Grafana**:
   - Conectar como datasource a Prometheus
   - Crear dashboard con:
     - JVM Memory Usage (gauge)
     - HTTP Requests Rate (graph)
     - HTTP Request Duration (heatmap)
     - Active Orders (stat)

3. **Configurar la aplicación** para exponer prometheus endpoint

### Verificación
- Prometheus targets muestran UP
- Grafana dashboard muestra datos en tiempo real

---

## Ejercicio 4: Distributed Tracing con Zipkin

### Objetivo
Implementar tracing distribuido entre 3 microservicios y visualizarlo en Zipkin.

### Requisitos
1. **Servicio A** (api-gateway): Recibe petición y la reenvía
2. **Servicio B** (order-service): Procesa el pedido
3. **Servicio C** (payment-service): Procesa el pago
4. Cada servicio envía trazas a Zipkin (`http://localhost:9411`)
5. Usar `@Observed` y `Tracer` para spans personalizados
6. Sampling probability: 1.0 (100% de las peticiones)

### Verificación
- Iniciar Zipkin con Docker
- Realizar petición que cruce los 3 servicios
- Ver en Zipkin UI: `http://localhost:9411` el trace completo
- Identificar spans, tiempos y etiquetas

---

## Ejercicio 5: Monitoreo completo con metricas de Resilience4j

### Objetivo
Integrar métricas de Resilience4j con Actuator, Prometheus y Grafana.

### Requisitos
1. Configurar Actuator para exponer métricas de Resilience4j
2. Añadir métricas de circuit breaker, retry, rate limiter
3. Crear un escenario con fallos simulados para ver cambios en métricas
4. Dashboard de Grafana con:
   - State transitions (OPEN, CLOSED, HALF_OPEN)
   - Failed calls ratio
   - Successful calls ratio
   - Call count

### Verificación
- Simular caída de servicio → CB cambia a OPEN → métricas se actualizan
- Dashboard refleja el cambio de estado en tiempo real
