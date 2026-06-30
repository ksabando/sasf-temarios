---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

## Categoría 3: JPA / Spring Data (10 preguntas)

21. **¿Qué anotación marca una clase como entidad JPA?**
    - a) @Table
    - b) @Entity
    - c) @Persistence
    - d) @Database
    - **Respuesta: b**

22. **¿Qué objeto representa el contexto de persistencia en JPA?**
    - a) Session
    - b) EntityManager
    - c) DatabaseContext
    - d) JpaContext
    - **Respuesta: b**

23. **¿Qué estrategia de generación de IDs usa AUTO por defecto?**
    - a) SEQUENCE
    - b) IDENTITY
    - c) TABLE
    - d) Depende del dialecto
    - **Respuesta: d**

24. **¿Qué anotación define una relación muchos a uno?**
    - a) @OneToMany
    - b) @ManyToOne
    - c) @ManyToMany
    - d) @OneToOne
    - **Respuesta: b**

25. **¿Qué tipo de fetch es el predeterminado en @ManyToOne?**
    - a) LAZY
    - b) EAGER
    - c) DEFAULT
    - d) NONE
    - **Respuesta: b**

26. **¿Qué anotación marca un método como transacción de base de datos?**
    - a) @Transactional
    - b) @Transaction
    - c) @Transact
    - d) @Commit
    - **Respuesta: a**

27. **¿Qué LockModeType evita escrituras concurrentes en una fila?**
    - a) OPTIMISTIC
    - b) PESSIMISTIC_WRITE
    - c) READ
    - d) WRITE
    - **Respuesta: b**

28. **¿Qué interfaz de Spring Data proporciona paginación?**
    - a) PagingAndSortingRepository
    - b) PageableRepository
    - c) PaginationRepository
    - d) SortRepository
    - **Respuesta: a**

29. **¿Qué herramienta gestiona migraciones de base de datos?**
    - a) Hibernate
    - b) Flyway / Liquibase
    - c) DDL-Auto
    - d) SchemaExport
    - **Respuesta: b**

30. **¿Qué anotación permite escribir consultas JPQL personalizadas?**
    - a) @SQL
    - b) @Query
    - c) @JPQL
    - d) @NativeQuery
    - **Respuesta: b**

---

## Categoría 4: Seguridad (10 preguntas)

31. **¿Qué protocolo usa JWT para autenticación?**
    - a) SAML
    - b) OAuth2
    - c) LDAP
    - d) BASIC_AUTH
    - **Respuesta: b**

32. **¿Qué partes componen un JWT?**
    - a) Header, Body, Signature
    - b) Header, Payload, Signature
    - c) Token, Secret, Hash
    - d) User, Password, Token
    - **Respuesta: b**

33. **¿Qué anotación restringe acceso por rol a nivel de método?**
    - a) @Secured
    - b) @PreAuthorize
    - c) @RolesAllowed
    - d) Todas las anteriores
    - **Respuesta: d**

34. **¿Qué bean configura la cadena de filtros de seguridad?**
    - a) SecurityFilterChain
    - b) FilterChainProxy
    - c) WebSecurityConfig
    - d) HttpSecurity
    - **Respuesta: a**

35. **¿Qué servidor de autenticación se usa en este curso?**
    - a) Auth0
    - b) Keycloak
    - c) Okta
    - d) Spring Security OAuth
    - **Respuesta: b**

36. **¿Qué grant_type se usa para login con usuario y contraseña?**
    - a) authorization_code
    - b) client_credentials
    - c) password
    - d) refresh_token
    - **Respuesta: c**

37. **¿Qué tipo de token usa OAuth2 Resource Server?**
    - a) Access Token
    - b) ID Token
    - c) Refresh Token
    - d) Client Token
    - **Respuesta: a**

38. **¿Qué hace @EnableMethodSecurity?**
    - a) Habilita seguridad a nivel de método
    - b) Habilita seguridad web
    - c) Configura CORS
    - d) Deshabilita CSRF
    - **Respuesta: a**

39. **¿Qué filtro de Gateway valida tokens JWT?**
    - a) TokenRelay
    - b) JwtValidation
    - c) OAuth2ResourceServer
    - d) SecurityFilter
    - **Respuesta: a**

40. **¿Qué algoritmo de firma usa JWT por defecto en Spring?**
    - a) HMAC-SHA256
    - b) RSA256
    - c) ECDSA
    - d) Ninguno, depende de configuración
    - **Respuesta: a**

