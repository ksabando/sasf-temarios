---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

## Metodología de Estudio por Módulo

Cada módulo sigue este flujo de trabajo. Respetar el orden maximiza el aprendizaje:

```
1. DIA PO SITIVA   → Abrir diap.pptx, ver las 10 slides (15 min)
2. CLASE TE—RICA   → Leer clase.md completo, tomar notas (30 min)
3. EJERCICIOS      → Resolver ejercicio.md SIN ver la respuesta (60-90 min)
4. AUTO-CORRECCI—N → Comparar con respuesta.md, corregir errores (30 min)
5. CUESTIONARIO    → Responder las 10 preguntas de cuestionario.md (20 min)
6. REPASO          → Marcar dudas para preguntar al instructor (10 min)
```

> Revisar **Regla de oro:** No mirar `respuesta.md` hasta haber intentado todos los ejercicios.

---

## Semana 1 — Fundamentos Oracle y SQL

**Objetivo:** Conectar, consultar, crear objetos, dominar JOINs y pensar con lógica de programación.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M01 | Oracle Fundamentos | 3h | [ ] Conexión HR OK [ ] Arquitectura comprendida [ ] Ej. resueltos |
| **Mar** | M02 | SQL Consultas | 4h | [ ] SELECT/GROUP BY [ ] Funciones string/num/fecha [ ] Ej. 1-6 |
| **Mié** | M03 | SQL Objetos | 4h | [ ] DDL con PK/FK/CHECK [ ] Índices y secuencias [ ] Ej. 1-6 |
| **Jue** | M04 | JOINs | 5h | [ ] INNER/LEFT/RIGHT/FULL [ ] SELF JOIN [ ] Rendimiento |
| **Vie** | M05 | Lógica de Programación | 5h | [ ] Algoritmos [ ] 10 ejercicios resueltos [ ] Cuestionario |

**Checkpoint semana 1:** Escribir desde cero una consulta con 3 JOINs, GROUP BY y funciones analíticas.

---

## Semana 2 — PL/SQL Básico + Tipos Escalares

**Objetivo:** Escribir bloques PL/SQL, manejar variables, control de flujo y excepciones.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M06 | Introducción a PL/SQL | 3h | [ ] Primer bloque [ ] DBMS_OUTPUT [ ] Modelo ER inicial |
| **Mar** | M07 | Fundamentos del Lenguaje | 4h | [ ] %TYPE/%ROWTYPE [ ] Scope [ ] Analíticas |
| **Mié** | M08 | Control Condicional e Iterativo | 4h | [ ] IF/CASE [ ] FOR/WHILE/LOOP [ ] Secuencias |
| **Jue** | M09 | Manejo de Excepciones | 4h | [ ] NO_DATA_FOUND [ ] RAISE_APPLICATION_ERROR [ ] FK/PK |
| **Vie** | M10 | Strings y Números | 5h | [ ] VARCHAR2/CLOB [ ] REGEXP [ ] Analíticas avanzadas |

**Checkpoint semana 2:** Escribir un bloque que recorra empleados, clasifique por salario, maneje excepciones y use funciones analíticas.

---

## Semana 3 — Tipos de Datos, Estructuras y SQL en PL/SQL

**Objetivo:** Dominar fechas, records, colecciones, transacciones y cursores.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M11 | Fechas y Timestamps | 4h | [ ] DATE/TIMESTAMP [ ] INTERVAL [ ] Modelado SCD2 |
| **Mar** | M12 | Records | 4h | [ ] TYPE IS RECORD [ ] %ROWTYPE [ ] Vistas + JOINs |
| **Mié** | M13 | Colecciones | 5h | [ ] Associative Array [ ] Nested Table/VARRAY [ ] BULK/FORALL |
| **Jue** | M14 | DML y Transacciones | 4h | [ ] INSERT/UPDATE/MERGE [ ] SAVEPOINT [ ] AUTONOMOUS |
| **Vie** | M15 | Cursores | 5h | [ ] FOR LOOP [ ] SYS_REFCURSOR [ ] Paramétricos |

**Checkpoint semana 3:** Procesar datos masivos con BULK COLLECT + FORALL dentro de un procedimiento transaccional con SAVEPOINT.

---

## Semana 4 — Unidades de Programa y Evaluación Final

**Objetivo:** Crear procedures, funciones, packages, triggers y preparar entrevistas.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M16 | SQL Dinámico | 4h | [ ] EXECUTE IMMEDIATE [ ] Bind variables [ ] DBMS_SQL |
| **Mar** | M17 | Procedimientos y Funciones | 4h | [ ] IN/OUT/IN OUT [ ] Recursividad [ ] Table API |
| **Mié** | M18 | Packages | 5h | [ ] Spec + Body [ ] Variables globales [ ] Overloading |
| **Jue** | M19 | Triggers | 4h | [ ] BEFORE/AFTER [ ] :OLD/:NEW [ ] Auditoría |
| **Vie** | M20+M21 | Optimización + Simulación | 6h | [ ] RESULT_CACHE [ ] BULK LIMIT [ ] 10 ejercicios entrevista |

**Checkpoint semana 4:** Completar los 10 ejercicios del M21 (simulación de entrevista) en máximo 8 horas.

---

## Rúbrica de Auto-Evaluación

Al final de cada módulo, calificarse de 0 a 5:

| Puntaje | Significado | Acción |
|---------|-------------|--------|
| 5 | Puedo explicarlo y aplicarlo sin ayuda | Avanzar |
| 4 | Lo entiendo pero necesito consultar la guía | Avanzar, repasar luego |
| 3 | Entiendo el concepto pero fallo en implementación | Rehacer ejercicios |
| 2 | No entiendo partes clave | Volver a clase.md + diapositivas |
| 1 | No entiendo casi nada | Pedir ayuda al instructor |
| 0 | No lo vi | Hacer el módulo |

---

## Reglas de Oro del Curso

1. **Nunca copies y pegues.** Escribe cada línea de código manualmente.
2. **Lee el error completo.** Oracle te dice exactamente qué falló y en qué línea.
3. **Usa `DBMS_OUTPUT` como debug.** Agrega PUT_LINE para ver valores intermedios.
4. **Primero modela, después programa.** El 50% del trabajo es diseñar bien las tablas.
5. **No te saltes ejercicios.** Cada uno construye sobre el anterior.
6. **Haz ROLLBACK después de cada prueba.** Así no ensucias el esquema HR.
7. **Pregunta.** Si algo no te cierra después de 15 minutos, pregunta.

---

## Recursos

| Recurso | Enlace |
|---------|--------|
| Temario completo | `Modulos/Temario-Oracle-2026.md` |
| Ejercicios y soluciones | `Modulos/` (21 carpetas) |
| Libro base | `Libros/Oracle-pl_sql-programming_6th-edition_2014.pdf` |
| Docker Compose | `Anexos/docker-compose.yml` |
| Curso YouTube PL/SQL | [Playlist](https://www.youtube.com/watch?v=l6wOghW_gNI&list=PL2Z95CSZ1N4EO3wqFmTBNZXCovLpxkEqB) |
| Certificación SQL 1Z0-071 | [Playlist](https://www.youtube.com/watch?v=o0pbrbqgEpY&list=PL2Z95CSZ1N4GnsAClPZq4IreFOw8c9qfh) |
| Oracle Live SQL | https://livesql.oracle.com |
| Documentación Oracle | https://docs.oracle.com/database/121/LNPLS/ |

