---
sidebar_label: "Clase"
---

# Módulo 13 — Patrones Modernos

## Null Object

Evita `null checks` proporcionando un objeto por defecto que implementa la misma interfaz con comportamiento neutro.

### Problema

```java
// Código lleno de null checks
public void procesarDescuento(Pedido pedido) {
    Descuento desc = pedido.getDescuento();
    if (desc != null) {
        desc.aplicar(pedido);
    }
    // más null checks...
}
```

### Solución con Null Object

```java
public interface Descuento {
    double aplicar(double monto);
    String getNombre();
}

public class DescuentoPorcentual implements Descuento {
    private double porcentaje;

    public DescuentoPorcentual(double porcentaje) {
        this.porcentaje = porcentaje;
    }

    public double aplicar(double monto) {
        return monto * (1 - porcentaje / 100);
    }

    public String getNombre() {
        return "Descuento " + porcentaje + "%";
    }
}

// Null Object
public class NullDescuento implements Descuento {
    public double aplicar(double monto) {
        return monto; // no aplica descuento
    }

    public String getNombre() {
        return "Sin descuento";
    }
}

// Uso sin null checks
public class Pedido {
    private Descuento descuento = new NullDescuento(); // nunca null

    public void setDescuento(Descuento descuento) {
        this.descuento = descuento != null ? descuento : new NullDescuento();
    }

    public double calcularTotal() {
        return descuento.aplicar(montoBase);
    }
}
```

## Repository Pattern

Abstrae la capa de persistencia, proporcionando una interfaz tipo colección para acceder a objetos de dominio.

```java
// Interfaz del repositorio (en el dominio)
public interface PedidoRepository {
    Pedido findById(Long id);
    List<Pedido> findByCliente(String cliente);
    Pedido save(Pedido pedido);
    void delete(Long id);
    List<Pedido> findAll();
}

// Implementación con JPA (en infraestructura)
@Repository
public class PedidoJpaRepository implements PedidoRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public Pedido findById(Long id) {
        return em.find(Pedido.class, id);
    }

    @Override
    public List<Pedido> findByCliente(String cliente) {
        return em.createQuery("SELECT p FROM Pedido p WHERE p.cliente = :c", Pedido.class)
                 .setParameter("c", cliente)
                 .getResultList();
    }

    @Override
    public Pedido save(Pedido pedido) {
        if (pedido.getId() == null) {
            em.persist(pedido);
            return pedido;
        } else {
            return em.merge(pedido);
        }
    }

    @Override
    public void delete(Long id) {
        em.remove(em.find(Pedido.class, id));
    }

    @Override
    public List<Pedido> findAll() {
        return em.createQuery("SELECT p FROM Pedido p", Pedido.class).getResultList();
    }
}
```

### Spring Data JPA simplifica

```java
// Solo la interfaz, Spring implementa automáticamente
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByCliente(String cliente);
    List<Pedido> findByTotalGreaterThan(Double total);
    @Query("SELECT p FROM Pedido p WHERE p.fecha BETWEEN :desde AND :hasta")
    List<Pedido> findByFechaRange(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
```

## Data Mapper vs Active Record

| Aspecto | Data Mapper (JPA) | Active Record (Rails) |
|---------|------------------|----------------------|
| Separación | Entidades sin lógica de persistencia | Entidad contiene lógica + persistencia |
| Clase | `Pedido` (POJO) + `PedidoMapper` | `Pedido` extiende `ActiveRecord::Base` |
| Acoplamiento | Bajo (entidad no conoce DB) | Alto (entidad conoce DB) |
| Testing | Fácil (entidad es POJO) | Requiere DB |
| Ejemplo | Hibernate, JPA | Ruby on Rails, Laravel Eloquent |

## Event Sourcing

Almacena eventos en lugar del estado actual. El estado actual se reconstruye reproduciendo eventos.

```java
// Evento
public abstract class Evento {
    private final LocalDateTime timestamp = LocalDateTime.now();
    public abstract void aplicar(Agregado agregado);
}

public class PedidoCreadoEvent extends Evento {
    private final String pedidoId;
    private final String cliente;
    // constructor...

    public void aplicar(Agregado agregado) {
        if (agregado instanceof PedidoAgregado p) {
            p.setCliente(this.cliente);
            p.setEstado("CREADO");
        }
    }
}

public class PedidoPagadoEvent extends Evento {
    private final String pedidoId;
    private final double monto;

    public void aplicar(Agregado agregado) {
        if (agregado instanceof PedidoAgregado p) {
            p.setEstado("PAGADO");
        }
    }
}

// Agregado que se reconstruye desde eventos
public class PedidoAgregado extends Agregado {
    private String id;
    private String cliente;
    private String estado;
    private double total;

    public static PedidoAgregado reconstruir(List<Evento> eventos) {
        PedidoAgregado pedido = new PedidoAgregado();
        for (Evento e : eventos) {
            e.aplicar(pedido);
        }
        return pedido;
    }

    // Comandos generan eventos
    public void crear(String id, String cliente) {
        aplicarEvento(new PedidoCreadoEvent(id, cliente));
    }

    public void pagar(double monto) {
        aplicarEvento(new PedidoPagadoEvent(id, monto));
    }
}

// Event Store
public class EventStore {
    private Map<String, List<Evento>> eventos = new HashMap<>();

    public void guardar(String agregadoId, List<Evento> nuevosEventos) {
        eventos.merge(agregadoId, nuevosEventos, (old, news) -> {
            List<Evento> todos = new ArrayList<>(old);
            todos.addAll(news);
            return todos;
        });
    }

    public List<Evento> obtenerEventos(String agregadoId) {
        return eventos.getOrDefault(agregadoId, Collections.emptyList());
    }
}
```

