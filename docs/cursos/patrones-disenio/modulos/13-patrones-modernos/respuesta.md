---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M13 — Patrones Modernos

## Ejercicio 1: Null Object para Logger

**Solución esperada**:

```java
interface Logger { void info(String msg); void warn(String msg); void error(String msg); }

class ConsoleLogger implements Logger {
    public void info(String m) { System.out.println("[INFO] " + m); }
    public void warn(String m) { System.out.println("[WARN] " + m); }
    public void error(String m) { System.err.println("[ERROR] " + m); }
}

class FileLogger implements Logger {
    private String filename;
    FileLogger(String f) { this.filename = f; }
    public void info(String m) { log("INFO", m); }
    public void warn(String m) { log("WARN", m); }
    public void error(String m) { log("ERROR", m); }
    private void log(String level, String msg) {
        try (FileWriter fw = new FileWriter(filename, true)) {
            fw.write(level + ": " + msg + "\n");
        } catch (IOException e) { e.printStackTrace(); }
    }
}

class NullLogger implements Logger {
    public void info(String m) { }
    public void warn(String m) { }
    public void error(String m) { }
}

class LoggerFactory {
    static Logger createLogger(boolean activo, String tipo, String archivo) {
        if (!activo) return new NullLogger();
        return switch (tipo) {
            case "console" -> new ConsoleLogger();
            case "file" -> new FileLogger(archivo);
            default -> new NullLogger();
        };
    }
}

// Uso — sin null checks
class PedidoService {
    private Logger log = LoggerFactory.createLogger(true, "console", "");
    void crearPedido() {
        log.info("Creando pedido...");
        // lógica
        log.warn("Stock bajo");
    }
}
```

**Posibles mejoras**:
- **Usar SLF4J en producción**: en lugar de inventar una interfaz `Logger` propia, usar SLF4J que ya es una Abstract Factory de loggers. `LoggerFactory` delegaría a `LoggerFactory.getLogger()` de SLF4J y `NullLogger` sería un `NOPLogger` de SLF4J.
- **Logger con niveles de severidad dinámicos**: en lugar de hardcodear `boolean activo`, la factory podría consultar un archivo de configuración o variable de entorno que permita cambiar el nivel de log en caliente (DEBUG, INFO, WARN, ERROR, OFF) sin recompilar, similar a Logback/Log4j2.
- **Logger compuesto (Composite + Chain)**: crear un `CompositeLogger` que contenga múltiples `Logger` (consola + archivo + remoto) y delegue en todos. Combinado con `NullLogger`, permite desactivar destinos específicos independientemente: `new CompositeLogger(List.of(new ConsoleLogger(), new NullLogger(), new RemoteLogger()))`.

## Ejercicio 2: Repository + Data Mapper

**Solución esperada**:

```java
class Producto {
    private Long id; private String nombre; private double precio; private int stock;
    // constructor, getters, setters...
}

class ProductoMapper {
    Producto mapRow(ResultSet rs) throws SQLException {
        Producto p = new Producto();
        p.setId(rs.getLong("id"));
        p.setNombre(rs.getString("nombre"));
        p.setPrecio(rs.getDouble("precio"));
        p.setStock(rs.getInt("stock"));
        return p;
    }
}

interface ProductoRepository {
    Producto findById(Long id);
    List<Producto> findAll();
    Producto save(Producto p);
    void delete(Long id);
}

class ProductoJdbcRepository implements ProductoRepository {
    private DataSource ds;
    private ProductoMapper mapper = new ProductoMapper();

    ProductoJdbcRepository(DataSource ds) { this.ds = ds; }

    public Producto findById(Long id) {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement("SELECT * FROM productos WHERE id = ?")) {
            ps.setLong(1, id);
            ResultSet rs = ps.executeQuery();
            return rs.next() ? mapper.mapRow(rs) : null;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    public List<Producto> findAll() {
        List<Producto> res = new ArrayList<>();
        try (Connection c = ds.getConnection();
             Statement s = c.createStatement();
             ResultSet rs = s.executeQuery("SELECT * FROM productos")) {
            while (rs.next()) res.add(mapper.mapRow(rs));
        } catch (SQLException e) { throw new RuntimeException(e); }
        return res;
    }

    public Producto save(Producto p) {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(
                 "INSERT INTO productos (nombre, precio, stock) VALUES (?,?,?)",
                 Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, p.getNombre());
            ps.setDouble(2, p.getPrecio());
            ps.setInt(3, p.getStock());
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            if (keys.next()) p.setId(keys.getLong(1));
            return p;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    public void delete(Long id) {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement("DELETE FROM productos WHERE id = ?")) {
            ps.setLong(1, id); ps.executeUpdate();
        } catch (SQLException e) { throw new RuntimeException(e); }
    }
}
```

