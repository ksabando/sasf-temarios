---
sidebar_position: 2
sidebar_label: "Temario"
---

## Estructura de cada Módulo

Cada módulo tiene su carpeta en `Modulos/` con 5 archivos:

| Archivo | Propósito |
|---------|-----------|
| `clase.md` | Lección teórica con ejemplos y código compilable |
| `ejercicio.md` | Enunciados de ejercicios prácticos (4-6 por módulo) |
| `respuesta.md` | Soluciones completas con código compilable |
| `diap.pptx` | Diapositivas PowerPoint (8-10 slides) para dictar la clase |
| `cuestionario.md` | 10 preguntas de nivel medio con respuestas |

---

## SEMANA 1 — Fundamentos de Spring

> **Objetivo:** Dominar IoC, Spring Boot, configuración, profiles y empaquetado.

---

### Módulo 01 — Spring Framework e IoC
- `01-Spring-Framework-IoC/`

- ¿Qué es Spring? Historia y ecosistema (Spring Framework, Boot, Cloud, Data, Security)
- Inversión de Control (IoC) vs. Dependency Injection (DI)
- ApplicationContext y BeanFactory: diferencias y usos
- Tipos de inyección: campo (@Autowired), setter, constructor (recomendado)
- XML vs Anotaciones vs Java Config (@Configuration, @Bean)
- Ciclo de vida del ApplicationContext
- **Proyecto base:** Hola Spring con contexto manual y DI por constructor

---

### Módulo 02 — Spring Boot y Auto-Configuración
- `02-Spring-Boot-AutoConfig/`

- ¿Qué resuelve Spring Boot? Opinionated defaults, Starters, Auto-Configuration
- @SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan
- Creación de proyecto con Spring Initializr (start.spring.io)
- Estructura de proyecto Maven/Gradle: pom.xml, build.gradle
- Embedded Tomcat / Jetty / Undertow
- spring-boot-maven-plugin, goal: run, package
- **Proyecto:** Primer microservicio REST con endpoint GET /api/health

---

### Módulo 03 — Beans y Configuración
- `03-Beans-Configuracion/`

- Anotaciones de estereotipo: @Component, @Service, @Repository, @Controller
- @Bean en clases @Configuration: métodos factory
- Ciclo de vida de beans: @PostConstruct, @PreDestroy, InitializingBean, DisposableBean
- Scope: singleton (default), prototype, request, session, application
- @Primary, @Qualifier, @Lazy, @Scope
- @Import para módulos de configuración
- **Proyecto:** Configurar beans con diferentes scopes y calificadores

---

### Módulo 04 — Properties, Profiles y Logging
- `04-Properties-Profiles-Logging/`

- application.properties vs application.yml: diferencias y buenas prácticas
- @Value para valores simples
- @ConfigurationProperties con @Validated (tipos seguros)
- @Profile: perfiles por entorno (dev, qa, prod)
- Archivos multi-documento YAML
- Logging: SLF4J + Logback, niveles (TRACE, DEBUG, INFO, WARN, ERROR)
- Configuración de appenders: consola, archivo, rolling file
- logback-spring.xml, @Profile en logging
- **Proyecto:** Configurar perfiles dev/prod con logging diferenciado por archivo

---

### Módulo 05 — DevTools y Empaquetado
- `05-DevTools-Empaquetado/`

- Spring Boot DevTools: LiveReload, auto-restart, remote tunneling
- Exclusión de recursos del reinicio automático
- Empaquetado: fat JAR con Maven (package) y Gradle (bootJar)
- Ejecución: java -jar, argumentos VM (--server.port=8081)
- Capas Docker optimizadas (layers) con spring-boot-maven-plugin
- spring-boot-run vs ejecutable JAR
- **Proyecto:** Empaquetar aplicación y ejecutar en Docker con multi-stage build
- **Integracin React:** Proyecto TaskFlow (ver [Temario React](/cursos/react/temario))

---

## Proyecto transversal: TaskFlow + Spring Task API

Este curso de Spring construye la **Task API** que sirve como backend del proyecto **TaskFlow** del curso de React.

| Curso | Rol | Tecnología |
|-------|-----|-------------|
| **Spring** (este curso) | Backend API REST | Java 17 + Spring Boot 3.x |
| **React** (curso hermano) | Frontend SPA | TypeScript + Vite + React 18 |

