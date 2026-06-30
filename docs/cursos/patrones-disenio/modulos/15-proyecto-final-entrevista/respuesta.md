---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M15 — Proyecto Final: Integración de Patrones

## Ejercicio 1: Builder para Notificaciones

**Solución esperada**:

```java
public class Notificacion {
    private final String destinatario;
    private final String mensaje;
    private final CanalEnvio canal;
    private final Prioridad prioridad;
    private final LocalDateTime fechaProgramacion;
    private final List<String> adjuntos;
    private final Map<String, String> metadata;

    private Notificacion(Builder builder) {
        this.destinatario = builder.destinatario;
        this.mensaje = builder.mensaje;
        this.canal = builder.canal;
        this.prioridad = builder.prioridad;
        this.fechaProgramacion = builder.fechaProgramacion;
        this.adjuntos = Collections.unmodifiableList(builder.adjuntos);
        this.metadata = Collections.unmodifiableMap(builder.metadata);
    }

    public static class Builder {
        private String destinatario;
        private String mensaje;
        private CanalEnvio canal;
        private Prioridad prioridad = Prioridad.MEDIA;
        private LocalDateTime fechaProgramacion;
        private List<String> adjuntos = new ArrayList<>();
        private Map<String, String> metadata = new HashMap<>();

        public Builder destinatario(String d) { this.destinatario = d; return this; }
        public Builder mensaje(String m) { this.mensaje = m; return this; }
        public Builder canal(CanalEnvio c) { this.canal = c; return this; }
        public Builder prioridad(Prioridad p) { this.prioridad = p; return this; }
        public Builder fechaProgramacion(LocalDateTime f) { this.fechaProgramacion = f; return this; }
        public Builder addAdjunto(String a) { this.adjuntos.add(a); return this; }
        public Builder addMetadata(String k, String v) { this.metadata.put(k, v); return this; }

        public Notificacion build() {
            if (destinatario == null || destinatario.isBlank())
                throw new IllegalStateException("Destinatario obligatorio");
            if (mensaje == null || mensaje.isBlank())
                throw new IllegalStateException("Mensaje obligatorio");
            if (canal == null)
                throw new IllegalStateException("Canal obligatorio");
            return new Notificacion(this);
        }
    }

    // getters...
}

enum CanalEnvio { EMAIL, SMS, PUSH }
enum Prioridad { BAJA, MEDIA, ALTA }
```

**Posibles mejoras**:
- **Pasar a `record` con Builder (Java 16+)**: `Notificacion` es inmutable y solo tiene campos — candidata perfecta para `record`. El Builder puede seguir existiendo como clase separada que construye el record. Esto elimina boilerplate de getters, `equals`, `hashCode`, `toString`.
- **Validación con Jakarta Bean Validation**: en lugar de `if` manuales en `build()`, anotar los campos del Builder con `@NotBlank`, `@NotNull`, `@Email` y usar `Validator.validate()`. Los mensajes de error serían `Set<ConstraintViolation>` con mensajes internacionalizables.
- **Lombok `@Builder` + `@Singular`**: `@Builder` en la clase (con `@AllArgsConstructor(access = PRIVATE)`) y `@Singular` en `adjuntos` y `metadata` para que el builder soporte `adjunto("a").adjunto("b").clearAdjuntos()`. Esto genera ~150 líneas de código automáticamente.

## Ejercicio 2: Factory + Abstract Factory

**Solución esperada**:

