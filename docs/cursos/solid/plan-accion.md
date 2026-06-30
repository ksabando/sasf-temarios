---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

## Semana 2 — Aplicación Avanzada y Proyecto Final

### Día 6 (Lunes) — Módulo 06: DIP — Dependency Inversion Principle

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | Teoría DIP: abstracciones, no detalles | Clase teórica | `06-DIP-Dependency-Inversion/clase.md` |
| 10:00 - 10:30 | DI vs DIP: diferencias fundamentales | Discusión guiada | `06-DIP-Dependency-Inversion/clase.md` |
| 10:30 - 11:00 | Break | — | — |
| 11:00 - 12:00 | Refactorizar acoplamiento directo a BD | Live coding | `06-DIP-Dependency-Inversion/ejercicio.md` |
| 12:00 - 12:30 | DIP en Spring: IoC, constructor injection | Demo | `06-DIP-Dependency-Inversion/clase.md` |
| 12:30 - 13:00 | DIP en React con hooks | Discusión | `06-DIP-Dependency-Inversion/clase.md` |

**Entregable:** `OrderService` refactorizado con dependencias invertidas

### Día 7 (Martes) — Módulo 07: SOLID en Spring Boot

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | SOLID en Spring: mapeo principio-característica | Clase teórica | `07-SOLID-en-Spring/clase.md` |
| 10:00 - 11:00 | Análisis de app Spring existente (catalogo violaciones) | Trabajo grupal | `07-SOLID-en-Spring/ejercicio.md` |
| 11:00 - 11:30 | Break | — | — |
| 11:30 - 12:30 | Refactorización de app Spring | Práctica guiada | `07-SOLID-en-Spring/ejercicio.md` |
| 12:30 - 13:00 | Presentación de resultados | Plenaria | — |

**Entregable:** App Spring refactorizada + catálogo de violaciones

### Día 8 (Miércoles) — Módulo 08: SOLID en React + TypeScript

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | SOLID en React: patrones por principio | Clase teórica | `08-SOLID-en-React/clase.md` |
| 10:00 - 11:00 | Compound Components, Render Props, custom hooks | Demo | `08-SOLID-en-React/clase.md` |
| 11:00 - 11:30 | Break | — | — |
| 11:30 - 12:30 | Refactorizar Dashboard Dios en React | Práctica individual | `08-SOLID-en-React/ejercicio.md` |
| 12:30 - 13:00 | Code review de refactorizaciones | Trabajo grupal | — |

**Entregable:** Componentes React refactorizados + hooks personalizados

### Día 9 (Jueves) — Módulo 09: Refactorización Guiada

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 09:30 | Presentación del proyecto de pedidos legacy | Charla | `09-Refactorizacion-Goal-SOLID/clase.md` |
| 09:30 - 10:30 | SRP + OCP en el proyecto | Trabajo en parejas | `09-Refactorizacion-Goal-SOLID/ejercicio.md` |
| 10:30 - 11:00 | Break | — | — |
| 11:00 - 12:00 | LSP + ISP + DIP en el proyecto | Trabajo en parejas | `09-Refactorizacion-Goal-SOLID/ejercicio.md` |
| 12:00 - 12:30 | Comparación de métricas antes/después | Análisis | `09-Refactorizacion-Goal-SOLID/clase.md` |
| 12:30 - 13:00 | Informe de refactorización | Entrega | — |

**Entregable:** Proyecto de pedidos refactorizado + informe de métricas

### Día 10 (Viernes) — Módulo 10: Proyecto Final + Entrevista

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | Proyecto Final: inicio y presentación (API Biblioteca) | Trabajo individual | `10-Proyecto-Final-Entrevista/ejercicio.md` |
| 10:00 - 11:00 | Proyecto Final: refactorización | Trabajo individual | — |
| 11:00 - 11:30 | Break | — | — |
| 11:30 - 12:00 | Simulación de Entrevista (parte 1): 5 ejercicios | Evaluación oral | `10-Proyecto-Final-Entrevista/clase.md` |
| 12:00 - 12:30 | Simulación de Entrevista (parte 2): 5 ejercicios | Evaluación oral | `10-Proyecto-Final-Entrevista/clase.md` |
| 12:30 - 13:00 | Cierre del curso, feedback, certificaciones | Plenaria | — |

**Entregable:** Proyecto final (API Biblioteca refactorizada) + entrevista completada

---

## Cronograma de Entregas

| Día | Entrega | Peso |
|---|---|---|
| Día 1 | 10 violaciones SOLID identificadas | 3% |
| Día 2 | EmployeeService refactorizado | 5% |
| Día 3 | Cálculo de impuestos extensible | 5% |
| Día 4 | Jerarquía de clientes con composición | 5% |
| Día 5 | Interfaces segregadas (Worker) | 5% |
| Día 6 | OrderService con DIP | 5% |
| Día 7 | App Spring refactorizada | 5% |
| Día 8 | Componentes React refactorizados | 5% |
| Día 9 | Proyecto pedidos + informe métricas | 7% |
| Día 10 | Proyecto Final + Entrevista | 55% (40% + 15%) |

---

## Recursos Necesarios por Sesión

### Por alumno
- Laptop con Java 17+, Maven 3.9+, IntelliJ IDEA
- Git configurado con cuenta personal
- Proyecto base clonado al inicio del curso

### Por el instructor
- Proyector / pantalla compartida
- Repositorio con soluciones (ramas por módulo)
- Acceso a SonarQube / SonarLint

---

## Plan de Contingencia

| Situación | Acción |
|---|---|
| Alumno se atrasa | Material grabado + sesión de refuerzo (30 min después de clase) |
| Ejercicio muy complejo | Solución parcial guiada, completar en casa |
| Problemas técnicos (IDE, Maven) | Pair programming con compañero |
| Ausencia justificada | Entrega de ejercicio al día siguiente hábil |

---

## Criterios de Éxito del Curso

- **80%+** de alumnos aprueban el proyecto final
- **90%+** de alumnos completan todos los ejercicios semanales
- **100%** de alumnos participan en la simulación de entrevista
- Los alumnos pueden explicar y aplicar los 5 principios SOLID en código real

---

*Documento generado por SASF — Junio 2026*

