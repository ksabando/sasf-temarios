---
sidebar_label: "Clase"
---

## Plan de Ataque: Refactorización Paso a Paso

### Paso 1: SRP — Separar Responsabilidades

Dividir OrderManager en capas con responsabilidades únicas:

1. `OrderController` — Manejo de HTTP (si es web) o entry point
2. `OrderService` — Lógica de negocio y orquestación
3. `OrderValidator` — Validación de datos de entrada
4. `DiscountCalculator` — Cálculo de descuentos
5. `TaxCalculator` — Cálculo de impuestos
6. `OrderRepository` — Persistencia de órdenes
7. `InventoryService` — Gestión de inventario
8. `NotificationService` — Envío de notificaciones
9. `AuditService` — Registro de auditoría

### Paso 2: OCP — Hacer Extensible

Convertir los cálculos de descuentos e impuestos en estrategias:

```java
public interface DiscountStrategy {
    double calculate(Order order);
    boolean supports(String customerType);
}

public interface TaxStrategy {
    double calculate(Item item);
    boolean supports(String category);
}
```

### Paso 3: LSP — Corregir Herencia de Clientes

Reemplazar jerarquía de tipos de cliente por composición:

```java
// Antes: herencia problematica
public class Customer { }
public class VIPCustomer extends Customer { }
public class WholesaleCustomer extends Customer { }

// Despues: composicion
public class Customer {
    private CustomerType type;
    private DiscountStrategy discountStrategy;
}
```

### Paso 4: ISP — Interfaces Específicas

```java
public interface OrderReader { Optional<Order> findById(Long id); }
public interface OrderWriter { Order save(Order order); }
public interface InventoryChecker { boolean hasStock(Item item); }
public interface InventoryUpdater { void reduceStock(Item item); }
```

### Paso 5: DIP — Invertir Dependencias

```java
// Antes: creacion directa en constructor
public class OrderManager {
    private Connection conn;
    public OrderManager() { conn = DriverManager.getConnection(...); }
}

// Despues: inyeccion de dependencias
public class OrderService {
    private final OrderRepository repository;
    private final DiscountCalculator discountCalc;
    private final TaxCalculator taxCalc;
    private final InventoryService inventory;
    private final NotificationService notifier;
    private final AuditService auditor;

    public OrderService(OrderRepository repository, DiscountCalculator discountCalc,
                        TaxCalculator taxCalc, InventoryService inventory,
                        NotificationService notifier, AuditService auditor) {
        this.repository = repository; this.discountCalc = discountCalc;
        this.taxCalc = taxCalc; this.inventory = inventory;
        this.notifier = notifier; this.auditor = auditor;
    }
}
```

---

## Métricas Después de la Refactorización

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas por clase (promedio) | 1200 | 45 | -96% |
| Complejidad ciclomática (promedio) | 18 | 3 | -83% |
| Acoplamiento | 6 concretas | 0 concretas (solo interfaces) | 100% |
| Cobertura de pruebas | 0% | 92% | +92% |
| Violaciones SRP | 8 | 1 (solo orquestación) | -87% |
| Código duplicado | 3 bloques | 0 | 100% |
| Número de clases | 1 | 14 | +1400% (deseable) |
| Tiempo para agregar nuevo tipo de cliente | 30 min | 5 min | -83% |
| Tiempo para cambiar de BD | 2 días | 2 horas | -87% |

---

## Resumen del Proceso

```
Fase 1 (SRP): Identificar responsabilidades → Separar en clases
Fase 2 (OCP): Identificar switch/if → Convertir a estrategias
Fase 3 (LSP): Identificar herencia → Reemplazar por composición
Fase 4 (ISP): Identificar interfaces grandes → Segregar
Fase 5 (DIP): Identificar new/estáticos → Inyectar dependencias
```

### Anti-patrones a Evitar Durante la Refactorización

1. **Big Bang Refactoring:** No refactorizar todo de una vez. Hacerlo por pasos con pruebas
2. **Golden Hammer:** No aplicar todos los principios a todas partes. Usar criterio
3. **Over-engineering:** No crear 50 interfaces para un CRUD simple. YAGNI
4. **Scope Creep:** No mezclar refactorización con nuevas funcionalidades
5. **Sin pruebas:** No refactorizar sin tener pruebas que validen el comportamiento
