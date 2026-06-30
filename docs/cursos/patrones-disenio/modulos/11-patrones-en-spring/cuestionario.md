---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Self-Injection" en Spring y cómo resuelve el problema de `@Transactional` en self-invocation? ¿Por qué es controversial?

**Respuesta**: **Self-Injection** consiste en inyectar el propio bean en sí mismo para obtener una referencia al PROXY (no al target). `@Service public class MiServicio { @Autowired private MiServicio self; public void metodoNoTransactional() { self.metodoTransactional(); } }`. `self` apunta al proxy de Spring (con AOP), mientras que `this` apunta al objeto real (sin AOP). Esto resuelve el problema de que `this.metodoTransactional()` no pasa por el proxy. Es controversial porque: (1) **Acoplamiento circular**: el bean se inyecta a sí mismo — difícil de razonar y propenso a loops infinitos si no se usa con cuidado, (2) **Rompe el principio de diseño**: la clase expone su propia API interna a sí misma a través de una referencia proxy, lo cual es confuso en code review, (3) **Acoplamiento a Spring**: estás dependiendo explícitamente de la magia de proxies de Spring para que `self != this`, (4) **Alternativas más limpias**: extraer el método transaccional a otro bean, o usar `AopContext.currentProxy()`, o refactorizar usando AspectJ weaving.

**Por qué**: La documentación de Spring AOP menciona self-injection como workaround, pero lo desaconseja. Juergen Hoeller (Spring) ha dicho que es "a necessary evil, but not recommended for clean code." La solución preferida es extraer a otro bean o usar `@EnableAspectJAutoProxy(exposeProxy = true)` con `AopContext.currentProxy()`. En Spring Modulith (2023), el equipo recomienda evitar self-injection y usar eventos de aplicación para desacoplar.

---

### 3. [Investigar] ¿Qué es Spring Modulith y cómo implementa el patrón "Module" a nivel de arquitectura? ¿Qué patrones GoF se usan para garantizar la modularidad?

**Respuesta**: **Spring Modulith** (Oliver Drotbohm, 2023) es un toolkit para construir aplicaciones Spring modulares (modulith = monolito modular). Implementa el patrón **Module** usando: (1) **Event-Driven communication entre módulos**: los módulos se comunican vía `ApplicationEventPublisher` (Observer) — un módulo publica un evento de dominio y otros módulos reaccionan, (2) **Verificación de arquitectura en tests**: `Modulith.dependencyVerifier()` verifica que los módulos no accedan a clases internas de otros módulos (Adapter Pattern: interfaces públicas del módulo), (3) **Documentación asciidoc generada**: genera diagramas de módulos y sus dependencias (Composite document). Los patrones GoF usados: (a) **Facade**: cada módulo expone una API pública que oculta los internos, (b) **Observer**: comunicación entre módulos vía eventos, (c) **Adapter**: el event externalization adapta eventos internos a mensajería externa (Kafka), (d) **Mediator**: `ApplicationEventPublisher` actúa como mediador entre módulos. Spring Modulith formaliza prácticas que equipos maduros ya aplicaban manualmente.

**Por qué**: Oliver Drotbohm (Spring Data) creó Modulith inspirado por Domain-Driven Design y Package-by-Feature. La idea de "modulith" fue popularizada por Simon Brown (C4 Model) y el artículo "MonolithFirst" de Martin Fowler. Modulith proporciona tooling para lo que antes era disciplina manual: `.verify()` automáticamente detecta violaciones de acceso entre módulos.

---

### 4. [Investigar] ¿Qué es el patrón "BeanPostProcessor" en Spring internals y cómo implementa un Proxy Chain? Explicá la diferencia entre `BeanPostProcessor` y `BeanFactoryPostProcessor`.

