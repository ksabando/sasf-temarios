---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Saga" (Chris Richardson, microservices.io) y cómo se relaciona con Command? ¿Por qué una Saga es esencialmente una cadena de Commands con compensación?

**Respuesta**: **Saga** es un patrón de microservicios que garantiza consistencia eventual en transacciones distribuidas mediante una secuencia de **pasos locales**, cada uno con su **paso de compensación** (undo). En el corazón de una Saga hay una **cadena de Commands**: cada paso es un `SagaCommand.execute()`, y si falla, se ejecuta `SagaCommand.compensate()` en orden inverso (LIFO). La diferencia con Command GoF: (1) los comandos de una Saga son **distribuidos** (cada comando se ejecuta en un microservicio diferente), (2) la compensación no es simplemente deshacer el estado en memoria — requiere publicar un mensaje de compensación, (3) la Saga necesita **persistencia del estado de la saga** (Saga Log) para recuperarse de crashes del orquestador, (4) los comandos deben ser **idempotentes** (ejecutar dos veces el mismo comando no duplica efectos). En esencia, una Saga es Command GoF + distribución + idempotencia + compensación + persistencia de estado.

**Por qué**: Chris Richardson documentó Sagas en microservices.io (2015). Hector Garcia-Molina (Princeton) y Kenneth Salem (1987) definieron Sagas originalmente para bases de datos distribuidas. En la práctica, Axon Framework implementa Saga con `@SagaEventHandler` que es Command GoF: recibe un evento, decide qué comando disparar, y registra la compensación. Eventuate (de Chris Richardson) implementa Tram (Transaction Messaging) con Sagas sobre Kafka.

---

### 3. [Investigar] ¿Cómo implementa Redux en React el patrón Command? ¿Qué rol juegan las "actions" y los "reducers" en la arquitectura Command de Redux?

**Por qué**: Dan Abramov (creador de Redux) basó Redux en Flux (Facebook) y Elm (lenguaje funcional). La arquitectura es Command GoF adaptado a programación funcional: actions son comandos, dispatch es el invoker, reducers son receivers puros. Redux DevTools permite "time-travel debugging" porque cada acción es un Command inmutable que puede re-ejecutarse para reconstruir cualquier estado — Memento + Command combinados.

---

### 4. [Investigar] ¿Qué es el patrón "Intercepting Filter" (Core J2EE Patterns, Alur et al.) y cómo se diferencia de Chain of Responsibility? ¿Por qué Spring Security usa ambos?

**Respuesta**: **Intercepting Filter** (Alur, Crupi, Malks — "Core J2EE Patterns", 2001) es un patrón donde una cadena de filtros pre-procesa y post-procesa requests HTTP antes de que lleguen al handler. La diferencia con Chain of Responsibility: (a) Intercepting Filter SIEMPRE ejecuta TODOS los filtros (pre + post processing), mientras Chain puede detenerse en cualquier eslabón, (b) Intercepting Filter es bidireccional (pre antes de delegar, post después), (c) el flujo es fijo y declarativo. Spring Security usa AMBOS: `SecurityFilterChain` es Intercepting Filter (cada filtro ejecuta pre + post alrededor de `chain.doFilter()`), pero también tiene comportamiento de Chain of Responsibility puro (un filtro de autenticación puede devolver 401 y NO llamar a `chain.doFilter()` — cortocircuito). En la práctica, `SecurityFilterChain` es un híbrido: Chain de GoF (cortocircuito en fallo de auth) + Intercepting Filter (pre/post processing para logging, CSRF).

**Por qué**: La confusión entre Chain of Responsibility e Intercepting Filter es común porque ambos son cadenas. Alur et al. documentaron Intercepting Filter en 2001 como patrón J2EE. Spring Security lo implementa como cadena de `jakarta.servlet.Filter`. La diferencia clave: en GoF Chain, el handler decide si propagar; en Intercepting Filter, la cadena siempre se recorre completa (pre) y en reverso (post) a menos que haya excepción. Spring Security permite ambos comportamientos según el filtro.

---

### 5. [Conectar] La clase presenta Command con `Runnable`. Conectá esto con el patrón "Job" en sistemas de procesamiento batch (Spring Batch, Apache Flink): ¿cómo un Job es un Command compuesto con estado y persistence?

**Respuesta**: En **Spring Batch**, un `Job` es un **MacroCommand** (GoF p. 241) con persistencia y recuperación. Un `Job` contiene `Step`s (sub-comandos) que se ejecutan secuencialmente. Cada `Step` es un Command con su propio `ItemReader`, `ItemProcessor`, `ItemWriter`. Spring Batch persiste el estado de cada Step en `JobRepository` (BD): qué steps se ejecutaron, cuáles fallaron, cuál es el último ítem procesado. Si un Job falla en el Step 3, al reiniciar, retoma desde el Step 3 con el offset guardado, sin re-ejecutar Steps 1 y 2. Esto extiende Command GoF con: (a) **persistencia del estado de ejecución** (Memento aplicado al Command), (b) **retry y skip policies** (el Command puede reintentar items individuales sin fallar el step entero), (c) **listeners de ciclo de vida** (Observer: `beforeStep`, `afterStep`, `onError`).

