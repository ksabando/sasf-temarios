---
sidebar_label: "Clase"
---

## 3. Entregables del Proyecto

| # | Entregable | Descripción | Peso |
|---|-----------|-------------|------|
| 1 | **DDD Estratégico** | Bounded contexts, context map, ubiquitous language | 20% |
| 2 | **Hexagonal + Clean** | Puertos, adaptadores, entities, use cases, presenters | 20% |
| 3 | **CQRS + Event Sourcing** | Commands, queries, event store, projections | 15% |
| 4 | **Diagramas C4** | Context + Container + Component | 15% |
| 5 | **ADRs** | 5+ decisiones documentadas | 15% |
| 6 | **Justificación** | Trade-offs explícitos, alternativas consideradas | 15% |

---

## 4. Estructura Sugerida del Proyecto

```
docs/
├── adr/
│   ├── ADR-001-hexagonal-clean-architecture.md
│   ├── ADR-002-descomposicion-bounded-contexts.md
│   ├── ADR-003-bases-de-datos-poliglota.md
│   ├── ADR-004-comunicacion-asincrona-kafka.md
│   ├── ADR-005-cqrs-event-sourcing-pedidos.md
│   └── ADR-006-frontend-react-typescript.md
├── diagrams/
│   ├── context.puml (C4 Nivel 1)
│   ├── container.puml (C4 Nivel 2)
│   └── component.puml (C4 Nivel 3)
├── architecture/
│   ├── context-map.md
│   ├── ubiquitous-language.md
│   └── quality-scenarios.md
└── README.md

src/
├── order-service/
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── catalog-service/
├── payment-service/
├── shipping-service/
├── user-service/
└── notification-service/
```

---

## 5. Ejemplo de Arquitectura General

```
                    +------------------+
                    |  API Gateway     |
                    |  (Spring Cloud   |
                    |   Gateway)       |
                    +------------------+
                     /    |    |    \
                    v     v    v     v
            +------+ +----+ +----+ +------+
            |Orders| |Catá.| |Pag.| |Shipping|
            |Service| |Srvc| |Srvc| |Service|
            +------+ +----+ +----+ +------+
               |        |      |        |
            +------+ +----+ +----+ +------+
            |Postgr| |Mong | |Postgr| |Postgr|
            +------+ |oDB  | +----+ +------+
                     +----+

                    +------------------+
                    |     Kafka        |
                    | order-events     |
                    | payment-events   |
                    | inventory-events |
                    +------------------+

                    +------------------+
                    |  Elasticsearch   |
                    |  (búsqueda)      |
                    +------------------+

                    +------------------+
                    |  Redis (caché,   |
                    |   carrito,       |
                    |   sesiones)      |
                    +------------------+
```

---

## 6. Simulación de Entrevista Técnica

### Estructura de la entrevista

| Sección | Duración | Temas |
|---------|----------|-------|
| Diseño de sistema | 25 min | Arquitectura de sistema, trade-offs |
| DDD y modelado | 15 min | Bounded contexts, aggregates, eventos |
| Clean/Hexagonal | 15 min | Puertos, casos de uso, dependencias |
| CQRS/EDA/Microservicios | 15 min | Commands vs queries, sagas, descomposición |
| Calidad y gobierno | 10 min | ATAM, deuda técnica, ADRs, C4 |

### Consejos

1. **Piensa en voz alta**: El entrevistador quiere entender tu proceso de pensamiento.
2. **Haz preguntas**: Antes de diseñar, aclara requerimientos y restricciones.
3. **Menciona trade-offs**: Toda decisión tiene pros y contras. Menciónalos.
4. **Sé pragmático**: No sobre-ingenieríes. Menciona qué harías para un MVP vs a largo plazo.
5. **Usa el pizarrón**: Dibuja diagramas (Context, Container, Component).
6. **Conoce tus principios**: SOLID, Dependency Inversion, Conway's Law, CAP Theorem.

---

## 7. Criterios de Evaluación del Proyecto

| Criterio | Excelente (90-100) | Bueno (70-89) | Regular (50-69) |
|----------|--------------------|---------------|-----------------|
| **DDD** (20%) | Context map claro, aggregates bien modelados, lenguaje ubicuo preciso | Context map presente, aggregates con errores menores | Context map difuso, aggregates incorrectos |
| **Hexagonal/Clean** (20%) | Separación perfecta, dependencias correctas, tests | Separación buena con algunas dependencias incorrectas | Dependencias incorrectas, mezcla de capas |
| **C4 Diagrams** (15%) | 3 niveles completos, claros, precisos | 2 niveles completos, 1 incompleto | Solo 1 nivel, impreciso |
| **ADRs** (15%) | 5+ ADRs con contexto, decisión, consecuencias | 3+ ADRs, algunos sin consecuencias | Menos de 3 ADRs o incompletos |
| **Comunicación** (15%) | Eventos claros, patrones de resiliencia, idempotencia | Eventos presentes, sin resiliencia | Sin eventos, solo REST |
| **Justificación** (15%) | Trade-offs explícitos, alternativas consideradas | Trade-offs mencionados sin profundidad | Sin justificación |