```java
interface CanalEnvio {
    ResultadoEnvio enviar(Notificacion n);
}

class EmailAWS implements CanalEnvio {
    public ResultadoEnvio enviar(Notificacion n) {
        System.out.println("Enviando email vía AWS a " + n.getDestinatario());
        return new ResultadoEnvio(true, "EMAIL— + System.currentTimeMillis());
    }
}

class SMSAWS implements CanalEnvio {
    public ResultadoEnvio enviar(Notificacion n) {
        System.out.println("Enviando SMS vía AWS a " + n.getDestinatario());
        return new ResultadoEnvio(true, "SMS— + System.currentTimeMillis());
    }
}

class EmailMock implements CanalEnvio {
    public ResultadoEnvio enviar(Notificacion n) {
        System.out.println("[MOCK] Email a " + n.getDestinatario());
        return new ResultadoEnvio(true, "MOCK-EMAIL");
    }
}

class SMSMock implements CanalEnvio {
    public ResultadoEnvio enviar(Notificacion n) {
        System.out.println("[MOCK] SMS a " + n.getDestinatario());
        return new ResultadoEnvio(true, "MOCK-SMS");
    }
}

abstract class FabricaCanales {
    abstract CanalEnvio crearEmail();
    abstract CanalEnvio crearSMS();
    abstract CanalEnvio crearPush();
}

class FabricaProduccion extends FabricaCanales {
    CanalEnvio crearEmail() { return new EmailAWS(); }
    CanalEnvio crearSMS() { return new SMSAWS(); }
    CanalEnvio crearPush() { return new PushFirebase(); }
}

class FabricaTesting extends FabricaCanales {
    CanalEnvio crearEmail() { return new EmailMock(); }
    CanalEnvio crearSMS() { return new SMSMock(); }
    CanalEnvio crearPush() { return new PushMock(); }
}
```

**Posibles mejoras**:
- **Registry dinámico con ServiceLoader**: en lugar de hardcodear las clases en `FabricaProduccion`, usar `ServiceLoader.load(CanalEnvio.class)` o un `Map<TipoCanal, Supplier<CanalEnvio>>` inyectado. Esto permite agregar nuevos proveedores (SendGrid en lugar de AWS) vía dependencia Maven sin modificar la fábrica.
- **`@ConditionalOnMissingBean` con Spring**: `FabricaCanales` como interfaz y Spring auto-configuration que crea `FabricaProduccion` si no hay un bean custom. Esto permite que proyectos que usen la librería sobrescriban canales específicos sin tocar el código de la fábrica.
- **Feature flag por canal**: `crearEmail()` podría consultar `featureFlagService.isEnabled("email.sendgrid")` y devolver `SendGridEmail()` si está activo, `EmailAWS()` si no. Esto permite A/B testing de proveedores en producción sin recompilar.

## Ejercicio 3: Chain of Responsibility

**Solución esperada**:

```java
abstract class ProcesadorNotificacion {
    protected ProcesadorNotificacion siguiente;
    ProcesadorNotificacion setSiguiente(ProcesadorNotificacion s) { this.siguiente = s; return s; }
    abstract void procesar(Notificacion n);
    void siguiente(Notificacion n) { if (siguiente != null) siguiente.procesar(n); }
}

class ValidadorNotificacion extends ProcesadorNotificacion {
    void procesar(Notificacion n) {
        if (!n.getDestinatario().contains("@") && n.getCanal() == CanalEnvio.EMAIL)
            throw new IllegalArgumentException("Email inválido: " + n.getDestinatario());
        if (n.getMensaje() == null || n.getMensaje().isBlank())
            throw new IllegalArgumentException("Mensaje vacío");
        System.out.println("Validación OK");
        siguiente(n);
    }
}

class TransformadorMensaje extends ProcesadorNotificacion {
    void procesar(Notificacion n) {
        if (!n.getMensaje().startsWith("<html>")) {
            String html = "<html><body><p>" + n.getMensaje() + "</p></body></html>";
            // n.setMensaje(html) // si fuera mutable
            System.out.println("Transformado a HTML");
        }
        siguiente(n);
    }
}

class EnriquecedorNotificacion extends ProcesadorNotificacion {
    void procesar(Notificacion n) {
        // n.addMetadata("trackingId", UUID.randomUUID().toString());
        System.out.println("Enriquecido con metadata");
        siguiente(n);
    }
}
```

