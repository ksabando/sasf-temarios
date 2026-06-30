---
sidebar_position: 2
sidebar_label: "Temario"
---

## Objetivos del Curso

1. **Comprender** los 23 patrones GoF (Gamma, Helm, Johnson, Vlissides) y su clasificación.
2. **Aplicar** patrones en Java 17 y Spring Boot para resolver problemas reales de diseño.
3. **Identificar** cuándo un patrón es beneficioso y cuándo introduce sobreingeniería.
4. **Reconocer** patrones en frameworks modernos (Spring, React) y en código legacy.
5. **Implementar** un proyecto final integrando múltiples patrones.
6. **Prepararse** para entrevistas técnicas sobre patrones de diseño.

---

## Metodología

- **Clase teórica (40%):** Explicación del patrón, UML, ejemplos del GoF.
- **Clase práctica (40%):** Live coding + ejercicios en pares.
- **Revisión (20%):** Code review de soluciones, discusión de trade-offs.
- **Tareas:** 1 ejercicio semanal de implementación individual.
- **Proyecto final:** Revisar última semana, presentación grupal.

---

## Estructura de Módulos

### Semana 1 — Fundamentos y Patrones Creacionales

| Módulo | Tema                          | Patrones                            |
| ------ | ----------------------------- | ----------------------------------- |
| 01     | Introducción a Patrones GoF   | —                                   |
| 02     | Creacionales I                | Singleton, Factory Method           |
| 03     | Creacionales II               | Abstract Factory, Builder, Prototype |
| 04     | Estructurales I               | Adapter, Bridge                     |
| 05     | Estructurales II              | Composite, Decorator                |

### Semana 2 — Patrones Estructurales y de Comportamiento

| Módulo | Tema                           | Patrones                                    |
| ------ | ------------------------------ | ------------------------------------------- |
| 06     | Estructurales III              | Facade, Flyweight, Proxy                    |
| 07     | Comportamiento I               | Chain of Responsibility, Command            |
| 08     | Comportamiento II              | Iterator, Mediator                          |
| 09     | Comportamiento III             | Memento, Observer, State                    |
| 10     | Comportamiento IV              | Strategy, Template Method, Visitor          |

### Semana 3 — Patrones en Frameworks, Modernos y Proyecto

| Módulo | Tema                     | Enfoque                             |
| ------ | ------------------------ | ----------------------------------- |
| 11     | Patrones en Spring Boot  | IoC, Proxy, Template, Factory, etc. |
| 12     | Patrones en React        | Compound, Hooks, HOC, Provider      |
| 13     | Patrones Modernos        | Null Object, Repository, Saga       |
| 14     | Anti-patrones            | God Class, Golden Hammer, etc.      |
| 15     | Proyecto Final + Simulación | Evaluación y entrevista           |

---

## Contenido Detallado por Módulo

### Módulo 01 — Introducción a Patrones GoF

- ¿Qué son los patrones de diseño? (Christopher Alexander → GoF)
- Clasificación: creacionales, estructurales, de comportamiento
- Cómo leer un patrón: nombre, problema, solución, consecuencias
- UML básico para patrones: clases, interfaces, relaciones
- Patrones vs principios SOLID (refuerzo)
- Proyecto base: sistema de procesamiento de pedidos
- Herramientas: IntelliJ, Maven, estructura del repositorio
- Git básico: fork, clone, branch, commit, push
- Ejercicio: identificar patrones en frameworks conocidos (Spring, React)
- Lectura previa: GoF Capítulo 1 — Introducción
- Ejemplo guiado: identificar patrón Strategy en Comparator de Java
- Ejemplo guiado: identificar patrón Observer en UI de Swing
- Discusión: ¿Por qué los patrones son soluciones probadas y no recetas?
- Diferencias entre arquitectura, diseño idiomático y patrón formal
- Anti-patrón introductorio: Reinventar la rueda sin conocer catálogo existente

### Módulo 02 — Singleton y Factory Method

- Singleton: garantizar una única instancia, implementación thread-safe (Bill Pugh, enum)
- Factory Method: encapsular creación de objetos, subtipos deciden qué instanciar
- Comparar con new directo y constructor público
- Singleton en Spring: @Scope("singleton") por defecto
- Factory en Spring: @Bean en @Configuration
- Singleton en Java: Runtime.getRuntime(), Logger
- Factory en Java: Calendar.getInstance(), Stream.of()
- Ejercicio 1: Logger thread-safe con Singleton
- Ejercicio 2: Procesador de documentos con Factory Method
- Discusión: ¿Singleton es anti-patrón? (testing, acoplamiento)
- Ejemplo real: Spring ApplicationContext es Singleton por defecto
- Factory Method vs Strategy: crear objetos vs ejecutar algoritmos
- Patrón relacionado: Template Method usa Factory Method en sus pasos