Al finalizar la Semana 2, la API de Tasks estará funcionando y lista para ser consumida desde React.
Al finalizar la Semana 4, la API estará protegida con JWT y React podrá autenticarse.

> ?? Ver `../React/Anexos/puente-integracion-react-spring.md` para la guía de conexión.

---

## SEMANA 2 — Capa Web y APIs REST

> **Objetivo:** Construir APIs REST completas con validación, documentación y testing.

---

### Módulo 06 — Spring MVC y REST APIs
- `06-Spring-MVC-REST/`

- @RestController vs @Controller (diferencia con vistas)
- @RequestMapping a nivel de clase y método
- HTTP methods: @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping
- ResponseEntity<T>: status code, headers, body
- @ResponseStatus, @ResponseBody
- Content Negotiation: produces/consumes (JSON, XML)
- Principios REST: stateless, recursos, HATEOAS
- **Proyecto:** CRUD completo de entidad Task con ResponseEntity
- **Integración React:** TaskFlow consume `GET /api/tasks`, `POST /api/tasks`, etc.

---

### Módulo 07 — Peticiones, Respuestas y DTOs
- `07-Peticiones-Respuestas-DTOs/`

- @RequestParam: parámetros de consulta, required, defaultValue
- @PathVariable: variables de ruta
- @RequestBody: cuerpo JSON a objeto
- @RequestHeader, @CookieValue
- @ModelAttribute para formularios
- DTOs vs Entidades: patrón de transferencia, separación de capas
- MapStruct y ModelMapper para mapeo DTO — Entidad
- Paginación: Pageable, Page<T>, Sort
- **Proyecto:** API de Tasks con paginación, filtros (completed, search) y DTOs con MapStruct

---

### Módulo 08 — Validación y Manejo de Excepciones
- `08-Validacion-Excepciones/`

- Bean Validation (Jakarta Validation): @NotBlank, @Email, @Size, @Pattern, @Positive, @Future
- @Valid y @Validated en controladores (@RequestBody, @RequestParam)
- Validación en cascada con @Valid en relaciones
- Validaciones personalizadas: @Constraint + ConstraintValidator
- @ControllerAdvice y @ExceptionHandler para manejo global
- Problem Details for HTTP APIs (RFC 9457) en Spring Boot 3.x
- ResponseEntityExceptionHandler personalizado
- **Proyecto:** Validación completa de Tasks + manejo centralizado de errores con RFC 9457

---

### Módulo 09 — Documentación con OpenAPI/Swagger
- `09-Documentacion-OpenAPI/`

- springdoc-openapi: dependencia starter
- Configuración: OpenAPI bean con info, servers, security schemes
- Anotaciones: @Operation, @ApiResponse, @Schema, @Parameter
- Swagger UI: http://localhost:8080/swagger-ui.html
- JSON spec: /v3/api-docs
- Agrupación de endpoints por tags
- Ejemplos de request/response con @Schema(example)
- **Proyecto:** Documentar API de Tasks con OpenAPI completo

---

### Módulo 10 — Testing de APIs
- `10-Testing-APIs/`

- @SpringBootTest y sus variantes (webEnvironment)
- @WebMvcTest para tests de capa web
- MockMvc: perform, expect, andReturn, andExpect
- Mockito: @MockBean, when, verify, ArgumentCaptor
- JsonPath y Hamcrest matchers para assertions
- @AutoConfigureMockMvc
- Cobertura con JaCoCo (jacoco-maven-plugin)
- **Proyecto:** Tests de integración del CRUD de Tasks con MockMvc

---

## SEMANA 3 — Capa de Datos

> **Objetivo:** Dominar JPA, consultas avanzadas, transacciones, migraciones y testing de datos.

---

### Módulo 11 — Spring Data JPA y ORM
- `11-Spring-Data-JPA/`

- JPA, Hibernate, Spring Data JPA: diferencias y relación
- @Entity, @Table, @Id, @GeneratedValue (strategies: IDENTITY, SEQUENCE, UUID)
- Mapeo de tipos: @Column, @Temporal, @Enumerated, @Lob
- Relaciones: @OneToOne, @OneToMany, @ManyToOne, @ManyToMany
- Fetch types: LAZY vs EAGER, @JsonIgnore, @JsonProperty
- JpaRepository, CrudRepository, PagingAndSortingRepository
- Métodos derivados del nombre del método
- **Proyecto:** Modelo relacional completo: User, Task, Label, Comment, Project
- **Modelo de datos:**
  ```
  User ????1:N????? Task
  Project ?1:N????? Task
  Task ????N:M????? Label
  Task ????1:N????? Comment
  User ????1:N????? Comment
  ```

