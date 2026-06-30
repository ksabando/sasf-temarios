---
sidebar_label: "Clase"
---

# Simulación de Pruebas Técnicas y Entrevistas Oracle PL/SQL

## Objetivo
Este módulo simula escenarios reales de entrevistas técnicas y pruebas de selección para desarrolladores Oracle PL/SQL. Cada ejercicio combina:
1. **Modelado de datos:** Diseñar un modelo relacional desde un enunciado de negocio
2. **Implementación PL/SQL:** Escribir el código que implementa las reglas de negocio
3. **Pensamiento crítico:** Justificar decisiones de diseño

## Cómo enfrentar una prueba técnica

### 1. Leer el enunciado completo
No empieces a codificar de inmediato. Lee todo el problema. Identifica:
- Entidades principales
- Relaciones entre ellas
- Reglas de negocio explícitas e implícitas
- Qué información se necesita almacenar

### 2. Modelar antes de codificar
- Dibuja el modelo entidad-relación (aunque sea mental)
- Define las tablas y sus columnas
- Establece PK, FK, constraints
- Piensa en los tipos de datos correctos

### 3. Identificar la lógica de negocio
- ¿Qué reglas van como CHECK constraints?
- ¿Qué reglas van en PL/SQL (triggers/procedures)?
- ¿Qué reglas necesitan datos de múltiples tablas?

### 4. Codificar en orden
1. DDL (CREATE TABLE con constraints)
2. Datos de prueba (INSERT de ejemplos)
3. Lógica de negocio (procedures, funciones, triggers)
4. Pruebas (bloques anónimos que validan)

### 5. Explicar tus decisiones
En una entrevista, no basta con que el código funcione. Debes explicar:
- Por qué elegiste ese tipo de dato
- Por qué usaste un trigger en vez de un CHECK
- Cómo manejarías 1 millón de registros
- Qué índices crearías y por qué

## Estructura de cada ejercicio en este módulo

Cada ejercicio presenta:
- **Enunciado de negocio:** situación real con reglas
- **Requerimientos:** qué información se necesita
- **Tareas:** diseñar modelo + implementar PL/SQL
- **Complejidad:** ⭐ Básico / ⭐⭐ Intermedio / ⭐⭐⭐ Avanzado
