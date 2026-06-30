---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

## Semana 2 — Patrones Estructurales y de Comportamiento

### Día 6 — Módulo 06: Facade, Flyweight, Proxy

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| Facade: simplificar subsistema     | 15 min   | Teoría    | Interfaz unificada para sistema complejo                       |
| Flyweight: compartir objetos       | 15 min   | Teoría    | Economía de memoria, objetos intrínsecos vs extrínsecos        |
| Proxy: control de acceso           | 15 min   | Teoría    | Virtual, remoto, protección, smart reference                   |
| Proxy en Spring                    | 10 min   | Teoría    | AOP proxies, @Transactional, @Cacheable                        |
| Facade en Spring                   | 10 min   | Teoría    | JdbcTemplate                                                   |
| Live coding: Facade microservicios | 20 min   | Práctica  | Facade para orquestar pedidos, pagos, envíos                   |
| Live coding: Proxy virtual         | 15 min   | Práctica  | Lazy loading de imágenes grandes                               |
| Ejemplo: String pool               | 10 min   | Discusión | Flyweight en Java: String.intern(), Integer.valueOf()          |
| Tarea: Ejercicio 1                 | —        | Tarea     | Facade para API de microservicios                              |
| Lectura previa                     | —        | Lectura   | GoF Capítulo 4 (Facade, Flyweight, Proxy)                     |

### Día 7 — Módulo 07: Chain of Responsibility y Command

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| Chain: cadena de handlers          | 15 min   | Teoría    | Pasar petición por cadena, cada handler decide                 |
| Command: encapsular petición       | 15 min   | Teoría    | Objeto con ejecución, deshacer, colas, logging                 |
| Chain en Spring                    | 10 min   | Teoría    | SecurityFilterChain, HandlerInterceptor                        |
| Command en Spring                  | 10 min   | Teoría    | @Async con comandos, JdbcTemplate QueryRunner                  |
| Chain en Java                      | 10 min   | Teoría    | java.util.logging.Logger (handlers)                            |
| Live coding: Validación cadena     | 20 min   | Práctica  | Middleware HTTP (auth, logging, rate-limit)                    |
| Live coding: Command bancario      | 20 min   | Práctica  | Operaciones bancarias (depósito, retiro, transferencia)        |
| Discusión: Chain vs Decorator      | 10 min   | Discusión | Cadena de handlers vs envoltura de objetos                     |
| Tarea: Ejercicio 2                 | —        | Tarea     | Command Pattern para operaciones bancarias                     |
| Lectura previa                     | —        | Lectura   | GoF Capítulo 5 (Chain of Responsibility, Command)              |

### Día 8 — Módulo 08: Iterator y Mediator

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| Iterator: acceso secuencial        | 15 min   | Teoría    | Recorrer colección sin exponer estructura interna              |
| Mediator: comunicación centralizada| 15 min   | Teoría    | Reducir dependencias entre objetos                            |
| Iterator en Java                   | 10 min   | Teoría    | Iterable<T>, for-each, Stream API                              |
| Mediator en Spring                 | 10 min   | Teoría    | ApplicationEventPublisher, controladores MVC                   |
| Mediator en React                  | 10 min   | Teoría    | Context API como mediator                                      |
| Live coding: Iterador árbol        | 20 min   | Práctica  | Iterador personalizado para árbol binario                      |
| Live coding: Chat con Mediator     | 20 min   | Práctica  | Sala de chat con mediador central                              |
| Code review                        | 10 min   | Revisión  | Identificar mediadores ocultos en controladores                |
| Tarea: Ejercicio 1                 | —        | Tarea     | Iterador personalizado para árbol binario                      |
| Lectura previa                     | —        | Lectura   | GoF Capítulo 5 (Iterator, Mediator)                            |

### Día 9 — Módulo 09: Memento, Observer, State

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| Memento: capturar estado           | 15 min   | Teoría    | Snapshot, undo/redo, origen vs cuidador                        |
| Observer: notificar cambios        | 15 min   | Teoría    | Subject-Observer, push vs pull                                 |
| State: comportamiento variable     | 15 min   | Teoría    | Cada estado = una clase, máquina de estados                    |
| Observer en Spring                 | 10 min   | Teoría    | @EventListener, ApplicationListener                           |
| State en React                     | 10 min   | Teoría    | useState/useReducer como State pattern                         |
| Live coding: Editor con undo       | 20 min   | Práctica  | Memento para historial de texto                                |
| Live coding: Máquina expendedora   | 15 min   | Práctica  | State Pattern: sin moneda, con moneda, vendiendo               |
| Ejemplo: Observer en eventos       | 10 min   | Práctica  | Sistema de notificaciones con Observer                         |
| Tarea: Ejercicio 2                 | —        | Tarea     | Máquina expendedora con State Pattern                          |
| Lectura previa                     | —        | Lectura   | GoF Capítulo 5 (Memento, Observer, State)                     |

