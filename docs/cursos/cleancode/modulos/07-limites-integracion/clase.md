---
sidebar_label: "Clase"
---

# Módulo 07 — Límites e Integración

## Código de Terceros

Integrar código de terceros es inherentemente riesgoso. La librería cambia, el contrato evoluciona, y tu código queda acoplado.

```java
// MAL: acoplado directamente a la API de terceros
public class PaymentService {
    private PayPalApi paypal = new PayPalApi();

    public PaymentResult process(Payment payment) {
        // Acoplado a la API de PayPal
        PayPalTransaction tx = paypal.createTransaction();
        tx.setAmount(payment.getAmount());
        tx.setCurrency(payment.getCurrency());
        tx.setCardNumber(payment.getCardNumber());
        PayPalResponse response = tx.execute();

        // Traducción manual y acoplada
        return new PaymentResult(response.getStatus(), response.getTransactionId());
    }
}
```

## Adapter Pattern (Puerto-Adapter)

El principio: define un **puerto** (interfaz) que represente lo que NECESITAS, no lo que la librería OFRECE.

```java
// PUERTO: lo que el negocio necesita
public interface PaymentGateway {
    PaymentResult charge(String cardNumber, Money amount, Currency currency);
}

// ADAPTER: traduce puerto → API externa
public class PayPalAdapter implements PaymentGateway {
    private final PayPalApi paypalApi;

    public PayPalAdapter(PayPalApi paypalApi) {
        this.paypalApi = paypalApi;
    }

    public PaymentResult charge(String cardNumber, Money amount, Currency currency) {
        PayPalTransaction tx = paypalApi.createTransaction();
        tx.setAmount(amount.getValue());
        tx.setCurrency(currency.toString());
        tx.setCardNumber(cardNumber);
        PayPalResponse response = tx.execute();
        return new PaymentResult(response.getStatus(), response.getTransactionId());
    }
}

// OTRO ADAPTER: mismo puerto, distinta implementación
public class StripeAdapter implements PaymentGateway {
    private final StripeApi stripeApi;

    public StripeAdapter(StripeApi stripeApi) {
        this.stripeApi = stripeApi;
    }

    public PaymentResult charge(String cardNumber, Money amount, Currency currency) {
        StripeCharge charge = stripeApi.charges.create(
            new StripeChargeRequest()
                .amount(amount.getValue())
                .currency(currency.toString())
                .cardNumber(cardNumber)
        );
        return new PaymentResult(charge.getStatus(), charge.getId());
    }
}

// USO: el negocio no sabe qué adapter usa
@Service
public class CheckoutService {
    private final PaymentGateway paymentGateway;

    public CheckoutService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;  // Inyectado
    }

    public void checkout(Cart cart) {
        PaymentResult result = paymentGateway.charge(
            cart.getCardNumber(),
            cart.getTotal(),
            cart.getCurrency()
        );
        // ...
    }
}
```

## Learning Tests

Los Learning Tests son tests que escribes para **aprender cómo funciona una librería de terceros**, no para probar tu código.

```java
// Learning Test: cómo funciona PayPalApi.createTransaction()
public class PayPalApiLearningTest {

    @Test
    void shouldCreateTransactionWithCorrectAmount() {
        PayPalApi api = new PayPalApi(TestCredentials.SANDBOX);
        PayPalTransaction tx = api.createTransaction();

        tx.setAmount(100.50);
        tx.setCurrency("USD");
        tx.setCardNumber("4111111111111111");

        PayPalResponse response = tx.execute();

        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getTransactionId()).isNotNull();
        assertThat(response.getAmount()).isCloseTo(100.50, within(0.01));
    }

    @Test
    void shouldFailWhenCardExpired() {
        PayPalApi api = new PayPalApi(TestCredentials.SANDBOX);
        PayPalTransaction tx = api.createTransaction();

        tx.setAmount(50.0);
        tx.setCardNumber("4000000000000069");  // Tarjeta expirada de prueba

        PayPalResponse response = tx.execute();

        assertThat(response.getStatus()).isEqualTo("FAILED");
        assertThat(response.getErrorCode()).isEqualTo("CARD_EXPIRED");
    }
}
```

### Beneficios de Learning Tests

1. **Documentación viva**: muestra cómo usar la API
2. **Alerta de cambio**: si la librería cambia, el test falla
3. **No afectan producción**: son independientes
4. **Prueban supuestos**: validas que la API se comporta como esperas

## Boundaries (Límites del Sistema)

Los puntos donde tu código toca código externo son **boundaries**. Deben estar protegidos.

```java
// Boundary problem: dependencia directa de API externa
public class ReportGenerator {
    public byte[] generate() {
        ExternalChartApi chart = new ExternalChartApi();  // Acoplamiento
        chart.setData(fetchData());
        return chart.renderPng();
    }
}

// Boundary solution: interfaz propia
public class ReportGenerator {
    private final ChartRenderer chartRenderer;  // Puerto propio

    public ReportGenerator(ChartRenderer chartRenderer) {
        this.chartRenderer = chartRenderer;
    }

    public byte[] generate() {
        return chartRenderer.render(fetchData());
    }
}

public interface ChartRenderer {
    byte[] render(List<Data> data);
}

public class ExternalChartAdapter implements ChartRenderer {
    private final ExternalChartApi api;

    public ExternalChartAdapter(ExternalChartApi api) {
        this.api = api;
    }

    public byte[] render(List<Data> data) {
        api.setData(data);
        return api.renderPng();
    }
}
```

## Explorando Límites

Cuando integras una librería nueva, el proceso es:

1. **Aísla**: crea una interfaz que represente lo que NECESITAS
2. **Explora**: escribe learning tests para entender la API
3. **Implementa**: escribe el adapter
4. **Prueba**: test de integración con el adapter

```
Proceso:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Interfaz    │────▶│ Learning     │────▶│ Adapter     │
│ (Puerto)    │     │ Tests        │     │ (Implement) │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Código Legacy sin Tests

El boundary más peligroso es el código legacy sin tests.

```java
// Caracterización: test que documenta el comportamiento actual
// (sin asumir que es correcto, solo que existe)
public class LegacyOrderProcessorTest {

    @Test
    void shouldProcessOrderAsCurrentlyImplemented() {
        LegacyOrderProcessor processor = new LegacyOrderProcessor();
        Order order = new Order();
        order.addItem(new Item("PROD1", 2, 10.0));

        processor.process(order);

        assertThat(order.getStatus()).isEqualTo("PROCESSED");
        assertThat(order.getTotal()).isEqualTo(23.2);  // 20 + 3.2 tax
        assertThat(order.getTrackingNumber()).startsWith("TRK");
    }
}
```

## Regla de Oro

> No dejes que el código de terceros contamine tu dominio. Los adapters son la frontera.