**Posibles mejoras**:
- **Pipeline inmutable con `andThen` funcional**: en lugar de mutar `ProcesadorNotificacion` con `setSiguiente()`, usar `Function<Notificacion, Notificacion>` con `andThen()`. Cada paso retorna una nueva `Notificacion` (inmutable) modificada. Esto es más funcional y evita efectos secundarios entre pasos.
- **Manejo de errores con `Either` monádico**: cada paso de la cadena retorna `Either<Error, Notificacion>`. Si un paso falla, el error se propaga sin ejecutar los pasos siguientes. `flatMap` encadena los pasos. Esto elimina las excepciones como flujo de control y hace el pipeline más predecible.
- **Configuración externa del orden de los pasos**: cargar la secuencia de procesadores desde un archivo YAML: `pipeline: [validador, transformador, enriquecedor]`. Usar reflexión o un registry de beans de Spring para instanciarlos por nombre. Esto permite cambiar el orden o agregar/quitar pasos sin recompilar.

## Ejercicio 4: Decorator

**Solución esperada**:

```java
abstract class CanalDecorator implements CanalEnvio {
    protected CanalEnvio wrappee;
    CanalDecorator(CanalEnvio w) { this.wrappee = w; }
    public ResultadoEnvio enviar(Notificacion n) { return wrappee.enviar(n); }
}

class LoggingDecorator extends CanalDecorator {
    LoggingDecorator(CanalEnvio w) { super(w); }
    public ResultadoEnvio enviar(Notificacion n) {
        System.out.println("[LOG] Enviando a " + n.getDestinatario() + " vía " + n.getCanal());
        long start = System.currentTimeMillis();
        ResultadoEnvio res = super.enviar(n);
        long ms = System.currentTimeMillis() - start;
        System.out.println("[LOG] Resultado: " + res.isExito() + " (" + ms + "ms)");
        return res;
    }
}

class SeguridadDecorator extends CanalDecorator {
    SeguridadDecorator(CanalEnvio w) { super(w); }
    public ResultadoEnvio enviar(Notificacion n) {
        String cifrado = "ENC(" + n.getMensaje() + ")";
        System.out.println("Mensaje cifrado: " + cifrado);
        return super.enviar(n);
    }
}

class ReintentoDecorator extends CanalDecorator {
    private int maxReintentos = 3;
    ReintentoDecorator(CanalEnvio w) { super(w); }
    public ResultadoEnvio enviar(Notificacion n) {
        for (int i = 1; i <= maxReintentos; i++) {
            ResultadoEnvio res = super.enviar(n);
            if (res.isExito()) return res;
            System.out.println("Reintento " + i + "/" + maxReintentos);
        }
        return new ResultadoEnvio(false, "FALL—");
    }
}
```

**Posibles mejoras**:
- **Backoff exponencial con jitter**: `ReintentoDecorator` actualmente reintenta inmediatamente. Agregar `Thread.sleep()` con backoff exponencial: `delay = min(100 * 2^i + random(0, 100), 10000)`. Esto evita thundering herd cuando el servicio downstream se recupera.
- **Circuit Breaker como decorator**: crear `CircuitBreakerDecorator` que envuelva `CanalEnvio` y use Resilience4j. Si el canal envuelto falla N veces, el decorator cortocircuita y devuelve fallback sin llamar al wrappee. Esto combina Decorator + Circuit Breaker, mostrando cómo los patrones se apilan.
- **Composición declarativa con Builder**: `CanalEnvio canal = CanalPipeline.iniciar(new EmailAWS()).conReintento(3).conLogging().conCifrado().build()`. Esto oculta la anidación de `new` y permite validar el orden de los decorators (cifrado antes que logging, reintento más interno).

## Ejercicio 5: Strategy

**Solución esperada**:

