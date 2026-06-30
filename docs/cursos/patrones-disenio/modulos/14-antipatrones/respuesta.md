---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M14 — Anti-patrones

## Ejercicio 1: Identificar Anti-patrones

**Solución esperada**:

| Escenario | Anti-patrón | Solución |
|---|---|---|
| 1. Clase Util con 200 métodos estáticos | **God Class** | Separar en clases especializadas: DateUtils, TaxCalculator, EmailService, RUCValidator, PDFGenerator |
| 2. 50+ clases como Singleton | **Golden Hammer** | Reemplazar con DI. Solo usar Singleton cuando realmente se necesita una única instancia |
| 3. Interfaz con 1 implementación por 3 años | **Premature Abstraction** | Eliminar interfaz y usar la clase directamente. Crear interfaz solo cuando haya otra implementación |
| 4. Validación email duplicada en 15 clases | **Copy & Paste / DRY** | Extraer a EmailValidator. Usar Template Method para procesos similares |
| 5. Dependencia no utilizada | **Boat Anchor** | Eliminar dependencia del pom.xml |
| 6. Clase de 2000 líneas | **God Class** | Dividir en PedidoService, DatabaseService, ReportGenerator, NotificadorService |
| 7. Código comentado de 2 años | **Lava Flow** | Eliminar. Usar control de versiones si se necesita recuperar |

**Posibles mejoras**:
- Agregar métricas de detección: para God Class, usar `LCOM4` (Lack of Cohesion of Methods) o `WMC` (Weighted Methods per Class) con umbrales > 50 métodos. Para Copy & Paste, usar `PMD CPD` (Copy-Paste Detector) con umbral de 10 líneas duplicadas.
- Agregar una columna "Prioridad": ordenar por impacto en la velocidad del equipo. Lava Flow (bajo impacto, molesto) vs God Class en el core del negocio (alto impacto, blocker para cambios). Esto permite un backlog de refactoring priorizado.

## Ejercicio 2: Refactorizar God Class

**Solución esperada**:

```java
// 1. PedidoService — coordina el flujo
public class PedidoService {
    private final PedidoRepository repo;
    private final EmailService emailService;
    private final FacturaService facturaService;
    private final StockService stockService;
    private final LogisticaService logisticaService;

    public PedidoService(PedidoRepository r, EmailService e, FacturaService f,
                         StockService s, LogisticaService l) {
        this.repo=r; this.emailService=e; this.facturaService=f;
        this.stockService=s; this.logisticaService=l;
    }

    public void procesarPedido(Pedido p) {
        repo.save(p);
        emailService.enviarConfirmacion(p);
        facturaService.generarFactura(p);
        stockService.actualizarStock(p);
        logisticaService.notificar(p);
    }
}

// 2. Clases especializadas (responsabilidad única)
class PedidoRepository {
    public void save(Pedido p) {
        Connection conn = DriverManager.getConnection("jdbc:...");
        PreparedStatement ps = conn.prepareStatement("INSERT INTO pedidos...");
        // ...
    }
}

class EmailService {
    public void enviarConfirmacion(Pedido p) {
        System.out.println("Enviando email a " + p.getCliente().getEmail());
    }
}

class FacturaService {
    public void generarFactura(Pedido p) {
        System.out.println("Generando PDF...");
    }
}

class StockService {
    public void actualizarStock(Pedido p) {
        System.out.println("Actualizando stock...");
    }
}

class LogisticaService {
    public void notificar(Pedido p) {
        System.out.println("Notificando logística...");
    }
}
```

**Posibles mejoras**:
- **Usar Observer para desacoplar el flujo**: en lugar de que `PedidoService` llame explícitamente a 5 servicios, publicar un `PedidoCreadoEvent` y que cada servicio se suscriba con `@EventListener`. Esto reduce el acoplamiento de `PedidoService` a 0 dependencias de servicios secundarios, y agregar un nuevo paso (ej. notificar a fiscalización) no requiere modificar `PedidoService`.
- **Agregar validación y manejo de errores**: `procesarPedido()` actualmente no maneja fallos. Si `stockService.actualizarStock()` falla, el pedido ya está guardado y el email enviado. Envolver en `try-catch` con compensación, o usar el patrón Saga para coordinar los pasos.
- **Interfaces para cada servicio**: si `PedidoRepository` se inyecta por interfaz, podés tener `PedidoJdbcRepository` y `PedidoMockRepository` para tests. Esto aplica DIP (Dependency Inversion Principle) y permite testing aislado de `PedidoService` sin base de datos.

