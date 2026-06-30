---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

## Semana 2 — HATEOAS, OpenAPI, Seguridad, Proyecto Final

### Día 6 — Lunes | Módulo 06: HATEOAS y APIs Auto-descriptivas
**Objetivo:** Implementar HATEOAS Nivel 3 de Richardson con HAL.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | HATEOAS, HAL, _links, _embedded — conceptos | Teoría |
| 1:00-2:00 | Spring HATEOAS, RepresentationModelAssembler | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:15 | Agregar HATEOAS a TaskFlow (links de navegación, transiciones) | Laboratorio |
| 3:15-4:00 | Explorar con HAL Explorer + ejercicios | Práctica |
| **Entrega:** | API TaskFlow con HATEOAS Nivel 3 | |

### Día 7 — Martes | Módulo 07: OpenAPI Avanzado
**Objetivo:** Crear spec OpenAPI 3.1 completa, API-first, documentación visual.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | OpenAPI 3.1 estructura, security schemes, $ref | Teoría |
| 1:00-2:00 | Composición (allOf, oneOf, anyOf), API-first vs code-first | Teoría |
| 2:00-2:15 | Break | — |
| 2:15-3:15 | Crear spec OpenAPI completa para TaskFlow | Laboratorio |
| 3:15-4:00 | Ejercicio: Swagger UI + Redoc + openapi-generator | Práctica |
| **Entrega:** | Spec openapi.yaml + documentación visual + código generado | |

### Día 8 — Miércoles | Módulo 08: Seguridad y Rate Limiting
**Objetivo:** Asegurar la API con JWT, OAuth2 y rate limiting.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | JWT, OAuth2 flows (Auth Code, Client Credentials, PKCE) | Teoría |
| 1:00-1:45 | Rate limiting: fixed window, sliding window, token bucket | Teoría |
| 1:45-2:15 | CORS, input validation, headers de seguridad | Teoría |
| 2:15-2:30 | Break | — |
| 2:30-3:30 | Implementar JWT + rate limiting (bucket4j) en TaskFlow | Laboratorio |
| 3:30-4:00 | Ejercicio: login, token refresh, CORS config | Práctica |
| **Entrega:** | API asegurada con JWT + rate limiting + CORS | |

### Día 9 — Jueves | Módulo 09: GraphQL vs REST vs gRPC
**Objetivo:** Comparar tecnologías, identificar cuándo usar cada una.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-1:00 | GraphQL: queries, mutations, subscriptions, schema | Teoría |
| 1:00-1:45 | gRPC: Protocol Buffers, HTTP/2, streaming | Teoría |
| 1:45-2:15 | REST vs GraphQL vs gRPC — comparativa y criterios | Teoría |
| 2:15-2:30 | Break | — |
| 2:30-3:15 | Implementar endpoint GraphQL con Spring GraphQL | Laboratorio |
| 3:15-4:00 | Ejercicio: comparar REST vs GraphQL vs gRPC en TaskFlow | Práctica |
| **Entrega:** | Endpoint GraphQL funcional + comparativa documentada | |

### Día 10 — Viernes | Módulo 10: Proyecto Final + Simulación de Entrevista
**Objetivo:** Integrar todo lo aprendido y prepararse para entrevistas técnicas.
| Hora | Actividad | Tipo |
|------|-----------|------|
| 0:00-0:30 | Repaso general y ronda de preguntas | Debrief |
| 0:30-2:30 | **Proyecto Final:** Diseñar + implementar API TaskFlow completa | Proyecto |
| 2:30-2:45 | Break | — |
| 2:45-3:30 | **Simulación de entrevista:** 10 ejercicios prácticos + 60 preguntas | Evaluación |
| 3:30-4:00 | Retrospectiva, feedback individual, próximos pasos | Cierre |

---

## Cronograma de Entregas

| Entrega | Módulo | Fecha | Tipo |
|---------|--------|-------|------|
| E01 | 01 | Semana 1, Lunes | Proyecto base Spring Boot |
| E02 | 02 | Semana 1, Martes | Endpoints RESTful rediseñados |
| E03 | 03 | Semana 1, Miércoles | CRUD completo + error handling |
| E04 | 04 | Semana 1, Jueves | API versionada v1 + v2 |
| E05 | 05 | Semana 1, Viernes | Paginación + filtros + sort |
| E06 | 06 | Semana 2, Lunes | HATEOAS Nivel 3 |
| E07 | 07 | Semana 2, Martes | Spec OpenAPI + docs |
| E08 | 08 | Semana 2, Miércoles | Seguridad JWT + rate limiting |
| E09 | 09 | Semana 2, Jueves | GraphQL endpoint |
| E10 | 10 | Semana 2, Viernes | Proyecto final completo |

---

## Evaluación Semanal

| Semana | Evaluación | Peso |
|--------|-----------|------|
| Semana 1 | Examen parcial (módulos 01-05): 30 preguntas + laboratorios | 30% |
| Semana 2 | Examen final (módulos 06-10): 30 preguntas + proyecto final | 40% |
| Continuo | Participación, code reviews, ejercicios en clase | 10% |

---

## Recursos y Materiales

- **Repositorio:** GitHub Classroom con template de proyecto
- **Slides:** Presentaciones por módulo en /slides
- **Laboratorios:** Guías paso a paso en /labs
- **Grabaciones:** Clases grabadas disponibles 24h después
- **Comunicación:** Slack/Discord para dudas y discusiones
- **Office Hours:** 2h semanales para consultas individuales

---

## Plan de Contingencia

| Problema | Solución |
|----------|----------|
| Módulo se extiende | Ajustar laboratorio, mover ejercicio a tarea |
| Participación baja | Pair programming, ejercicios gamificados |
| Dificultad técnica | Office hours, material complementario |
| Falla de herramientas | Alternativas offline (Postman, H2, embedded Kafka) |

