---
sidebar_label: "Clase"
---

## 3. CompletableFuture

Java 8+ provee `CompletableFuture` para programación asíncrona funcional.

### Métodos principales

```java
// Crear
CompletableFuture.supplyAsync(() -> "resultado");
CompletableFuture.runAsync(() -> System.out.println("tarea"));

// Combinar
futuro1.thenCombine(futuro2, (r1, r2) -> r1 + r2);
futuro.thenApply(r -> r.toUpperCase());
futuro.thenAccept(r -> System.out.println(r));

// Manejar errores
futuro.exceptionally(ex -> "fallback");
futuro.handle((res, ex) -> ex != null ? "error" : res);
```

---

## 4. @Scheduled — Tareas Programadas

### Habilitar scheduling

```java
@Configuration
@EnableScheduling
public class SchedulingConfig { }
```

### Tipos de scheduling

| Atributo | Descripción |
|----------|-------------|
| `fixedRate` | Ejecuta cada N milisegundos, sin esperar a que termine |
| `fixedDelay` | Espera N ms después de que termine la ejecución anterior |
| `initialDelay` | Espera inicial antes de la primera ejecución |
| `cron` | Expresión cron para programación avanzada |

```java
@Component
public class TareasProgramadas {

    @Scheduled(fixedRate = 5000)
    public void ejecutarCada5Segundos() {
        System.out.println("Ejecutando cada 5s");
    }

    @Scheduled(fixedDelay = 3000, initialDelay = 10000)
    public void ejecutarConDelay() {
        System.out.println("Empieza en 10s, luego cada 3s tras finalizar");
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void ejecutarDiario8AM() {
        System.out.println("Ejecutando todos los días a las 8:00 AM");
    }
}
```

---

## 5. Cron Expressions

Formato: `segundo minuto hora día-del-mes mes día-de-la-semana`

```
 * * * * * *
```

### Ejemplos

| Expresión | Significado |
|-----------|-------------|
| `0 0 12 * * *` | Todos los días al mediodía |
| `0 0/5 9-18 * * *` | Cada 5 min entre 9:00 y 18:00 |
| `0 0 8 * * MON-FRI` | 8:00 AM de lunes a viernes |
| `0 0 0 1 1 *` | 1 de enero a medianoche |
| `0 */10 * * * *` | Cada 10 minutos |

---

## 6. Eventos con @EventListener

Spring permite comunicación débilmente acoplada entre beans mediante eventos.

### Evento personalizado

```java
public class PedidoCreadoEvent {
    private final Long pedidoId;
    private final String cliente;
    // constructor, getters
}
```

### Publicar evento

```java
@Service
public class PedidoService {

    @Autowired
    private ApplicationEventPublisher publisher;

    public void crearPedido(Pedido pedido) {
        // lógica de negocio
        publisher.publishEvent(new PedidoCreadoEvent(pedido.getId(), pedido.getCliente()));
    }
}
```

### Escuchar evento

```java
@Component
public class NotificacionListener {

    @EventListener
    public void manejarPedidoCreado(PedidoCreadoEvent event) {
        System.out.println("Enviando notificación a " + event.getCliente());
    }
}
```

---

## 7. @TransactionalEventListener

Escucha eventos después de que la transacción se complete (commit/rollback).

```java
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void despuesDeConfirmar(PedidoCreadoEvent event) {
    // solo si la transacción se confirmó
}
```

| Fase | Cuándo se ejecuta |
|------|-------------------|
| `AFTER_COMMIT` | Después de commit (default) |
| `AFTER_ROLLBACK` | Después de rollback |
| `AFTER_COMPLETION` | Después de commit o rollback |
| `BEFORE_COMMIT` | Antes del commit |

---

## 8. AsyncUncaughtExceptionHandler

Maneja excepciones no capturadas en métodos `@Async`.

```java
@Component
public class AsyncExceptionHandler implements AsyncUncaughtExceptionHandler {
    @Override
    public void handleUncaughtException(Throwable ex, Method method, Object... params) {
        System.err.println("Error en método asíncrono " + method.getName()
            + ": " + ex.getMessage());
    }
}

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new AsyncExceptionHandler();
    }
}
```

---

## Resumen

| Técnica | Anotación | Uso |
|---------|-----------|-----|
| Async | `@Async` | Ejecución en segundo plano |
| Scheduling | `@Scheduled` | Tareas temporizadas |
| Eventos | `@EventListener` | Comunicación desacoplada |
| Eventos transaccionales | `@TransactionalEventListener` | Eventos post-transacción |
