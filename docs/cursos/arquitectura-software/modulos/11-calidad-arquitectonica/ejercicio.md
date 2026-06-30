---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Realizar Análisis ATAM

Realiza un análisis ATAM para la siguiente decisión crítica:

> "El equipo de arquitectura propone implementar **CQRS + Event Sourcing** para el módulo de Pedidos de la E-Commerce Platform. Esto implica separar el modelo de lectura (MongoDB desnormalizado) del modelo de escritura (PostgreSQL normalizado + Event Store)."

### Tareas
a) ¿Qué QAs se ven favorecidos?
b) ¿Qué QAs se ven perjudicados?
c) Identifica al menos 2 sensitivity points
d) Identifica al menos 2 trade-off points
e) Identifica al menos 1 risk y 1 non-risk
f) ¿Recomendarías la decisión? ¿Bajo qué condiciones?

---

## Ejercicio 4: Tácticas Arquitectónicas

Para cada QA, selecciona la táctica más apropiada para la E-Commerce Platform y justifica:

| QA | Táctica seleccionada | Justificación | Implementación concreta |
|----|---------------------|---------------|------------------------|
| Disponibilidad (99.9%) | | | |
| Performance (<200ms p95) | | | |
| Seguridad (PCI-DSS) | | | |
| Escalabilidad (10K concurrentes) | | | |
| Mantenibilidad (alta) | | | |

Selecciona de estas tácticas (puedes proponer otras):
- Redundancia activo-activo
- Caching multinivel
- Sharding por tenant
- Clean Architecture + Ports & Adapters
- Autenticación OAuth 2.0 + JWT
- Circuit Breaker
- Rate Limiting
- Auto-scaling (Kubernetes HPA)
- CDN
- Connection Pooling