### Módulo 03 — Abstract Factory, Builder, Prototype

- Abstract Factory: familias de objetos relacionados sin especificar clases concretas
- Builder: construcción paso a paso, telescoping constructors vs Builder
- Prototype: clonación de objetos (clone(), Copy Constructor)
- Builder en Java: StringBuilder, Stream.Builder, Lombok @Builder
- Abstract Factory en Spring: PlatformTransactionManager
- Prototype en Java: clonación superficial vs profunda
- Abstract Factory en JDK: DocumentBuilderFactory
- Ejercicio 1: UI Builder para formularios dinámicos
- Ejercicio 2: Prototype para templates de notificaciones
- Comparativa: Factory Method vs Abstract Factory vs Builder

### Módulo 04 — Adapter y Bridge

- Adapter: convertir interfaz de una clase en otra que el cliente espera
- Bridge: desacoplar abstracción de implementación
- Adapter en Spring: HandlerAdapter en MVC
- Diferencia Adapter vs Bridge: intención vs estructura
- Adapter en Java: Arrays.asList(), InputStreamReader
- Bridge en Java: JDBC Driver (DriverManager como puente)
- Ejemplo práctico: conectar sistema legacy de pagos con nuevo sistema
- Ejercicio 1: Adapter para API de proveedor externo
- Ejercicio 2: Bridge para notificaciones multiplataforma
- Code review: identificar Adapter y Bridge en código base

### Módulo 05 — Composite y Decorator

- Composite: tratar objetos individuales y compuestos uniformemente
- Decorator: agregar responsabilidades dinámicamente
- Decorator en Java: InputStream (BufferedInputStream, GZIPInputStream)
- Decorator en Spring: SecurityFilterChain
- Composite en Java: java.awt.Container, JSF UIComponent
- Decorator en JDK: Collections.synchronizedList()
- Problema del Decorator: muchos objetos pequeños, debugging complejo
- Ejercicio 1: Sistema de archivos con Composite (archivos y carpetas)
- Ejercicio 2: Decorator para agregar logging, caché, compresión
- Comparativa: Composite vs Decorator (similitud estructural)

### Módulo 06 — Facade, Flyweight, Proxy

- Facade: interfaz simplificada a un subsistema
- Flyweight: compartir objetos granulares (String pool en Java)
- Proxy: controlar acceso a otro objeto (virtual, remoto, protección)
- Proxy en Spring: AOP proxies, @Transactional, @Cacheable
- Facade en Spring: JdbcTemplate (facade sobre JDBC complejo)
- Flyweight en Java: Integer.valueOf() (-128 a 127), String.intern()
- Facade en JDK: javax.faces.context.FacesContext
- Proxy en Java: java.lang.reflect.Proxy (dinámico)
- Ejercicio 1: Facade para API de microservicios
- Ejercicio 2: Proxy virtual para imágenes lazy-load

### Módulo 07 — Chain of Responsibility y Command

- Chain: pasar petición por cadena de handlers
- Command: encapsular petición como objeto (deshacer, colas, logging)
- Chain en Spring: SecurityFilterChain, HandlerInterceptor
- Command en Spring: @Async con comandos, JdbcTemplate
- Chain en Java: java.util.logging.Logger (handlers encadenados)
- Command en Java: Runnable, Callable, Swing Action
- Ejemplos prácticos: middlewares HTTP, validación encadenada
- Ejercicio 1: Chain para validación de formularios (not null, email, rango)
- Ejercicio 2: Command Pattern para operaciones bancarias (depósito, retiro, transferencia)
- Discusión: Chain vs Decorator (cadena vs envoltura)

### Módulo 08 — Iterator y Mediator

- Iterator: acceso secuencial a colección sin exponer estructura
- Mediator: reducir comunicación directa entre objetos
- Iterator en Java: Iterable<T>, for-each, Stream API
- Mediator en Spring: ApplicationEventPublisher, controladores MVC
- Mediator en React: Context API como mediator
- Iterator en JDK: java.util.Iterator, java.util.Enumeration
- Mediator en Java: java.util.Timer (coordina tareas)
- Ejercicio 1: Iterador personalizado para árbol binario
- Ejercicio 2: Mediator para sala de chat (usuarios se comunican por mediador)
- Code review: identificar mediadores ocultos en controladores