## Ejercicio 3: Eliminar Singleton (usar DI)

**Solución esperada**:

```java
// PagoService como bean (sin Singleton)
public class PagoService {
    public void procesarPago(Pedido p, double monto) {
        System.out.println("Procesando pago de $" + monto + " para pedido " + p.getId());
    }
}

// Configuración Spring
@Configuration
public class AppConfig {
    @Bean
    public PagoService pagoService() { return new PagoService(); }

    @Bean
    public PedidoController pedidoController(PagoService pagoService) {
        return new PedidoController(pagoService);
    }
}

// Controller con DI
public class PedidoController {
    private final PagoService pagoService;

    public PedidoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    public void crearPedido(Pedido p) {
        pagoService.procesarPago(p, p.getTotal());
    }
}

// Test fácil con mock
class PedidoControllerTest {
    @Test void testCrearPedido() {
        PagoService mock = mock(PagoService.class);
        PedidoController ctrl = new PedidoController(mock);
        // ...
    }
}
```

**Posibles mejoras**:
- **Usar Spring Boot auto-wiring**: en lugar de `AppConfig` manual, usar `@Service` en `PagoService` y `@RestController` en `PedidoController` con `@Autowired` por constructor. Spring escanea y configura automáticamente. Esto elimina la clase `AppConfig` (aunque `@Configuration` explícita es preferible para beans de terceros).
- **Agregar interfaz para PagoService**: `interface PagoService` con implementaciones `StripePagoService`, `PayPalPagoService`, `MercadoPagoPagoService`. El controller recibe la interfaz y Spring inyecta la implementación según `@Profile` o `@ConditionalOnProperty`. Esto muestra cómo DI habilita Strategy.
- **Test de integración con Spring Test**: en lugar de mock manual, usar `@SpringBootTest` + `@MockBean PagoService` para tests de integración. Esto verifica que el wiring de beans funcione además de la lógica de negocio.

## Ejercicio 4: Eliminar Duplicación con Template Method

**Solución esperada**:

```java
public abstract class ProcesadorPedido {

    // Template Method
    public final void ejecutar(Pedido p) {
        validarPedido(p);
        calcularImpuestos(p);
        procesarPago(p);
        enviarConfirmacion(p);
        pasosAdicionales(p); // hook
    }

    protected abstract void validarPedido(Pedido p);
    protected abstract void calcularImpuestos(Pedido p);
    protected abstract void procesarPago(Pedido p);
    protected void enviarConfirmacion(Pedido p) {
        System.out.println("Enviando confirmación...");
    }
    protected void pasosAdicionales(Pedido p) { } // hook
}

class ProcesarPedidoNormal extends ProcesadorPedido {
    protected void validarPedido(Pedido p) { System.out.println("Validando pedido..."); }
    protected void calcularImpuestos(Pedido p) { System.out.println("Calculando impuestos normales..."); }
    protected void procesarPago(Pedido p) { System.out.println("Procesando pago..."); }
}

class ProcesarPedidoExpress extends ProcesadorPedido {
    protected void validarPedido(Pedido p) { System.out.println("Validando pedido express..."); }
    protected void calcularImpuestos(Pedido p) { System.out.println("Calculando impuestos express..."); }
    protected void procesarPago(Pedido p) { System.out.println("Procesando pago express..."); }
    protected void pasosAdicionales(Pedido p) { System.out.println("Notificando prioridad..."); }
}

class ProcesarPedidoInternacional extends ProcesadorPedido {
    protected void validarPedido(Pedido p) { System.out.println("Validando pedido internacional..."); }
    protected void calcularImpuestos(Pedido p) { System.out.println("Calculando impuestos aduana..."); }
    protected void procesarPago(Pedido p) { System.out.println("Procesando pago internacional..."); }
    protected void pasosAdicionales(Pedido p) { System.out.println("Generando documentación aduana..."); }
}
```