### Día 10 — Módulo 10: Strategy, Template Method, Visitor

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| Strategy: algoritmos intercambiables| 15 min   | Teoría    | Familia de algoritmos, selección en tiempo de ejecución        |
| Template Method: esqueleto         | 15 min   | Teoría    | Pasos definidos, subclases implementan detalles                |
| Visitor: separar algoritmo         | 15 min   | Teoría    | Operaciones sobre estructura de objetos sin modificarlos       |
| Strategy en Spring                 | 10 min   | Teoría    | AuthenticationProvider, PasswordEncoder                        |
| Template Method en Spring          | 10 min   | Teoría    | JdbcTemplate, RestTemplate, JmsTemplate                        |
| Live coding: Calculadora impuestos | 20 min   | Práctica  | Strategy para IVA, ISR, ICE (intercambiables)                  |
| Live coding: Exportar con Visitor  | 15 min   | Práctica  | Visitor para exportar objetos a JSON, XML, CSV                 |
| Quiz Semana 2                      | 10 min   | Evaluación| 10 preguntas de opción múltiple                                |
| Tarea: Ejercicio                   | —        | Tarea     | Calculadora de impuestos con Strategy                          |
| Lectura previa                     | —        | Lectura   | GoF Capítulo 5 (Strategy, Template Method, Visitor)            |

---

## Semana 3 — Patrones en Frameworks, Modernos y Proyecto

### Día 11 — Módulo 11: Patrones en Spring Boot

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| IoC/DI en Spring                   | 20 min   | Teoría    | Inversión de Control + Dependency Injection                    |
| Singleton y Proxy                  | 15 min   | Teoría    | @Scope, AOP proxies, @Transactional                            |
| Template Method en Spring          | 15 min   | Teoría    | JdbcTemplate, RestTemplate, JmsTemplate                        |
| Factory y Observer                 | 15 min   | Teoría    | @Bean, FactoryBean, ApplicationEventPublisher                  |
| Chain y Adapter                    | 15 min   | Teoría    | SecurityFilterChain, HandlerAdapter                            |
| Live coding: @Transactional proxy  | 20 min   | Práctica  | Ver proxy en logs, propagación de transacciones                |
| Live coding: Eventos con @EventListener | 20 min | Práctica | Evento de registro de usuario → enviar email                   |
| Code review: identificar patrones  | 10 min   | Revisión  | Revisar proyecto Spring Boot real                              |
| Tarea: Ejercicio                   | —        | Tarea     | Implementar CRUD con patrones Spring                           |
| Lectura previa                     | —        | Lectura   | Spring Docs: Core, AOP, Transaction Management                 |

### Día 12 — Módulo 12: Patrones en React + TypeScript

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| Compound Components                | 15 min   | Teoría    | Tabs, Select, Accordion — composición sobre herencia           |
| HOC y Render Props                 | 15 min   | Teoría    | withAuth, withLogger, Render Props pattern                     |
| Custom Hooks                       | 15 min   | Teoría    | useFetch, useLocalStorage — Strategy funcional                 |
| Provider Pattern                   | 10 min   | Teoría    | Context API, ThemeProvider, AuthProvider                       |
| State Reducer                      | 10 min   | Teoría    | useReducer con control invertido                               |
| Live coding: Tabs compound         | 20 min   | Práctica  | Componente Tabs con Compound Components                        |
| Live coding: Custom Hook useFetch  | 15 min   | Práctica  | Hook para fetching con loading, error, data                    |
| Ejemplo: Adapter para API externa  | 10 min   | Práctica  | Adaptar API REST a interfaz del dominio                        |
| Tarea: Ejercicio                   | —        | Tarea     | Implementar Tabs compound component                            |
| Lectura previa                     | —        | Lectura   | React Patterns (reactpatterns.com), React Docs                 |

### Día 13 — Módulo 13: Patrones Modernos

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| Null Object                        | 10 min   | Teoría    | Evitar null checks, objeto por defecto                         |
| Builder fluent                     | 10 min   | Teoría    | Lombok @Builder, Fluent interface                              |
| Repository Pattern                 | 15 min   | Teoría    | Abstracción de persistencia, Spring Data JPA                   |
| Data Mapper vs Active Record       | 10 min   | Teoría    | JPA vs ActiveRecord en Rails                                   |
| Event Sourcing                     | 10 min   | Teoría    | Almacenar eventos en lugar de estado actual                    |
| Saga Pattern                       | 15 min   | Teoría    | Coreografía vs Orquestación, transacciones distribuidas        |
| Outbox Pattern                     | 10 min   | Teoría    | Consistencia eventual, tabla outbox                            |
| Circuit Breaker                    | 10 min   | Teoría    | Resilience4j, estados: cerrado, abierto, semi-abierto          |
| Live coding: Null Object           | 10 min   | Práctica  | Reemplazar null checks con NullLogger, NullPaymentGateway      |
| Tarea: Ejercicio                   | —        | Tarea     | Implementar Repository + Null Object                           |
| Lectura previa                     | —        | Lectura   | Microservices Patterns (Newman), Event Sourcing (Fowler)       |