### Módulo 09 — Memento, Observer, State

- Memento: capturar/restaurar estado interno (undo)
- Observer: notificar cambios a múltiples objetos
- State: cambiar comportamiento según estado interno
- Observer en Spring: @EventListener, ApplicationListener
- State en React: useState/useReducer como State pattern
- Memento en React: undo en useReducer con historial de acciones
- Observer en Java: java.util.Observer (deprecated), PropertyChangeListener
- State en Java: JSF Lifecycle, workflow engines
- Ejercicio 1: Editor de texto con undo/redo (Memento)
- Ejercicio 2: Máquina expendedora con State Pattern

### Módulo 10 — Strategy, Template Method, Visitor

- Strategy: familia de algoritmos intercambiables
- Template Method: esqueleto de algoritmo, subclases definen pasos
- Visitor: separar algoritmo de estructura de objetos
- Strategy en Spring: AuthenticationProvider, PasswordEncoder
- Template Method en Spring: JdbcTemplate, RestTemplate
- Visitor en Java: javax.lang.model.element.ElementVisitor
- Strategy en Java: java.util.Comparator, ThreadPoolExecutor
- Template Method en Java: AbstractList, HttpServlet (doGet/doPost)
- Ejercicio 1: Calculadora de impuestos con Strategy
- Ejercicio 2: Visitor para exportar objetos a JSON/XML/CSV

### Módulo 11 — Patrones en Spring Boot

- IoC/DI: Inversión de Control + Dependency Injection (patrón más usado en Spring)
- Singleton: beans por defecto, @Scope("singleton")
- Proxy: AOP, @Transactional, @Cacheable, @Async
- Template Method: JdbcTemplate, RestTemplate, JmsTemplate, JpaTemplate
- Factory: @Bean en @Configuration, FactoryBean
- Observer: ApplicationEventPublisher con @EventListener
- Chain: SecurityFilterChain, HandlerInterceptor
- Adapter: HandlerAdapter en Spring MVC
- Decorator: SecurityFilterChain, filtros encadenados
- Facade: JdbcTemplate fachada sobre JDBC, CrudRepository

### Módulo 12 — Patrones en React + TypeScript

- Compound Components: Tabs, Select, Accordion (composición sobre herencia)
- Render Props: compartir lógica con props de renderizado
- HOC (Higher Order Components): withAuth, withLogger, withTheme
- Custom Hooks: patrón Strategy funcional (useFetch, useLocalStorage)
- Provider Pattern: Context API para temas, autenticación
- State Reducer: useReducer con control invertido (inversion of control)
- Observer: useEffect + EventEmitter (suscripciones)
- Factory: funciones que crean componentes configurados
- Singleton: módulos ES6 con estado compartido (import)
- Adapter: adaptar APIs externas a interfaces del dominio (fetch wrapper)

### Módulo 13 — Patrones Modernos

- Null Object: evitar null checks con objeto por defecto
- Builder fluent: Java Lombok @Builder, React Query builder, Fluent interface
- Repository: abstracción de persistencia (Spring Data JPA)
- Data Mapper vs Active Record (JPA vs ActiveRecord en Rails)
- Dependency Injection: contenedor IoC vs DI manual
- Inversion of Control: frameworks que llaman tu código
- Event Sourcing: almacenar eventos en lugar de estado actual
- Saga Pattern: transacciones distribuidas (Coreografía vs Orquestación)
- Outbox Pattern: consistencia eventual con tabla outbox
- Circuit Breaker: Resilience4j, fallos controlados en sistemas distribuidos

### Módulo 14 — Anti-patrones y Cuándo NO Usar un Patrón

- God Class: clase que hace de todo (cientos de métodos, miles de líneas)
- Spaghetti Code: código sin estructura, goto lógico
- Golden Hammer: usar el mismo patrón para todo (todo es Singleton, todo es Factory)
- Singleton mal usado: estado global oculto, testing difícil, acoplamiento
- Factory innecesaria: cuando new es suficiente y más simple
- Over-engineering: patrones donde no se necesitan (YAGNI, KISS)
- Premature Abstraction: interfaces sin implementaciones múltiples
- Copy & Paste Programming: duplicación de código (DRIV)
- Poltergeist: objetos temporales sin propósito real
- Cómo detectar anti-patrones en code review (checklist)

