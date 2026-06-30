---
sidebar_label: "Clase"
---

# Módulo 03 — Funciones

## La Primera Regla de las Funciones

> **"La primera regla de las funciones es que deben ser pequeñas. La segunda regla es que deben ser aún más pequeñas."** — Robert C. Martin

Una función debe hacer **una sola cosa**. Debe hacerla bien. Debe hacerla solamente ella.

```java
// MAL: hace 3 cosas
public void processOrder(Order order) {
    // 1. valida
    if (order.getItems().isEmpty()) {
        throw new IllegalArgumentException("Empty order");
    }
    // 2. calcula
    double total = 0;
    for (Item item : order.getItems()) {
        total += item.getPrice() * item.getQuantity();
    }
    // 3. guarda
    database.save(order);
}

// BIEN: cada función hace una cosa
public void processOrder(Order order) {
    validateOrder(order);
    double total = calculateTotal(order);
    saveOrder(order, total);
}
```

## Un Nivel de Abstracción por Función

No mezcles conceptos de alto nivel con detalles de bajo nivel.

```java
// MAL: mezcla niveles
public void generateReport() {
    // Alto nivel
    List<Data> data = fetchData();
    // Bajo nivel (detalle de parseo)
    StringBuilder sb = new StringBuilder();
    sb.append("<html><body>");
    for (Data d : data) {
        sb.append("<p>").append(d.getValue()).append("</p>");
    }
    sb.append("</body></html>");
    // Alto nivel
    sendReport(sb.toString());
}

// BIEN: cada función en su nivel
public void generateReport() {
    List<Data> data = fetchData();
    String html = buildHtmlReport(data);
    sendReport(html);
}

private String buildHtmlReport(List<Data> data) {
    StringBuilder sb = new StringBuilder();
    sb.append(HTML_HEADER);
    for (Data d : data) {
        sb.append(buildParagraph(d));
    }
    sb.append(HTML_FOOTER);
    return sb.toString();
}
```

## Stepdown Rule

El código debe leerse como un artículo: las funciones de alto nivel arriba, los detalles abajo.

```
// Alto nivel (quién)
processOrder
  → validateOrder
  → calculateTotal
  → saveOrder

// Detalles (cómo)
validateOrder
  → checkItemsNotEmpty
  → checkCustomerExists

calculateTotal
  → sumItemPrices
  → applyDiscounts
```

## Switch Statements

Los switch rara vez son pequeños. Una estrategia: enterrarlos en una fábrica y usar polimorfismo.

```java
// MAL: switch en todas partes
public double calculatePay(Employee employee) {
    switch (employee.getType()) {
        case COMMISSIONED: return calculateCommissionedPay(employee);
        case HOURLY: return calculateHourlyPay(employee);
        case SALARIED: return calculateSalariedPay(employee);
        default: throw new InvalidEmployeeType(employee.getType());
    }
}

// BIEN: polimorfismo
public interface Employee {
    double calculatePay();
}

public class CommissionedEmployee implements Employee {
    public double calculatePay() { /* ... */ }
}

public class HourlyEmployee implements Employee {
    public double calculatePay() { /* ... */ }
}
```

## Command Query Separation (CQS)

Un método debe ser **comando** (modifica estado) o **consulta** (devuelve valor), pero no ambos.

```java
// MAL: comando y consulta a la vez
public boolean deleteUser(int id) {
    User user = findById(id);
    if (user != null) {
        database.delete(user);
        return true;
    }
    return false;
}

// Uso confuso
if (deleteUser(5)) { ... }  // ¿borró? ¿existe?

// BIEN: separados
public void deleteUser(int id) {
    User user = findById(id);
    database.delete(user);
}

public boolean userExists(int id) {
    return findById(id) != null;
}

// Uso claro
if (userExists(5)) {
    deleteUser(5);
}
```

## No Efectos Secundarios

Una función no debe hacer cosas que su nombre no promete.

```java
// MAL: checkPassword NO debe inicializar sesión
public boolean checkPassword(String username, String password) {
    User user = userRepository.findBy(username);
    if (user.getPassword().equals(password)) {
        Session.initialize(user);  // EFECTO SECUNDARIO
        return true;
    }
    return false;
}

// BIEN: separado
public boolean checkPassword(String username, String password) {
    User user = userRepository.findBy(username);
    return user.getPassword().equals(password);
}

public Session login(String username, String password) {
    if (checkPassword(username, password)) {
        return Session.initialize(userRepository.findBy(username));
    }
    throw new AuthenticationException();
}
```

## Argumentos de Salida

Prefiere valores de retorno a modificar parámetros.

```java
// MAL: output argument
public void parseAddress(String input, Address address) {
    address.setStreet(input.split(",")[0]);
    address.setCity(input.split(",")[1]);
}

// BIEN: return value
public Address parseAddress(String input) {
    Address address = new Address();
    address.setStreet(input.split(",")[0]);
    address.setCity(input.split(",")[1]);
    return address;
}
```

## DRY (Don't Repeat Yourself)

Código duplicado = bug duplicado.

```java
// MAL: duplicación
public void saveCustomer(Customer customer) {
    logger.info("Saving customer: " + customer.getName());
    validate(customer);
    database.save(customer);
    logger.info("Customer saved: " + customer.getId());
}

public void saveProduct(Product product) {
    logger.info("Saving product: " + product.getName());
    validate(product);
    database.save(product);
    logger.info("Product saved: " + product.getId());
}

// BIEN: abstraer la operación genérica
public void save(Entity entity) {
    logger.info("Saving " + entity.getType() + ": " + entity.getName());
    validate(entity);
    database.save(entity);
    logger.info(entity.getType() + " saved: " + entity.getId());
}
```

## Errores: Códigos vs Excepciones

```java
// MAL: código de error (rompe flujo)
public int calculateTotal(Order order, double[] result) {
    if (order == null) return -1;
    if (order.getItems().isEmpty()) return -2;
    result[0] = ...;
    return 0;  // OK
}

// BIEN: excepción
public double calculateTotal(Order order) {
    if (order == null) throw new IllegalArgumentException("Order cannot be null");
    if (order.getItems().isEmpty()) throw new EmptyOrderException();
    return ...;
}
```

## Parámetros

| Número | Regla | Ejemplo |
|--------|-------|---------|
| 0 | Ideal | `double calculateTotal()` |
| 1 | Bueno | `double calculateTotal(Order order)` |
| 2 | Aceptable | `double calculateTotal(Order order, Discount discount)` |
| 3+ | Evitar | `double calculateTotal(Order o, Discount d, Tax t, Currency c)` |

¿Muchos parámetros? Agrúpalos en un objeto:

```java
// MAL: 4 parámetros
void createBooking(String user, String flight, Date date, String seat);

// BIEN: objeto parámetro
void createBooking(BookingRequest request);
```

## Regla de Oro

> Una función debe caber en una pantalla. Si no cabe, es muy grande.