### Día 14 — Módulo 14: Anti-patrones

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| God Class                          | 10 min   | Teoría    | Clase con cientos de métodos y responsabilidades               |
| Spaghetti Code                     | 10 min   | Teoría    | Código sin estructura, difícil de mantener                     |
| Golden Hammer                      | 10 min   | Teoría    | Usar el mismo patrón para todo                                 |
| Singleton mal usado                | 10 min   | Teoría    | Estado global oculto, testing difícil                          |
| Over-engineering                   | 10 min   | Teoría    | Patrones donde no se necesitan (YAGNI, KISS)                   |
| Premature Abstraction              | 10 min   | Teoría    | Interfaces sin implementaciones múltiples                      |
| Live coding: Refactor God Class    | 20 min   | Práctica  | Extraer responsabilidades, aplicar SRP                         |
| Live coding: Eliminar Singleton    | 20 min   | Práctica  | Reemplazar Singleton con DI                                    |
| Quiz Semana 3                      | 10 min   | Evaluación| 10 preguntas de opción múltiple                                |
| Code review checklist              | 10 min   | Discusión | Cómo detectar anti-patrones en code review                     |

### Día 15 — Módulo 15: Proyecto Final + Simulación de Entrevista

| Actividad                          | Duración | Tipo      | Descripción                                                    |
| ---------------------------------- | -------- | --------- | -------------------------------------------------------------- |
| Presentación proyecto (grupo 1)    | 20 min   | Proyecto  | Sistema notificaciones multicanal — arquitectura y patrones    |
| Presentación proyecto (grupo 2)    | 20 min   | Proyecto  | Sistema notificaciones multicanal — implementación             |
| Presentación proyecto (grupo 3)    | 20 min   | Proyecto  | Sistema notificaciones multicanal — trade-offs                 |
| Defensa individual                 | 10 min   | Evaluación| Preguntas sobre decisiones de diseño                           |
| Simulación entrevista              | 20 min   | Práctica  | 10 ejercicios de pizarra (30 min c/u)                          |
| Preguntas creacionales             | 5 min    | Evaluación| 10 preguntas sobre Singleton, Factory, Builder                 |
| Preguntas estructurales            | 5 min    | Evaluación| 10 preguntas sobre Adapter, Decorator, Proxy, Facade           |
| Preguntas comportamiento           | 5 min    | Evaluación| 10 preguntas sobre Strategy, Observer, Command, State          |
| Preguntas Spring                   | 5 min    | Evaluación| 10 preguntas sobre IoC, AOP, Transactional, Eventos            |
| Preguntas React                    | 5 min    | Evaluación| 10 preguntas sobre Hooks, HOC, Context, Compound Components    |
| Preguntas anti-patrones            | 5 min    | Evaluación| 10 preguntas sobre God Class, Golden Hammer, Over-engineering  |
| Retroalimentación y cierre         | 10 min   | Discusión| Evaluación del curso, sugerencias, próximos pasos              |

---

## Resumen de Entregables

| #  | Entregable                      | Tipo       | Semana | Peso  |
| -- | ------------------------------- | ---------- | ------ | ----- |
| 1  | Logger thread-safe (Singleton)  | Individual | 1      | 3%    |
| 2  | UI Builder para formularios     | Individual | 1      | 3%    |
| 3  | Adapter para API externa        | Individual | 1      | 3%    |
| 4  | Decorator para InputStream      | Individual | 1      | 3%    |
| 5  | Facade para microservicios      | Individual | 2      | 3%    |
| 6  | Command para operaciones        | Individual | 2      | 3%    |
| 7  | Iterador para árbol binario     | Individual | 2      | 3%    |
| 8  | Máquina expendedora (State)     | Individual | 2      | 3%    |
| 9  | Calculadora impuestos (Strategy)| Individual | 2      | 3%    |
| 10 | Ejercicio Spring o React        | Individual | 3      | 3%    |
| 11 | Quiz Semana 1                   | Evaluación | 1      | 10%   |
| 12 | Quiz Semana 2                   | Evaluación | 2      | 10%   |
| 13 | Quiz Semana 3                   | Evaluación | 3      | 0%*   |
| 14 | Proyecto Final — Código         | Grupal     | 3      | 20%   |
| 15 | Proyecto Final — Presentación   | Grupal     | 3      | 15%   |
| 16 | Participación + Code review     | Continua   | 1-3    | 15%   |

