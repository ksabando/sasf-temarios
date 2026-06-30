---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Gateway & Resilience4j

1. **¿En qué paradigma está basado Spring Cloud Gateway?**
   - a) Spring MVC (servlets)
   - b) Spring WebFlux (reactivo)
   - c) Spring Batch
   - d) Spring Data REST
   - **Respuesta: b**

2. **¿Qué elemento define la condición para activar una ruta en Gateway?**
   - a) Filter
   - b) Predicate
   - c) Route
   - d) Handler
   - **Respuesta: b**

3. **¿Qué filtro modifica la URL de la petición en Gateway?**
   - a) AddRequestHeader
   - b) RewritePath
   - c) CircuitBreaker
   - d) Retry
   - **Respuesta: b**

4. **¿Cuáles son los tres estados del Circuit Breaker?**
   - a) START, STOP, WAIT
   - b) OPEN, CLOSED, HALF_OPEN
   - c) ON, OFF, STANDBY
   - d) ACTIVE, PASSIVE, DORMANT
   - **Respuesta: b**

5. **¿Qué anotación de Resilience4j limita el número de peticiones por segundo?**
   - a) @CircuitBreaker
   - b) @Retry
   - c) @RateLimiter
   - d) @Bulkhead
   - **Respuesta: c**

6. **¿Qué patrón reintenta una operación fallida?**
   - a) Circuit Breaker
   - b) Retry
   - c) Bulkhead
   - d) TimeLimiter
   - **Respuesta: b**

7. **¿Qué patrón limita las ejecuciones concurrentes?**
   - a) Circuit Breaker
   - b) Retry
   - c) RateLimiter
   - d) Bulkhead
   - **Respuesta: d**

8. **¿Qué URI usa Gateway para balancear entre instancias de un servicio en Eureka?**
   - a) http://servicio
   - b) lb://servicio
   - c) eureka://servicio
   - d) discovery://servicio
   - **Respuesta: b**

9. **¿Qué parámetro define el umbral de fallos en un Circuit Breaker?**
   - a) sliding-window-size
   - b) failure-rate-threshold
   - c) minimum-number-of-calls
   - d) wait-duration-in-open-state
   - **Respuesta: b**

10. **¿Qué filtro de Gateway permite reintentar automáticamente?**
    - a) CircuitBreaker
    - b) Retry
    - c) RequestRateLimiter
    - d) FallbackHeaders
    - **Respuesta: b**

11. **¿Qué endpoint muestra el estado de los circuit breakers?**
    - a) /actuator/health
    - b) /actuator/circuitbreakers
    - c) /actuator/metrics
    - d) /actuator/info
    - **Respuesta: b**

12. **¿Qué tipo de Bulkhead usa un pool de hilos?**
    - a) SEMAPHORE
    - b) THREADPOOL
    - c) EXECUTOR
    - d) QUEUE
    - **Respuesta: b**

13. **¿Qué hace el estado HALF_OPEN en un Circuit Breaker?**
    - a) Bloquea todas las peticiones
    - b) Permite peticiones de prueba para verificar recuperación
    - c) Reintenta automáticamente
    - d) Envía notificaciones
    - **Respuesta: b**

14. **¿Qué anotación maneja timeout en Resilience4j?**
    - a) @Timeout
    - b) @TimeLimiter
    - c) @Timed
    - d) @TimeoutLimiter
    - **Respuesta: b**

15. **¿Qué filtro de Gateway añade una cabecera a la respuesta?**
    - a) AddRequestHeader
    - b) AddResponseHeader
    - c) SetResponseHeader
    - d) AddHeader
    - **Respuesta: b**