```java
interface EstrategiaSeleccionCanal {
    CanalEnvio seleccionar(Notificacion n, List<CanalEnvio> disponibles);
}

class SeleccionPorPrioridad implements EstrategiaSeleccionCanal {
    public CanalEnvio seleccionar(Notificacion n, List<CanalEnvio> disponibles) {
        return switch (n.getPrioridad()) {
            case ALTA -> disponibles.stream().filter(c -> c instanceof PushAdapter).findFirst()
                .orElse(disponibles.get(0));
            case MEDIA -> disponibles.stream().filter(c -> c instanceof SMSAdapter).findFirst()
                .orElse(disponibles.get(0));
            case BAJA -> disponibles.stream().filter(c -> c instanceof EmailAdapter).findFirst()
                .orElse(disponibles.get(0));
        };
    }
}

class SeleccionPorCosto implements EstrategiaSeleccionCanal {
    public CanalEnvio seleccionar(Notificacion n, List<CanalEnvio> disponibles) {
        return disponibles.stream()
            .min(Comparator.comparingDouble(this::getCosto))
            .orElseThrow();
    }
    private double getCosto(CanalEnvio c) {
        if (c instanceof EmailAdapter) return 0.01;
        if (c instanceof SMSAdapter) return 0.05;
        if (c instanceof PushAdapter) return 0.001;
        return 1.0;
    }
}
```

**Posibles mejoras**:
- **Eliminar `instanceof` con Strategy dentro de Strategy**: `SeleccionPorCosto` usa `instanceof` para determinar el costo de cada canal. En su lugar, cada `CanalEnvio` podría implementar una interfaz `ConCosto { double getCosto(); }` y la estrategia leería `canal.getCosto()`. Esto elimina el acoplamiento a clases concretas y hace la estrategia genérica para cualquier canal futuro.
- **Estrategia compuesta con pesos**: combinar prioridad y costo con un `WeightedSelectionStrategy` que use `pesoPrioridad * getPriorityScore(canal) + pesoCosto * getCostScore(canal)`. Los pesos se configuran externamente (`application.yml`). Esto permite afinar la selección sin modificar código.
- **A/B Testing de estrategias**: `FeatureFlaggedEstrategia implements EstrategiaSeleccionCanal` que recibe dos estrategias y un `FeatureFlagService`. Para el 10% de usuarios, usa la estrategia B; para el resto, la A. Mide tasa de entrega y latencia de cada grupo para decidir cuál es mejor.

## Ejercicio 7: Observer

**Solución esperada**:

```java
enum EventoNotificacion { ENVIADA, FALLIDA, REINTENTANDO, ENTREGADA }

interface ObservadorNotificacion {
    void onEvent(Notificacion n, EventoNotificacion evento);
}

class NotificacionObservable {
    private List<ObservadorNotificacion> observadores = new ArrayList<>();
    void addObserver(ObservadorNotificacion o) { observadores.add(o); }
    void notifyObservers(Notificacion n, EventoNotificacion e) {
        observadores.forEach(o -> o.onEvent(n, e));
    }
}

class AuditoriaObserver implements ObservadorNotificacion {
    public void onEvent(Notificacion n, EventoNotificacion e) {
        System.out.println("[AUDITORIA] " + n.getId() + " -> " + e + " a las " + LocalDateTime.now());
    }
}

class EstadisticasObserver implements ObservadorNotificacion {
    private Map<EventoNotificacion, Integer> contadores = new HashMap<>();
    public void onEvent(Notificacion n, EventoNotificacion e) {
        contadores.merge(e, 1, Integer::sum);
        System.out.println("[ESTADÍSTICAS] " + contadores);
    }
}

class AlertaObserver implements ObservadorNotificacion {
    private int fallosConsecutivos = 0;
    public void onEvent(Notificacion n, EventoNotificacion e) {
        if (e == EventoNotificacion.FALLIDA) {
            fallosConsecutivos++;
            if (fallosConsecutivos >= 3) {
                System.out.println("[ALERTA] 3 fallos consecutivos! Notificando admin...");
                fallosConsecutivos = 0;
            }
        } else {
            fallosConsecutivos = 0;
        }
    }
}
```

