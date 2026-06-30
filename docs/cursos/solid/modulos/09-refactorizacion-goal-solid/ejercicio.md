---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: OCP — Estrategias de Descuento e Impuestos

Convierte los switch/if de descuentos e impuestos en estrategias:

1. Crea interfaz `DiscountStrategy` con método `double calculate(Order order)`
   y `boolean supports(String customerType)`.
2. Implementa: `RegularDiscount`, `VIPDiscount`, `WholesaleDiscount`, `EmployeeDiscount`.
3. Crea interfaz `TaxStrategy` con método `double calculate(Item item)`
   y `boolean supports(String category)`.
4. Implementa: `ElectronicsTax`, `FoodTax`, `ClothingTax`, `DefaultTax`.
5. Crea `DiscountCalculator` que recibe `List<DiscountStrategy>`.
6. Crea `TaxCalculator` que recibe `List<TaxStrategy>`.

**Entregable:** Interfaces + implementaciones + pruebas unitarias (una por estrategia).

---

## Ejercicio 3: LSP + ISP — Jerarquía de Clientes e Interfaces

Corrige la violación LSP en el manejo de tipos de cliente y aplica ISP:

1. **LSP:** Elimina la herencia problemática de `Customer`. Usa composición:
   - `Customer` tiene un `CustomerType` (enum) y una `DiscountStrategy` asociada.
2. **ISP:** Divide `OrderRepository` en interfaces pequeñas:
   - `OrderReader`: `findById()`, `findByCustomer()`
   - `OrderWriter`: `save()`, `deleteById()`
   - `OrderSearch`: `findByDateRange()`, `findByStatus()`
3. Asegura que ninguna implementación tenga métodos no implementados.

**Entregable:** Código refactorizado + explicación de cómo se corrigió LSP.

---

## Ejercicio 4: DIP — Inversión de Dependencias + Factory

Refactoriza `OrderService` para que cumpla DIP:

1. Extrae interfaces para todas las dependencias.
2. El servicio debe recibir todas las dependencias por constructor.
3. Crea una clase `OrderServiceFactory` que construye el servicio con todas sus dependencias.
4. Crea una implementación mock de cada interfaz para pruebas.
5. Escribe una prueba unitaria de `OrderService` usando los mocks.

**Diagrama de dependencias antes y después:**

```
ANTES:
OrderManager → MySQL (DriverManager.getConnection())
            → System.out (email)
            → FileWriter (auditoria)

DESPUES:
OrderService → OrderRepository (interface) ← JdbcOrderRepository
             → DiscountCalculator (interface) ← DiscountCalculatorImpl
             → TaxCalculator (interface) ← TaxCalculatorImpl
             → InventoryService (interface) ← InventoryServiceImpl
             → NotificationService (interface) ← EmailNotificationService
             → AuditService (interface) ← DatabaseAuditService
```

**Entregable:** Código con DIP aplicado + pruebas con mocks + diagrama antes/después.

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| SRP: separación en 6+ clases cohesivas | 2.5 pts |
| OCP: estrategias de descuento e impuestos | 2.5 pts |
| LSP + ISP: composición en clientes + interfaces segregadas | 2.5 pts |
| DIP: inyección de dependencias + pruebas con mocks | 2.5 pts |
| **Total** | **10 pts** |

### Bonus (+1 pt)
Comparación de métricas antes/después (complejidad ciclomática, líneas por clase,
acoplamiento, cobertura de pruebas).