---

## Categoría 5: AOP / Async / Cache (10 preguntas)

41. **¿Qué palabra clave define un punto de corte en AOP?**
    - a) @Aspect
    - b) @Pointcut
    - c) @JoinPoint
    - d) @Advice
    - **Respuesta: b**

42. **¿Qué advice se ejecuta antes y después del método?**
    - a) @Before
    - b) @After
    - c) @Around
    - d) @AfterReturning
    - **Respuesta: c**

43. **¿Qué anotación habilita el procesamiento asíncrono?**
    - a) @Async
    - b) @EnableAsync
    - c) @AsyncTask
    - d) @Asynchronous
    - **Respuesta: b**

44. **¿Qué tipo de return debe tener un método @Async?**
    - a) void
    - b) Future
    - c) CompletableFuture
    - d) Todos los anteriores
    - **Respuesta: d**

45. **¿Qué anotación almacena el resultado de un método en caché?**
    - a) @CacheStore
    - b) @Cacheable
    - c) @CachePut
    - d) @CacheGet
    - **Respuesta: b**

46. **¿Qué anotación elimina entradas de caché?**
    - a) @CacheEvict
    - b) @CacheRemove
    - c) @CacheDelete
    - d) @CacheInvalidate
    - **Respuesta: a**

47. **¿Qué implementación de caché se usa por defecto en Spring Boot?**
    - a) Redis
    - b) ConcurrentHashMap
    - c) EhCache
    - d) Hazelcast
    - **Respuesta: b**

48. **¿Qué expresión cron ejecuta una tarea cada minuto?**
    - a) 0 * * * * ?
    - b) */1 * * * *
    - c) 0 0/1 * * *
    - d) 0 */1 * ? * *
    - **Respuesta: a**

49. **¿Qué anotación programa tareas periódicas?**
    - a) @Scheduled
    - b) @Task
    - c) @Periodic
    - d) @CronTask
    - **Respuesta: a**

50. **¿Qué API de caché implementa @Cacheable?**
    - a) JCache (JSR-107)
    - b) Spring Cache Abstraction
    - c) Hibernate Cache
    - d) Redis Cache
    - **Respuesta: b**

---

## Categoría 6: Microservicios / Cloud (10 preguntas)

51. **¿Qué es Eureka?**
    - a) Un API Gateway
    - b) Un Service Registry
    - c) Un Config Server
    - d) Un Message Broker
    - **Respuesta: b**

52. **¿Qué puerto usa por defecto Spring Cloud Config Server?**
    - a) 8080
    - b) 8761
    - c) 8888
    - d) 9090
    - **Respuesta: c**

53. **¿Qué tipo de exchange de RabbitMQ usa routing key exacto?**
    - a) Direct
    - b) Topic
    - c) Fanout
    - d) Headers
    - **Respuesta: a**

54. **¿Qué concepto de Kafka permite paralelizar el consumo?**
    - a) Topic
    - b) Partition
    - c) Consumer Group
    - d) Broker
    - **Respuesta: b**

55. **¿Qué patrón de Resilience4j limita peticiones por segundo?**
    - a) Circuit Breaker
    - b) Retry
    - c) RateLimiter
    - d) Bulkhead
    - **Respuesta: c**

56. **¿Qué estado del Circuit Breaker permite peticiones de prueba?**
    - a) CLOSED
    - b) OPEN
    - c) HALF_OPEN
    - d) TESTING
    - **Respuesta: c**

57. **¿Qué herramienta visualiza trazas distribuidas?**
    - a) Prometheus
    - b) Grafana
    - c) Zipkin
    - d) Elasticsearch
    - **Respuesta: c**

58. **¿Qué define un Predicate en Spring Cloud Gateway?**
    - a) Una regla de filtrado
    - b) Una condición para activar una ruta
    - c) Una transformación de URL
    - d) Una cabecera HTTP
    - **Respuesta: b**

59. **¿Qué anotación de Spring Cloud Stream produce mensajes?**
    - a) @Producer
    - b) Supplier
    - c) @Source
    - d) @Output
    - **Respuesta: b**

60. **¿Qué tipo de comunicación usan los microservicios en este proyecto para eventos de pedidos?**
    - a) REST síncrono
    - b) Mensajería asíncrona (RabbitMQ)
    - c) gRPC
    - d) WebSockets
    - **Respuesta: b**

