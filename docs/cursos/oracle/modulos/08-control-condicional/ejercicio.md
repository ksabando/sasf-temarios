---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Clasificación de libros por precio con FOR LOOP

Escribir un bloque que recorra todos los libros con `FOR LOOP` y los clasifique según su precio:

| Rango | Clasificación |
|---|---|
| precio < 30 | `'Económico'` |
| 30 <= precio <= 60 | `'Regular'` |
| precio > 60 | `'Costoso'` |

Mostrar: `"El libro [título] ($[precio]) es [clasificación]"`.

**Requisito:** Usar `CASE searched` dentro del `FOR LOOP`.

---

## Ejercicio 3: WHILE LOOP — Cálculo de multas

Un libro se devuelve con **N días de retraso**. La política de multas es:
- Cada día de retraso cuesta **$1**.
- La multa máxima es **$50** (no se acumula más allá de 50 días de retraso).

Escribir un bloque anónimo que:
1. Declare una variable `v_dias_retraso` inicializada en `0`.
2. Use un `WHILE LOOP` para **simular** el cálculo: incremente `v_dias_retraso` de 1 en 1.
3. En cada iteración, calcule la multa como `v_dias_retraso * 1`.
4. Si la multa llega a 50, mostrar `"Multa máxima alcanzada ($50) después de [días] días"` y salir del bucle.
5. Si `v_dias_retraso` llega a 60 sin alcanzar el máximo (no debería pasar), salir también.
6. Mostrar el día actual y la multa acumulada en cada iteración.

**Pregunta conceptual al final del bloque:** ¿Por qué esta regla (multa máxima) se implementa en PL/SQL y no como CHECK constraint?

---

## Ejercicio 4: LOOP + EXIT WHEN — Buscar primer libro por editorial

Escribir un bloque que:
1. Declare una variable `v_editorial_buscar` con el valor `'Emecé'`.
2. Use un **LOOP + EXIT WHEN** que recorra los libros (usar un cursor implícito `SELECT ... INTO` con ordenamiento por título).
3. En cada iteración, si la editorial del libro coincide con `v_editorial_buscar`, mostrar:
   ```
   Primer libro de Emecé encontrado: [título] (ISBN: [isbn])
   ```
   Y salir del bucle.
4. Si no se encuentra ningún libro de esa editorial, mostrar:
   ```
   No se encontraron libros de la editorial [editorial].
   ```

**Nota:** No usar `FOR LOOP`; usar `LOOP ... EXIT WHEN` explícito con `FETCH` de cursor explícito o manejar con `BEGIN ... EXCEPTION`.

---

## Ejercicio 5: Secuencias — Generación automática de IDs

La tabla `MIEMBROS` actualmente requiere que se especifique manualmente el `id_miembro`. Se desea automatizar la generación del ID.

Se pide:

1. Crear una secuencia llamada `seq_id_miembro` que:
   - Empiece en 100.
   - Incremente de 1 en 1.
   - Almacene en caché 10 valores.
   - No permita ciclos.
2. Insertar dos nuevos miembros usando `seq_id_miembro.NEXTVAL`:
   - `'Roberto Sánchez'`, fecha actual, estado `'A'`.
   - `'Diana Torres'`, fecha actual, estado `'A'`.
3. Consultar el valor actual de la secuencia (CURRVAL) y mostrarlo.
4. Explicar en un comentario qué ocurriría si se ejecuta `CURRVAL` sin haber llamado antes a `NEXTVAL` en la misma sesión.

**Requisito:** Escribir un bloque anónimo que realice las inserciones y muestre los IDs generados.

---

## Ejercicio 6: Sinónimos y diccionario de datos

Partiendo de los objetos creados en ejercicios anteriores:

1. Crear un **sinónimo público** para la tabla `LIBROS` del esquema actual:
   ```sql
   CREATE PUBLIC SYNONYM syn_libros FOR libros;
   ```
2. Crear un **sinónimo privado** llamado `miembros_local` para la tabla `MIEMBROS`.
3. Consultar el diccionario de datos para ver los sinónimos creados:
   ```sql
   SELECT synonym_name, table_owner, table_name, db_link
   FROM user_synonyms;
   ```
4. Consultar el diccionario para listar todas las secuencias del usuario actual:
   ```sql
   SELECT sequence_name, min_value, max_value, increment_by, cache_size
   FROM user_sequences;
   ```
5. Conectarse como otro usuario (si existe) y verificar que puede consultar `syn_libros` pero no `miembros_local`.

**Pregunta conceptual:** ¿Qué vista del diccionario (`USER_`, `ALL_` o `DBA_`) se debe consultar para ver sinónimos creados por otros usuarios?

---

## Ejercicio 7: Database Link — Consulta remota (simulación)

En un entorno real, un dblink permite consultar datos de otra base de datos. Este ejercicio simula el concepto.

1. Crear un sinónimo que simule acceso remoto:
   ```sql
   CREATE SYNONYM libros_sucursal FOR libros;
   ```
2. Escribir una consulta que simule el acceso remoto:
   ```sql
   SELECT isbn, titulo, precio FROM libros_sucursal
   WHERE precio > 400;
   ```
3. Consultar el diccionario de datos para ver los dblinks (aunque esté vacío en este entorno):
   ```sql
   SELECT * FROM user_db_links;
   ```

**Preguntas conceptuales:**
1. ¿Qué privilegio se necesita para crear un dblink?
2. ¿Qué comando se usa para eliminar un dblink existente?
3. Si se tiene una tabla remota `pedidos` en la base `BD_VENTAS`, ¿cómo se escribiría un SELECT que la consulte?