### Módulo 15 — Proyecto Final + Simulación de Entrevista

- Proyecto: Sistema de notificaciones multicanal (email, SMS, push)
- Creacionales: Builder para construir notificaciones, Factory para crear canales
- Estructurales: Decorator para agregar logging/seguridad, Adapter para canales externos
- Comportamiento: Strategy para algoritmo de envío, Observer para eventos de notificación
- Chain of Responsibility para procesamiento de notificaciones (validación, transformación, envío)
- Repository Pattern para persistencia de notificaciones
- 10 ejercicios de entrevista técnica (pizarra + código)
- 60 preguntas teóricas (6 categorías: Creacionales, Estructurales, Comportamiento, Spring, React, Anti-patrones)
- Presentación grupal (20 min): arquitectura, patrones usados, trade-offs
- Defensa individual: preguntas sobre decisiones de diseño

---

## Resumen del Calendario

### Semana 1 — Días 1 a 5

| Día | Módulo | Temas Clave                              | Entrega         |
| --- | ------ | ---------------------------------------- | --------------- |
| 1   | 01     | Introducción, GoF, SOLID, UML            | —               |
| 2   | 02     | Singleton thread-safe, Factory Method    | Ejercicio 1     |
| 3   | 03     | Abstract Factory, Builder, Prototype     | Ejercicio 2     |
| 4   | 04     | Adapter, Bridge                          | Ejercicio 1     |
| 5   | 05     | Composite, Decorator                     | Ejercicio 2     |

### Semana 2 — Días 6 a 10

| Día | Módulo | Temas Clave                              | Entrega         |
| --- | ------ | ---------------------------------------- | --------------- |
| 6   | 06     | Facade, Flyweight, Proxy                 | Ejercicio 1     |
| 7   | 07     | Chain of Responsibility, Command         | Ejercicio 2     |
| 8   | 08     | Iterator, Mediator                       | Ejercicio 1     |
| 9   | 09     | Memento, Observer, State                 | Ejercicio 2     |
| 10  | 10     | Strategy, Template Method, Visitor       | Quiz Semana 2   |

### Semana 3 — Días 11 a 15

| Día | Módulo | Temas Clave                              | Entrega         |
| --- | ------ | ---------------------------------------- | --------------- |
| 11  | 11     | Patrones en Spring Boot                  | Ejercicio       |
| 12  | 12     | Patrones en React + TypeScript           | Ejercicio       |
| 13  | 13     | Patrones Modernos                        | Ejercicio       |
| 14  | 14     | Anti-patrones, code review               | Quiz Semana 3   |
| 15  | 15     | Proyecto Final + Simulación Entrevista   | Proyecto Final  |

---

## Diagrama Gantt

```
Semana 1 (Fundamentos)

Semana 2 (Estructurales + Comportamiento)

Semana 3 (Frameworks + Modernos + Proyecto)
```

---

## Criterios de Evaluación

### Componentes de la Nota Final

| Componente                     | Peso  | Descripción                                    |
| ------------------------------ | ----- | ---------------------------------------------- |
| Ejercicios semanales           | 30%   | 10 ejercicios individuales (3% c/u)            |
| Quiz / Examen parcial          | 20%   | Semanas 1 y 2 (10% c/u)                        |
| Proyecto Final                 | 35%   | Código (20%) + Presentación (15%)              |
| Participación + Code review    | 15%   | Discusiones en clase, revisiones de pares      |

### Rúbrica de Evaluación

| Criterio              | Sobresaliente (4)                         | Competente (3)                         | Básico (2)                   | Insuficiente (1)                  |
| --------------------- | ----------------------------------------- | -------------------------------------- | ---------------------------- | --------------------------------- |
| **Identificación de patrón** | Identifica y justifica el patrón correcto | Identifica el patrón con ayuda        | Identifica parcialmente      | No identifica el patrón           |
| **Implementación**    | Código funcional, eficiente, con pruebas  | Código funcional con errores menores   | Código incompleto            | Código no funcional               |
| **UML / Diagrama**    | Diagrama completo, claro, notación UML    | Diagrama con errores menores           | Diagrama incompleto          | Sin diagrama o incorrecto         |
| **Trade-offs**        | Explica ventajas, desventajas y alternativas | Menciona ventajas y desventajas      | Solo ventajas                | No reconoce trade-offs            |
| **Uso en frameworks** | Relaciona con ejemplos reales de Spring/React | Menciona frameworks pero sin detalle | Cita un framework            | No relaciona con frameworks       |

