---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

## Metodología de Estudio por Módulo

Cada módulo sigue este flujo de trabajo. Respetar el orden maximiza el aprendizaje:

```
1. DIA POSITIVA   → Abrir diap.pptx, ver las 10 slides (15 min)
2. CLASE TE—RICA   → Leer clase.md completo, tomar notas (30 min)
3. EJERCICIOS      → Resolver ejercicio.md SIN ver la respuesta (60-90 min)
4. AUTO-CORRECCI—N → Comparar con respuesta.md, corregir errores (30 min)
5. CUESTIONARIO    → Responder las 10 preguntas de cuestionario.md (20 min)
6. REPASO          → Marcar dudas para preguntar al instructor (10 min)
```

> Revisar **Regla de oro:** No mirar `respuesta.md` hasta haber intentado todos los ejercicios.

---

## Semana 1 — Fundamentos de Spring

**Objetivo:** Dominar IoC, Spring Boot, configuración, profiles y empaquetado.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M01 | Spring Framework e IoC | 3h | [ ] DI por constructor [ ] ApplicationContext [ ] Ej. resueltos |
| **Mar** | M02 | Spring Boot y Auto-Configuración | 4h | [ ] @SpringBootApplication [ ] Starters [ ] Ej. 1-5 |
| **Mié** | M03 | Beans y Configuración | 4h | [ ] @Component/@Bean [ ] Scopes [ ] @Qualifier |
| **Jue** | M04 | Properties, Profiles y Logging | 4h | [ ] YAML [ ] @Profile [ ] Logback config |
| **Vie** | M05 | DevTools y Empaquetado | 4h | [ ] Docker multi-stage [ ] fat JAR [ ] DevTools |

**Checkpoint semana 1:** Spring Boot app funcionando en Docker con perfiles dev/prod y logging.

---

## Semana 2 — Capa Web y APIs REST

**Objetivo:** Construir APIs REST completas con validación, documentación y testing.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M06 | Spring MVC y REST APIs | 3h | [ ] Endpoints CRUD [ ] ResponseEntity [ ] HTTP methods |
| **Mar** | M07 | Peticiones, Respuestas y DTOs | 4h | [ ] @RequestParam [ ] DTOs [ ] MapStruct [ ] Paginación |
| **Mié** | M08 | Validación y Manejo de Excepciones | 4h | [ ] Bean Validation [ ] @ControllerAdvice [ ] RFC 9457 |
| **Jue** | M09 | Documentación con OpenAPI | 3h | [ ] Swagger UI [ ] @Operation [ ] @ApiResponse |
| **Vie** | M10 | Testing de APIs | 4h | [ ] @WebMvcTest [ ] MockMvc [ ] JaCoCo coverage |

**Checkpoint semana 2:** API REST de Tasks completa, documentada, validada y testeada.
> Y"- **Integración React:** La Task API ya puede ser consumida por TaskFlow (ver Semana 2 del curso React).

---

## Semana 3 — Capa de Datos

**Objetivo:** Dominar JPA, consultas avanzadas, transacciones, migraciones y testing de datos.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M11 | Spring Data JPA y ORM | 4h | [ ] Entidades [ ] Relaciones [ ] JpaRepository |
| **Mar** | M12 | Consultas Avanzadas JPA | 4h | [ ] @Query [ ] Specifications [ ] Projections |
| **Mié** | M13 | Transacciones y Migraciones | 4h | [ ] @Transactional [ ] Locking [ ] Flyway |
| **Jue** | M14 | Spring Data REST | 3h | [ ] HAL Explorer [ ] Eventos repositorio |
| **Vie** | M15 | Testing de Capa de Datos | 4h | [ ] @DataJpaTest [ ] TestContainers [ ] AssertJ |

**Checkpoint semana 3:** Modelo relacional completo con migraciones, transacciones y tests.

---

## Semana 4 — Seguridad y Features Avanzadas

