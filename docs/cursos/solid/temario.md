---
sidebar_position: 2
sidebar_label: "Temario"
---

## Configuración Técnica

| Herramienta | Versión | Propósito |
|---|---|---|
| Java | 17+ (LTS) | Lenguaje principal del curso |
| Maven | 3.9+ | Gestión de dependencias y builds |
| IntelliJ IDEA | 2024+ (Community o Ultimate) | IDE oficial del curso |
| Git | 2.40+ | Control de versiones |
| JUnit 5 | 5.10+ | Pruebas unitarias |
| Mockito | 5.4+ | Mocking en pruebas |
| SonarLint | Plugin | Análisis estático en tiempo real |
| Spring Boot | 3.2+ | Framework de aplicación final |

---

## Estructura de cada Módulo

Cada módulo contiene 4 archivos dentro de su carpeta numerada:

| Archivo | Propósito |
|---|---|
| `clase.md` | Contenido teórico-práctico impartido en clase |
| `ejercicio.md` | Enunciado del ejercicio práctico |
| `respuesta.md` | Solución comentada del ejercicio (entrega al final) |
| `cuestionario.md` | 5-10 preguntas de verificación |

---

## Módulo 01 — Introducción a SOLID y Código Espagueti

**📁 `01-Introduccion-SOLID/`**

### Contenido

- ¿Qué son los principios SOLID? Historia (Robert C. Martin, 2000)
- ¿Por qué SOLID? Costo del cambio, deuda técnica, mantenibilidad
- Señales de código que viola SOLID:
  - Clases Dios (God Classes)
  - Métodos largos (Long Method)
  - Acoplamiento excesivo (Tight Coupling)
  - Interfaces infladas (Fat Interfaces)
  - Herencia mal aplicada
- Proyecto base: sistema de nóminas LEGACY (código espagueti)
- Análisis de código legacy: identificar violaciones a simple vista
- Métricas de calidad:
  - Acoplamiento (Coupling)
  - Cohesión (Cohesion)
  - Complejidad ciclomática (Cyclomatic Complexity)
- Introducción a herramientas de análisis: SonarLint, IntelliJ Inspections

### Archivos
- `clase.md`: Presentación del curso, setup del proyecto legacy
- `ejercicio.md`: Identificar 10 violaciones SOLID en el código de nóminas
- `respuesta.md`: Listado comentado de violaciones encontradas
- `cuestionario.md`: 8 preguntas sobre conceptos básicos

---

## Módulo 02 — SRP (Single Responsibility Principle)

**📁 `02-SRP-Single-Responsibility/`**

### Contenido

- Una clase debe tener una sola razón para cambiar
- Cohesión vs Acoplamiento: la balanza del diseño
- SRP en la práctica: separar persistencia, lógica de negocio, presentación
- Refactorizar clase `EmployeeService` (hacía de todo: validación, persistencia, cálculo, notificación)
- SRP en Spring:
  - `@Service` para lógica de negocio
  - `@Repository` para acceso a datos
  - `@Controller` para manejo de requests
  - `@Component` para utilidades
- SRP en React: componentes pequeños con una sola responsabilidad
- Anti-patrón: la clase "Suiza" (todo en uno)

### Archivos
- `clase.md`: Teoría + ejemplos de violación y solución
- `ejercicio.md`: Refactorizar `EmployeeService` (600+ líneas) en 5 clases separadas
- `respuesta.md`: Código refactorizado con explicación
- `cuestionario.md`: 8 preguntas SRP

---

## Módulo 03 — OCP (Open/Closed Principle)

**📁 `03-OCP-Open-Closed/`**

### Contenido

- Abierto a extensión, cerrado a modificación
- Strategy Pattern como implementación de OCP
- Template Method Pattern para comportamiento extensible
- OCP en Spring:
  - `@Bean` y configuración programática
  - Interfaces y polimorfismo
  - Dependency Injection para inyectar estrategias
- Refactorizar switch/if gigantes a estrategias
- Ejemplo completo: cálculo de impuestos extensible (IVA, ISR, IEPS, impuestos locales)
- Pattern Matching con switch (Java 17+)

### Archivos
- `clase.md`: Strategy Pattern + Template Method aplicados a OCP
- `ejercicio.md`: Refactorizar cálculo de impuestos (10 tipos) usando Strategy
- `respuesta.md`: Implementación con interfaces, beans y tests
- `cuestionario.md`: 8 preguntas OCP

