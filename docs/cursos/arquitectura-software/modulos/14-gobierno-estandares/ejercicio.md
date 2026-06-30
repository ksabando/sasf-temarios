---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Architecture Review Process

Diseña el proceso de Architecture Review para la E-Commerce Platform:

**a) Definir umbrales**: ¿Qué cambios requieren revisión?

Ejemplos:
- Nuevo bounded context
- Cambio de base de datos
- Nuevo framework o librería crítica
- etc.

**b) RFC Template**: Crea una plantilla de RFC (Request for Comments) que incluya:
- Título, autor, fecha
- Contexto y problema
- Propuesta de solución
- Alternativas consideradas
- Trade-offs y riesgos
- Plan de implementación

**c) Timeline**: Define tiempos máximos para cada etapa del proceso (envío, revisión, discusión, decisión)

**d) Escalamiento**: ¿Qué pasa si hay desacuerdo entre el squad y el arquitecto?

---

## Ejercicio 4: Health Check Arquitectónico

Realiza un health check arquitectónico para la E-Commerce Platform asumiendo los siguientes datos:

| Métrica | Actual | Target |
|---------|--------|--------|
| Disponibilidad (último mes) | 99.5% | 99.9% |
| Latencia p95 (API catálogo) | 450ms | <200ms |
| Coverage de tests | 35% | >70% |
| Deuda técnica (SonarQube) | 45 días | <20 días |
| Tiempo de deploy | 1 día | <30 min |
| Incidentes P1/mes | 3 | <1 |
| Tiempo de onboarding | 4 semanas | <2 semanas |
| Velocity (story points/sprint) | 25 | 40+ |

### Tareas
a) Identifica las 3 áreas más críticas que requieren atención inmediata
b) Para cada área crítica, propón acciones concretas
c) Define métricas de seguimiento para el próximo trimestre
d) Escribe un resumen ejecutivo de 1 párrafo para los stakeholders
