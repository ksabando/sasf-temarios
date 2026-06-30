---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M03 — processOrder Refactorizado

## Ejercicio: Refactorización de Función Monolítica `processOrder`

**Solución esperada**:

Extracción de 18 funciones con una sola responsabilidad a partir de una función monolítica de ~150 líneas:

| Función | Líneas | Responsabilidad |
|---------|--------|-----------------|
| `processOrder` | 10 | Orquestador: llama funciones en orden |
| `validateOrder` | 15 | Valida orden, items, customer, email |
| `validateOrderNotNull` | 3 | Valida que order no sea null |
| `validateItems` | 12 | Valida lista de items y cada item |
| `validateItem` | 5 | Valida un item individual |
| `validateCustomer` | 5 | Valida customer y su email |
| `calculateOrderTotal` | 10 | Calcula subtotal, descuento, impuesto, shipping |
| `calculateSubtotal` | 5 | Suma price * quantity de cada item |
| `calculateDiscount` | 12 | Aplica cupón si existe |
| `calculateTax` | 8 | Calcula impuesto base + electrónicos |
| `hasElectronicsCategory` | 5 | Verifica si hay items electrónicos |
| `calculateShippingCost` | 5 | Determina costo de envío |
| `checkInventoryAvailability` | 10 | Verifica stock de todos los items |
| `processPayment` | 10 | Ejecuta cobro y valida resultado |
| `createShipment` | 8 | Crea envío y devuelve tracking |
| `updateOrderStatus` | 8 | Actualiza estado, total, IDs |
| `sendConfirmationEmail` | 6 | Envía email de confirmación |
| `auditOrderProcessing` | 4 | Registra auditoría |

## Código Refactorizado