**Posibles mejoras**:
- **Devolver Optional en findById**: `Optional<Producto> findById(Long id)` en lugar de `Producto` → `null`. El cliente es forzado a manejar la ausencia con `orElseThrow()`. Esto es más seguro que Null Object en este caso porque el repositorio no puede devolver un Producto vacío con comportamiento — simplemente no existe.
- **Batch operations con JDBC Batch**: `saveAll(List<Producto>)` que use `PreparedStatement.addBatch()` y `executeBatch()` para insertar múltiples productos en un solo round-trip a la BD. Esto reduce drásticamente la latencia para cargas masivas.
- **Query methods con Specification**: agregar métodos como `findByPrecioBetween(double min, double max)` usando el patrón Specification (predicados componibles: `precioMayorA(100).and(stockMenorA(10))`). Esto evita la explosión de métodos en la interfaz y permite queries dinámicas en runtime.

## Ejercicio 3: Event Sourcing para Cuenta Bancaria

**Solución esperada**:

```java
abstract class EventoBancario {
    final LocalDateTime timestamp = LocalDateTime.now();
    abstract void aplicar(CuentaBancariaAgregado c);
}

class CuentaCreada extends EventoBancario {
    String titular; double saldoInicial;
    CuentaCreada(String t, double s) { titular=t; saldoInicial=s; }
    void aplicar(CuentaBancariaAgregado c) { c.titular=titular; c.saldo=saldoInicial; c.activa=true; }
}

class Depositado extends EventoBancario {
    double monto;
    Depositado(double m) { monto=m; }
    void aplicar(CuentaBancariaAgregado c) { c.saldo += monto; }
}

class Retirado extends EventoBancario {
    double monto;
    Retirado(double m) { monto=m; }
    void aplicar(CuentaBancariaAgregado c) { c.saldo -= monto; }
}

class CuentaBancariaAgregado {
    String id, titular; double saldo; boolean activa;

    static CuentaBancariaAgregado reconstruir(List<EventoBancario> eventos) {
        CuentaBancariaAgregado c = new CuentaBancariaAgregado();
        eventos.forEach(e -> e.aplicar(c));
        return c;
    }

    List<EventoBancario> depositar(double monto) {
        if (!activa) throw new RuntimeException("Cuenta inactiva");
        return List.of(new Depositado(monto));
    }

    List<EventoBancario> retirar(double monto) {
        if (!activa) throw new RuntimeException("Cuenta inactiva");
        CuentaBancariaAgregado temp = reconstruir(eventStore.obtenerEventos(id));
        if (temp.saldo < monto) throw new RuntimeException("Saldo insuficiente: $" + temp.saldo);
        return List.of(new Retirado(monto));
    }
}

class EventStore {
    Map<String, List<EventoBancario>> eventos = new HashMap<>();
    void guardar(String id, List<EventoBancario> nuevos) {
        eventos.merge(id, nuevos, (a, b) -> { var l = new ArrayList<>(a); l.addAll(b); return l; });
    }
    List<EventoBancario> obtenerEventos(String id) {
        return eventos.getOrDefault(id, new ArrayList<>());
    }
}

class CuentaQueryService {
    EventStore eventStore;
    double getSaldo(String id) {
        return CuentaBancariaAgregado.reconstruir(eventStore.obtenerEventos(id)).saldo;
    }
}
```

**Posibles mejoras**:
- **Snapshotting para rendimiento**: si una cuenta tiene 10000 eventos, reconstruir desde el inicio es lento. Cada 100 eventos, guardar un `Snapshot` del estado completo. La reconstrucción carga el último snapshot y aplica solo los eventos posteriores. El `EventStore` tendría `guardarSnapshot(id, version, CuentaBancariaAgregado)` y `obtenerUltimoSnapshot(id)`.
- **Optimistic concurrency con version**: al guardar eventos, pasar la versión esperada. Si otro proceso ya guardó eventos con esa versión, lanzar `ConcurrencyException` y reintentar. Esto se implementa con `version` en `EventStore.guardar(id, versionEsperada, eventos)` y un campo `long version` en `CuentaBancariaAgregado`.
- **Proyecciones materializadas para queries**: en lugar de reconstruir el agregado para cada consulta de saldo, crear una tabla `cuenta_proyeccion (id, saldo, titular)` actualizada por event handlers cuando se persisten eventos. `CuentaQueryService.getSaldo()` leería directamente de esta tabla sin recorrer eventos.

## Ejercicio 4: Saga para Reserva de Viaje

**Solución esperada**:

