---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 2: Clasificación de libros por precio con FOR LOOP

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_clasificacion VARCHAR2(20);
BEGIN
    FOR r IN (SELECT titulo, precio FROM libros) LOOP
        v_clasificacion :=
            CASE
                WHEN r.precio < 30   THEN 'Económico'
                WHEN r.precio <= 60  THEN 'Regular'
                ELSE 'Costoso'
            END;
        DBMS_OUTPUT.PUT_LINE('El libro ' || r.titulo || ' ($' || r.precio || ') es ' || v_clasificacion);
    END LOOP;
END;
/
```

**Salida esperada:**
```
El libro Cien años de soledad ($520) es Costoso
El libro Rayuela ($450) es Costoso
El libro Ficciones ($380) es Costoso
El libro El Aleph ($420) es Costoso
El libro La casa de los espíritus ($350) es Costoso
```

---

## Solución Ejercicio 3: WHILE LOOP — Cálculo de multas

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_dias_retraso NUMBER := 0;
    v_multa        NUMBER := 0;
    c_multa_diaria CONSTANT NUMBER := 1;
    c_multa_maxima CONSTANT NUMBER := 50;
BEGIN
    WHILE v_dias_retraso < 60 LOOP
        v_dias_retraso := v_dias_retraso + 1;
        v_multa := v_dias_retraso * c_multa_diaria;

        DBMS_OUTPUT.PUT_LINE('Día ' || v_dias_retraso || ': multa acumulada = $' || v_multa);

        EXIT WHEN v_multa >= c_multa_maxima;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Multa máxima alcanzada ($' || c_multa_maxima ||
                         ') después de ' || v_dias_retraso || ' días.');
END;
/
```

**Salida esperada:**
```
Día 1: multa acumulada = $1
Día 2: multa acumulada = $2
...
Día 49: multa acumulada = $49
Día 50: multa acumulada = $50
Multa máxima alcanzada ($50) después de 50 días.
```

### Pregunta conceptual — Respuesta

> ¿Por qué esta regla (multa máxima) se implementa en PL/SQL y no como CHECK constraint?

Porque la multa máxima depende de un **cálculo dinámico**: `dias_retraso * tarifa_diaria`, y además debe tener un **tope** (`$50`). Una CHECK constraint no puede:
- Evaluar valores que se calculan proceduralmente (el monto final no se almacena en el momento del INSERT).
- Depender de lógica variable (la tarifa diaria o el tope podrían cambiar).
- Implementar reglas de "máximo" que requieren comparar el resultado de un cálculo contra una constante que podría ser modificada por negocio.

Las CHECK constraints solo validan valores ya existentes en una fila, no cálculos procedurales que dependen de lógica de aplicación.

---

## Solución Ejercicio 4: LOOP + EXIT WHEN — Buscar primer libro por editorial

**Opción A — Con cursor explícito y FETCH:**

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_editorial_buscar VARCHAR2(100) := 'Emecé';
    v_isbn   libros.isbn%TYPE;
    v_titulo libros.titulo%TYPE;
    v_editorial libros.editorial%TYPE;

    CURSOR c_libros IS
        SELECT isbn, titulo, editorial FROM libros ORDER BY titulo;
BEGIN
    OPEN c_libros;

    LOOP
        FETCH c_libros INTO v_isbn, v_titulo, v_editorial;
        EXIT WHEN c_libros%NOTFOUND;

        IF v_editorial = v_editorial_buscar THEN
            DBMS_OUTPUT.PUT_LINE('Primer libro de ' || v_editorial_buscar ||
                                 ' encontrado: ' || v_titulo || ' (ISBN: ' || v_isbn || ')');
            EXIT;
        END IF;
    END LOOP;

    CLOSE c_libros;

    IF c_libros%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No se encontraron libros de la editorial ' || v_editorial_buscar || '.');
    END IF;
END;
/
```

**Opción B — Con bloque anidado y EXCEPTION (más compacta):**

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_editorial_buscar VARCHAR2(100) := 'Emecé';
    v_isbn   libros.isbn%TYPE;
    v_titulo libros.titulo%TYPE;
BEGIN
    BEGIN
        SELECT isbn, titulo
          INTO v_isbn, v_titulo
          FROM (SELECT isbn, titulo, editorial
                  FROM libros
                 WHERE editorial = v_editorial_buscar
                 ORDER BY titulo)
         WHERE ROWNUM = 1;

        DBMS_OUTPUT.PUT_LINE('Primer libro de ' || v_editorial_buscar ||
                             ' encontrado: ' || v_titulo || ' (ISBN: ' || v_isbn || ')');

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('No se encontraron libros de la editorial ' ||
                                 v_editorial_buscar || '.');
    END;
END;
/
```

**Salida esperada (Opción A y B):**
```
Primer libro de Emecé encontrado: El Aleph (ISBN: 978-987-1234-04-2)
```

Si se buscara `'O'Reilly'`:
```
No se encontraron libros de la editorial O'Reilly.
```

