---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Actuator & Monitoreo

1. **¿Qué endpoint de Actuator muestra el estado de la aplicación y sus componentes?**
   - a) /actuator/info
   - b) /actuator/health
   - c) /actuator/status
   - d) /actuator/state
   - **Respuesta: b**

2. **¿Qué dependencia se necesita para exponer métricas en formato Prometheus?**
   - a) micrometer-registry-graphite
   - b) micrometer-registry-prometheus
   - c) prometheus-client
   - d) spring-boot-starter-prometheus
   - **Respuesta: b**

3. **¿Qué interfaz se implementa para crear un health check personalizado?**
   - a) HealthChecker
   - b) HealthIndicator
   - c) CustomHealth
   - d) MonitorService
   - **Respuesta: b**

4. **¿Cómo se cambia el nivel de log de un logger en caliente?**
   - a) Modificando application.yml y reiniciando
   - b) POST /actuator/loggers/{name} con el nivel deseado
   - c) PUT /actuator/logging/{name}
   - d) PATCH /actuator/log/{name}
   - **Respuesta: b**

5. **¿Qué herramienta se usa para visualizar trazas distribuidas?**
   - a) Prometheus
   - b) Grafana
   - c) Zipkin
   - d) Elasticsearch
   - **Respuesta: c**

6. **¿Qué anotación de Micrometer marca un método para ser observado automáticamente?**
   - a) @Timed
   - b) @Monitored
   - c) @Observed
   - d) @Tracing
   - **Respuesta: c**

7. **¿Cuál es el puerto por defecto de Zipkin?**
   - a) 9090
   - b) 3000
   - c) 9411
   - d) 8080
   - **Respuesta: c**

8. **¿Qué tipo de métrica cuenta el número de ocurrencias de un evento?**
   - a) Gauge
   - b) Counter
   - c) Timer
   - d) DistributionSummary
   - **Respuesta: b**

9. **¿Qué endpoint genera un dump del heap de la JVM?**
   - a) /actuator/threaddump
   - b) /actuator/heapdump
   - c) /actuator/dump
   - d) /actuator/memory
   - **Respuesta: b**

10. **¿Qué propiedad controla el porcentaje de peticiones trazadas?**
    - a) management.tracing.enabled
    - b) management.tracing.sampling.probability
    - c) management.zipkin.tracing.enabled
    - d) management.tracing.rate
    - **Respuesta: b**

11. **¿Qué endpoint de Prometheus usa Grafana como fuente de datos?**
    - a) /actuator/health
    - b) /actuator/metrics
    - c) /actuator/prometheus
    - d) /actuator/info
    - **Respuesta: c**

12. **¿Qué interfaz se implementa para añadir información personalizada a /info?**
    - a) InfoIndicator
    - b) InfoContributor
    - c) CustomInfo
    - d) InfoBuilder
    - **Respuesta: b**

13. **¿Qué tipo de métrica de Micrometer mide la distribución de valores?**
    - a) Counter
    - b) Gauge
    - c) DistributionSummary
    - d) FunctionCounter
    - **Respuesta: c**

14. **¿Qué herramienta se usa para scrape métricas de los endpoints Actuator?**
    - a) Grafana
    - b) Zipkin
    - c) Prometheus
    - d) Elasticsearch
    - **Respuesta: c**

15. **¿Qué endpoint permite ver todas las propiedades de configuración de Spring?**
    - a) /actuator/configprops
    - b) /actuator/env
    - c) /actuator/properties
    - d) /actuator/config
    - **Respuesta: a**

