---
sidebar_label: "Ejercicio"
---

# Ejercicio M07 — Adapter para API de Pagos + Learning Tests

## Objetivo

Crear un adapter para el proveedor de pagos "FastPay" y escribir learning tests que documenten su comportamiento.

## Contexto

FastPay es una API de pagos que acaban de contratar. Necesitas integrarla limpiamente, sin contaminar el dominio.

## API de FastPay (terceros)

```java
// Esta es la API de terceros. NO MODIFICAR.
package com.fastpay.api;

public class FastPayClient {
    private static final String SANDBOX_URL = "https://sandbox.fastpay.com/v1";

    public FastPayClient(String apiKey, boolean sandbox) {
        // Inicializa cliente
    }

    public FastPayResponse processPayment(FastPayRequest request) {
        // Procesa pago
        return new FastPayResponse(...);
    }
}

public class FastPayRequest {
    private String transactionId;
    private double amount;
    private String currencyCode;
    private CreditCardData card;

    public void setTransactionId(String transactionId) { ... }
    public void setAmount(double amount) { ... }
    public void setCurrencyCode(String currencyCode) { ... }
    public void setCard(CreditCardData card) { ... }
}

public class CreditCardData {
    private String number;
    private int expMonth;
    private int expYear;
    private String cvv;

    // getters/setters
}

public class FastPayResponse {
    public enum Status { SUCCESS, FAILED, PENDING, ERROR }

    public Status getStatus() { ... }
    public String getTransactionId() { ... }
    public String getErrorMessage() { ... }
    public String getAuthCode() { ... }
}
```

## Requisitos

### Parte 1: Diseñar el Puerto

Define una interfaz `PaymentGateway` que represente lo que el negocio necesita (NO lo que FastPay ofrece).

### Parte 2: Learning Tests

Escribe 3 learning tests para la API de FastPay:
1. Test de pago exitoso
2. Test de pago con tarjeta inválida (debe fallar)
3. Test de pago con monto cero (debe fallar)

### Parte 3: Implementar el Adapter

Implementa `FastPayAdapter` implementando `PaymentGateway`. El adapter debe:
- Traducir llamadas del puerto a la API de FastPay
- Convertir tipos (Money → double, Currency → String)
- Mapear errores de FastPay a excepciones de dominio
- Ser intercambiable (StripeAdapter, etc.)

### Parte 4: Tests del Adapter

Escribe tests que verifiquen que el adapter:
- Traduce correctamente los parámetros
- Maneja respuestas exitosas
- Maneja respuestas fallidas
- Lanza excepción con contexto cuando falla

## Entrega

1. `PaymentGateway.java` (interfaz puerto)
2. `FastPayAdapterTest.java` (learning tests)
3. `FastPayAdapter.java` (implementación)
4. `PaymentGatewayTest.java` (tests del adapter)