**Posibles mejoras**:
- **Reemplazar abstract por Strategy con callbacks**: en lugar de forzar herencia, pasar los pasos variables como lambdas o Strategy objects al constructor de `ProcesadorPedido`. Esto permite componer comportamientos sin crear subclases: `new ProcesadorPedido(this::validacionSimple, this::impuestosNormales, this::pagoOnline)`.
- **Agregar hooks pre y post**: además de `pasosAdicionales()`, agregar `antesDeEjecutar(Pedido)` y `despuesDeEjecutar(Pedido, Resultado)` como hooks con implementación por defecto vacía. Esto da más puntos de extensión sin modificar el template method.
- **Validación centralizada con Chain of Responsibility**: los pasos `validarPedido` en cada subclase podrían duplicar código de validación común. Extraer la validación común a un `ValidadorComun` y usar Chain: `validarComun → validarEspecifico`. El template method llamaría al chain en lugar de un paso abstracto.

## Ejercicio 5: Code Review

**Solución esperada**:

```java
// Anti-patrones detectados:
// 1. God Class — TodoEnUno mezcla UI, lógica, BD, email
// 2. Singleton mal usado — get() no es thread-safe y acopla globalmente
// 3. SQL Injection — Concatenación directa en SQL
// 4. Spaghetti Code — Todo en un método con if-else
// 5. Lava Flow — Código muerto (opciones 2,3,4 no implementadas)

// Refactorización:
public class TodoEnUnoRefactorizado {

    // 1. Separar responsabilidades
    @Service
    public static class DatoService {
        private final DatoRepository repo;
        private final EmailService emailService;

        public DatoService(DatoRepository r, EmailService e) { repo=r; emailService=e; }

        public void crearDato(String dato) {
            repo.insertar(dato);
            emailService.enviar("admin@empresa.com", "Dato creado: " + dato);
        }
    }

    @Repository
    public static class DatoRepository {
        private final DataSource ds;
        DatoRepository(DataSource ds) { this.ds = ds; }

        public void insertar(String dato) {
            try (Connection c = ds.getConnection();
                 PreparedStatement ps = c.prepareStatement("INSERT INTO datos VALUES(?)")) {
                ps.setString(1, dato); // No SQL Injection
                ps.executeUpdate();
            } catch (SQLException e) { throw new RuntimeException(e); }
        }
    }

    // 2. Controller separado (Spring MVC)
    @RestController
    public static class DatoController {
        private final DatoService service;

        DatoController(DatoService s) { this.service = s; }

        @PostMapping("/datos")
        public String crear(@RequestBody String dato) {
            service.crearDato(dato);
            return "OK";
        }
    }

    // 3. Inyección de dependencias en lugar de Singleton
    @Configuration
    public static class AppConfig {
        @Bean public DataSource dataSource() { return new H2DataSource(); }
        @Bean public EmailService emailService() { return new EmailService(); }
        @Bean public DatoRepository datoRepository(DataSource ds) { return new DatoRepository(ds); }
        @Bean public DatoService datoService(DatoRepository r, EmailService e) { return new DatoService(r, e); }
    }
}
```

**Posibles mejoras**:
- **Agregar logging centralizado con AOP**: en lugar de `System.out.println` en los servicios, usar SLF4J + `@Slf4j` de Lombok. Para logging transversal (métricas, tracing), crear un `@Around` aspect similar al ejercicio de Spring que registre tiempo de ejecución y excepciones.
- **Agregar manejo de errores global con `@ControllerAdvice`**: en lugar de `return "OK"` siempre, crear un `GlobalExceptionHandler` que capture `DataAccessException`, `IllegalArgumentException`, etc. y devuelva códigos HTTP apropiados con mensajes de error estructurados (RFC 7807 Problem Details).
- **Agregar tests unitarios para `DatoService`**: mockear `DatoRepository` y `EmailService` con Mockito, verificar que `crearDato("test")` llame a `repo.insertar("test")` y `emailService.enviar(...)`. También test de integración para `DatoRepository` con una BD H2 en memoria.