```java
class SagaOrquestador {
    private VueloService vuelos;
    private HotelService hoteles;
    private PagoService pagos;

    public void reservarPaquete(ReservaViaje req) {
        try {
            String idVuelo = vuelos.reservar(req.origen, req.destino, req.fecha);
            try {
                String idHotel = hoteles.reservar(req.hotel, req.fecha);
                try {
                    pagos.cobrar(req.tarjeta, req.montoTotal);
                    System.out.println("Paquete reservado exitosamente");
                } catch (Exception e) {
                    System.out.println("Fallo pago, compensando...");
                    hoteles.cancelar(idHotel);
                    vuelos.cancelar(idVuelo);
                    throw new RuntimeException("Saga falló en paso 3 (pago)");
                }
            } catch (Exception e) {
                System.out.println("Fallo hotel, compensando vuelo...");
                vuelos.cancelar(idVuelo);
                throw new RuntimeException("Saga falló en paso 2 (hotel)");
            }
        } catch (Exception e) {
            System.out.println("Saga falló: " + e.getMessage());
        }
    }
}
```

**Posibles mejoras**:
- **Persistir estado de la Saga**: si el proceso muere después de reservar vuelo y hotel pero antes de cancelar, las compensaciones nunca se ejecutan. Guardar cada paso en una tabla `saga_log (saga_id, step, status, compensation_status)`. Al reiniciar, un proceso de recovery busca sagas no completadas y ejecuta las compensaciones pendientes.
- **Manejar fallos de compensación**: si `vuelos.cancelar()` también falla (ej. el servicio de vuelos está caído), la Saga no puede compensar. Implementar una cola de dead-letter y reintentos con backoff para compensaciones. Si después de N intentos falla, alertar a operaciones humanas con el ID de la saga y los pasos completados/fallidos.

## Ejercicio 5: Circuit Breaker + Outbox

**Solución esperada**:

```java
class CircuitBreakerManual {
    enum State { CLOSED, OPEN, HALF_OPEN }
    private State state = State.CLOSED;
    private int failureCount = 0;
    private final int threshold = 3;
    private final long timeout = 30000;
    private long lastFailureTime;

    <T> T call(Supplier<T> operation, Supplier<T> fallback) {
        if (state == State.OPEN) {
            if (System.currentTimeMillis() - lastFailureTime > timeout) state = State.HALF_OPEN;
            else return fallback.get();
        }
        try {
            T result = operation.get();
            if (state == State.HALF_OPEN) state = State.CLOSED;
            failureCount = 0;
            return result;
        } catch (Exception e) {
            failureCount++;
            lastFailureTime = System.currentTimeMillis();
            if (failureCount >= threshold || state == State.HALF_OPEN) state = State.OPEN;
            return fallback.get();
        }
    }
}

@Entity @Table(name = "outbox_messages")
class OutboxMessage {
    @Id private String id = UUID.randomUUID().toString();
    private String pedidoId;
    @Lob private String payload;
    private boolean enviado;
    private LocalDateTime creadoEn = LocalDateTime.now();
    // getters/setters...
}

@Component
class PedidoOutboxService {
    @PersistenceContext EntityManager em;

    @Transactional
    public void crearPedidoConOutbox(Pedido pedido) {
        em.persist(pedido);
        OutboxMessage msg = new OutboxMessage();
        msg.setPedidoId(pedido.getId().toString());
        msg.setPayload("{\"id\":\"" + pedido.getId() + "\",\"total\":" + pedido.getTotal() + "}");
        em.persist(msg);
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void procesarOutbox() {
        em.createQuery("SELECT m FROM OutboxMessage m WHERE m.enviado = false", OutboxMessage.class)
          .setMaxResults(50).getResultList().forEach(msg -> {
            try {
                kafkaTemplate.send("pedidos-topic", msg.getPayload());
                msg.setEnviado(true);
            } catch (Exception e) { /* reintentar después */ }
          });
    }
}
```

**Posibles mejoras**:
- **Reemplazar CircuitBreaker manual por Resilience4j**: usar `@CircuitBreaker(name = "orderService", fallbackMethod = "fallback")` y configurar en `application.yml` con `slidingWindowSize`, `failureRateThreshold`, `waitDurationInOpenState`. El circuito manual es didáctico pero no es production-ready (falta thread-safety, métricas, sliding window en lugar de conteo simple).
- **CDC con Debezium en lugar de polling**: en lugar de `@Scheduled` cada 5 segundos, usar Debezium para leer el WAL de PostgreSQL/MySQL y publicar a Kafka en tiempo real con latencia de milisegundos. Elimina el polling, reduce la latencia y escala mejor porque no hay consultas recurrentes a la tabla outbox.
- **Outbox con PostgreSQL LISTEN/NOTIFY**: en lugar de polling, usar `LISTEN outbox_channel` de PostgreSQL. Un trigger `AFTER INSERT ON outbox_messages` ejecuta `NOTIFY outbox_channel`. La app escucha notificaciones con `PGConnection.addNotificationListener()` y publica inmediatamente, sin delay de 5 segundos y sin Debezium.

