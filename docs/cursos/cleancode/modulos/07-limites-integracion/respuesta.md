---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M07 — Adapter de Pagos + Learning Tests

## Ejercicio 1: Puerto (Interfaz)

**Solución esperada**:

```java
package com.sasf.nomina.payment;

public interface PaymentGateway {
    PaymentResult charge(Money amount, CreditCard card, Currency currency);
    PaymentResult refund(String transactionId, Money amount);
}

record PaymentResult(String transactionId, boolean success, String errorMessage) {}

record CreditCard(String number, int expMonth, int expYear, String cvv) {}
```

**Posibles mejoras**:

- Agregar un parámetro adicional `idempotencyKey` al método `charge` para evitar cobros duplicados en reintentos. Muchas pasarelas de pago modernas (Stripe, MercadoPago) requieren o recomiendan claves de idempotencia. Que el puerto lo contemple desde el diseño inicial evita tener que modificar la interfaz después.

- Enriquecer `PaymentResult` con un `enum PaymentStatus { SUCCESS, FAILED, PENDING, REFUNDED }` en lugar de un booleano `success`. Un booleano no modela adecuadamente estados como "pendiente de confirmación" o "requiere autenticación adicional" (3DS), que son cada vez más comunes en pagos online.

- Separar la lógica de refund en su propio puerto `RefundGateway` si el ciclo de vida del refund es significativamente distinto al del charge (diferentes timeouts, diferentes políticas de reintento, diferentes proveedores). SRP aplica a interfaces también.

## Ejercicio 2: Learning Tests

**Solución esperada**:

```java
package com.sasf.nomina.payment;

import com.fastpay.api.*;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class FastPayLearningTest {

    private FastPayClient createClient() {
        return new FastPayClient("test_api_key_123", true);
    }

    @Test
    void paymentShouldSucceedWithValidCard() {
        FastPayClient client = createClient();
        FastPayRequest request = new FastPayRequest();
        request.setTransactionId("TX— + System.currentTimeMillis());
        request.setAmount(100.50);
        request.setCurrencyCode("USD");

        CreditCardData card = new CreditCardData();
        card.setNumber("4111111111111111");
        card.setExpMonth(12);
        card.setExpYear(2028);
        card.setCvv("123");
        request.setCard(card);

        FastPayResponse response = client.processPayment(request);

        assertThat(response.getStatus()).isEqualTo(FastPayResponse.Status.SUCCESS);
        assertThat(response.getTransactionId()).isNotNull();
    }

    @Test
    void paymentShouldFailWithInvalidCard() {
        FastPayClient client = createClient();
        FastPayRequest request = new FastPayRequest();
        request.setTransactionId("TX— + System.currentTimeMillis());
        request.setAmount(50.0);
        request.setCurrencyCode("USD");

        CreditCardData card = new CreditCardData();
        card.setNumber("1234567890123456");
        card.setExpMonth(1);
        card.setExpYear(2022);
        card.setCvv("000");
        request.setCard(card);

        FastPayResponse response = client.processPayment(request);

        assertThat(response.getStatus()).isEqualTo(FastPayResponse.Status.FAILED);
        assertThat(response.getErrorMessage()).isNotEmpty();
    }

    @Test
    void paymentShouldFailWithZeroAmount() {
        FastPayClient client = createClient();
        FastPayRequest request = new FastPayRequest();
        request.setTransactionId("TX— + System.currentTimeMillis());
        request.setAmount(0);
        request.setCurrencyCode("USD");

        CreditCardData card = new CreditCardData();
        card.setNumber("4111111111111111");
        card.setExpMonth(12);
        card.setExpYear(2028);
        card.setCvv("123");
        request.setCard(card);

        FastPayResponse response = client.processPayment(request);

        assertThat(response.getStatus()).isEqualTo(FastPayResponse.Status.FAILED);
    }
}
```

**Posibles mejoras**:

- Agregar tests para casos borde adicionales: tarjeta con fecha expirada, tarjeta con CVV inválido (longitud incorrecta), monto negativo, currency no soportada ("XYZ"), y request con campos nulos. Cuantos más corner cases documenten los Learning Tests, más rápido detectarás cambios de comportamiento en upgrades de la librería.

- Parametrizar los tests con un enum de tarjetas de prueba (VISA, MASTERCARD, AMEX) y sus comportamientos esperados. Esto reduce la duplicación entre tests y hace explícito qué tarjetas de prueba soporta la librería.

- Extraer los datos de prueba hardcodeados a constantes o a un archivo de configuración de test. Cambiar una tarjeta de prueba en 10 tests es tedioso y propenso a errores. Una factory `TestCards.validVisa()` centraliza los datos.

## Ejercicio 3: Adapter

**Solución esperada**:

```java
package com.sasf.nomina.payment;

import com.fastpay.api.*;
import java.util.UUID;

public class FastPayAdapter implements PaymentGateway {

    private final FastPayClient fastPayClient;

    public FastPayAdapter(String apiKey, boolean sandbox) {
        this.fastPayClient = new FastPayClient(apiKey, sandbox);
    }

    public FastPayAdapter(FastPayClient fastPayClient) {
        this.fastPayClient = fastPayClient;
    }

    @Override
    public PaymentResult charge(Money amount, CreditCard card, Currency currency) {
        FastPayRequest request = buildRequest(amount, card, currency);
        FastPayResponse response = fastPayClient.processPayment(request);
        return mapToPaymentResult(response);
    }

    @Override
    public PaymentResult refund(String transactionId, Money amount) {
        FastPayRequest request = new FastPayRequest();
        request.setTransactionId("REF— + UUID.randomUUID());
        request.setAmount(amount.getValue());
        request.setCurrencyCode("USD");
        CreditCardData card = new CreditCardData();
        card.setNumber("0000000000000000");
        card.setExpMonth(1);
        card.setExpYear(2030);
        card.setCvv("000");
        request.setCard(card);

        FastPayResponse response = fastPayClient.processPayment(request);
        return mapToPaymentResult(response);
    }

    private FastPayRequest buildRequest(Money amount, CreditCard card, Currency currency) {
        FastPayRequest request = new FastPayRequest();
        request.setTransactionId("TX— + UUID.randomUUID());
        request.setAmount(amount.getValue());
        request.setCurrencyCode(currency.toString());

        CreditCardData cardData = new CreditCardData();
        cardData.setNumber(card.number());
        cardData.setExpMonth(card.expMonth());
        cardData.setExpYear(card.expYear());
        cardData.setCvv(card.cvv());
        request.setCard(cardData);

        return request;
    }

    private PaymentResult mapToPaymentResult(FastPayResponse response) {
        return switch (response.getStatus()) {
            case SUCCESS -> new PaymentResult(
                response.getTransactionId(), true, null);
            case FAILED -> new PaymentResult(
                null, false, response.getErrorMessage());
            case ERROR -> throw new PaymentServiceException(
                "FastPay error: " + response.getErrorMessage());
            case PENDING -> new PaymentResult(
                response.getTransactionId(), true, "PENDING");
        };
    }
}
```

**Posibles mejoras**:

- Inyectar un `TransactionIdGenerator` (puerto) en lugar de usar `UUID.randomUUID()` directamente. Esto permite que en producción uses IDs con prefijos de negocio (`PAY-2026-001`) y en tests puedas usar IDs predecibles. También evita que el adapter tenga la responsabilidad de generar identificadores.

- Agregar reintentos con backoff exponencial dentro del adapter para manejar fallas transitorias de red. Usar una librería como Resilience4j `@Retry` sobre `fastPayClient.processPayment` con configuración inyectable (maxAttempts, waitDuration). Pero mantener el timeout total bajo para no bloquear al llamante.

