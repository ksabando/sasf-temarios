---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

## Semana 2 — Aplicación Avanzada y Proyecto Final

### Día 6 (Lunes) — Módulo 06: Manejo de Errores

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | Excepciones vs códigos de error, excepciones de dominio | Clase teórica | `06-Manejo-Errores/clase.md` |
| 10:00 - 10:30 | No retornar null: Optional, Null Object Pattern | Clase teórica | `06-Manejo-Errores/clase.md` |
| 10:30 - 11:00 | Break | — | — |
| 11:00 - 12:00 | Refactorizar código con nulls y códigos de error | Live coding + práctica | `06-Manejo-Errores/ejercicio.md` |
| 12:00 - 12:30 | Manejo de errores en Spring (@ControllerAdvice) | Demo | `06-Manejo-Errores/clase.md` |
| 12:30 - 13:00 | Manejo de errores en React (Error Boundaries) | Discusión | `06-Manejo-Errores/clase.md` |

**Entregable:** Código refactorizado con manejo de errores basado en excepciones

### Día 7 (Martes) — Módulo 07: Límites e Integración

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | Código de terceros, boundaries, adapters | Clase teórica | `07-Limites-Integracion/clase.md` |
| 10:00 - 10:30 | Learning tests: qué son y cómo escribirlos | Demo | `07-Limites-Integracion/clase.md` |
| 10:30 - 11:00 | Break | — | — |
| 11:00 - 12:00 | Crear adapter para API de pagos + learning tests | Práctica individual | `07-Limites-Integracion/ejercicio.md` |
| 12:00 - 12:30 | Presentación de adapters: comparar enfoques | Trabajo grupal | — |
| 12:30 - 13:00 | Caracterización de código legacy con tests | Discusión | `07-Limites-Integracion/clase.md` |

**Entregable:** Payment adapter + learning tests de API

### Día 8 (Miércoles) — Módulo 08: Pruebas Limpias (TDD)

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | FIRST, Given-When-Then, una aserción por test | Clase teórica | `08-Pruebas-Limpias-TDD/clase.md` |
| 10:00 - 10:30 | TDD: ciclo Red-Green-Refactor | Demo en vivo | `08-Pruebas-Limpias-TDD/clase.md` |
| 10:30 - 11:00 | Break | — | — |
| 11:00 - 12:00 | TDD: desarrollar calculadora de descuentos | Práctica individual (pair programming) | `08-Pruebas-Limpias-TDD/ejercicio.md` |
| 12:00 - 12:30 | Refactorizar tests legacy | Práctica individual | `08-Pruebas-Limpias-TDD/clase.md` |
| 12:30 - 13:00 | Discusión: cobertura de código, mitos y realidades | Plenaria | — |

**Entregable:** Tests TDD para calculadora de descuentos + tests legacy refactorizados

### Día 9 (Jueves) — Módulo 09: Clases

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | Clases pequeñas, SRP, cohesión | Clase teórica | `09-Clases/clase.md` |
| 10:00 - 10:30 | Organización de clases: orden y estructura | Clase teórica | `09-Clases/clase.md` |
| 10:30 - 11:00 | Break | — | — |
| 11:00 - 12:30 | Refactorizar clase Dios `ReportGenerator` (1200 líneas) | Práctica en parejas | `09-Clases/ejercicio.md` |
| 12:30 - 13:00 | Presentación de resultados: número de clases creadas, cohesión | Plenaria | — |

**Entregable:** `ReportGenerator` dividido en 10-12 clases cohesivas

### Día 10 (Viernes) — Módulo 10: Proyecto Final + Entrevista

| Horario | Actividad | Tipo | Material |
|---|---|---|---|
| 09:00 - 10:00 | Proyecto Final: presentación e inicio (API Biblioteca Legacy) | Trabajo individual | `10-Proyecto-Final-Entrevista/ejercicio.md` |
| 10:00 - 11:00 | Proyecto Final: refactorización y tests | Trabajo individual | — |
| 11:00 - 11:30 | Break | — | — |
| 11:30 - 12:00 | Simulación de Entrevista (parte 1): 5 ejercicios | Evaluación oral | `10-Proyecto-Final-Entrevista/clase.md` |
| 12:00 - 12:30 | Simulación de Entrevista (parte 2): 5 ejercicios | Evaluación oral | `10-Proyecto-Final-Entrevista/clase.md` |
| 12:30 - 13:00 | Cierre del curso, feedback, certificaciones | Plenaria | — |

**Entregable:** Proyecto final (API Biblioteca refactorizada) + entrevista completada

---

## Cronograma de Entregas

| Día | Entrega | Peso |
|---|---|---|
| Día 1 | 15 code smells identificados | 3% |
| Día 2 | Nombres refactorizados (50+ identificadores) | 5% |
| Día 3 | `processOrder` refactorizado en funciones pequeñas | 5% |
| Día 4 | Código limpio de comentarios + formateado | 5% |
| Día 5 | Refactorización Ley de Demeter + DTOs | 5% |
| Día 6 | Manejo de errores con excepciones | 5% |
| Día 7 | Payment adapter + learning tests | 5% |
| Día 8 | Tests TDD + tests refactorizados | 5% |
| Día 9 | `ReportGenerator` dividido en clases cohesivas | 7% |
| Día 10 | Proyecto Final + Entrevista | 55% (40% + 15%) |

---

## Recursos Necesarios por Sesión

### Por alumno
- Laptop con Java 17+, Maven 3.9+, IntelliJ IDEA
- Git configurado con cuenta personal
- Proyecto base clonado al inicio del curso
- Plugin SonarLint, Checkstyle y PMD instalados

### Por el instructor
- Proyector / pantalla compartida
- Repositorio con soluciones (ramas por módulo)
- Proyectos legacy preparados para cada módulo
- Acceso a SonarQube

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
- Los alumnos pueden escribir código legible, mantenible y testeable
- Los alumnos aplican TDD de forma natural en ejercicios prácticos
- Reducción de code smells en el código producido por los alumnos

---

*Documento generado por SASF — Junio 2026*