---

### Módulo 12 — Consultas Avanzadas JPA
- `12-Consultas-Avanzadas-JPA/`

- Métodos derivados: findBy..., countBy..., existsBy..., deleteBy...
- @Query con JPQL (Java Persistence Query Language)
- @Query con Native Queries (SQL nativo)
- @Modifying + @Transactional para operaciones de escritura
- Criteria API: CriteriaBuilder, CriteriaQuery, Predicate, Root
- JpaSpecificationExecutor para filtros dinámicos
- Projections: interfaces cerradas, interfaces abiertas, clases DTO
- **Proyecto:** Consultas dinámicas sobre Tasks: filtrar por label, completed, userId, fecha con Specifications + Projections

---

### Módulo 13 — Transacciones y Migraciones
- `13-Transacciones-Migraciones/`

- @Transactional: propagación (REQUIRED, REQUIRES_NEW, SUPPORTS, NESTED)
- Niveles de aislamiento: READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE
- timeout, readOnly, rollbackFor, noRollbackFor
- Comportamiento con checked vs unchecked exceptions
- Locking optimista: @Version
- Locking pesimista: @Lock(LockModeType.PESSIMISTIC_WRITE)
- Flyway: V1__init.sql, V2__alter.sql, undo, repair, baseline
- Liquibase: changelog en XML/YAML/JSON/SQL
- **Proyecto:** Transacciones en Task API con locking optimista (@Version en Task) + migraciones Flyway

---

### Módulo 14 — Spring Data REST
- `14-Spring-Data-REST/`

- spring-boot-starter-data-rest: exposición automática de repositorios
- @RepositoryRestResource, @RestResource, @RestRepository
- Formatos: HAL, JSON, Collection+JSON
- HAL Explorer para navegación de APIs
- Validación y eventos: BeforeCreate, AfterCreate, BeforeSave, AfterSave...
- @RepositoryEventHandler para eventos personalizados
- Paginación y ordenamiento automáticos
- **Proyecto:** Exponer Task, Label y Comment como API REST con Data REST

---

### Módulo 15 — Testing de Capa de Datos
- `15-Testing-Capa-Datos/`

- @DataJpaTest para tests de repositorios
- @AutoConfigureTestDatabase: H2 en memoria (default) vs MySQL/PostgreSQL real
- TestContainers: PostgreSQL, MySQL, Oracle en contenedores Docker
- @TestMethodOrder y @Sql para carga de datos
- @SqlConfig, @SqlGroup
- @ActiveProfiles para configurar entorno de test
- AssertJ para aserciones fluyentes
- **Proyecto:** Tests de repositorios de Task, User, Label, Comment con H2 y TestContainers PostgreSQL

---

## SEMANA 4 — Seguridad y Features Avanzadas

> **Objetivo:** Implementar seguridad, AOP, async, cache y performance.

---

### Módulo 16 — Spring Security
- `16-Spring-Security/`

- SecurityFilterChain: cadena de filtros de seguridad
- @EnableWebSecurity, @EnableMethodSecurity
- AuthenticationProvider, UserDetailsService, AuthenticationManager
- PasswordEncoder: BCrypt, SCrypt, Argon2
- Autorización: .hasRole(), .hasAuthority(), .hasAnyRole(), .access()
- @PreAuthorize, @PostAuthorize, @Secured, @RolesAllowed
- CSRF: cuándo habilitar/deshabilitar (APIs REST)
- CORS: @CrossOrigin, CorsConfigurationSource
- Headers de seguridad: HSTS, X-Content-Type-Options, X-Frame-Options
- **Proyecto:** Seguridad con login basado en formulario + roles ADMIN/USER
- **Integración React:** Auth endpoints (`POST /api/auth/login`, `POST /api/auth/register`) usados por TaskFlow

---

### Módulo 17 — JWT y OAuth2
- `17-JWT-OAuth2/`