**Posibles mejoras**:
- **Notificación asíncrona sin bloquear**: `notifyObservers()` itera sincrónicamente, bloqueando al emisor. Envolver con `CompletableFuture.runAsync()` y un `ExecutorService` dedicado. Si un observer es lento, no afecta a los demás ni al publicador. Agregar timeout para observers que no responden.
- **Observer con filtro de interés**: cada observer declara en qué eventos está interesado: `AuditoriaObserver` escucha TODO, `AlertaObserver` solo escucha FALLIDA. `notifyObservers` solo itera sobre los observers cuyo filtro acepte el evento, evitando llamadas innecesarias.
- **Persistencia de eventos con Event Sourcing**: en lugar de solo notificar en memoria, `NotificacionObservable` guarda cada evento en una tabla `eventos_notificacion` con los datos del evento. Esto permite reconstruir el historial completo de cualquier notificación, y los observers pueden ser servicios separados que leen del event store.

## Ejercicio 10: Integración Completa

**Solución esperada**:

```java
@Service
public class NotificacionService {
    private final FabricaCanales fabrica;
    private final EstrategiaSeleccionCanal estrategia;
    private final NotificacionRepository repository;
    private final NotificacionObservable observable;

    public ResultadoEnvio procesarNotificacion(Notificacion n) {
        // 1. Pipeline (Chain)
        ProcesadorNotificacion pipeline = new ValidadorNotificacion();
        pipeline.setSiguiente(new TransformadorMensaje())
                .setSiguiente(new EnriquecedorNotificacion());
        pipeline.procesar(n);

        // 2. Seleccionar canal (Strategy)
        List<CanalEnvio> disponibles = List.of(
            fabrica.crearEmail(), fabrica.crearSMS(), fabrica.crearPush()
        );
        CanalEnvio canal = estrategia.seleccionar(n, disponibles);

        // 3. Decorar canal
        CanalEnvio decorado = new LoggingDecorator(
                               new SeguridadDecorator(
                               new ReintentoDecorator(canal)));

        // 4. Enviar
        ResultadoEnvio resultado = decorado.enviar(n);

        // 5. Persistir
        repository.save(n);

        // 6. Notificar evento
        observable.notifyObservers(n,
            resultado.isExito() ? EventoNotificacion.ENVIADA : EventoNotificacion.FALLIDA);

        return resultado;
    }
}

// Demo completa
public class Main {
    public static void main(String[] args) {
        Notificacion notif = new Notificacion.Builder()
            .destinatario("user@email.com")
            .mensaje("¡Bienvenido al sistema!")
            .canal(CanalEnvio.EMAIL)
            .prioridad(Prioridad.ALTA)
            .addMetadata("sistema", "registro")
            .build();

        NotificacionService service = new NotificacionService(
            new FabricaProduccion(),
            new SeleccionPorPrioridad(),
            new NotificacionJpaRepository(),
            new NotificacionObservable()
        );

        // Agregar observers
        service.observable.addObserver(new AuditoriaObserver());
        service.observable.addObserver(new EstadisticasObserver());

        ResultadoEnvio res = service.procesarNotificacion(notif);
        System.out.println("Resultado: " + res);
    }
}
```

**Posibles mejoras**:
- **Inversión de Control con Spring**: `NotificacionService` actualmente instancia sus dependencias manualmente en `Main`. Usar Spring `@Service` + `@Autowired` para que el contenedor inyecte `FabricaCanales`, `EstrategiaSeleccionCanal`, `NotificacionRepository` y `NotificacionObservable`. Esto permite cambiar la configuración por environment sin modificar `NotificacionService`.
- **Pipeline configurable externamente**: el orden y composición de procesadores en la cadena y decorators podría cargarse desde un archivo de configuración YAML/JSON, permitiendo que operaciones modifique el pipeline sin tocar código. Spring `@ConfigurationProperties` + Factory que construye la cadena según la config.
- **Métricas y trazabilidad distribuidas**: integrar Micrometer + Spring Cloud Sleuth para que cada paso del pipeline (Chain), cada decorator, y cada envío de canal genere spans de tracing y métricas de latency/error rate. Los observers podrían ser reemplazados por un exportador a Prometheus/Grafana y un sistema de alertas como Alertmanager.

