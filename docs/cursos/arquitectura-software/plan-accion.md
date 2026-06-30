---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

## Semana 2 — CQRS, Event-Driven, Microservicios, Comunicación, Bases de Datos

### Día 6 — Lunes | Módulo 06: CQRS
**Objetivo:** Separar modelos de lectura y escritura con CQRS.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | Command vs Query, separación de modelos | Teoría |
| 1:00-2:00 | Event Sourcing, reconstrucción de estado, projections | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:30 | Implementar CQRS en módulo de pedidos (writes: DDD, reads: desnormalizado) | Laboratorio |
| 3:30-4:00 | Ejercicio: crear proyección de reportes con Event Sourcing | Práctica |
| **Entrega:** | Módulo de pedidos con CQRS + Event Sourcing | |

### Día 7 — Martes | Módulo 07: Event-Driven Architecture
**Objetivo:** Diseñar e implementar flujos basados en eventos con Kafka.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | Event-Driven vs Request-Driven, coreografía vs orquestación | Teoría |
| 1:00-2:00 | Kafka: topics, partitions, consumer groups, garantías de entrega | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:30 | Implementar flujo OrderCreated → PaymentProcessed → InventoryUpdated | Laboratorio |
| 3:30-4:00 | Ejercicio: agregar notificación de eventos + idempotencia | Práctica |
| **Entrega:** | Flujo event-driven completo con Kafka + Spring Cloud Stream | |

### Día 8 — Miércoles | Módulo 08: Microservicios vs Monolito
**Objetivo:** Evaluar cuándo aplicar microservicios y cómo migrar.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | Monolito vs Microservicios: ventajas, desventajas | Teoría |
| 1:00-2:00 | Strangler Fig, descomposición por negocio/subdominio, Conway's Law | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:15 | Analizar E-Commerce Platform: proponer descomposición en microservicios | Laboratorio |
| 3:15-4:00 | Ejercicio: diseñar modular monolith como paso intermedio | Práctica |
| **Entrega:** | Propuesta de descomposición + diagrama de microservicios/modular monolith | |

### Día 9 — Jueves | Módulo 09: Comunicación entre Servicios
**Objetivo:** Implementar comunicación síncrona y asíncrona con resiliencia.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-0:45 | REST síncrono con OpenFeign | Teoría |
| 0:45-1:30 | gRPC: unary, streaming, Protocol Buffers | Teoría |
| 1:30-2:15 | Mensajería asíncrona (RabbitMQ/Kafka) + patrones de resiliencia | Teoría |
| 2:15-2:30 | Break | — |
| 2:30-3:30 | Implementar comunicación entre servicios con Feign + Circuit Breaker + Kafka | Laboratorio |
| 3:30-4:00 | Ejercicio: agregar bulkhead + retry con Resilience4j | Práctica |
| **Entrega:** | Comunicación entre servicios de e-commerce con resiliencia | |

### Día 10 — Viernes | Módulo 10: Bases de Datos en Arquitectura
**Objetivo:** Diseñar estrategia de persistencia poliglota con sagas y transaction outbox.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | SQL vs NoSQL, poliglota persistence, CAP theorem | Teoría |
| 1:00-2:00 | Saga pattern (coreografiada vs orquestada), Transaction Outbox | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:30 | Implementar Saga coreografiada + Transaction Outbox con Kafka | Laboratorio |
| 3:30-4:00 | Ejercicio: diseñar base de datos poliglota para e-commerce | Práctica |
| **Entrega:** | Saga de pedidos + Transaction Outbox + diagrama de persistencia | |

---

## Semana 3 — Calidad, Documentación, Deuda Técnica, Gobierno, Proyecto Final

### Día 11 — Lunes | Módulo 11: Calidad Arquitectónica
**Objetivo:** Evaluar arquitectura mediante ATAM y escenarios de calidad.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | Atributos de calidad: disponibilidad, performance, seguridad, mantenibilidad, escalabilidad | Teoría |
| 1:00-2:00 | Tácticas arquitectónicas, ATAM (Architecture Tradeoff Analysis Method) | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:15 | Definir escenarios de calidad para E-Commerce Platform | Laboratorio |
| 3:30-4:00 | Ejercicio: realizar ATAM preliminar, documentar sensitivity points | Práctica |
| **Entrega:** | Escenarios de calidad + análisis ATAM + trade-offs documentados | |

### Día 12 — Martes | Módulo 12: Documentación Arquitectónica
**Objetivo:** Documentar arquitectura con C4 Model + ADRs.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | C4 Model: Context, Container, Component, Code | Teoría |
| 1:00-2:00 | ADRs (Architecture Decision Records), Structurizr DSL | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:15 | Crear diagramas C4 para E-Commerce Platform con Structurizr | Laboratorio |
| 3:15-4:00 | Ejercicio: escribir ADRs para decisiones clave (bases de datos, comunicación, descomposición) | Práctica |
| **Entrega:** | Diagramas C4 (Context + Container + Component) + 3 ADRs | |