---

## Módulo 04 — LSP (Liskov Substitution Principle)

**📁 `04-LSP-Liskov-Substitution/`**

### Contenido

- Subtipos deben ser sustituibles por su tipo base sin alterar el comportamiento
- Violación clásica: Rectángulo vs Cuadrado (el problema de la herencia)
- Herencia mal aplicada vs Composición (Favor composition over inheritance)
- Design by Contract:
  - Precondiciones no pueden ser fortalecidas
  - Postcondiciones no pueden ser debilitadas
  - Invariantes deben mantenerse
- LSP en Spring:
  - `@Qualifier` para seleccionar implementaciones
  - Interfaces múltiples
  - `@Primary` y perfiles
- Refactor: reemplazar herencia por composición

### Archivos
- `clase.md`: LSP con ejemplos de violaciones clásicas y modernas
- `ejercicio.md`: Refactorizar jerarquía de herencia de tipos de cliente
- `respuesta.md`: Solución usando composición e interfaces
- `cuestionario.md`: 8 preguntas LSP

---

## Módulo 05 — ISP (Interface Segregation Principle)

**📁 `05-ISP-Interface-Segregation/`**

### Contenido

- Interfaces pequeñas y específicas vs interfaces grandes (fat interfaces)
- Los clientes no deben depender de métodos que no usan
- Role interfaces vs Header interfaces
- ISP en Spring:
  - `CrudRepository<T, ID>` vs `JpaRepository<T, ID>` (por qué separadas)
  - Interfaces funcionales (`Supplier`, `Consumer`, `Function`)
- ISP en React:
  - Props mínimas por componente
  - Componentes atómicos y atómicos compuestos
- Refactorizar interfaz `Worker` con métodos no implementados lanzando `UnsupportedOperationException`
- Principio de segregación a nivel de métodos (Command Query Separation)

### Archivos
- `clase.md`: Fat interfaces, role interfaces y ejemplos de segregación
- `ejercicio.md`: Refactorizar interfaz `Worker` (trabajadores humanos y robóticos)
- `respuesta.md`: Interfaces segregadas con implementaciones específicas
- `cuestionario.md`: 8 preguntas ISP

---

## Módulo 06 — DIP (Dependency Inversion Principle)

**📁 `06-DIP-Dependency-Inversion/`**

### Contenido

- Módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.
- Las abstracciones no deben depender de los detalles. Los detalles deben depender de las abstracciones.
- DI (Dependency Injection) vs DIP: relación y diferencias fundamentales
- DIP en Spring:
  - IoC Container (ApplicationContext)
  - `@Autowired` vs Constructor Injection (recomendado)
  - Inyección por constructor vs setter vs campo
- DIP en React:
  - Custom hooks como abstracción de servicios
  - Context API para inyección de dependencias
- Refactorizar acoplamiento directo a base de datos (MySQL directo en Service)
- Inversión de dependencias en capas: Controller → Service (interface) → Repository (interface)

### Archivos
- `clase.md`: DIP, DI/IoC y aplicación en Spring
- `ejercicio.md`: Refactorizar `OrderService` que instancia directamente `MySQLDatabase`
- `respuesta.md`: Dependencias invertidas con interfaces y constructor injection
- `cuestionario.md`: 8 preguntas DIP

---

## Módulo 07 — SOLID en Spring Boot

**📁 `07-SOLID-en-Spring/`**

### Contenido

- Cómo cada principio se manifiesta en el ecosistema Spring
- SRP: separación en capas (Controller → Service → Repository)
- OCP: `@Bean`, `@ConfigurationProperties` extensibles, `@ConditionalOnProperty`
- LSP: `@Qualifier`, `@Primary`, perfiles (Profiles), `@ConditionalOnClass`
- ISP: interfaces pequeñas (`CrudRepository` vs `JpaRepository`), `Pageable`, `Sort`
- DIP: Constructor Injection, `ApplicationContext` como contenedor IoC
- Patrones adicionales:
  - `@ControllerAdvice` para manejo centralizado de errores
  - `@ExceptionHandler` (SRP aplicado)
  - `@Service` para lógica de negocio
  - `@Repository` para persistencia
- Ejercicio de análisis: inspeccionar código Spring existente y catalogar violaciones SOLID

### Archivos
- `clase.md`: Mapeo de cada principio SOLID a características de Spring
- `ejercicio.md`: Analizar y refactorizar una app Spring Boot con violaciones
- `respuesta.md`: App Spring Boot refactorizada
- `cuestionario.md`: 10 preguntas SOLID + Spring

