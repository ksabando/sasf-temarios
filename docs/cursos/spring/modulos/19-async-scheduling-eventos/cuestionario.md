---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Async, Scheduling y Eventos

**Pregunta 1:** ¿Qué hace la anotación `@Async` en Spring?
**Respuesta:** Permite que un método se ejecute en un hilo separado, de forma asíncrona, usando un `TaskExecutor`.

**Pregunta 2:** ¿Qué anotación habilita el procesamiento asíncrono?
**Respuesta:** `@EnableAsync` en una clase de configuración.

**Pregunta 3:** ¿Cuál es la diferencia entre `fixedRate` y `fixedDelay` en `@Scheduled`?
**Respuesta:** `fixedRate` ejecuta cada N ms sin esperar a que termine la tarea anterior. `fixedDelay` espera N ms después de que finalice la ejecución anterior.

**Pregunta 4:** ¿Qué expresión cron ejecuta una tarea cada 30 minutos?
**Respuesta:** `0 */30 * * * *` (segundo=0, cada 30 minutos).

**Pregunta 5:** ¿Cómo se publica un evento en Spring?
**Respuesta:** Inyectando `ApplicationEventPublisher` y llamando `publishEvent(new MiEvento(...))`.

**Pregunta 6:** ¿Cuál es la diferencia entre `@EventListener` y `@TransactionalEventListener`?
**Respuesta:** `@EventListener` escucha eventos en cualquier momento. `@TransactionalEventListener` solo se ejecuta en una fase específica de la transacción (commit, rollback, etc.).

**Pregunta 7:** ¿Qué clase se usa para configurar un pool de hilos personalizado para `@Async`?
**Respuesta:** `ThreadPoolTaskExecutor`, configurado como un bean de tipo `Executor`.

**Pregunta 8:** ¿Qué método de `CompletableFuture` combina múltiples futuros y espera que todos terminen?
**Respuesta:** `CompletableFuture.allOf(...)`.

**Pregunta 9:** ¿Cómo se manejan excepciones no capturadas en métodos `@Async`?
**Respuesta:** Implementando `AsyncUncaughtExceptionHandler` y configurándolo en `AsyncConfigurer.getAsyncUncaughtExceptionHandler()`.

**Pregunta 10:** ¿Cuál es el valor por defecto de `phase` en `@TransactionalEventListener`?
**Respuesta:** `TransactionPhase.AFTER_COMMIT`, que ejecuta el listener después de que la transacción se confirma exitosamente.