- JWT: estructura (header, payload, signature), algoritmos HMAC/RSA/EC
- Generación de JWT con jjwt (io.jsonwebtoken)
- Filtro JWT personalizado: OncePerRequestFilter
- AuthenticationToken personalizado
- Refresh tokens: rotación y revocación
- OAuth2 Resource Server: spring-boot-starter-oauth2-resource-server
- OAuth2 Client: login con Google, GitHub
- Keycloak: instalación, realm, client, users
- **Proyecto:** API de Tasks protegida con JWT + Resource Server + Keycloak
- **Integración React:** TaskFlow envía JWT en cada petición (`Authorization: Bearer <token>`)

---

### Módulo 18 — Spring AOP
- `18-Spring-AOP/`

- Conceptos: Aspect, JoinPoint, Pointcut, Advice, Weaving (compilación/ejecución)
- @Aspect, @EnableAspectJAutoProxy
- Tipos de Advice: @Around, @Before, @After, @AfterReturning, @AfterThrowing
- Pointcut expressions: execution(), within(), @annotation(), args(), bean()
- JoinPoint API: getArgs(), getSignature(), getTarget()
- Orden de aspectos con @Order
- CGLIB vs JDK Dynamic Proxies: diferencias y configuración
- Casos: logging, métricas, seguridad, transacciones declarativas
- **Proyecto:** Aspecto para loguear tiempos de ejecución + métricas de métodos

---

### Módulo 19 — Async, Scheduling y Eventos
- `19-Async-Scheduling-Eventos/`

- @Async, @EnableAsync, ThreadPoolTaskExecutor
- Future, CompletableFuture, ListenableFuture
- @Scheduled: fixedRate, fixedDelay, initialDelay, cron expressions
- Cron: segundo, minuto, hora, día del mes, mes, día de la semana
- @EventListener, @TransactionalEventListener (AFTER_COMMIT, AFTER_ROLLBACK)
- @EventPublisher, ApplicationEventPublisher
- Manejo de errores: AsyncUncaughtExceptionHandler
- **Proyecto:** Procesamiento asíncrono de pedidos + tareas programadas + eventos

---

### Módulo 20 — Cache y Rendimiento
- `20-Cache-Rendimiento/`

- Spring Cache Abstraction: CacheManager, Cache
- @Cacheable: key generation, condition, unless, sync
- @CacheEvict: allEntries, beforeInvocation
- @CachePut para actualización
- @Caching para combinaciones
- @CacheConfig a nivel de clase
- Proveedores: Caffeine (en memoria), Redis (distribuido), Hazelcast
- Métricas de caché con Actuator
- Estrategias de invalidación TTL, LRU, LFU
- **Proyecto:** Cachear consultas de productos con Caffeine y Redis

---

## SEMANA 5 — Microservicios y Proyecto Final

> **Objetivo:** Arquitectura de microservicios, cloud, mensajería, monitoreo y proyecto integrador.

---

### Módulo 21 — Cloud Config y Service Discovery
- `21-Cloud-Config-Discovery/`

- Arquitectura de microservicios: ventajas, desafíos, patrones
- Spring Cloud Config: Config Server (git-backed) + Config Client
- Spring Cloud Bus + RabbitMQ para refresco dinámico de configuración
- Service Discovery: Eureka Server / Eureka Client
- Registro y descubrimiento automático
- Spring Cloud LoadBalancer: @LoadBalanced RestClient/WebClient
- **Proyecto:** 2 microservicios registrados en Eureka con Config Server centralizado

---

### Módulo 22 — API Gateway y Resilience4j
- `22-Gateway-Resilience4j/`

- Spring Cloud Gateway: rutas, predicados, filtros
- Filtros: AddRequestHeader, RewritePath, CircuitBreaker, Retry
- Resilience4j: Circuit Breaker (states: CLOSED, OPEN, HALF_OPEN)
- @CircuitBreaker, @Retry, @RateLimiter, @Bulkhead, @TimeLimiter
- Fallback methods y configuraciones
- Actuator + métricas de Resilience4j
- **Proyecto:** Gateway que enruta y protege microservicios con Circuit Breaker

---

### Módulo 23 — Mensajería con Spring
- `23-Mensajeria-Kafka-RabbitMQ/`