---

## Módulo 08 — SOLID en React + TypeScript

**📁 `08-SOLID-en-React/`**

### Contenido

- SRP:
  - Componentes con una sola responsabilidad
  - Custom hooks para encapsular lógica
  - Separación de concerns en componentes
- OCP:
  - Compound Components Pattern
  - Render Props
  - Higher-Order Components (HOCs)
- LSP:
  - Interfaces de props bien definidas
  - Subtipos de componentes (polimorfismo con TypeScript)
- ISP:
  - Props mínimas (solo las necesarias)
  - Separar lógica en hooks personalizados
  - Componentes atómicos
- DIP:
  - Hooks de servicios (abstracción)
  - Inyección de dependencias funcional (DI sin clases)
  - Conexión a APIs a través de capas de servicio
- Ejercicio: refactorizar componente Dios en React (Dashboard de 800+ líneas)

### Archivos
- `clase.md`: Patrones React que implementan SOLID
- `ejercicio.md`: Refactorizar `Dashboard.tsx` (componente Dios) en componentes atómicos
- `respuesta.md`: Componentes refactorizados + hooks + tests
- `cuestionario.md`: 10 preguntas SOLID + React

---

## Módulo 09 — Refactorización Guiada (Proyecto Legacy → SOLID)

**📁 `09-Refactorizacion-Goal-SOLID/`**

### Contenido

- Proyecto completo: sistema de pedidos legacy (código proporcionado)
  - 3 clases con +1000 líneas cada una
  - Sin pruebas unitarias
  - Acoplamiento extremo
  - Código duplicado
- Aplicar SRP: separar responsabilidades en capas
- Aplicar OCP: hacer extensible el cálculo de descuentos (Strategy Pattern)
- Aplicar LSP: corregir herencia de tipos de cliente (Cliente Premium, Regular, VIP)
- Aplicar ISP: dividir interfaces grandes (OrderService, PaymentService, NotificationService)
- Aplicar DIP: invertir dependencias (dependencias en constructor, no instanciación directa)
- Antes/Después: comparar métricas de calidad
  - Complejidad ciclomática
  - Líneas por clase
  - Acoplamiento
  - Cobertura de pruebas
- Entrega de informe de refactorización

### Archivos
- `clase.md`: Plan de ataque para refactorización paso a paso
- `ejercicio.md`: Refactorizar sistema de pedidos completo
- `respuesta.md`: Proyecto refactorizado completo (código + tests)
- `cuestionario.md`: 10 preguntas de aplicación integrada

---

## Módulo 10 — Proyecto Final + Simulación de Entrevista

**📁 `10-Proyecto-Final-Entrevista/`**

### Contenido

#### Proyecto Final (70% nota)
- Aplicación REST legacy en Spring Boot (API de gestión de biblioteca)
- Refactorizar aplicando los 5 principios SOLID
- Requisitos:
  - Código limpio y testeable
  - Pruebas unitarias (cobertura > 80%)
  - Documentación técnica
  - README con instrucciones

#### Simulación de Entrevista Técnica (30% nota)
- 10 ejercicios de entrevista técnica sobre SOLID:
  1. Explica SRP con un ejemplo real de código
  2. ¿Cómo aplicarías OCP en un sistema de notificaciones?
  3. ¿Por qué Rectángulo/Cuadrado viola LSP? Propón solución
  4. Diseña interfaces aplicando ISP para un sistema de impresión
  5. Explica DIP y diferencia con DI
  6. Refactoriza este código para cumplir SOLID (ejemplo en vivo)
  7. ¿Cómo Spring Boot promueve SOLID?
  8. ¿Cómo aplicarías SOLID en React?
  9. ¿Cómo medirías si un código cumple SOLID?
  10. ¿Cuándo NO aplicar SOLID? (trade-offs)
- 60 preguntas tipo (6 categorías: SRP, OCP, LSP, ISP, DIP, General)
- Escenarios:
  - Junior: definiciones y ejemplos básicos
  - Semi-senior: aplicaciones prácticas y refactorización
  - Senior: trade-offs, arquitectura, diseño avanzado
  - Tech Lead: decisiones de equipo, escalabilidad, costos