- Mejorar el método `refund` para no hardcodear `"USD"` como currency code. Actualmente cualquier refund se hace en USD independientemente de la moneda original, lo que es incorrecto. El método debería recibir un `Currency` como parámetro, igual que `charge`.

## Ejercicio 4: Tests del Adapter

**Solución esperada**:

```java
package com.sasf.nomina.payment;

import com.fastpay.api.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FastPayAdapterTest {

    @Mock private FastPayClient fastPayClient;
    private FastPayAdapter adapter;

    void setUp() {
        MockitoAnnotations.openMocks(this);
        adapter = new FastPayAdapter(fastPayClient);
    }

    @Test
    void shouldReturnSuccessfulResultWhenPaymentSucceeds() {
        FastPayResponse response = new FastPayResponse();
        when(response.getStatus()).thenReturn(FastPayResponse.Status.SUCCESS);
        when(response.getTransactionId()).thenReturn("FP-123456");
        when(fastPayClient.processPayment(any())).thenReturn(response);

        PaymentResult result = adapter.charge(
            new Money(100.0),
            new CreditCard("4111111111111111", 12, 2028, "123"),
            Currency.USD);

        assertThat(result.success()).isTrue();
        assertThat(result.transactionId()).isEqualTo("FP-123456");
    }

    @Test
    void shouldReturnFailedResultWhenPaymentFails() {
        FastPayResponse response = new FastPayResponse();
        when(response.getStatus()).thenReturn(FastPayResponse.Status.FAILED);
        when(response.getErrorMessage()).thenReturn("Card declined");
        when(fastPayClient.processPayment(any())).thenReturn(response);

        PaymentResult result = adapter.charge(
            new Money(50.0),
            new CreditCard("4000000000000002", 1, 2022, "000"),
            Currency.USD);

        assertThat(result.success()).isFalse();
        assertThat(result.errorMessage()).contains("Card declined");
    }

    @Test
    void shouldThrowWhenPaymentReturnsError() {
        FastPayResponse response = new FastPayResponse();
        when(response.getStatus()).thenReturn(FastPayResponse.Status.ERROR);
        when(response.getErrorMessage()).thenReturn("Internal error");
        when(fastPayClient.processPayment(any())).thenReturn(response);

        assertThatThrownBy(() ->
            adapter.charge(
                new Money(100.0),
                new CreditCard("4111111111111111", 12, 2028, "123"),
                Currency.USD))
            .isInstanceOf(PaymentServiceException.class)
            .hasMessageContaining("FastPay error");
    }
}
```

**Posibles mejoras**:

- Agregar tests para verificar que el adapter construye correctamente el request (usando `ArgumentCaptor`). Actualmente los tests solo verifican la respuesta, pero no que el adapter mapeó correctamente los campos de `Money`, `CreditCard` y `Currency` a `FastPayRequest`. Un bug en el mapping pasaría desapercibido.

- Agregar tests para el estado PENDING: verificar que `success=true` y `errorMessage="PENDING"` es realmente el comportamiento deseado. Esto es contra-intuitivo (¿success=true cuando está pendiente?) y debería estar documentado en un test que haga explícita esta decisión de diseño.

- Separar la lógica de mapeo (`mapToPaymentResult`, `buildRequest`) en clases separadas (`FastPayResponseMapper`, `FastPayRequestBuilder`) y testearlas unitariamente. Esto reduce la complejidad del adapter y hace los tests más específicos y mantenibles.

## Principios Aplicados

- **Puerto-Adapter**: PaymentGateway es el puerto, FastPayAdapter la implementación
- **Learning Tests**: documentan comportamiento real de FastPay
- **Mocks**: aislan pruebas del adapter de la red
- **Excepciones de dominio**: PaymentServiceException para errores técnicos
- **Inversión de dependencias**: el negocio depende de la interfaz, no de FastPay