- **RabbitMQ:** exchange (direct, topic, fanout), queue, binding, @RabbitListener
- RabbitTemplate: convertAndSend, receiveAndConvert
- Dead Letter Queue (DLQ), retry, manual ack
- **Kafka:** topics, partitions, offsets, @KafkaListener, KafkaTemplate
- Kafka: consumer groups, replay, idempotent producer
- Transacciones y exactly-once semantics
- Spring Cloud Stream: @Input, @Output, binder abstraction
- **Proyecto:** Sistema de pedidos con eventos via RabbitMQ y Kafka

---

### Módulo 24 — Actuator y Monitoreo
- `24-Actuator-Monitoreo/`

- spring-boot-starter-actuator: endpoints de monitoreo
- Endpoints: /health, /metrics, /info, /env, /loggers, /threaddump, /heapdump
- Custom HealthIndicator: DatabaseHealthIndicator, RedisHealthIndicator
- Custom InfoContributor para metadatos
- Micrometer: métricas a Prometheus (registry prometheus)
- Grafana: dashboards personalizados
- Distributed tracing: Micrometer Tracing (antes Spring Cloud Sleuth)
- Zipkin: visualización de traces
- **Proyecto:** Dashboard Grafana + Zipkin para monitoreo de microservicios

---

### Módulo 25 — Proyecto Final + Simulación de Entrevista
- `25-Proyecto-Final-Entrevista/`

**Módulo capstone integrador.** Simula un escenario real de desarrollo y entrevista técnica Spring.

- **Proyecto E-commerce:** 3-4 microservicios (product-service, order-service, user-service, gateway)
- **Requisitos técnicos:**
  - API REST con Spring MVC
  - Persistencia con Spring Data JPA + PostgreSQL
  - Seguridad con JWT + OAuth2 + Keycloak
  - Procesamiento asíncrono con @Async y RabbitMQ
  - Caché con Redis
  - API Gateway con Spring Cloud Gateway
  - Circuit Breaker con Resilience4j
  - Monitoreo con Actuator + Prometheus + Grafana
  - Docker Compose para toda la infraestructura
- 10 ejercicios de entrevista técnica de complejidad creciente
- Cuestionario de 60 preguntas (6 categorías)
- **Entregable:** Repositorio completo con el proyecto funcional + despliegue

---

## Resumen del Calendario

| Semana | Módulos | Fase | Contenido |
|--------|---------|------|-----------|
| **1** | 01 — 05 | Fundamentos Spring | IoC, Boot, Beans, Properties, DevTools |
| **2** | 06 — 10 | Capa Web | MVC/REST, Peticiones, Validación, OpenAPI, Testing |
| **3** | 11 — 15 | Capa de Datos | JPA, Consultas Avanzadas, Transacciones, Data REST, Testing DB |
| **4** | 16 — 20 | Seguridad y Avanzado | Security, JWT/OAuth2, AOP, Async, Cache |
| **5** | 21 — 25 | Microservicios y Final | Cloud Config, Gateway, Mensajería, Monitoreo, Proyecto Final |

---

## Dominios de Negocio por Fase

| Fase | Dominio | Entidades principales |
|------|---------|----------------------|
| Fundamentos | Health Check / Demo | Task básica (sin persistencia) |
| Capa Web | Task API REST | Task, TaskRequest, TaskResponse |
| Capa de Datos | Task Manager | User, Task, Label, Comment, Project |
| Seguridad | Usuarios y Roles | User, Role, JWT |
| Microservicios | E-commerce distribuido | products, orders, users, gateway |

---

## Criterios Generales de Evaluación

| Nivel | Descripción |
|-------|-------------|
| OK **Aprobado** | El código compila, ejecuta sin errores y produce el resultado esperado |
| Revisar **Revisar** | Funciona pero usa anti-patrones (ej: inyección por campo, @RequestMapping sin método, lógica en controladores) |
| Repetir **Repetir** | No compila, resultado incorrecto, o no entiende el concepto evaluado |

### Rúbrica por ejercicio

- **Corrección funcional (40%):** El código hace lo que se pide
- **Buenas prácticas (25%):** Nomenclatura, DI por constructor, separación en capas
- **Manejo de errores (20%):** Excepciones manejadas correctamente
- **Eficiencia (15%):** Usa paginación, caché, lazy loading apropiadamente

---

## Línea de Tiempo y Diagrama de Avance (Gantt)

```
SEMANA 1                  SEMANA 2                  SEMANA 3                  SEMANA 4                  SEMANA 5
Fundamentos Spring        Capa Web                  Capa de Datos             Seguridad+Avanzado         Microservicios+Final
```

