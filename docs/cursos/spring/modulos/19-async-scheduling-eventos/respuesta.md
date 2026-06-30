---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Eventos de pedidos

```java
// Evento
public record PedidoCreadoEvent(Long pedidoId, String cliente, BigDecimal total) {}

// Service
@Service
public class PedidoService {

    @Autowired
    private ApplicationEventPublisher publisher;

    public PedidoCreadoEvent crearPedido(String cliente, BigDecimal total) {
        Long pedidoId = ThreadLocalRandom.current().nextLong(1000, 9999);
        PedidoCreadoEvent event = new PedidoCreadoEvent(pedidoId, cliente, total);
        publisher.publishEvent(event);
        return event;
    }
}

// Listeners
@Component
public class InventarioListener {

    @Async
    @EventListener
    public void descontarStock(PedidoCreadoEvent event) {
        System.out.println("[INVENTARIO] Descontando stock para pedido "
            + event.pedidoId() + " en " + Thread.currentThread().getName());
    }
}

@Component
public class FacturacionListener {

    @Async
    @EventListener
    public void generarFactura(PedidoCreadoEvent event) {
        System.out.println("[FACTURA] Generando factura para pedido "
            + event.pedidoId() + " por $" + event.total());
    }
}
```

---

## Ejercicio 4: Evento transaccional

```java
@Service
public class PedidoService {

    @Autowired
    private ApplicationEventPublisher publisher;

    @Transactional
    public PedidoCreadoEvent crearPedido(String cliente, BigDecimal total) {
        if (total.compareTo(new BigDecimal("10000")) > 0) {
            throw new RuntimeException("Pedido rechazado: total excede $10000");
        }
        Long pedidoId = ThreadLocalRandom.current().nextLong(1000, 9999);
        PedidoCreadoEvent event = new PedidoCreadoEvent(pedidoId, cliente, total);
        publisher.publishEvent(event);
        return event;
    }
}

@Component
public class InventarioListener {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void descontarStock(PedidoCreadoEvent event) {
        System.out.println("[INVENTARIO] Descontando stock (post-commit) para pedido "
            + event.pedidoId());
    }
}

@Component
public class FacturacionListener {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void generarFactura(PedidoCreadoEvent event) {
        System.out.println("[FACTURA] Factura generada (post-commit) para pedido "
            + event.pedidoId());
    }
}
```

---

## Ejercicio 5: CompletableFuture combinado

```java
@Service
public class ProcesadorPedidosService {

    private static final Logger log =
        LoggerFactory.getLogger(ProcesadorPedidosService.class);

    public CompletableFuture<String> procesarPedido(List<String> productos,
                                                    BigDecimal total,
                                                    String cliente) {

        CompletableFuture<String> stock = CompletableFuture.supplyAsync(() -> {
            sleep(2000);
            return "Stock verificado para " + productos.size() + " productos";
        });

        CompletableFuture<String> impuestos = CompletableFuture.supplyAsync(() -> {
            sleep(1000);
            BigDecimal impuesto = total.multiply(new BigDecimal("0.21"));
            return "Impuesto calculado: $" + impuesto;
        });

        CompletableFuture<String> descuentos = CompletableFuture.supplyAsync(() -> {
            sleep(1500);
            return "Descuento aplicado para cliente " + cliente;
        });

        return CompletableFuture.allOf(stock, impuestos, descuentos)
            .thenApply(v -> {
                try {
                    return "RESUMEN:\n" + stock.get() + "\n"
                        + impuestos.get() + "\n" + descuentos.get();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            })
            .exceptionally(ex -> {
                log.error("Error procesando pedido: {}", ex.getMessage());
                return "Error en el procesamiento: " + ex.getMessage();
            });
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

