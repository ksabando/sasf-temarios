---
sidebar_label: "Ejercicio"
---

# Ejercicio M03 — Refactorizar processOrder

## Objetivo

Refactorizar el método `processOrder` de **150 líneas** y **3 niveles de anidación** en funciones pequeñas (máximo 20 líneas, 1 nivel de anidación).

## Código Legacy

```java
package com.sasf.nomina.legacy;

import java.util.*;

public class OrderProcessor {

    private InventoryService inventoryService;
    private PaymentService paymentService;
    private ShippingService shippingService;
    private EmailService emailService;
    private AuditService auditService;

    public void processOrder(Order order) {
        // Validar orden
        if (order == null) {
            System.out.println("Order is null");
            return;
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            System.out.println("No items in order");
            return;
        }
        for (Item item : order.getItems()) {
            if (item == null) {
                System.out.println("Found null item");
                return;
            }
            if (item.getProductId() == null || item.getQuantity() <= 0 || item.getPrice() < 0) {
                System.out.println("Invalid item: " + item);
                return;
            }
        }
        if (order.getCustomer() == null) {
            System.out.println("No customer");
            return;
        }
        if (order.getCustomer().getEmail() == null) {
            System.out.println("No customer email");
            return;
        }

        // Calcular totales
        double subtotal = 0;
        for (Item item : order.getItems()) {
            subtotal += item.getPrice() * item.getQuantity();
        }
        double discount = 0;
        String coupon = order.getCouponCode();
        if (coupon != null && !coupon.isEmpty()) {
            if (coupon.equals("SUMMER10")) {
                discount = subtotal * 0.10;
            } else if (coupon.equals("WELCOME5")) {
                discount = subtotal * 0.05;
            } else if (coupon.equals("VIP20")) {
                discount = subtotal * 0.20;
            }
        }
        double tax = subtotal * 0.16;
        // Special tax for electronics
        for (Item item : order.getItems()) {
            if (item.getCategory() != null && item.getCategory().equals("ELECTRONICS")) {
                tax += item.getPrice() * item.getQuantity() * 0.03;
            }
        }
        double shipping = 0;
        if (subtotal > 100) {
            shipping = 0;
        } else {
            shipping = 9.99;
        }
        double total = subtotal - discount + tax + shipping;

        // Verificar inventario
        boolean allInStock = true;
        for (Item item : order.getItems()) {
            boolean inStock = inventoryService.checkStock(item.getProductId(), item.getQuantity());
            if (!inStock) {
                allInStock = false;
                System.out.println("Out of stock: " + item.getProductId());
            }
        }
        if (!allInStock) {
            System.out.println("Cannot process order: out of stock");
            return;
        }

        // Procesar pago
        PaymentResult paymentResult = paymentService.charge(order.getCustomer().getId(), total);
        if (paymentResult == null) {
            System.out.println("Payment failed: null result");
            return;
        }
        if (!paymentResult.isSuccess()) {
            System.out.println("Payment failed: " + paymentResult.getErrorMessage());
            return;
        }
        String paymentId = paymentResult.getTransactionId();

        // Crear shipment
        ShippingRequest shippingRequest = new ShippingRequest();
        shippingRequest.setOrderId(order.getId());
        shippingRequest.setAddress(order.getShippingAddress());
        shippingRequest.setItems(order.getItems());
        String trackingNumber = shippingService.createShipment(shippingRequest);
        if (trackingNumber == null) {
            System.out.println("Shipping failed");
            return;
        }

        // Actualizar orden
        order.setStatus("CONFIRMED");
        order.setTotal(total);
        order.setPaymentId(paymentId);
        order.setTrackingNumber(trackingNumber);
        order.setProcessedAt(new Date());

        // Enviar emails
        String emailBody = "Order " + order.getId() + " confirmed. Total: $" + total + ". Tracking: " + trackingNumber;
        emailService.send(order.getCustomer().getEmail(), "Order Confirmation", emailBody);

        // Auditar
        auditService.log("Order processed: " + order.getId());
        System.out.println("Order " + order.getId() + " processed successfully");
    }
}
```

## Requisitos

1. **Máximo 20 líneas por función** (sin contar llaves ni blank lines)
2. **Máximo 1 nivel de anidación** (sin if dentro de for dentro de if)
3. **Nombres que revelan intención**
4. **Un nivel de abstracción por función**
5. **Stepdown rule**: funciones de alto nivel arriba
6. **Sin efectos secundarios**
7. **DRY**: sin código duplicado
8. **Excepciones en lugar de println + return**

## Entrega

- Código refactorizado completo
- Lista de funciones extraídas con su responsabilidad
- Justificación de cada extracción