**Objetivo:** Implementar seguridad, AOP, async, cache y performance.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M16 | Spring Security | 4h | [ ] SecurityFilterChain [ ] BCrypt [ ] Roles |
| **Mar** | M17 | JWT y OAuth2 | 5h | [ ] JWT tokens [ ] Keycloak [ ] Resource Server |
| **Mié** | M18 | Spring AOP | 3h | [ ] @Aspect [ ] Pointcuts [ ] Logging |
| **Jue** | M19 | Async, Scheduling y Eventos | 4h | [ ] @Async [ ] @Scheduled [ ] Event listeners |
| **Vie** | M20 | Cache y Rendimiento | 4h | [ ] @Cacheable [ ] Redis [ ] Caffeine |

**Checkpoint semana 4:** Task API segura con JWT, caché Redis, procesamiento asíncrono y AOP.
> Y"- **Integración React:** TaskFlow ya puede autenticarse con JWT y hacer peticiones protegidas.

---

## Semana 5 — Microservicios y Proyecto Final

**Objetivo:** Arquitectura de microservicios, cloud, mensajería, monitoreo y proyecto integrador.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M21 | Cloud Config y Service Discovery | 4h | [ ] Config Server [ ] Eureka [ ] LoadBalancer |
| **Mar** | M22 | API Gateway y Resilience4j | 4h | [ ] Gateway routes [ ] Circuit Breaker |
| **Mié** | M23 | Mensajería (RabbitMQ/Kafka) | 5h | [ ] RabbitMQ [ ] @RabbitListener [ ] Kafka |
| **Jue** | M24 | Actuator y Monitoreo | 4h | [ ] Endpoints [ ] Prometheus [ ] Zipkin |
| **Vie** | M25 | Proyecto Final + Entrevista | 6h | [ ] 3 microservicios [ ] 60 preguntas [ ] 10 ejercicios |

**Checkpoint semana 5:** Proyecto e-commerce completo entregado + simulación de entrevista aprobada.

---

## Rúbrica de Auto-Evaluación

Al final de cada módulo, calificarse de 0 a 5:

| Puntaje | Significado | Acción |
|---------|-------------|--------|
| 5 | Puedo explicarlo y aplicarlo sin ayuda | Avanzar |
| 4 | Lo entiendo pero necesito consultar la guía | Avanzar, repasar luego |
| 3 | Entiendo el concepto pero fallo en implementación | Rehacer ejercicios |
| 2 | No entiendo partes clave | Volver a clase.md + diapositivas |
| 1 | No entiendo casi nada | Pedir ayuda al instructor |
| 0 | No lo vi | Hacer el módulo |

---

## Reglas de Oro del Curso

1. **Nunca copies y pegues.** Escribe cada línea de código manualmente.
2. **Lee el error completo.** Spring Boot te dice exactamente qué falló y en qué línea.
3. **Usa logs como debug.** Agrega log.info() para ver valores intermedios.
4. **Primero diseña la API, después implementa.** El 50% del trabajo es diseñar bien los contratos.
5. **No te saltes ejercicios.** Cada uno construye sobre el anterior.
6. **Usa Postman/Insomnia.** Prueba cada endpoint manualmente antes de escribir tests.
7. **Pregunta.** Si algo no te cierra después de 15 minutos, pregunta.

---

## Recursos

| Recurso | Enlace |
|---------|--------|
| Temario completo | `Modulos/Temario-Spring-2026.md` |
| Ejercicios y soluciones | `Modulos/` (25 carpetas) |
| Libros de referencia | `Libros/` |
| Docker Compose | `Anexos/docker-compose.yml` |
| Integración con React (TaskFlow) | `../React/Anexos/puente-integracion-react-spring.md` |
| Temario React | `../React/Modulos/Temario-React-2026.md` |
| Spring Initializr | https://start.spring.io |
| Baeldung | https://www.baeldung.com/ |
| Documentación Spring Boot | https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/ |
| Documentación Spring Security | https://docs.spring.io/spring-security/reference/ |

