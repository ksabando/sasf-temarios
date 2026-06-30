---
sidebar_label: "Clase"
---

## 3. Performance

**Definición**: Velocidad de respuesta del sistema.

**Métricas**:
- **Latencia**: tiempo de respuesta (p50, p95, p99)
- **Throughput**: transacciones por segundo (TPS)
- **Percentiles**: p50 (mediana), p95 (95% más rápido), p99 (99% más rápido)

```
Distribución de latencia:
     p50: 150ms  (50% de requests responden en 150ms o menos)
     p95: 300ms  (95% de requests responden en 300ms o menos)
     p99: 800ms  (99% de requests responden en 800ms o menos)
```

**Estrategias**:
- **Caching**: Redis, CDN, HTTP caching
- **Conexiones persistentes**: connection pooling, keep-alive
- **Compresión**: gzip/brotli en respuestas
- **Async processing**: colas para tareas lentas
- **Database indexing**: índices, query optimization
- **Materialized views**: vistas precalculadas

---

## 4. Seguridad

**Definición**: Protección contra amenazas.

**CIA Triad**:
- **Confidentiality**: datos accesibles solo por autorizados (encriptación)
- **Integrity**: datos no alterados (firmas, checksums)
- **Availability**: sistema accesible cuando se necesita (DDoS protection)

**Estrategias**:
- **Autenticación**: OAuth 2.0, JWT, SSO
- **Autorización**: RBAC (Role-Based Access Control), ABAC
- **Encriptación**: TLS/SSL, encriptación en reposo (AES-256)
- **Input Validation**: prevenir SQL injection, XSS, CSRF
- **Rate Limiting**: prevenir abuso, DDoS
- **Audit Logging**: registro de accesos y cambios

---

## 5. Mantenibilidad

**Definición**: Facilidad de modificar y extender el sistema.

**Métrica**: Tiempo para implementar un cambio de tamaño medio.

**Estrategias**:
- **Modularidad**: separación en módulos cohesivos con bajo acoplamiento
- **Clean Architecture**: capas bien definidas, dependencias hacia adentro
- **Código limpio**: nombres claros, funciones pequeñas, sin duplicación
- **Tests**: cobertura adecuada, tests que documentan comportamiento
- **Documentación**: ADRs, diagramas C4, README actualizado
- **Estándares**: guías de estilo, code reviews

---

## 6. Escalabilidad

**Definición**: Capacidad de manejar crecimiento en carga de trabajo.

### Escalado Vertical (Scale Up)
- Agregar recursos a una máquina (CPU, RAM, disco)
- Límite: capacidad máxima del hardware
- Costo creciente no lineal

### Escalado Horizontal (Scale Out)
- Agregar más instancias
- Prácticamente ilimitado
- Requiere diseño stateless

**Estrategias**:
- **Stateless Services**: cualquier instancia puede manejar cualquier request
- **Caching**: reducir carga en bases de datos
- **Sharding**: particionar datos horizontalmente
- **Auto-scaling**: agregar/remover instancias según demanda
- **CDN**: distribuir contenido estático geográficamente
- **Async processing**: colas para desacoplar picos de carga

---

## 7. Testabilidad

**Definición**: Facilidad de probar el sistema.

**Estrategias**:
- **Dependency Injection**: permitir mocks/stubs
- **Ports & Adapters**: probar casos de uso sin infraestructura
- **Test Doubles**: mocks, stubs, fakes
- **Testing Pyramid**:

```
          /\          E2E Tests (pocos)
         /  \         Integration Tests (algunos)
        /    \
       /      \
      /--------\      Unit Tests (muchos)
     /----------\
```

---

## 8. Tácticas Arquitectónicas

Son soluciones técnicas específicas para lograr un atributo de calidad.

| QA | Táctica |
|----|---------|
| Disponibilidad | Heartbeat, Monitor, Restart, Checkpoint/Rollback |
| Performance | Caching, Lazy Loading, Concurrency, Resource Pooling |
| Seguridad | Autenticación, Autorización, Encriptación, Auditoría |
| Mantenibilidad | Modularidad, Abstracción, Anticipación de cambios |
| Escalabilidad | Stateless, Caching, Sharding, Auto-scaling |
| Testabilidad | DI, Interface Segregation, Self-Test |

---

## 9. ATAM (Architecture Tradeoff Analysis Method)

Método del SEI (Software Engineering Institute) para evaluar arquitecturas.

### Fases

1. **Presentación de la arquitectura**
2. **Identificación de escenarios de calidad** (concrete quality scenarios)
3. **Análisis de decisiones arquitectónicas**
4. **Identificación de trade-offs**, risks, non-risks, sensitivity points
5. **Generación de informe**

### Escenarios de Calidad (formato)

> **Estímulo** → **Fuente** → **Artefacto** → **Entorno** → **Respuesta** → **Medida**

### Output del ATAM

| Concepto | Definición |
|----------|-----------|
| **Sensitivity Point** | Decisión que afecta un QA específico |
| **Trade-off Point** | Decisión que afecta múltiples QAs (positiva y negativamente) |
| **Risk** | Decisión que puede impedir lograr un QA |
| **Non-Risk** | Decisión que apoya un QA |

### Ejemplo de Trade-off Analysis

| Decisión | Favorece | Perjudica |
|----------|----------|-----------|
| Microservicios | Escalabilidad, Mantenibilidad | Performance (latencia), Disponibilidad (más puntos de fallo) |
| Caching (Redis) | Performance | Consistencia (datos pueden estar obsoletos) |
| CQRS | Performance de lecturas | Consistencia (eventual), Complejidad |
| Sharding | Escalabilidad | Disponibilidad (shard caído = datos no disponibles) |

---

## 10. Laboratorio

Definir escenarios de calidad para E-Commerce Platform y realizar ATAM preliminar:

1. Definir 5 escenarios de calidad concretos
2. Identificar sensitivity points y trade-off points
3. Documentar risks y non-risks
4. Generar un informe ATAM
