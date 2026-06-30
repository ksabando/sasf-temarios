---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M01 — Introducción a Patrones GoF

## Ejercicio 1: Identificar Patrones en el JDK

**Solución esperada**:

| Clase/Método | Patrón | Justificación |
|---|---|---|
| `Calendar.getInstance()` | **Factory Method** | El método estático devuelve una subclase concreta de `Calendar` (GregorianCalendar, BuddhistCalendar) según la locale. El cliente no conoce la clase concreta. |
| `Collections.unmodifiableList()` | **Decorator** | Envuelve una lista existente agregando comportamiento (protección contra modificación) sin cambiar la interfaz original. |
| `InputStreamReader` | **Adapter** | Convierte un `InputStream` (bytes) en un `Reader` (caracteres), adaptando una interfaz a otra que el cliente espera. |
| `Arrays.asList()` | **Adapter** | Adapta un array (estructura fija) a la interfaz `List<T>`, permitiendo usar un array donde se espera una lista. |

**Posibles mejoras**:
- Agregar `Collections.synchronizedList()` como ejemplo de **Decorator** con preocupación de concurrencia: envuelve una `List` agregando sincronización con `synchronized` blocks sin cambiar la interfaz `List`.
- Incluir `java.io.BufferedInputStream` como ejemplo canónico de Decorator puro (misma interfaz `InputStream`, agrega buffering), para contrastar con `InputStreamReader` que sí cambia la interfaz.
- Para `Calendar.getInstance()`, mencionar que es un Factory Method combinado con **Singleton** interno (el mismo `Calendar.Builder` usa Builder pattern), mostrando cómo los patrones frecuentemente se componen.

## Ejercicio 2: Lectura de Diagrama UML

**Solución esperada**:

- a) **Strategy** (interfaz `PaymentStrategy` con implementaciones intercambiables) y **Template Method** (la clase abstracta `PaymentProcessor` define el esqueleto del algoritmo con `process()` que llama a `validate()`, `execute()`, `notify()`).
- b) **Strategy** permite intercambiar algoritmos completos (métodos de pago) en tiempo de ejecución. **Template Method** define la estructura fija de un algoritmo, delegando pasos específicos a subclases.
- c) **Strategy** cumple OCP (nuevos métodos de pago sin modificar cliente) y DIP (cliente depende de abstracción). **Template Method** cumple OCP (nuevos procesadores sin modificar esqueleto) y LSP (subclases sustituibles).

**Posibles mejoras**:
- Agregar un diagrama alternativo usando **Chain of Responsibility** para el flujo de validación, donde cada validador (`FraudValidator`, `BalanceValidator`, `LimitValidator`) decide si procesa o pasa al siguiente, evitando una lista hardcodeada de validaciones.
- Para el Template Method, considerar reemplazar `abstract` por métodos `default` en interfaz Java 8+ con `protected final void process()` delegando a métodos `default` sobreescribibles, eliminando la clase abstracta.
- Mencionar que el cliente `CheckoutService` podría usar **Factory Method** para crear la `PaymentStrategy` correcta basada en el tipo de pago seleccionado, evitando un `switch` en el cliente.

## Ejercicio 3: Clasificación de Patrones

**Solución esperada**:

1. **Adapter** — **Estructural**: Cambia la interfaz de un objeto para hacerlo compatible con otro sistema.
2. **Observer** — **Comportamiento**: Define una dependencia uno-a-muchos entre objetos para notificar cambios.
3. **Builder** — **Creacional**: Separa la construcción de objetos complejos de su representación final.
4. **Proxy** — **Estructural**: Proporciona un sustituto o representante de otro objeto para controlar acceso.
5. **Command** — **Comportamiento**: Encapsula una solicitud como objeto, permitiendo parametrizar, deshacer y registrar.
6. **Singleton** — **Creacional**: Asegura que una clase tenga solo una instancia y proporciona un punto de acceso global.
7. **Composite** — **Estructural**: Compone objetos en estructuras de árbol para trabajar con jerarquías parte-todo.

**Posibles mejoras**:
- Agregar una columna "Anti-patrón asociado" para cada clasificación. Por ejemplo, mal uso de Singleton → **God Object** (estado global excesivo); mal uso de Observer → **Memory Leak** (listeners no desregistrados que previenen garbage collection).

## Ejercicio 4: Identificar Patrones en Spring Boot

**Solución esperada**:

| Componente | Patrón | Justificación |
|---|---|---|
| `JdbcTemplate` | **Template Method** + **Facade** | Define el esqueleto de operaciones JDBC (abrir conexión, ejecutar, cerrar), delegando las partes variables a callbacks. También actúa como Facade simplificando la API compleja de JDBC. |
| `@Autowired` | **Dependency Injection** | El contenedor IoC inyecta las dependencias en lugar de que el objeto las cree. Es la implementación concreta del principio IoC. |
| `@EventListener` | **Observer** | Permite que objetos reaccionen a eventos publicados por el `ApplicationEventPublisher`. Hay una relación uno-a-muchos entre el publicador y los suscriptores. |
| `SecurityFilterChain` | **Chain of Responsibility** | Cada filtro en la cadena decide si procesa la petición o la pasa al siguiente. La petición recorre la cadena hasta ser manejada o rechazada. |
| `PlatformTransactionManager` | **Abstract Factory** + **Strategy** | Define una interfaz para crear/manejar transacciones. Las implementaciones concretas (`DataSourceTransactionManager`, `JpaTransactionManager`) son estrategias intercambiables. |

**Posibles mejoras**:
- Agregar `BeanPostProcessor` como ejemplo de **Proxy dinámico**: Spring crea proxies AOP alrededor de beans para inyectar comportamiento transversal (transacciones, seguridad, logging) sin modificar el código original.
- Para `@EventListener`, mencionar la alternativa con **Reactive Streams** (`@EventListener` síncrono vs `ApplicationEventMulticaster` con `TaskExecutor` para async, o migrar a Spring WebFlux con `Project Reactor` para backpressure).
- Incluir `@Configuration` + `@Bean` como combinación de **Factory Method** con **Singleton** a nivel de contenedor, donde Spring gestiona el ciclo de vida y el scope del bean creado.

