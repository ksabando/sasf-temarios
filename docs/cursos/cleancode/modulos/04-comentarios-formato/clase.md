---
sidebar_label: "Clase"
---

# Módulo 04 — Comentarios y Formato

## Comentarios: Los Buenos vs Los Malos

> "No comentes código malo. Reescríbelo." — Brian Kernighan

### Los comentarios NO compensan el mal código

```java
// MAL: comentario que explica código confuso
// Check if employee is eligible for full benefits
if ((emp.flags & HOURLY_FLAG) == 0 && emp.age > 65)

// BIEN: código que se explica solo
if (employee.isEligibleForFullBenefits())
```

## Comentarios Necesarios

### 1. Documentación Legal

```java
// Copyright (C) 2026 SASF - Todos los derechos reservados
// Licenciado bajo Apache License 2.0
```

### 2. Explicación de Intención

```java
// Usamos ordenamiento por burbuja porque garantizamos
// que la lista nunca tiene más de 10 elementos
// (el rendimiento no es crítico aquí)
public void sort(List<Item> items) {
    bubbleSort(items);
}
```

### 3. Clarificación

```java
public void compare(Article article) {
    // El formato 'YYYYMMDD' lo exige el sistema legacy
    // de contabilidad. NO CAMBIAR.
    String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
}
```

### 4. Advertencia de Consecuencias

```java
// ATENCIÓN: Este método consume mucha memoria RAM
// No invocar desde el hilo principal de la UI
public byte[] generateLargeReport() { ... }

// WARNING: hilo inseguro. Solo usar desde un solo thread.
private SimpleDateFormat formatter = new SimpleDateFormat();
```

### 5. TODO con Responsable

```java
// TODO: (jperez, 2026-03-15) Implementar paginación
// cuando la tabla supere 1000 registros
```

## Comentarios Innecesarios (NO hacer)

### 1. Ruido

```java
// MAL: comenta lo obvio
// Constructor por defecto
public Employee() {}

// Getter for name
public String getName() { return name; }
```

### 2. Redundantes

```java
// MAL: explica algo que el código ya dice
// Returns the day of the month
public int getDayOfMonth() { return this.day; }
```

### 3. Mandados (copy-paste comments)

```java
// MAL: comentario que debería estar en commit, no en código
// 2024-01-01: Juan cambió X
// 2024-02-15: Pedro corrigió Y
```

### 4. Código Comentado

```java
// MAL: código muerto que nadie borra
// public void oldMethod() {
//     someOldLogic();
// }
```

### 5. Marcadores de Posición

```java
// MAL: ruido visual
// ---------------------- Constructors ----------------------
// ==================== PUBLIC METHODS ====================
// ******************** PRIVATE ********************
```

## Formato Vertical

### Newspaper Metaphor

El código debe leerse como un periódico:
- **Arriba**: título y encabezado (nombre de clase, métodos públicos principales)
- **Medio**: detalles importantes
- **Abajo**: detalles de implementación

### Densidad Vertical

```java
// MAL: demasiados espacios
public class Employee {

    private String name;

    private String department;

    public Employee(String name) {
        this.name = name;

    }

}

// BIEN: densidad adecuada (líneas en blanco separan conceptos)
public class Employee {
    private String name;
    private String department;

    public Employee(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

### Distancia Vertical

Las variables y funciones relacionadas deben estar cerca.

```java
// MAL: variable lejos de donde se usa
private int MAX_RETRIES = 3;

// ... 200 líneas ...

public void connect() {
    for (int i = 0; i < MAX_RETRIES; i++) { ... }
}

// BIEN: variable cerca de su uso
public void connect() {
    final int MAX_RETRIES = 3;
    for (int i = 0; i < MAX_RETRIES; i++) { ... }
}
```

## Formato Horizontal

### Ancho Máximo

```java
// MAL: 150 caracteres, requiere scroll horizontal
public SomeClassWithAVeryLongName findCustomerByFirstNameAndLastName(String firstName, String lastName, String middleName, Date dateOfBirth, String documentType) { ... }

// BIEN: 80-120 caracteres máximo
public Customer findCustomer(CustomerSearchCriteria criteria) { ... }
```

### Indentación

```java
// MAL: indentación inconsistente
if (condition) {
    doSomething();
      doAnotherThing();
    }

// BIEN: indentación consistente (2 o 4 espacios)
if (condition) {
    doSomething();
    doAnotherThing();
}
```

## Consistencia de Equipo

Usar **formateador automático** (Spotless, Prettier) con configuración compartida:

```xml
<!-- checkstyle.xml -->
<module name="LineLength">
    <property name="max" value="120"/>
</module>
<module name="Indentation">
    <property name="basicOffset" value="4"/>
</module>
```

## Reglas Checkstyle/PMD

| Regla | Descripción |
|-------|-------------|
| `LineLength` | Máximo 120 caracteres |
| `Indentation` | 4 espacios, sin tabs |
| `JavadocType` | Clases públicas requieren Javadoc |
| `UnusedImports` | Sin imports no usados |
| `TodoComment` | TODO con formato específico |
| `EmptyBlock` | Bloques vacíos con comentario |