### Calificación Final

| Rango      | Nota     |
| ---------- | -------- |
| 90—100     | A (Excelente) |
| 80—89      | B (Bueno)     |
| 70—79      | C (Suficiente) |
| 60—69      | D (Deficiente) |
| 0—59       | F (Insuficiente) |

---

## Mapa de Relaciones entre Patrones

```
                                —, creado por              —,
                                        —,   Factory Method  —,

         —,                                       —,
         —,                                       —,

```

### Patrones que suelen combinarse

| Combinación                          | Caso de uso típico                              |
| ------------------------------------ | ----------------------------------------------- |
| Abstract Factory + Singleton         | Fábrica única que produce familias de objetos   |
| Factory Method + Template Method     | Template llama a Factory en pasos concretos     |
| Composite + Visitor                  | Recorrer árbol y ejecutar operación por nodo    |
| Command + Memento                    | Sistema de undo/redo con comandos               |
| Observer + Mediator                  | Eventos distribuidos con mediador central       |
| Strategy + Factory Method            | Seleccionar estrategia en tiempo de ejecución   |
| Decorator + Chain of Responsibility  | Filtros encadenados con envolturas decoradoras  |
| State + Singleton                    | Estados sin estado propio (compartidos)         |

## Recursos

### Libros

- Gamma, Helm, Johnson, Vlissides. *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley, 1994. — **El libro de cabecera (GoF)**
- Freeman, Robson, Bates, Sierra. *Head First Design Patterns*. O'Reilly, 2004. — **Enfoque visual y práctico**
- Martin, R. C. *Clean Architecture*. Prentice Hall, 2017.
- Bloch, J. *Effective Java* (3rd ed.). Addison-Wesley, 2018. — **Patrones en Java moderno**
- Evans, E. *Domain-Driven Design*. Addison-Wesley, 2003.
- Newman, S. *Building Microservices* (2nd ed.). O'Reilly, 2021.

### Artículos y Referencias Online

- Refactoring.Guru — https://refactoring.guru/es/design-patterns
- Spring.io Documentation — https://docs.spring.io/spring-framework/reference/core/aop.html
- React Patterns — https://reactpatterns.com
- Java Design Patterns (GitHub) — https://github.com/iluwatar/java-design-patterns
- Baeldung — https://www.baeldung.com/design-patterns-series
- Sourcemaking — https://sourcemaking.com/design_patterns

### Herramientas Online

- Draw.io / diagrams.net — Diagramas UML colaborativos
- PlantUML — Diagramas UML basados en texto
- Lucidchart — Diagramas profesionales
- Mermaid.js — Diagramas en Markdown (integrado en GitHub)

### Repositorios y Proyectos Base

- Repositorio del curso: `https://github.com/upc-course/patrones-2026`
- Spring Initializr: `https://start.spring.io`
- Create React App + TypeScript: `npx create-react-app my-app --template typescript`

---

## Preguntas Frecuentes

**¿Necesito saber TypeScript?** Los módulos 12 usan React + TypeScript, pero los conceptos se explican desde cero.

**¿Puedo usar otro lenguaje?** Los ejemplos principales son en Java 17. Si usas Kotlin, C# o Python, coordina con el instructor.

**¿Hay recuperación?** Sí, cada quiz tiene una recuperación al final del curso.

**¿El proyecto final es grupal?** Grupos de 2-3 personas. Se evalúa individualmente en la defensa.

---

## Histórico de Cambios

| Versión | Fecha      | Cambios                         |
| ------- | ---------- | ------------------------------- |
| 1.0     | 2025-11-01 | Versión inicial del temario     |
| 1.1     | 2025-12-15 | Añadidos módulos 11-15          |
| 1.2     | 2026-01-10 | Actualizado a Java 17           |
| 1.3     | 2026-03-01 | Agregados ejemplos en React     |
| 1.4     | 2026-06-01 | Revisión final, correcciones    |

---

## Licencia

Este material está licenciado bajo Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0). Puedes compartir y adaptar el material citando la fuente, sin uso comercial y bajo la misma licencia.

© 2026 — Universidad Peruana de Ciencias Aplicadas (UPC) — Curso: Patrones de Diseño GoF + Modernos