---

## Solución Ejercicio 5: Secuencias — Generación automática de IDs

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_id1 NUMBER;
    v_id2 NUMBER;
BEGIN
    -- Crear la secuencia (solo la primera vez)
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_id_miembro
                       START WITH 100
                       INCREMENT BY 1
                       CACHE 10
                       NOCYCLE';

    -- Insertar primer miembro
    INSERT INTO miembros (id_miembro, nombre, fecha_registro, estado_membresia)
    VALUES (seq_id_miembro.NEXTVAL, 'Roberto Sánchez', SYSDATE, 'A');
    v_id1 := seq_id_miembro.CURRVAL;

    -- Insertar segundo miembro
    INSERT INTO miembros (id_miembro, nombre, fecha_registro, estado_membresia)
    VALUES (seq_id_miembro.NEXTVAL, 'Diana Torres', SYSDATE, 'A');
    v_id2 := seq_id_miembro.CURRVAL;

    DBMS_OUTPUT.PUT_LINE('Miembros insertados:');
    DBMS_OUTPUT.PUT_LINE('Roberto Sánchez → ID: ' || v_id1);
    DBMS_OUTPUT.PUT_LINE('Diana Torres    → ID: ' || v_id2);
    DBMS_OUTPUT.PUT_LINE('Valor actual de la secuencia (CURRVAL): ' || seq_id_miembro.CURRVAL);
END;
/
```

**Salida esperada:**
```
Miembros insertados:
Roberto Sánchez → ID: 100
Diana Torres    → ID: 101
Valor actual de la secuencia (CURRVAL): 101
```

**¿Qué ocurre si se ejecuta CURRVAL sin NEXTVAL previo en la misma sesión?**
Se lanza el error `ORA-08002: sequence SEQ_ID_MIEMBRO.CURRVAL is not yet defined in this session`. `CURRVAL` solo está disponible después de haber llamado a `NEXTVAL` al menos una vez en la sesión actual.

---

## Solución Ejercicio 6: Sinónimos y diccionario de datos

```sql
-- 1. Sinónimo público
CREATE PUBLIC SYNONYM syn_libros FOR libros;

-- 2. Sinónimo privado
CREATE SYNONYM miembros_local FOR miembros;

-- 3. Consultar sinónimos del usuario
SELECT synonym_name, table_owner, table_name, db_link
FROM user_synonyms;
```

**Resultado esperado:**
```
SYNONYM_NAME    TABLE_OWNER  TABLE_NAME  DB_LINK
--------------  -----------  ----------  -------
MIEMBROS_LOCAL  (su usuario) MIEMBROS    (null)
SYN_LIBROS      (su usuario) LIBROS      (null)
```

```sql
-- 4. Consultar secuencias del usuario
SELECT sequence_name, min_value, max_value, increment_by, cache_size
FROM user_sequences;
```

**Resultado esperado:**
```
SEQUENCE_NAME      MIN_VALUE  MAX_VALUE  INCREMENT_BY  CACHE_SIZE
-----------------  ---------  ---------  ------------  ----------
SEQ_ID_MIEMBRO             1 1.0000E+27             1          10
```

**5. Verificación:** Conectado como otro usuario:
```sql
SELECT * FROM syn_libros;     -- Funciona (sinónimo público)
SELECT * FROM miembros_local; -- Error: ORA-00942 (sinónimo privado de otro esquema)
```

**Pregunta conceptual:** Para ver sinónimos creados por otros usuarios se debe consultar `DBA_SYNONYMS` (requiere privilegios DBA) o `ALL_SYNONYMS` (sinónimos accesibles por el usuario actual).

---

## Solución Ejercicio 7: Database Link — Consulta remota (simulación)

```sql
-- 1. Crear un sinónimo simulando acceso remoto
CREATE SYNONYM libros_sucursal FOR libros;

-- 2. Consulta simulada
SELECT isbn, titulo, precio FROM libros_sucursal
WHERE precio > 400;

-- 3. Consultar dblinks (probablemente vacío)
SELECT * FROM user_db_links;
```

**Respuestas conceptuales:**

1. **¿Qué privilegio se necesita para crear un dblink?**
   Se necesita el privilegio `CREATE DATABASE LINK` (para dblinks privados) o `CREATE PUBLIC DATABASE LINK` (para públicos). Un DBA puede concederlo con:
   ```sql
   GRANT CREATE DATABASE LINK TO biblioteca;
   ```

2. **¿Qué comando se usa para eliminar un dblink existente?**
   ```sql
   DROP DATABASE LINK nombre_dblink;
   ```
   O para un dblink público:
   ```sql
   DROP PUBLIC DATABASE LINK nombre_dblink;
   ```

3. **SELECT a una tabla remota:**
   ```sql
   SELECT * FROM pedidos@bd_ventas;
   ```
   Si se crea un sinónimo:
   ```sql
   CREATE SYNONYM pedidos FOR pedidos@bd_ventas;
   SELECT * FROM pedidos;
   ```

