---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Resilience4j Circuit Breaker en microservicio

### Objetivo
Usar `@CircuitBreaker` en un servicio que llama a otro servicio externo.

### Requisitos
1. Servicio que expone `GET /api/external/data`
2. Llama a un endpoint externo (jsonplaceholder.typicode.com)
3. Configurar CB con:
   - sliding-window-size: 5
   - failure-rate-threshold: 50
   - wait-duration-in-open-state: 10s
4. Fallback que retorna datos cacheados locales
5. Monitorear cambios de estado en logs

### Verificación
- Estado CLOSED → OPEN → HALF_OPEN → CLOSED
- Logs mostrando transiciones de estado

---

## Ejercicio 4: RateLimiter + Retry + Bulkhead combinados

### Objetivo
Combinar múltiples patrones de Resilience4j en un mismo método.

### Requisitos
1. Endpoint `GET /api/search` que hace una búsqueda simulada
2. Configurar:
   - **RateLimiter**: 5 peticiones por segundo
   - **Retry**: 3 reintentos con backoff de 500ms
   - **Bulkhead**: máximo 3 llamadas concurrentes
   - **TimeLimiter**: timeout de 2 segundos
3. Anotar el método con los 4 decoradores
4. Implementar fallbacks para cada uno

### Verificación
- Enviar 20 peticiones concurrentes y verificar el comportamiento
- Logs de rate limit exceeded, retries, bulkhead full

---

## Ejercicio 5: Gateway + Eureka + Circuit Breaker completo

### Objetivo
Arquitectura completa: Gateway con Eureka Discovery y Circuit Breaker.

### Requisitos
1. **Eureka Server** (puerto 8761)
2. **Config Server** (puerto 8888)
3. **product-service** (2 instancias: 8081, 8082)
4. **order-service** (puerto 8090)
5. **Gateway** (puerto 8080):
   - Registrado en Eureka
   - Rutas con `lb://` discovery
   - Circuit Breaker con fallback en cada ruta
   - Filtro Retry para GET requests

### Verificación
- Dashboard de Eureka muestra todas las instancias
- Gateway balancea entre las 2 instancias de product-service
- Si una instancia falla, CB la excluye
- Si todas fallan, fallback responde