**Respuesta**: `BeanPostProcessor` implementa un **Proxy Chain de post-procesamiento**: después de que Spring instancia un bean y lo configura (DI, `@Autowired`), una cadena de `BeanPostProcessor`s lo procesa secuencialmente. Cada BPP puede: (1) devolver el mismo bean, (2) devolver un wrapper/proxy alrededor del bean (ej. `AsyncAnnotationBeanPostProcessor` envuelve beans `@Async` con un proxy que ejecuta en thread pool), (3) modificar propiedades del bean. `BeanFactoryPostProcessor` opera a NIVEL DE DEFINICI—N de beans (ANTES de instanciar): modifica `BeanDefinition` metadata — ej. `PropertySourcesPlaceholderConfigurer` resuelve `${...}` placeholders en definiciones. La diferencia: BFPP modifica el PLANO de construcción (metadata); BPP modifica el OBJETO construido (instancia). Esta arquitectura de post-processors es un **Chain of Responsibility + Decorator**: cada processor toma el bean y opcionalmente lo envuelve o transforma, y la cadena es configurable y ordenada.

**Por qué**: Spring internals usan `BeanPostProcessor` masivamente: `AutowiredAnnotationBeanPostProcessor` procesa `@Autowired`, `PersistenceExceptionTranslationPostProcessor` traduce excepciones JPA a Spring DataAccessException, `ScheduledAnnotationBeanPostProcessor` procesa `@Scheduled`. El patrón es Chain of Responsibility: cada BPP decide si aplica o pasa al siguiente. `AbstractAutoProxyCreator` (que implementa AOP) es el BPP más importante — crea proxies alrededor de beans que tienen advisors aplicables.

---

### 5. [Conectar] La clase menciona que `JdbcTemplate` es Facade + Template Method. Conectá esto con `RestClient` (Spring 6.1+), el sucesor de `RestTemplate`: ¿cómo implementa el mismo concepto con una API fluent/builder moderna?

**Por qué**: Spring 6.1 (2023) introdujo `RestClient` como sucesor de `RestTemplate` (que ahora está en "maintenance mode"). Rossen Stoyanchev (Spring Web) diseñó `RestClient` con una API alineada a Java 21. `HttpExchange` (análogo a `@FeignClient` de Spring Cloud) genera el template en tiempo de compilación, eliminando runtime reflection — similar al modelo de Micronaut.

---

### 6. [Conectar] La clase explica AOP con `@Transactional`. Conectá esto con `@TransactionalEventListener` y la integración de transacciones con eventos: ¿cómo Spring garantiza que un evento solo se publique si la transacción commitea?

**Por qué**: `@TransactionalEventListener` fue introducido en Spring 4.2 (2015) por Juergen Hoeller. Usa `TransactionSynchronization` (que es un Observer de ciclo de vida de transacción). La documentación de Spring lo recomienda para "event listeners that must be invoked only after the transaction has completed successfully." Es un ejemplo de cómo Spring compone Proxy + Observer + Template Method en una sola anotación.

---

### 7. [Conectar] La clase menciona `Scope("prototype")` como Prototype en Spring. Conectá esto con `@RefreshScope` de Spring Cloud: ¿cómo implementa un scope dinámico que se recarga sin reiniciar?

**Respuesta**: `@RefreshScope` es un **Proxy + Prototype + Cache dinámico**. Internamente: (1) Spring crea un **proxy** (`ScopedProxyFactoryBean`) alrededor del bean con `@RefreshScope`, (2) el proxy mantiene un **cache** de instancias del bean, (3) cada vez que se accede al bean, el proxy retorna la instancia cacheada, (4) cuando el endpoint `/actuator/refresh` es invocado (o `RefreshScope.refreshAll()`), Spring: limpia el cache Y destruye todas las instancias existentes (cierra `@PreDestroy`), (5) la próxima vez que se acceda al bean, el proxy crea una NUEVA instancia (como Prototype) con la nueva configuración. Esto permite que un bean `@Value("${app.timeout}") int timeout` vea el nuevo valor sin reiniciar la JVM. Patrones involucrados: (a) **Proxy**: el bean inyectado es un proxy que intercepta accesos, (b) **Prototype**: bajo demanda, el proxy crea nuevas instancias, (c) **Observer**: `RefreshEventListener` escucha el evento `RefreshScopeRefreshedEvent` y limpia el cache, (d) **Caching Flyweight**: las instancias se cachean por scope.

**Por qué**: Spring Cloud (Dave Syer, Spencer Gibb) introdujo `@RefreshScope` en 2014. Funciona con Spring Cloud Config y Spring Cloud Bus para refrescar beans en múltiples instancias. La documentación lo describe como "a scope that allows beans to be refreshed dynamically." La implementación usa `GenericScope` (superclase) + `BeanLifecycleWrapper` (wrapper de la instancia cacheada).

