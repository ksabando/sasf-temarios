---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Capturar DUP_VAL_ON_INDEX

Escribir un bloque anónimo que:

1. Intente insertar un libro con un ISBN que **YA EXISTE** en la tabla `LIBROS`.
   - isbn: `'978-987-1234-01-1'`
   - titulo: `'El amor en los tiempos del cólera'`
   - anio: 1985
   - editorial: 'Sudamericana'
   - precio: 480.00
2. Capture `DUP_VAL_ON_INDEX` y muestre:
   ```
   Error: El libro con ISBN 978-987-1234-01-1 ya está registrado.
   ```
3. Luego de capturar el error, mostrar cuántos libros hay actualmente en la tabla (usar `SELECT COUNT(*) INTO`).

**Reto:** Asegurarse de que el bloque no falle aunque ocurra el error de duplicado.

---

## Ejercicio 3: NO_DATA_FOUND y TOO_MANY_ROWS

Escribir un bloque anónimo que:

1. Declare una variable `v_nombre_buscar VARCHAR2(100) := '&nombre'`.
2. Intente hacer `SELECT nombre, direccion INTO` desde `MIEMBROS` donde `nombre = v_nombre_buscar`.
3. Capture:
   - `NO_DATA_FOUND`: mostrar `"No se encontró ningún miembro con el nombre [nombre]."`.
   - `TOO_MANY_ROWS`: mostrar `"Existen varios miembros con el nombre [nombre]. Sean más específico."`.
4. Si la búsqueda es exitosa (1 fila), mostrar `"Miembro: [nombre] — Dirección: [direccion]"`.

**Pregunta:** ¿Por qué `SELECT INTO` lanza excepción cuando hay más de una fila? ¿Qué alternativa usarías para evitar esa excepción si esperas múltiples coincidencias?

---

## Ejercicio 4: RAISE_APPLICATION_ERROR — Límite de préstamos activos

Escribir un bloque anónimo que simule el registro de un nuevo préstamo con la siguiente regla de negocio:

> **"Un miembro no puede tener más de 5 libros prestados simultáneamente."**

El bloque debe:

1. Declarar variables:
   - `v_id_miembro` := 1
   - `v_isbn` := `'978-987-1234-01-1'`
   - `v_prestamos_activos NUMBER`
2. Contar cuántos préstamos activos (estado = 'P') tiene el miembro.
3. Si `v_prestamos_activos >= 5`, lanzar `RAISE_APPLICATION_ERROR(-20001, 'El miembro [ID] ya tiene [N] préstamos activos. Límite: 5.')`.
4. Si está dentro del límite, insertar el préstamo y mostrar:
   ```
   Préstamo registrado exitosamente. Préstamos activos actuales: [N+1]
   ```

**Requisito adicional:** Antes de insertar, verificar que el ISBN existe en LIBROS (contar). Si no existe, lanzar `RAISE_APPLICATION_ERROR(-20002, 'El ISBN [isbn] no está registrado.')`.

**Pregunta conceptual:** ¿Por qué esta regla (límite de 5 préstamos activos) no se puede implementar como CHECK constraint de tabla?