```java
package com.sasf.nomina;

import java.time.LocalDateTime;
import java.util.List;

public class OrderProcessor {

    private static final double TAX_RATE = 0.16;
    private static final double ELECTRONICS_TAX_SURCHARGE = 0.03;
    private static final double FREE_SHIPPING_THRESHOLD = 100.0;
    private static final double STANDARD_SHIPPING_COST = 9.99;

    private InventoryService inventoryService;
    private PaymentService paymentService;
    private ShippingService shippingService;
    private EmailService emailService;
    private AuditService auditService;

    public void processOrder(Order order) {
        validateOrder(order);
        double total = calculateOrderTotal(order);
        checkInventoryAvailability(order);
        String paymentId = processPayment(order, total);
        String trackingNumber = createShipment(order);
        updateOrderStatus(order, total, paymentId, trackingNumber);
        sendConfirmationEmail(order, trackingNumber);
        auditOrderProcessing(order);
    }

    private void validateOrder(Order order) {
        validateOrderNotNull(order);
        validateItems(order.getItems());
        validateCustomer(order.getCustomer());
    }

    private void validateOrderNotNull(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }
    }

    private void validateItems(List<Item> items) {
        if (items == null || items.isEmpty()) {
            throw new InvalidOrderException("Order must contain at least one item");
        }
        for (Item item : items) {
            validateItem(item);
        }
    }

    private void validateItem(Item item) {
        if (item == null) {
            throw new InvalidOrderException("Item cannot be null");
        }
        if (item.getProductId() == null || item.getQuantity() <= 0 || item.getPrice() < 0) {
            throw new InvalidOrderException("Invalid item: " + item);
        }
    }

    private void validateCustomer(Customer customer) {
        if (customer == null) {
            throw new InvalidOrderException("Customer cannot be null");
        }
        if (customer.getEmail() == null) {
            throw new InvalidOrderException("Customer must have an email");
        }
    }

    private double calculateOrderTotal(Order order) {
        double subtotal = calculateSubtotal(order.getItems());
        double discount = calculateDiscount(subtotal, order.getCouponCode());
        double tax = calculateTax(order.getItems(), subtotal);
        double shipping = calculateShippingCost(subtotal);
        return subtotal - discount + tax + shipping;
    }

    private double calculateSubtotal(List<Item> items) {
        return items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    private double calculateDiscount(double subtotal, String couponCode) {
        if (couponCode == null || couponCode.isEmpty()) {
            return 0;
        }
        return switch (couponCode) {
            case "SUMMER10" -> subtotal * 0.10;
            case "WELCOME5" -> subtotal * 0.05;
            case "VIP20" -> subtotal * 0.20;
            default -> 0;
        };
    }

    private double calculateTax(List<Item> items, double subtotal) {
        double tax = subtotal * TAX_RATE;
        if (hasElectronicsCategory(items)) {
            tax += subtotal * ELECTRONICS_TAX_SURCHARGE;
        }
        return tax;
    }

    private boolean hasElectronicsCategory(List<Item> items) {
        return items.stream()
                .anyMatch(item -> "ELECTRONICS".equals(item.getCategory()));
    }

    private double calculateShippingCost(double subtotal) {
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            return 0;
        }
        return STANDARD_SHIPPING_COST;
    }

    private void checkInventoryAvailability(Order order) {
        for (Item item : order.getItems()) {
            boolean inStock = inventoryService.checkStock(item.getProductId(), item.getQuantity());
            if (!inStock) {
                throw new OutOfStockException("Product out of stock: " + item.getProductId());
            }
        }
    }

    private String processPayment(Order order, double total) {
        PaymentResult result = paymentService.charge(order.getCustomer().getId(), total);
        if (result == null || !result.isSuccess()) {
            String errorMessage = (result != null) ? result.getErrorMessage() : "Null payment result";
            throw new PaymentFailedException(errorMessage);
        }
        return result.getTransactionId();
    }

    private String createShipment(Order order) {
        ShippingRequest request = new ShippingRequest();
        request.setOrderId(order.getId());
        request.setAddress(order.getShippingAddress());
        request.setItems(order.getItems());
        String trackingNumber = shippingService.createShipment(request);
        if (trackingNumber == null) {
            throw new ShippingFailedException("Failed to create shipment");
        }
        return trackingNumber;
    }

    private void updateOrderStatus(Order order, double total, String paymentId, String trackingNumber) {
        order.setStatus(OrderStatus.CONFIRMED);
        order.setTotal(total);
        order.setPaymentId(paymentId);
        order.setTrackingNumber(trackingNumber);
        order.setProcessedAt(LocalDateTime.now());
    }

    private void sendConfirmationEmail(Order order, String trackingNumber) {
        String subject = "Order Confirmation - " + order.getId();
        String body = String.format(
                "Order %s confirmed. Total: $%.2f. Tracking: %s",
                order.getId(), order.getTotal(), trackingNumber);
        emailService.send(order.getCustomer().getEmail(), subject, body);
    }

    private void auditOrderProcessing(Order order) {
        auditService.log("Order processed: " + order.getId());
    }
}
```

**Posibles mejoras**:

- Reemplazar el switch de cupones por una estrategia de descuento con `Map<String, DiscountStrategy>`. Cada nuevo cupón se agrega al mapa sin modificar `calculateDiscount`. Esto cumple OCP y permite que los cupones se carguen desde configuración o base de datos sin tocar código.

- Encapsular el cálculo del total en un value object `OrderTotal` que contenga subtotal, discount, tax, shipping y total. Esto evita el "primitive obsession" de manejar múltiples `double` y permite que `OrderTotal` tenga métodos como `applyDiscount(DiscountStrategy)` inmutables.

- Usar el patrón Chain of Responsibility para las validaciones: `ValidationChain` con `OrderNotNullValidator`, `ItemsValidator`, `CustomerValidator` encadenados. Esto hace que agregar nuevas validaciones no requiera modificar `validateOrder` y cada validador puede testearse aisladamente.

- Reemplazar `double` por `BigDecimal` en todos los cálculos monetarios. Los errores de redondeo con `double` son inaceptables en un sistema de órdenes real. Idealmente usar una librería de dinero como Joda-Money o un value object `Money` propio con `BigDecimal` interno.

## Resumen de Mejoras

| Aspecto | Antes | Después |
|---------|-------|---------|
| Líneas totales | ~150 | ~160 (divididas en 18 funciones) |
| Máx líneas/función | 150 | 15 |
| Anidación máxima | 3 niveles | 1 nivel |
| System.out.println | 10+ usos | 0 (excepciones + logger) |
| Retornos tempranos | 7 returns silenciosos | 0 (excepciones con contexto) |
| Números mágicos | 5+ valores literales | Constantes con nombre |