---

### 8. [Cuestionar] ¿Es Spring Boot "opinionated" una violación del principio de "elegir el patrón adecuado para el problema"? ¿O es una curaduría experta que ahorra decisiones?

**Por qué**: Phil Webb (co-creador de Spring Boot) explicó que "opinionated defaults" es un principio de diseño, no una limitación. En "Spring Boot in Action" (Craig Walls), se enfatiza que Spring Boot es "opinionated to get you started, but flexible enough to adapt." La comparación es con Ruby on Rails (David Heinemeier Hansson) que es aún más opinionated. Spring Boot está en un punto medio entre "convention over configuration" y flexibilidad total.

---

### 9. [Cuestionar] ¿Es `@Transactional` un anti-patrón cuando se usa en el controller? Algunos defienden que la transacción debe estar en el service. ¿Hay fundamentos sólidos o es dogma?

**Respuesta**: Usar `@Transactional` en el controller NO es un anti-patrón per se, pero es una **mala práctica en la mayoría de los casos**. Fundamentos: (1) **Responsabilidad**: el controller es responsable de HTTP concerns (parsing, validation, response formatting); la transacción es un concern de negocio/persistencia. El controller NO debería saber si hay transacción o no — eso pertenece a la capa de servicio. (2) **Reutilización**: si la lógica transaccional está en el controller, no podés reutilizarla desde otro entry point (CLI, message listener, scheduled task). (3) **Testing**: testear un controller con `@SpringBootTest` + `@Transactional` es lento y pesado; testear un service con `@DataJpaTest` es rápido y liviano. (4) **Rollback de response**: si el controller escribe en el `HttpServletResponse` y luego la transacción hace rollback, enviaste una respuesta HTTP de éxito para una operación que no persistió. Sin embargo, hay CASOS donde `@Transactional` en el controller es aceptable: si el controller tiene lógica de negocio simple (CRUD) y no hay capa de servicio separada (proyectos pequeños), poner `@Transactional` en el controller evita crear un service anémico que solo delega al repository. La regla: si tenés service, la transacción va en el service. Si no tenés service (proyecto chico, prototipo), controller con `@Transactional` es pragmático.

**Por qué**: La documentación de Spring recomienda `@Transactional` en la capa de servicio. Oliver Gierke (Spring Data lead) ha dicho que es una "best practice, not a dogma." En proyectos reales con arquitectura hexagonal, la transacción está en el `ApplicationService` (caso de uso), no en el `WebAdapter` (controller).

---

### 10. [Cuestionar] ¿Está Spring volviéndose demasiado complejo con el tiempo (Spring Modulith, AOT, GraalVM, Native Images)? ¿Se está alejando del principio KISS que lo hizo popular?

**Respuesta**: Spring está VOLVI?NDOSE MÁS COMPLEJO en features pero NO necesariamente en complejidad para el desarrollador. La complejidad adicional (AOT compilation, GraalVM native images, Spring Modulith) es OPCIONAL y está detrás de defaults sensatos. Creás un proyecto Spring Boot 3.4 igual que en 2015: `@SpringBootApplication` + `@RestController` + `@Service`. La magia AOT y GraalVM es transparente si no la necesitás. Cuando la necesitás (serverless con cold start < 100ms), Spring te da LAS HERRAMIENTAS sin obligarte a cambiar a otro framework. Esto es KISS: el camino simple sigue siendo simple; el camino complejo está disponible. El riesgo es que la documentación y el ecosistema se fragmenten (tutoriales viejos no funcionan en nuevas versiones), pero el equipo de Spring (Sébastien Deleuze, Juergen Hoeller) mantiene backward compatibility y migraciones guiadas. La alternativa (Migrar de Spring a Micronaut/Quarkus solo para serverless) sería MÁS compleja para el ecosistema que agregar AOT a Spring.

**Por qué**: Rod Johnson (fundador) dijo en SpringOne 2022: "Spring's mission is to simplify Java development. Simplicity doesn't mean lack of features — it means the right defaults." Spring Boot 3.0 fue la mayor refactorización (Jakarta EE 9+, AOT, Observability), pero el equipo mantuvo la experiencia del desarrollador. La crítica es válida: la superficie de features crece más rápido que la documentación puede cubrir.