## Saga Pattern

Maneja transacciones distribuidas a través de una secuencia de pasos con compensación.

### Coreografía vs Orquestación

| Aspecto | Coreografía | Orquestación |
|---------|-------------|--------------|
| Control | Descentralizado (cada servicio escucha eventos) | Centralizado (orquestador coordina) |
| Acoplamiento | Bajo | Medio |
| Complejidad | Alta (eventos) | Media |
| Visibilidad | Difícil de seguir | Fácil (el orquestador tiene el flujo) |

```java
// Saga con Orquestación
public class PedidoSaga {

    @Autowired
    private EventStore eventStore;

    public void crearPedido(Pedido pedido) {
        // Paso 1: Crear pedido
        pedido.crear(pedido.getId(), pedido.getCliente());

        // Paso 2: Reservar inventario (podría fallar)
        boolean inventarioOK = inventarioService.reservar(pedido.getItems());
        if (!inventarioOK) {
            pedido.compensar(); // compensación
            return;
        }

        // Paso 3: Procesar pago
        boolean pagoOK = pagoService.cobrar(pedido.getTotal());
        if (!pagoOK) {
            inventarioService.liberar(pedido.getItems()); // compensación
            pedido.compensar();
            return;
        }

        // Paso 4: Programar envío
        envioService.programar(pedido.getId(), pedido.getDireccion());
    }
}
```

## Circuit Breaker

Previene fallos en cascada en sistemas distribuidos. Cuando un servicio falla repetidamente, el circuit breaker "abre" y las llamadas fallan inmediatamente.

```java
// Resilience4j CircuitBreaker
@CircuitBreaker(name = "productoService", fallbackMethod = "getProductoFallback")
public Producto getProducto(Long id) {
    return restTemplate.getForObject("http://producto-service/api/productos/{id}", Producto.class, id);
}

public Producto getProductoFallback(Long id, Exception e) {
    return new Producto(id, "Producto no disponible", 0.0);
}

// Configuración
CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .failureRateThreshold(50)               // 50% de fallos abre el circuito
    .waitDurationInOpenState(Duration.ofSeconds(30))  // tiempo en estado abierto
    .slidingWindowSize(10)                  // ventana de 10 llamadas
    .build();
```

## Outbox Pattern

Garantiza consistencia eventual entre bases de datos y mensajes/eventos.

```java
// Tabla outbox
@Entity
@Table(name = "outbox")
public class OutboxMessage {
    @Id private String id;
    private String agregadoTipo;
    private String agregadoId;
    private String eventoTipo;
    @Lob private String payload; // JSON del evento
    private LocalDateTime creadoEn;
    private boolean enviado;
}

// Guardar en misma transacción
@Transactional
public void crearPedido(Pedido pedido) {
    // 1. Guardar entidad
    em.persist(pedido);

    // 2. Guardar mensaje outbox (misma transacción)
    OutboxMessage msg = new OutboxMessage();
    msg.setId(UUID.randomUUID().toString());
    msg.setAgregadoTipo("Pedido");
    msg.setAgregadoId(pedido.getId().toString());
    msg.setEventoTipo("PedidoCreado");
    msg.setPayload(objectMapper.writeValueAsString(pedido));
    msg.setCreadoEn(LocalDateTime.now());
    msg.setEnviado(false);
    em.persist(msg);
}

// Procesador outbox (worker separado)
@Scheduled(fixedDelay = 5000)
@Transactional
public void procesarOutbox() {
    List<OutboxMessage> mensajes = em.createQuery(
        "SELECT m FROM OutboxMessage m WHERE m.enviado = false", OutboxMessage.class)
        .setMaxResults(100)
        .getResultList();

    for (OutboxMessage msg : mensajes) {
        try {
            kafkaTemplate.send("pedidos-topic", msg.getPayload());
            msg.setEnviado(true);
        } catch (Exception e) {
            log.error("Error enviando mensaje outbox", e);
        }
    }
}
```

## DI Container

Implementación del patrón Dependency Injection. Spring ApplicationContext es un contenedor IoC.

```java
// DI Manual (sin contenedor)
public class PedidoService {
    private PedidoRepository repo = new PedidoJpaRepository();
    private Notificador notif = new EmailNotificador();
}

// DI con Contenedor
ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
PedidoService service = ctx.getBean(PedidoService.class);
```