### Día 13 — Miércoles | Módulo 13: Deuda Técnica y Refactorización
**Objetivo:** Identificar, medir y reducir deuda técnica arquitectónica.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | Tipos de deuda técnica, cuadrante de Fowler, costo de interés | Teoría |
| 1:00-2:00 | Refactorización arquitectónica, Big Ball of Mud, estrategias de reducción | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:15 | Auditar E-Commerce Platform: identificar deuda, calcular interés | Laboratorio |
| 3:15-4:00 | Ejercicio: proponer plan de refactorización + escribir ADRs de deuda | Práctica |
| **Entrega:** | Auditoría de deuda técnica + plan de refactorización | |

### Día 14 — Jueves | Módulo 14: Gobierno y Estándares
**Objetivo:** Establecer gobierno arquitectónico, procesos y estándares.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | TOGAF, Enterprise Architecture, role del arquitecto | Teoría |
| 1:00-2:00 | Health checks, Architecture Review Boards, Tech Radar | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:15 | Diseñar estructura de gobierno para E-Commerce Platform | Laboratorio |
| 3:15-4:00 | Ejercicio: crear RFC template + proponer tech radar | Práctica |
| **Entrega:** | Propuesta de gobierno arquitectónico + RFC template + tech radar | |

### Día 15 — Viernes | Módulo 15: Proyecto Final + Simulación de Entrevista
**Objetivo:** Integrar todo el curso en un proyecto completo y prepararse para entrevistas.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-0:30 | Repaso general de los 14 módulos | Debrief |
| 0:30-2:30 | **Proyecto Final:** Arquitectura completa de E-Commerce Platform | Proyecto |
| 2:30-2:45 | Break | — |
| 2:45-3:30 | **Simulación de entrevista:** 15 ejercicios prácticos + 75 preguntas | Evaluación |
| 3:30-4:00 | Retrospectiva, feedback individual, hoja de ruta post-curso | Cierre |

---

## Cronograma de Entregas

| Entrega | Módulo | Fecha | Tipo |
|---------|--------|-------|------|
| E01 | 01 | Semana 1, Lunes | Análisis de trade-offs |
| E02 | 02 | Semana 1, Martes | Diagrama de estilo arquitectónico |
| E03 | 03 | Semana 1, Miércoles | Context map + modelo táctico DDD |
| E04 | 04 | Semana 1, Jueves | Proyecto hexagonal + tests |
| E05 | 05 | Semana 1, Viernes | Caso de uso Clean Architecture + tests |
| E06 | 06 | Semana 2, Lunes | CQRS + Event Sourcing en pedidos |
| E07 | 07 | Semana 2, Martes | Flujo event-driven con Kafka |
| E08 | 08 | Semana 2, Miércoles | Propuesta de descomposición |
| E09 | 09 | Semana 2, Jueves | Comunicación microservicios con resiliencia |
| E10 | 10 | Semana 2, Viernes | Saga + Transaction Outbox + persistencia |
| E11 | 11 | Semana 3, Lunes | Escenarios de calidad + ATAM |
| E12 | 12 | Semana 3, Martes | Diagramas C4 + ADRs |
| E13 | 13 | Semana 3, Miércoles | Auditoría de deuda técnica |
| E14 | 14 | Semana 3, Jueves | Gobierno arquitectónico + tech radar |
| E15 | 15 | Semana 3, Viernes | Proyecto final completo |

---

## Evaluación Semanal

| Semana | Evaluación | Peso |
|--------|-----------|------|
| Semana 1 | Examen parcial (módulos 01-05): 25 preguntas + laboratorios | 20% |
| Semana 2 | Examen intermedio (módulos 06-10): 25 preguntas + laboratorios | 20% |
| Semana 3 | Examen final (módulos 11-14): 25 preguntas + proyecto final | 40% |
| Continuo | Participación, code reviews, ejercicios en clase | 10% |

---

## Recursos y Materiales

- **Repositorio:** GitHub Classroom con template de proyecto (Spring Boot + React)
- **Slides:** Presentaciones por módulo en /slides
- **Diagramas:** Plantillas Structurizr DSL por módulo
- **Laboratorios:** Guías paso a paso con código de referencia
- **Grabaciones:** Clases grabadas disponibles 24h después
- **Comunicación:** Slack/Discord para dudas y discusiones
- **Office Hours:** 3h semanales para consultas individuales
- **Infraestructura:** Docker/Kubernetes local para laboratorios de servicios

---

## Plan de Contingencia

| Problema | Solución |
|----------|----------|
| Módulo se extiende | Ajustar laboratorio, mover ejercicio a tarea |
| Participación baja | Pair design, arquitectura wars (debates), katas |
| Dificultad técnica (Kafka, CQRS) | Ejemplos simplificados, office hours extras |
| Falla de herramientas | Alternativas offline (H2, in-memory broker, dibujar diagramas en papel) |
| Tiempo insuficiente para proyecto | Sprint extra de 1 día o entregas parciales |

