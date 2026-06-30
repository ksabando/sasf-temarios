---
sidebar_label: "Clase"
---

# Módulo 01 — Introducción a Patrones GoF

## ¿Qué son los Patrones de Diseño?

Los patrones de diseño son **soluciones probadas y reutilizables** para problemas recurrentes en el diseño de software orientado a objetos. El concepto fue popularizado por Christopher Alexander en arquitectura y adaptado al software por el **GoF (Gang of Four)** : Erich Gamma, Richard Helm, Ralph Johnson y John Vlissides.

> *"Each pattern describes a problem which occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice."* — Christopher Alexander

## Clasificación de Patrones (GoF)

Los 23 patrones GoF se clasifican en tres categorías según su **propósito**:

| Categoría | Propósito | Patrones |
|-----------|-----------|----------|
| **Creacionales** | Creación flexible de objetos | Singleton, Factory Method, Abstract Factory, Builder, Prototype |
| **Estructurales** | Composición de clases y objetos | Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy |
| **Comportamiento** | Comunicación entre objetos | Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor |

## Cómo Leer un Patrón

Cada patrón GoF se describe con una estructura consistente:

1. **Nombre** — Identificador único que describe el problema
2. **Clasificación** — Creacional, estructural o de comportamiento
3. **Intención** — ¿Qué problema resuelve?
4. **Motivación** — Escenario concreto donde aplica
5. **Aplicabilidad** — ¿Cuándo usarlo?
6. **Estructura** — Diagrama UML de clases y objetos
7. **Participantes** — Clases y objetos que intervienen
8. **Colaboraciones** — Cómo interactúan los participantes
9. **Consecuencias** — Trade-offs, ventajas y desventajas
10. **Implementación** — Consideraciones prácticas
11. **Ejemplo de Código** — Implementación de referencia
12. **Usos Conocidos** — Ejemplos en frameworks y librerías
13. **Patrones Relacionados** — Diferencias y similitudes

## UML Básico para Patrones

### Relaciones entre Clases

```
Clase A ─────▷ Clase B    : Dependencia (usa)
Clase A ─────▶ Interface B : Realización (implementa)
Clase A ────□▶ Clase B    : Asociación (tiene referencia)
Clase A ──◆▶ Clase B      : Composición (contiene, ciclo de vida compartido)
Clase A ──◇▶ Clase B      : Agregación (contiene, ciclo de vida independiente)
Clase A ─▷ Clase B        : Herencia (es un)
```

### Notación UML para Patrones

```
┌──────────────────┐       ┌──────────────────┐
│    <<abstract>>   │       │   <<interface>>   │
│     Client        │       │     Target       │
├──────────────────┤       ├──────────────────┤
│                   │       │ + request()      │
│                   │       └──────────────────┘
└──────────────────┘                ▲
        │                           │
        │ asocia                    │ realiza
        ▼                           │
┌──────────────────┐       ┌──────────────────┐
│    Adapter       │───────│    Adaptee       │
├──────────────────┤       ├──────────────────┤
│ + request()      │       │ + specificReq()  │
└──────────────────┘       └──────────────────┘
```

## Patrones vs Principios SOLID

| Principio | Relación con Patrones |
|-----------|----------------------|
| **S** — Single Responsibility | Cada clase tiene una razón para cambiar; los patrones ayudan a separar responsabilidades |
| **O** — Open/Closed | Abierto para extensión, cerrado para modificación; Strategy, Decorator, Observer lo facilitan |
| **L** — Liskov Substitution | Subtipos deben ser sustituibles por su tipo base; fundamental para herencia en patrones |
| **I** — Interface Segregation | Interfaces pequeñas y específicas; Adapter, Proxy trabajan con interfaces focalizadas |
| **D** — Dependency Inversion | Depender de abstracciones, no de concreciones; Abstract Factory, Bridge, Template Method lo aplican |

## Proyecto Base: Sistema de Procesamiento de Pedidos

A lo largo del curso trabajaremos sobre un **sistema de procesamiento de pedidos** que evolucionará aplicando patrones:

```
com.patrones.pedidos/
├── domain/            # Entidades del dominio
│   ├── Pedido.java
│   ├── ItemPedido.java
│   ├── Cliente.java
│   └── Producto.java
├── service/           # Servicios de negocio
│   ├── ProcesadorPedido.java
│   ├── CalculadorImpuestos.java
│   └── NotificadorPedido.java
├── repository/        # Persistencia
│   └── PedidoRepository.java
└── Main.java
```

## Git Básico para el Curso

```bash
# Fork y clone del repositorio base
git clone https://github.com/upc-course/patrones-2026.git
cd patrones-2026

# Crear rama para cada módulo
git checkout -b modulo-01
git add .
git commit -m "Módulo 01: Introducción"
git push origin modulo-01
```

## Identificación de Patrones en Frameworks Conocidos

### Strategy en `java.util.Comparator`

```java
// Comparator<T> es un Strategy: diferentes algoritmos de comparación
List<String> nombres = Arrays.asList("Ana", "Carlos", "Beatriz");
nombres.sort(String::compareToIgnoreCase); // Strategy: ignore case
nombres.sort(Comparator.naturalOrder());    // Strategy: natural order
```

### Observer en Swing

```java
// ActionListener es un Observer
JButton boton = new JButton("Click");
boton.addActionListener(e -> System.out.println("Botón clickeado"));
```

### Factory Method en Spring

```java
@Configuration
public class AppConfig {
    @Bean
    public PedidoService pedidoService() {
        return new PedidoService(); // Factory Method
    }
}
```

## Discusión: Patrones como Soluciones Probadas

Los patrones **no son recetas** sino **soluciones probadas** que deben adaptarse al contexto. Un patrón mal aplicado puede generar sobreingeniería (over-engineering). La clave está en:

- **Conocer el catálogo** para no reinventar la rueda
- **Elegir el patrón adecuado** al problema específico
- **Adaptar** el patrón al lenguaje y contexto
- **No forzar** patrones donde no se necesitan (YAGNI)

## Anti-patrón Introductorio: Reinventar la Rueda

No conocer el catálogo de patrones lleva a resolver problemas conocidos desde cero, perdiendo tiempo y calidad. Siempre pregúntate: *"¿Alguien ya resolvió esto antes?"*