### Archivos
- `clase.md`: Presentación proyecto final, rúbrica, simulacro
- `ejercicio.md`: Proyecto final (API Biblioteca Legacy)
- `respuesta.md`: Proyecto final resuelto (código completo)
- `cuestionario.md`: 60 preguntas de entrevista

---

## Resumen del Calendario

| Semana | Día | Módulo | Tema |
|---|---|---|---|
| 1 | Lun | M01 | Introducción a SOLID y Código Espagueti |
| 1 | Mar | M02 | SRP — Single Responsibility Principle |
| 1 | Mié | M03 | OCP — Open/Closed Principle |
| 1 | Jue | M04 | LSP — Liskov Substitution Principle |
| 1 | Vie | M05 | ISP — Interface Segregation Principle |
| 2 | Lun | M06 | DIP — Dependency Inversion Principle |
| 2 | Mar | M07 | SOLID en Spring Boot |
| 2 | Mié | M08 | SOLID en React + TypeScript |
| 2 | Jue | M09 | Refactorización Guiada (Proyecto Legacy) |
| 2 | Vie | M10 | Proyecto Final + Simulación de Entrevista |

---

## Criterios de Evaluación

| Aspecto | Peso | Descripción |
|---|---|---|
| Ejercicios de módulo | 30% | 9 ejercicios entregados (uno por módulo 01-09) |
| Participación en clase | 10% | Discusión, code reviews, preguntas |
| Proyecto Final | 40% | Refactorización aplicación REST legacy |
| Simulación Entrevista | 20% | Ejercicios y preguntas de entrevista técnica |

### Condiciones de aprobación
- Nota final ≥ 70/100
- Proyecto final entregado y funcional
- Asistencia ≥ 80%

---

## Rúbrica del Proyecto Final

| Criterio | Excelente (100%) | Bueno (75%) | Suficiente (50%) | Insuficiente (0%) |
|---|---|---|---|---|
| Aplicación SRP | Clases con 1 responsabilidad | 1-2 clases con 2 responsabilidades | Varias clases con múltiples responsabilidades | Sin separación de responsabilidades |
| Aplicación OCP | Extensiones sin modificar código existente | 1-2 extensiones requieren modificación | Mayoría de cambios requieren modificación | No aplica OCP |
| Aplicación LSP | Subtipos 100% sustituibles | 1 violación menor de LSP | 2-3 violaciones de LSP | Herencia mal aplicada |
| Aplicación ISP | Interfaces pequeñas y cohesivas | 1 interfaz ligeramente inflada | 2-3 interfaces infladas | Interfaces monolíticas |
| Aplicación DIP | Dependencias invertidas correctamente | Mayoría invertidas | Algunas dependencias directas | Sin inversión de dependencias |
| Pruebas | Cobertura > 80%, pruebas significativas | Cobertura > 60% | Cobertura > 40% | Sin pruebas o cobertura < 40% |
| Código limpio | Nombres claros, sin código muerto, formateado | Pequeñas mejoras posibles | Problemas de legibilidad | Código difícil de leer |

---

## Recursos

### Libros
- **Clean Architecture** — Robert C. Martin (2017)
- **Agile Software Development, Principles, Patterns, and Practices** — Robert C. Martin (2002)
- **Head First Design Patterns** — Freeman & Robson (2da edición, 2020)
- **Refactoring: Improving the Design of Existing Code** — Martin Fowler (2da edición, 2018)

### Artículos y Referencias
- [The Principles of OOD (Robert C. Martin)](http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod)
- [SOLID: The First 5 Principles of Object Oriented Design (DigitalOcean)](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [SOLID Principles in Spring Boot (Baeldung)](https://www.baeldung.com/solid-principles-spring-boot)

### Herramientas
- SonarLint — análisis estático en IDE
- JUnit 5 + Mockito — pruebas unitarias
- IntelliJ IDEA — refactorizaciones automáticas
- Git — control de versiones (commits por principio aplicado)

### Videos Recomendados
- **"SOLID Principles: The Definitive Guide"** — Amigoscode (YouTube)
- **"SOLID Principles in Java"** — Programming with Mosh (YouTube)
- **"Clean Code: SOLID"** — Uncle Bob (Clean Coders)

---

## Disclaimer

Este temario está diseñado para ser intensivo y práctico. Los alumnos deben tener conocimientos previos de Java, Spring Boot y POO. Si no cumples con estos requisitos, contacta al instructor para material de nivelación antes del inicio del curso.

---

*Documento generado por SASF — Junio 2026*