**Por qué**: Spring Batch fue diseñado por Dave Syer (Pivotal/VMware) inspirado en patrones de procesamiento batch. Un `Job` es Command GoF; `JobLauncher` es el Invoker; `JobRepository` es el Caretaker de Memento. La documentación de Spring Batch referencia explícitamente los patrones GoF en su arquitectura. Apache Flink usa el mismo concepto: un streaming job es un grafo de operadores (Commands conectados) con checkpointing (Memento del estado del stream).

---

### 6. [Conectar] La clase menciona `MacroComando` con `deshacer()` en orden incorrecto. Conectá esto con el patrón "Unit of Work" (Martin Fowler): ¿cómo un Unit of Work garantiza atomicidad en la ejecución de múltiples comandos?

**Respuesta**: **Unit of Work** (Fowler, PoEAA) mantiene una lista de operaciones pendientes sobre objetos y las ejecuta atómicamente en una transacción. Es un **MacroCommand transaccional**: registra inserts, updates, deletes como comandos, y en `commit()` los ejecuta todos en orden, o hace rollback si alguno falla. La diferencia con `MacroCommand`: (1) Unit of Work ordena automáticamente los comandos para respetar dependencias (insertar padre antes que hijos), (2) la compensación no es deshacer uno por uno — es ROLLBACK del RDBMS (el undo es automático), (3) mantiene identity map (si dos comandos modifican el mismo objeto, Unit of Work consolida en una sola operación). Hibernate `Session` y JPA `EntityManager` implementan Unit of Work. En el contexto de Command: cada `entityManager.persist(obj)` registra un comando en el Unit of Work; `entityManager.flush()` ejecuta todos los comandos; `transaction.commit()` confirma; `transaction.rollback()` compensa todos los comandos.

**Por qué**: Martin Fowler define Unit of Work en PoEAA (2002). La implementación en Hibernate (Gavin King) usa Command internamente: cada operación en la session se registra en un `ActionQueue` (insertions, updates, deletions) que se ejecuta ordenadamente en flush. Spring `@Transactional` integra Unit of Work con Command: el servicio emite comandos, y el proxy transactional los envuelve automáticamente en Unit of Work.

---

### 7. [Conectar] La clase compara Chain of Responsibility con Decorator. Conectá esto con el patrón "Pipes and Filters" (POSA): ¿cómo una tubería de filtros es un híbrido de Chain + Decorator + Command?

**Respuesta**: **Pipes and Filters** (POSA Vol 1, Buschmann et al.) es un patrón arquitectónico donde una tarea se descompone en filtros (pasos de procesamiento) conectados por pipes (canales de datos). Es un híbrido: (1) de **Chain of Responsibility** toma la idea de que cada filtro procesa y pasa al siguiente, con posibilidad de cortocircuito; (2) de **Decorator** toma la idea de transformación incremental de datos (cada filtro enriquece/modifica); (3) de **Command** toma la encapsulación de cada paso como una unidad de procesamiento (un filtro puede ser un comando). La diferencia: Pipes and Filters opera sobre STREAMS de datos (potencialmente infinitos), mientras Chain/Decorator operan sobre objetos discretos. En sistemas ETL: `leerCSV > filtrarColumnas > transformarFechas > agregarMetadatos > escribirParquet` — cada `>` es un pipe, cada paso es un filtro. Apache Camel implementa Pipes and Filters con DSL: `.from("file:input").filter().transform().to("file:output")`.

**Por qué**: Buschmann et al. en POSA Vol 1 (1996) definen Pipes and Filters como patrón arquitectónico. Es más antiguo que GoF (Unix pipes son Pipes and Filters). En Java, Stream API es Pipes and Filters: `stream.filter().map().collect()` es una tubería de filtros. Spring Integration y Apache Camel son frameworks dedicados al patrón. La combinación de Chain + Decorator en Pipes and Filters es natural porque los filtros pueden tanto detener el flujo (Chain) como transformar datos (Decorator).

---

### 8. [Cuestionar] ¿Es `Runnable` realmente un Command? Algunos argumentan que `Runnable` solo especifica UNA operación (`run()`) y que le falta `undo()`, `getState()`, etc. ¿Es un Command minimalista o un caso degenerado?

