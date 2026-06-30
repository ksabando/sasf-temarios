---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Validador de Pedidos con Template Method
**Solución esperada**:

```java
// Plantilla abstracta
public abstract class OrderValidatorTemplate {

    // Template method: cerrado a modificación
    public final void validate(Order order) {
        validateCommon(order);
        validateSpecific(order);
    }

    // Pasos comunes: cerrados
    private void validateCommon(Order order) {
        Objects.requireNonNull(order, "Order cannot be null");
        if (order.getItems() == null || order.getItems().isEmpty())
            throw new ValidationException("Order must have items");
        if (order.getCustomer() == null)
            throw new ValidationException("Customer required");
        if (order.getShippingAddress() == null)
            throw new ValidationException("Shipping address required");
    }

    // Pasos específicos: abiertos a extensión
    protected abstract void validateSpecific(Order order);

    // Helper para subclases
    protected void requirePaymentMethod(Order order) {
        if (order.getPaymentMethod() == null)
            throw new ValidationException("Payment method required");
    }
}

// Implementaciones concretas
public class StandardOrderValidator extends OrderValidatorTemplate {
    @Override
    protected void validateSpecific(Order order) {
        if (order.getTotal() < 10000)
            throw new ValidationException("Minimum order: $10,000");
        if (order.getItems().size() > 50)
            throw new ValidationException("Max 50 items per order");
        requirePaymentMethod(order);
    }
}

public class ExpressOrderValidator extends OrderValidatorTemplate {
    @Override
    protected void validateSpecific(Order order) {
        if (order.getTotal() < 50000)
            throw new ValidationException("Minimum express: $50,000");
        if (order.getItems().size() > 20)
            throw new ValidationException("Max 20 items for express");
        requirePaymentMethod(order);
        if (order.getDeliveryTime() == null)
            throw new ValidationException("Delivery time required for express");
        if (order.getDeliveryTime().before(new Date()))
            throw new ValidationException("Delivery time must be in the future");
    }
}

public class InternationalOrderValidator extends OrderValidatorTemplate {
    @Override
    protected void validateSpecific(Order order) {
        if (order.getTotal() < 200000)
            throw new ValidationException("Minimum international: $200,000");
        if (!order.hasCustomsDocs())
            throw new ValidationException("Customs documents required");
        if (order.getExportLicense() == null)
            throw new ValidationException("Export license required");
        if (order.getIncoterm() == null)
            throw new ValidationException("Incoterm required");
    }
}

// Nuevo validador sin modificar la plantilla
public class GovernmentOrderValidator extends OrderValidatorTemplate {
    @Override
    protected void validateSpecific(Order order) {
        if (order.getGovernmentContract() == null)
            throw new ValidationException("Government contract required");
        if (order.getBudgetCode() == null)
            throw new ValidationException("Budget code required");
        if (order.getApprovedBy() == null || !"DIRECTOR".equals(order.getApprovedBy()))
            throw new ValidationException("Director approval required");
    }
}
```

**Posibles mejoras**:
- Extraer cada regla de validación como un objeto **Specification Pattern** (`Specification<Order>`) componible con `and()`, `or()`, `not()`, permitiendo que las validaciones comunes y específicas se combinen dinámicamente sin una jerarquía de herencia rígida.
- Implementar **Strategy** para las validaciones comunes también: en lugar de codificar `validateCommon()` en la clase base, inyectar una lista de `ValidationRule` que se ejecuten secuencialmente, permitiendo que las reglas "comunes" también sean extensibles.
- Agregar un **collector de errores** que acumule todas las violaciones en lugar de lanzar en la primera, devolviendo `List<ValidationError>` para mejor experiencia de usuario en formularios.

---

## Ejercicio 4: Motor de Cálculo de Envíos
**Solución esperada**:

```java
// DTO
public class ShippingInfo {
    private double weight;
    private double distance;
    private double width;
    private double height;
    private double depth;
    private boolean express;

    // getters, setters, constructor
}

// Abstracción
public interface ShippingStrategy {
    double calculate(ShippingInfo info);
    boolean supports(String courier);
}

// Estrategias concretas
public class DHLShippingStrategy implements ShippingStrategy {
    private static final double BASE_COST = 15000;

    @Override
    public double calculate(ShippingInfo info) {
        double weightCost;
        double w = info.getWeight();
        if (w <= 1) weightCost = info.getDistance() * 200;
        else if (w <= 5) weightCost = info.getDistance() * 400;
        else if (w <= 10) weightCost = info.getDistance() * 800;
        else weightCost = info.getDistance() * 1500;
        return BASE_COST + weightCost;
    }

    @Override
    public boolean supports(String courier) { return "DHL".equals(courier); }
}

public class FedExShippingStrategy implements ShippingStrategy {
    private static final double BASE_COST = 12000;

    @Override
    public double calculate(ShippingInfo info) {
        double rate;
        double d = info.getDistance();
        if (d <= 10) rate = 300;
        else if (d <= 50) rate = 500;
        else if (d <= 200) rate = 900;
        else rate = 2000;
        return BASE_COST + info.getWeight() * rate;
    }

    @Override
    public boolean supports(String courier) { return "FEDEX".equals(courier); }
}

public class EnviaShippingStrategy implements ShippingStrategy {
    private static final double BASE_COST = 8000;

    @Override
    public double calculate(ShippingInfo info) {
        double cost = BASE_COST + info.getWeight() * info.getDistance() * 50;
        if (info.getWeight() > 20) {
            cost += 5000;
        }
        return cost;
    }

    @Override
    public boolean supports(String courier) { return "ENVIA".equals(courier); }
}

public class InterRapidissimoShippingStrategy implements ShippingStrategy {
    private static final double BASE_COST = 20000;

    @Override
    public double calculate(ShippingInfo info) {
        double volumetric = info.getWeight() * 100;
        double distanceCost = info.getDistance() * 300;
        double insurance = (BASE_COST + volumetric + distanceCost) * 0.05;
        return BASE_COST + volumetric + distanceCost + insurance;
    }

    @Override
    public boolean supports(String courier) { return "INTERRAPIDISIMO".equals(courier); }
}

public class ServiEntregaShippingStrategy implements ShippingStrategy {
    private static final double BASE_COST = 5000;

    @Override
    public double calculate(ShippingInfo info) {
        double weightCost = info.getWeight() * 1000;
        if (info.getWeight() > 30) {
            weightCost *= 1.5;
        }
        return BASE_COST + weightCost + info.getDistance() * 100;
    }

    @Override
    public boolean supports(String courier) { return "SERVIENTREGA".equals(courier); }
}

// Nueva estrategia sin modificar existente
public class MercadoEnvioShippingStrategy implements ShippingStrategy {
    private static final double BASE_COST = 10000;

    @Override
    public double calculate(ShippingInfo info) {
        double volume = info.getWidth() * info.getHeight() * info.getDepth();
        double volumetricWeight = volume / 5000;
        double chargeableWeight = Math.max(info.getWeight(), volumetricWeight);
        double cost = BASE_COST + chargeableWeight * info.getDistance() * 60;
        if (info.isExpress()) {
            cost *= 1.3;
        }
        return cost;
    }

    @Override
    public boolean supports(String courier) { return "MERCADOENVIO".equals(courier); }
}

// Calculador cerrado a modificación
public class ShippingCalculator {
    private final Map<String, ShippingStrategy> strategies;

    public ShippingCalculator(List<ShippingStrategy> strategyList) {
        this.strategies = strategyList.stream()
            .collect(HashMap::new,
                (map, s) -> {/* use supports() */},
                HashMap::putAll);
    }

    public double calculate(String courier, ShippingInfo info) {
        ShippingStrategy strategy = strategies.values().stream()
            .filter(s -> s.supports(courier))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown courier: " + courier));
        return strategy.calculate(info);
    }
}
```

**Posibles mejoras**:
- Agregar **patrón Chain of Responsibility** para decorar envíos con servicios adicionales: `InsuranceDecorator`, `ExpressDecorator`, `TrackingDecorator` que envuelvan cualquier `ShippingStrategy` y agreguen costo incremental sin modificar la estrategia base.
- Usar **Spring `@ConditionalOnProperty`** en cada estrategia para activar/desactivar couriers por configuración sin necesidad de recompilar, permitiendo que operaciones habilite couriers en producción de forma dinámica.
- Implementar un **Factory de estrategias** con caché y fallback: si un courier externo falla (timeout), automáticamente intentar con un courier alternativo configurable, aplicando OCP y resiliencia simultáneamente.