### Hitos por Semana

| Semana | Día | Hito | Módulo | Entregable |
|--------|-----|------|--------|------------|
| **1** | Lun | OK IoC y DI comprendidos | M01 | Proyecto con DI por constructor |
| **1** | Mar | OK Spring Boot configurado | M02 | Endpoint /api/health funcionando |
| **1** | Mié | OK Beans y scopes dominados | M03 | Beans con diferentes scopes |
| **1** | Jue | OK Profiles y logging configurados | M04 | Perfiles dev/prod con log separado |
| **1** | Vie | OK App empaquetada en Docker | M05 | Imagen Docker ejecutándose |
| **2** | Lun | OK CRUD REST completo | M06 | API CRUD de Tasks |
| **2** | Mar | OK DTOs y paginación | M07 | API paginada con MapStruct |
| **2** | Mié | OK Validación + manejo errores | M08 | RFC 9457 implementado |
| **2** | Jue | OK API documentada | M09 | Swagger UI funcional |
| **2** | Vie | OK Tests de API pasando | M10 | Cobertura > 80% |
| **3** | Lun | OK Modelo relacional JPA | M11 | Entidades mapeadas correctamente |
| **3** | Mar | OK Consultas dinámicas | M12 | Specifications funcionales |
| **3** | Mié | OK Transacciones + Flyway | M13 | Migraciones ejecutadas |
| **3** | Jue | OK Data REST expuesto | M14 | API HAL navegable |
| **3** | Vie | OK Tests DB con TestContainers | M15 | Tests de repositorios verdes |
| **4** | Lun | OK Seguridad implementada | M16 | Login con roles funcional |
| **4** | Mar | OK JWT + Keycloak | M17 | API protegida con JWT |
| **4** | Mié | OK AOP implementado | M18 | Logging con aspectos |
| **4** | Jue | OK Async + eventos | M19 | Pedidos procesados asíncronamente |
| **4** | Vie | OK Caché funcionando | M20 | Redis cache operativo |
| **5** | Lun | OK Config Server + Eureka | M21 | Microservicios registrados |
| **5** | Mar | OK Gateway + Circuit Breaker | M22 | Enrutamiento y protección |
| **5** | Mié | OK Mensajería integrada | M23 | Eventos via RabbitMQ |
| **5** | Jue | OK Monitoreo operativo | M24 | Grafana + Zipkin funcionales |
| **5** | Vie | OK Proyecto final completo | M25 | Repositorio entregado |

### Progreso Visual

| Semana | Módulos | Avance | Barra de progreso |
|--------|---------|--------|--------------------|
| **1**   | 01 — 05 | 20%   | `#####---------------------`  5/25 |
| **2**   | 06 — 10 | 40%   | `##########----------------` 10/25 |
| **3**   | 11 — 15 | 60%   | `###############-----------` 15/25 |
| **4**   | 16 — 20 | 80%   | `####################------` 20/25 |
| **5**   | 21 — 25 | 100%  | `##########################` 25/25 |

> Marcar con `X` los módulos completados para seguimiento diario.

---

## Recursos de Referencia

- - **Spring Boot Reference Documentation:** https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/
- - **Spring Framework Documentation:** https://docs.spring.io/spring-framework/reference/
- - **Spring in Action, 6th Edition** — Craig Walls (Manning)
- - **Spring Security in Action** — Laurentiu Spilca (Manning)
- - **Baeldung:** https://www.baeldung.com/
- - **Spring Initializr:** https://start.spring.io
- - **IntelliJ IDEA:** https://www.jetbrains.com/idea/
- - **Plan de Acción:** `../Plan-Accion-Curso.md`

## Cursos en Video de Referencia

- - **Spring Boot 3 + Spring Framework 6 (inglés):** [YouTube - Amigoscode](https://www.youtube.com/watch?v=9SGDpanrc8U)
- - **Spring Boot Tutorial (inglés):** [YouTube - Telusko](https://www.youtube.com/watch?v=35EQXmHKZYs)
- - **Microservicios con Spring Boot (español):** [YouTube - Andrés Guzmán (Udemy)](https://www.udemy.com/course/spring-boot-microservicios/)
- - **Spring Security JWT (inglés):** [YouTube - Bouali Ali](https://www.youtube.com/watch?v=KxqlJblhzfI)

