---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Inyección por constructor con repositorio
Crear `UserRepository` (simulado con lista en memoria) e `UserService` que recibe `UserRepository` por constructor.

**Requisitos**:
- `UserRepository` con método `List<String> findAll()`
- `UserService` con constructor injection
- `@Component` en ambas clases
- `@ComponentScan` en la configuración

---

## Ejercicio 4: Singleton vs Prototype
Demostrar la diferencia entre beans singleton y prototype.

**Requisitos**:
- Bean `CounterService` (singleton) con atributo `int count` e incremento
- Bean `RequestScopeBean` (prototype) con atributo similar
- Desde `main`, obtener 3 veces cada bean y mostrar su estado
- Explicar por qué singleton comparte estado y prototype no

---

## Ejercicio 5: @Qualifier para desambiguar
Crear tres implementaciones de una interfaz `NotificationService` (`EmailNotification`, `SmsNotification`, `PushNotification`) y usar `@Qualifier` para inyectar una específica.

**Requisitos**:
- Interfaz `NotificationService` con método `void send(String message)`
- Tres implementaciones con `@Component` y `@Qualifier("...")`
- Clase `NotificationManager` que inyecte las tres con `@Qualifier`
- Configuración que escanee los componentes