**Respuesta**: `Runnable` es un **Command GoF en su forma más minimalista y exitosa**. GoF definen Command con al menos `execute()`. `Runnable` tiene `run()` = `execute()`. Que no tenga `undo()` no lo descalifica — GoF (p. 240) presentan undo como una extensión opcional ("Commands support undo. The Command interface must have an added Unexecute operation that reverses the effects of a previous Execute"). La mayoría de los Commands en el mundo real NO son reversibles (enviar un email, cobrar una tarjeta, enviar un mensaje a Kafka). `Runnable` representa el caso más común: ejecutá esta acción. Su minimalismo es su fortaleza: si necesitás `undo()`, `getState()`, `getDescription()`, extendés la interfaz. El éxito de `Runnable` como Command se mide por su ubicuidad: `Executor`, `Thread`, `ScheduledExecutorService`, `CompletableFuture` — todos usan `Runnable` como Command sin que nadie lo llame patrón. Es el ejemplo perfecto de un patrón que desapareció en la infraestructura del lenguaje.

**Por qué**: GoF (p. 236) describen Command con `execute()`. `Runnable` (Java 1.0, 1996) surgió 2 años después del libro. El equipo de Java (Arthur Van Hoff) no dijo "implementemos Command" — simplemente necesitaban una interfaz para tareas. El patrón emergió naturalmente. Josh Bloch en Effective Java Item 54 recomienda `Runnable` sobre `Thread` extendido. La comunidad funcional llama a esto "reified function" — una función convertida en objeto.

---

### 9. [Cuestionar] ¿Es Chain of Responsibility un anti-patrón en APIs REST cuando se usa para validación? Algunos equipos prefieren validación declarativa (Bean Validation) sobre cadenas de validadores. Debate.

**Respuesta**: **A favor de Chain para validación**: cada validador (`ValidadorNoNulo`, `ValidadorEmail`, `ValidadorEdad`) es independiente, testeable aisladamente, reusable, y componible. Si mañana necesitás agregar `ValidadorTelefono`, lo insertás en la cadena sin modificar los demás validadores (OCP). **A favor de validación declarativa (Bean Validation)**: con `@NotNull`, `@Email`, `@Min(18)`, la validación está junto al modelo (cerca del invariante), es visible en la clase de dominio, y el framework (`Validator`) ejecuta todas las validaciones y reporta errores múltiples automáticamente. La cadena de validadores falla en el PRIMER error (a menos que captures excepciones), mientras que Bean Validation recolecta TODOS los errores — el usuario prefiere saber todos los campos inválidos de una vez. **Conclusión**: Chain es mejor para validación de NEGOCIO con reglas dependientes del contexto (una orden requiere validación de crédito solo si el monto > $1000); Bean Validation es mejor para validación de INTEGRIDAD estructural (formato de email, campos requeridos). En Spring, se usan AMBOS: `@Valid` para integridad, `Validator` custom en el service para reglas de negocio con Chain.

**Por qué**: Bean Validation (JSR 380, Emmanuel Bernard) es el estándar para validación declarativa. GoF Chain es el estándar para pipelines de procesamiento. Spring `MethodValidationPostProcessor` aplica Bean Validation con AOP. La cadena de validadores de la clase es didáctica, pero en producción nadie escribe `ValidadorEmail` manual — usás `@Email`. El equilibrio real es: Bean Validation para el modelo; Chain para el pipeline.

---

### 10. [Cuestionar] La clase muestra Command con undo. Pero en sistemas de microservicios, undo distribuido (Saga) introduce el problema de "falta de atomicidad en compensación". ¿Puede Command realmente garantizar undo? ¿O es una ilusión?

**Respuesta**: Command con undo **local** (mismo proceso) es real y funciona: el comando guarda el estado anterior (Memento) o ejecuta la operación inversa. Ejemplo: `EscribirComando` guarda el texto anterior en un Memento y undo restaura. **En sistemas distribuidos**, el undo es una **ilusión parcial**: (1) el comando de compensación puede FALLAR (si el servicio downstream está caído), (2) entre que el comando original se ejecutó y el comando de compensación se ejecuta, otros servicios pueden haber actuado basados en el estado cambiado (efectos secundarios no reversibles), (3) si el mensaje de compensación se pierde (red), la compensación nunca ocurre. La solución no es Command puro, sino: (a) **Outbox Pattern** (garantiza que el mensaje de compensación eventualmente se publique), (b) **idempotencia** (el comando se puede re-ejecutar sin duplicar efectos), (c) **Saga Log** (persistencia del estado de la saga para recuperación manual). En resumen: Command con undo LOCAL es real; Command con undo DISTRIBUIDO requiere infraestructura adicional (Outbox, idempotencia, message broker con at-least-once delivery) y aún así la compensación eventual no es atómica — es "eventualmente consistente".

**Por qué**: Pat Helland (Amazon, Microsoft) escribió "Life beyond Distributed Transactions: an Apostate's Opinion" (2007) argumentando que las transacciones distribuidas ACID son imposibles a escala. Sagas (Garcia-Molina, 1987) son la alternativa con compensación eventual. En microservicios, el undo perfecto no existe — siempre hay un "compensation gap" entre la ejecución y la compensación. La respuesta madura es: diseñá comandos con idempotencia y compensación eventual, no pretendas atomicidad distribuida.