*\*Quiz Semana 3 reemplaza nota más baja de quizzes anteriores.*

---

## Cronograma de Sesiones

| Sesión | Fecha       | Día   | Módulo | Tema Principal              |
| ------ | ----------- | ----- | ------ | --------------------------- |
| 1      | 2026-08-10  | Lunes | 01     | Introducción a Patrones GoF |
| 2      | 2026-08-11  | Martes| 02     | Singleton y Factory Method  |
| 3      | 2026-08-12  | Miér. | 03     | Abstract Factory, Builder   |
| 4      | 2026-08-13  | Jueves| 04     | Adapter y Bridge            |
| 5      | 2026-08-14  | Viernes| 05    | Composite y Decorator       |
| 6      | 2026-08-17  | Lunes | 06     | Facade, Flyweight, Proxy    |
| 7      | 2026-08-18  | Martes| 07     | Chain of Responsibility     |
| 8      | 2026-08-19  | Miér. | 08     | Iterator y Mediator         |
| 9      | 2026-08-20  | Jueves| 09     | Memento, Observer, State    |
| 10     | 2026-08-21  | Viernes| 10    | Strategy, Template Method   |
| 11     | 2026-08-24  | Lunes | 11     | Patrones en Spring Boot     |
| 12     | 2026-08-25  | Martes| 12     | Patrones en React           |
| 13     | 2026-08-26  | Miér. | 13     | Patrones Modernos           |
| 14     | 2026-08-27  | Jueves| 14     | Anti-patrones               |
| 15     | 2026-08-28  | Viernes| 15    | Proyecto Final + Entrevista |

---

## Recursos Necesarios

### Hardware

| Recurso           | Especificación mínima        |
| ----------------- | ---------------------------- |
| Laptop            | 8 GB RAM, 256 GB SSD         |
| Procesador        | Intel i5 / AMD Ryzen 5       |
| Sistema operativo | Windows 10/11, macOS 12+, Linux |
| Conexión internet | 10 Mbps o superior           |

### Software

| Software          | Versión | Instalación                |
| ----------------- | ------- | -------------------------- |
| JDK               | 17+     | SDKMAN / Adoptium / Oracle |
| IntelliJ IDEA     | 2024+   | JetBrains Toolbox / sitio  |
| Maven             | 3.9+    | SDKMAN / Chocolatey        |
| Git               | 2.40+   | git-scm.com                |
| Node.js           | 20+     | nvm / sitio oficial        |
| VS Code           | 1.90+   | code.visualstudio.com      |
| Docker Desktop    | 4.30+   | docker.com/products/desktop|

### Material Didáctico

| Material                        | Formato | Propósito                          |
| ------------------------------- | ------- | ---------------------------------- |
| Diapositivas por módulo         | PDF     | Teoría y ejemplos                  |
| Código fuente ejemplos          | GitHub  | Live coding y ejercicios           |
| Guía UML rápida                 | PDF     | Referencia de notación UML         |
| Cheatsheet de patrones          | PDF     | Resumen de 23 patrones GoF         |
| Rúbrica de evaluación           | PDF     | Criterios de calificación          |
| Plantilla proyecto final        | GitHub  | Esqueleto del proyecto             |

---

## Plan de Contingencia

| Problema                          | Solución                                       |
| --------------------------------- | ---------------------------------------------- |
| Error en JDK/Maven                | Usar Docker con imagen preconfigurada          |
| Internet lento/inestable          | Material descargable, repositorio offline      |
| Estudiante se atrasa              | Grabaciones disponibles, horario de consulta   |
| Ejercicio muy complejo            | Dividir en partes, dar más tiempo              |
| Proyecto final incompleto         | Evaluar lo entregado + plan de continuación    |

---

## Acuerdos del Curso

1. **Asistencia:** Mínimo 80% para aprobar.
2. **Puntualidad:** Tolerancia máxima de 10 minutos.
3. **Entregas:** Fecha límite domingo 23:59 de cada semana.
4. **Plagio:** Cero tolerancia. Nota automática F en el curso.
5. **Uso de IA:** Permitido como herramienta de apoyo, no como sustituto.
6. **Código de conducta:** Respeto, colaboración, comunicación abierta.

---

## Firmas

| Rol              | Nombre               | Firma     | Fecha      |
| ---------------- | -------------------- | --------- | ---------- |
| Instructor       | [Nombre Instructor]  | ________  | 2026-08-01 |
| Coordinador      | [Nombre Coordinador] | ________  | 2026-08-01 |
| Director Acad.   | [Nombre Director]    | ________  | 2026-08-01 |

