---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 2: Acumulador (Suma de salarios)

```plsql
SET SERVEROUTPUT ON;

DECLARE
  v_total_salarios NUMBER := 0;
  v_contador       NUMBER := 0;
BEGIN
  FOR r_emp IN (
    SELECT salary
      FROM employees
     WHERE department_id = 90
  ) LOOP
    v_total_salarios := v_total_salarios + r_emp.salary;
    v_contador := v_contador + 1;
  END LOOP;

  DBMS_OUTPUT.PUT_LINE('=== DEPARTAMENTO 90 ===');
  DBMS_OUTPUT.PUT_LINE('Cantidad de empleados: ' || v_contador);
  DBMS_OUTPUT.PUT_LINE('Suma total de salarios: ' || v_total_salarios);
  IF v_contador > 0 THEN
    DBMS_OUTPUT.PUT_LINE('Salario promedio: ' ||
      ROUND(v_total_salarios / v_contador, 2));
  END IF;
END;
/
```

**Explicación:**
- `v_total_salarios` es el acumulador, inicializado en 0
- Cada iteración suma `r_emp.salary` al acumulador
- `v_contador` cuenta cuántos empleados hay en el departamento
- Se calcula y muestra también el promedio como bonus

---

## Ejercicio 3: Búsqueda (Salario máximo por departamento)

```plsql
SET SERVEROUTPUT ON;

DECLARE
  CURSOR c_emp IS
    SELECT first_name, last_name, salary
      FROM employees
     WHERE department_id = 80;

  v_first_name VARCHAR2(20);
  v_last_name  VARCHAR2(25);
  v_salary     NUMBER;

  v_max_salary  NUMBER := 0;
  v_max_first   VARCHAR2(20);
  v_max_last    VARCHAR2(25);
BEGIN
  OPEN c_emp;
  LOOP
    FETCH c_emp INTO v_first_name, v_last_name, v_salary;
    EXIT WHEN c_emp%NOTFOUND;

    IF v_salary > v_max_salary THEN
      v_max_salary := v_salary;
      v_max_first  := v_first_name;
      v_max_last   := v_last_name;
    END IF;
  END LOOP;
  CLOSE c_emp;

  IF v_max_salary > 0 THEN
    DBMS_OUTPUT.PUT_LINE('=== EMPLEADO CON MAYOR SALARIO (Dept 80) ===');
    DBMS_OUTPUT.PUT_LINE('Nombre:  ' || v_max_first || ' ' || v_max_last);
    DBMS_OUTPUT.PUT_LINE('Salario: ' || v_max_salary);
  ELSE
    DBMS_OUTPUT.PUT_LINE('No se encontraron empleados en el departamento 80.');
  END IF;
END;
/
```

**Explicación:**
- Se declara un cursor explícito `c_emp` que selecciona empleados del dept 80
- `OPEN c_emp` abre el cursor
- `FETCH` lee una fila; `EXIT WHEN c_emp%NOTFOUND` sale cuando no hay más filas
- Se compara cada salario con `v_max_salary` y se actualiza si es mayor
- `CLOSE c_emp` cierra el cursor al finalizar

---

## Ejercicio 4: Contador condicional (Clasificación de salarios)

```plsql
SET SERVEROUTPUT ON;

DECLARE
  v_altos  NUMBER := 0;
  v_medios NUMBER := 0;
  v_bajos  NUMBER := 0;
  v_total  NUMBER := 0;
BEGIN
  FOR r_emp IN (SELECT salary FROM employees) LOOP
    IF r_emp.salary > 10000 THEN
      v_altos := v_altos + 1;
    ELSIF r_emp.salary >= 5000 THEN
      v_medios := v_medios + 1;
    ELSE
      v_bajos := v_bajos + 1;
    END IF;
    v_total := v_total + 1;
  END LOOP;

  DBMS_OUTPUT.PUT_LINE('=== CLASIFICACION DE SALARIOS ===');
  DBMS_OUTPUT.PUT_LINE('Salarios > 10000:      ' || LPAD(v_altos, 4) || ' empleados');
  DBMS_OUTPUT.PUT_LINE('Salarios 5000-10000:   ' || LPAD(v_medios, 4) || ' empleados');
  DBMS_OUTPUT.PUT_LINE('Salarios < 5000:       ' || LPAD(v_bajos, 4) || ' empleados');
  DBMS_OUTPUT.PUT_LINE('================================');
  DBMS_OUTPUT.PUT_LINE('Total empleados:       ' || LPAD(v_total, 4));
END;
/
```

**Explicación:**
- Tres contadores independientes, todos inicializados en 0
- Un solo `FOR LOOP` recorre todos los empleados
- `IF/ELSIF/ELSE` clasifica cada salario en la categoría correspondiente
- `v_total` lleva la cuenta de todos los empleados para verificar que la suma coincide
- `LPAD` se usa para alinear las columnas numéricas

---

## Ejercicio 5: Descomposición (Reporte de antigüedad)

### Pseudocódigo (diseño previo)

```
-- Subproblema 5.1: Obtener datos
PARA CADA empleado EN employees:
  Obtener first_name, last_name, hire_date, salary

-- Subproblema 5.2: Calcular antigüedad
FUNCION calcular_antiguedad(fecha_ingreso):
  RETORNAR TRUNC(MONTHS_BETWEEN(SYSDATE, fecha_ingreso) / 12)

-- Subproblema 5.3: Clasificar en rangos
FUNCION clasificar_rango(anios):
  SI anios < 5: RETORNAR 'Menos de 5 años'
  SI anios <= 10: RETORNAR '5-10 años'
  SI anios <= 15: RETORNAR '10-15 años'
  SINO: RETORNAR 'Más de 15 años'

-- Subproblema 5.4: Resumen por rango
  Contar cuántos empleados caen en cada rango

-- Subproblema 5.5: Mostrar reporte
  Mostrar detalle por empleado + resumen final
```

### Implementación PL/SQL

```plsql
SET SERVEROUTPUT ON;
SET LINESIZE 200;

DECLARE
  -- Variables para el reporte
  v_antiguedad NUMBER;
  v_rango      VARCHAR2(30);

  -- Contadores por rango
  v_rango_menos5  NUMBER := 0;
  v_rango_5_10    NUMBER := 0;
  v_rango_10_15   NUMBER := 0;
  v_rango_mas15   NUMBER := 0;

  -- Funciones locales (Subproblemas 5.2 y 5.3)
  FUNCTION calcular_antiguedad(p_hire_date IN DATE) RETURN NUMBER
  IS
  BEGIN
    RETURN TRUNC(MONTHS_BETWEEN(SYSDATE, p_hire_date) / 12);
  END calcular_antiguedad;

  FUNCTION clasificar_rango(p_anios IN NUMBER) RETURN VARCHAR2
  IS
  BEGIN
    IF p_anios < 5 THEN
      RETURN 'Menos de 5 años';
    ELSIF p_anios <= 10 THEN
      RETURN '5-10 años';
    ELSIF p_anios <= 15 THEN
      RETURN '10-15 años';
    ELSE
      RETURN 'Más de 15 años';
    END IF;
  END clasificar_rango;

BEGIN
  -- Subproblema 5.1 + 5.5: Obtener datos y mostrar detalle
  DBMS_OUTPUT.PUT_LINE('=== REPORTE DE ANTIGoEDAD ===');
  DBMS_OUTPUT.PUT_LINE(RPAD('Empleado', 35) || '| ' ||
                       RPAD('Fecha Ingreso', 15) || '| ' ||
                       RPAD('Años', 6) || '| ' ||
                       'Rango');
  DBMS_OUTPUT.PUT_LINE(RPAD('-', 35, '-') || '+-' ||
                       RPAD('-', 15, '-') || '+-' ||
                       RPAD('-', 6, '-') || '+-' ||
                       RPAD('-', 20, '-'));

  FOR r_emp IN (
    SELECT first_name, last_name, hire_date
      FROM employees
     ORDER BY hire_date
  ) LOOP
    -- Subproblema 5.2
    v_antiguedad := calcular_antiguedad(r_emp.hire_date);

    -- Subproblema 5.3
    v_rango := clasificar_rango(v_antiguedad);

    -- Subproblema 5.4: Acumular contadores
    CASE
      WHEN v_antiguedad < 5  THEN v_rango_menos5 := v_rango_menos5 + 1;
      WHEN v_antiguedad <= 10 THEN v_rango_5_10 := v_rango_5_10 + 1;
      WHEN v_antiguedad <= 15 THEN v_rango_10_15 := v_rango_10_15 + 1;
      ELSE v_rango_mas15 := v_rango_mas15 + 1;
    END CASE;

    -- Mostrar detalle del empleado
    DBMS_OUTPUT.PUT_LINE(
      RPAD(r_emp.first_name || ' ' || r_emp.last_name, 35) || '| ' ||
      RPAD(TO_CHAR(r_emp.hire_date, 'DD-MON-YYYY'), 15) || '| ' ||
      LPAD(v_antiguedad, 4) || ' | ' ||
      v_rango
    );
  END LOOP;

  -- Subproblema 5.5: Mostrar resumen
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('=== RESUMEN POR RANGO ===');
  DBMS_OUTPUT.PUT_LINE('Menos de 5 años:       ' || v_rango_menos5 || ' empleados');
  DBMS_OUTPUT.PUT_LINE('5-10 años:             ' || v_rango_5_10  || ' empleados');
  DBMS_OUTPUT.PUT_LINE('10-15 años:            ' || v_rango_10_15 || ' empleados');
  DBMS_OUTPUT.PUT_LINE('Más de 15 años:        ' || v_rango_mas15 || ' empleados');
  DBMS_OUTPUT.PUT_LINE('----------------------------------------');
  DBMS_OUTPUT.PUT_LINE('Total:                 ' ||
    (v_rango_menos5 + v_rango_5_10 + v_rango_10_15 + v_rango_mas15) || ' empleados');
END;
/
```

**Explicación:**
- Se aplicó "divide y vencerás": cada subproblema es una función o sección del código
- `calcular_antiguedad`: función local que calcula años desde `hire_date` usando `MONTHS_BETWEEN`
- `clasificar_rango`: función local que devuelve la etiqueta del rango según los años
- El `CASE` en el cuerpo principal clasifica y acumula los contadores simultáneamente
- Se muestra primero el detalle ordenado por fecha de ingreso y luego el resumen

---

## Ejercicio 6: Algoritmo completo (Sistema de préstamos de biblioteca)

### 6.1 Crear tabla temporal

```sql
CREATE GLOBAL TEMPORARY TABLE prestamos_temp (
  prestamo_id      NUMBER GENERATED BY DEFAULT AS IDENTITY,
  miembro_id       NUMBER(6),
  libro_dept_id    NUMBER(4),
  fecha_prestamo   DATE,
  fecha_devolucion DATE,
  activo           VARCHAR2(1) DEFAULT 'S'
) ON COMMIT PRESERVE ROWS;
```

### 6.2 Implementar el procedimiento principal

```plsql
SET SERVEROUTPUT ON;

DECLARE
  -- Parámetros simulados (cambiar para probar distintos casos)
  v_miembro_id    NUMBER := 100;  -- Steven King
  v_libro_dept_id NUMBER := 50;   -- Shipping (simula un libro)

  -- Variables de validación
  v_miembro_nombre VARCHAR2(100);
  v_dept_nombre    VARCHAR2(50);
  v_prestamos_activos NUMBER;

  -- Variable para fecha de devolución
  v_fecha_dev DATE;

  -- Constante
  c_max_prestamos CONSTANT NUMBER := 3;
  c_dias_prestamo CONSTANT NUMBER := 14;

BEGIN
  DBMS_OUTPUT.PUT_LINE('=== SISTEMA DE PR?STAMOS DE BIBLIOTECA ===');
  DBMS_OUTPUT.PUT_LINE('');

  -- Paso 1: Validar que el miembro existe
  BEGIN
    SELECT first_name || ' ' || last_name
      INTO v_miembro_nombre
      FROM employees
     WHERE employee_id = v_miembro_id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      DBMS_OUTPUT.PUT_LINE('Error: El miembro con ID ' || v_miembro_id || ' no existe.');
      RETURN;
  END;

  -- Paso 2: Validar que el departamento existe
  BEGIN
    SELECT department_name
      INTO v_dept_nombre
      FROM departments
     WHERE department_id = v_libro_dept_id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      DBMS_OUTPUT.PUT_LINE('Error: El departamento/libro con ID ' || v_libro_dept_id || ' no existe.');
      RETURN;
  END;

  DBMS_OUTPUT.PUT_LINE('Miembro: ' || v_miembro_nombre || ' (ID: ' || v_miembro_id || ')');
  DBMS_OUTPUT.PUT_LINE('Libro (dept): ' || v_dept_nombre || ' (ID: ' || v_libro_dept_id || ')');

  -- Paso 3: Contar préstamos activos del miembro
  SELECT COUNT(*)
    INTO v_prestamos_activos
    FROM prestamos_temp
   WHERE miembro_id = v_miembro_id
     AND activo = 'S';

  DBMS_OUTPUT.PUT_LINE('Préstamos activos actuales: ' || v_prestamos_activos);

  -- Paso 4: Decidir si permitir o rechazar
  IF v_prestamos_activos >= c_max_prestamos THEN
    -- Paso 5 (rechazo): Mostrar error
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('ERROR: El miembro ' || v_miembro_nombre ||
      ' ya tiene ' || c_max_prestamos || ' préstamos activos.');
    DBMS_OUTPUT.PUT_LINE('No se puede realizar un nuevo préstamo hasta que devuelva alguno.');
  ELSE
    -- Paso 5 (aprobación): Calcular fecha y registrar préstamo
    v_fecha_dev := SYSDATE + c_dias_prestamo;

    INSERT INTO prestamos_temp (
      miembro_id, libro_dept_id, fecha_prestamo, fecha_devolucion, activo
    ) VALUES (
      v_miembro_id, v_libro_dept_id, SYSDATE, v_fecha_dev, 'S'
    );

    -- Confirmar la inserción
    COMMIT;

    -- Paso 6: Mostrar confirmación
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('Préstamo registrado exitosamente.');
    DBMS_OUTPUT.PUT_LINE('Fecha de préstamo:    ' ||
      TO_CHAR(SYSDATE, 'DD/MM/YYYY HH24:MI'));
    DBMS_OUTPUT.PUT_LINE('Devolución estimada:  ' ||
      TO_CHAR(v_fecha_dev, 'DD/MM/YYYY'));
    DBMS_OUTPUT.PUT_LINE('Días de préstamo:     ' || c_dias_prestamo);
  END IF;

END;
/
```

### 6.3 Script completo de prueba

```plsql
SET SERVEROUTPUT ON;

-- Limpiar datos de pruebas anteriores
DELETE FROM prestamos_temp;
COMMIT;

-- === PRUEBA 1: Insertar 3 préstamos para el miembro 100 ===
DBMS_OUTPUT.PUT_LINE('=== INSERTANDO 3 PR?STAMOS PARA MIEMBRO 100 ===');
INSERT INTO prestamos_temp (miembro_id, libro_dept_id, fecha_prestamo, fecha_devolucion, activo)
VALUES (100, 10, SYSDATE - 30, SYSDATE - 16, 'S');
INSERT INTO prestamos_temp (miembro_id, libro_dept_id, fecha_prestamo, fecha_devolucion, activo)
VALUES (100, 20, SYSDATE - 20, SYSDATE - 6, 'S');
INSERT INTO prestamos_temp (miembro_id, libro_dept_id, fecha_prestamo, fecha_devolucion, activo)
VALUES (100, 30, SYSDATE - 10, SYSDATE + 4, 'S');
COMMIT;

-- Verificar que se insertaron
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM prestamos_temp WHERE miembro_id = 100 AND activo = 'S';
  DBMS_OUTPUT.PUT_LINE('Préstamos activos para miembro 100: ' || v_count);
END;
/

-- === PRUEBA 2: Intentar un 4º préstamo (debe ser rechazado) ===
-- (Ejecutar el bloque principal del punto 6.2 con v_miembro_id := 100)

-- === PRUEBA 3: Marcar un préstamo como devuelto e intentar de nuevo ===
DBMS_OUTPUT.PUT_LINE('');
DBMS_OUTPUT.PUT_LINE('=== MARCANDO PR?STAMO COMO DEVUELTO ===');
UPDATE prestamos_temp
   SET activo = 'N'
 WHERE miembro_id = 100
   AND ROWNUM = 1;
COMMIT;

DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM prestamos_temp WHERE miembro_id = 100 AND activo = 'S';
  DBMS_OUTPUT.PUT_LINE('Préstamos activos restantes para miembro 100: ' || v_count);
END;
/

-- Ahora el miembro 100 debería poder tomar un nuevo préstamo
-- (Ejecutar el bloque principal del punto 6.2 nuevamente con v_miembro_id := 100)

-- === PRUEBA 4: Limpiar todo ===
DELETE FROM prestamos_temp;
COMMIT;
DBMS_OUTPUT.PUT_LINE('');
DBMS_OUTPUT.PUT_LINE('Tabla temporal limpiada.');
```

**Explicación del algoritmo:**

1. **Validación en dos pasos:** Primero verifica que el miembro existe, luego que el departamento existe. Cada validación tiene su propio bloque `BEGIN...EXCEPTION` para dar mensajes de error específicos.

2. **Conteo de préstamos:** `SELECT COUNT(*)` sobre la tabla temporal con filtro `activo = 'S'` da el número exacto de préstamos vigentes.

3. **Decisión con IF/ELSE:** Si los préstamos activos alcanzan el máximo (3), se rechaza con un mensaje claro. Si no, se procede a insertar.

4. **Cálculo de fecha de devolución:** `SYSDATE + 14` añade exactamente 14 días a la fecha actual.

5. **Inserción atómica:** Se inserta el registro con `SYSDATE` como fecha de préstamo y la fecha calculada como devolución estimada.

6. **Manejo de errores:** `NO_DATA_FOUND` se captura para los casos en que el miembro o departamento no existen en las tablas del esquema HR.

---

## Resumen de conceptos aplicados

| Ejercicio | Concepto principal | Estructuras usadas |
|-----------|-------------------|-------------------|
| 1 | Traducción pseudocódigo → código | FOR, IF/ELSE, MOD |
| 2 | Acumulador | Cursor FOR LOOP, variables acumuladoras |
| 3 | Búsqueda manual | LOOP, EXIT WHEN, cursor explícito, FETCH |
| 4 | Contador condicional | IF/ELSIF/ELSE, múltiples contadores |
| 5 | Divide y vencerás | Funciones locales, CASE, descomposición |
| 6 | Algoritmo completo | Validaciones, conteo, inserción, manejo de errores |
| 7 | FizzBuzz — condiciones múltiples | FOR, IF/ELSIF, MOD, orden de evaluación |
| 8 | Fibonacci — acumulador doble | FOR, desplazamiento de variables |
| 9 | Palíndromo — inversión manual | FOR inverso, SUBSTR, comparación |
| 10 | Números primos — nested loops | FOR anidados, EXIT WHEN, SQRT, booleano |

---

## Ejercicio 7: FizzBuzz

```plsql
SET SERVEROUTPUT ON;

DECLARE
  v_numero NUMBER;
BEGIN
  DBMS_OUTPUT.PUT_LINE('=== FIZZBUZZ (1 al 50) ===');
  FOR v_numero IN 1..50 LOOP
    IF MOD(v_numero, 3) = 0 AND MOD(v_numero, 5) = 0 THEN
      DBMS_OUTPUT.PUT_LINE(v_numero || ': FizzBuzz');
    ELSIF MOD(v_numero, 3) = 0 THEN
      DBMS_OUTPUT.PUT_LINE(v_numero || ': Fizz');
    ELSIF MOD(v_numero, 5) = 0 THEN
      DBMS_OUTPUT.PUT_LINE(v_numero || ': Buzz');
    ELSE
      DBMS_OUTPUT.PUT_LINE(v_numero);
    END IF;
  END LOOP;
END;
/
```

**Explicación:** La condición `3 AND 5` se evalúa primero. Si se evaluaran las condiciones individuales antes, los múltiplos de 15 caerían en "Fizz" y nunca llegarían a "FizzBuzz". El orden de evaluación en `IF/ELSIF` es crítico.

---

## Ejercicio 8: Serie de Fibonacci

```plsql
SET SERVEROUTPUT ON;

DECLARE
  v_anterior   NUMBER := 0;
  v_actual     NUMBER := 1;
  v_siguiente  NUMBER;
  v_serie      VARCHAR2(500);
BEGIN
  v_serie := v_anterior || ', ' || v_actual;

  FOR i IN 3..20 LOOP
    v_siguiente := v_anterior + v_actual;
    v_serie := v_serie || ', ' || v_siguiente;
    v_anterior := v_actual;
    v_actual   := v_siguiente;
  END LOOP;

  DBMS_OUTPUT.PUT_LINE('=== SERIE DE FIBONACCI (primeros 20) ===');
  DBMS_OUTPUT.PUT_LINE(v_serie);
END;
/
```

**Explicación:** El patrón de "acumulador doble" mantiene dos valores previos. En cada paso se suman (`v_siguiente = v_anterior + v_actual`), luego se desplazan los valores: `v_anterior` toma el valor de `v_actual`, y `v_actual` toma el del nuevo `v_siguiente`.

---

## Ejercicio 9: Validación de palíndromo

```plsql
SET SERVEROUTPUT ON;

DECLARE
  TYPE t_palabras IS TABLE OF VARCHAR2(100) INDEX BY PLS_INTEGER;
  v_palabras      t_palabras;
  v_palabra       VARCHAR2(100);
  v_invertida     VARCHAR2(100);
  v_es_palindromo BOOLEAN;
  v_resultado     VARCHAR2(20);
BEGIN
  -- Definir palabras de prueba
  v_palabras(1) := 'reconocer';
  v_palabras(2) := 'anilina';
  v_palabras(3) := 'oracle';
  v_palabras(4) := 'radar';
  v_palabras(5) := 'programacion';
  v_palabras(6) := 'ana';
  v_palabras(7) := 'somos';
  v_palabras(8) := 'base';

  DBMS_OUTPUT.PUT_LINE('=== VALIDADOR DE PALÍNDROMOS ===');
  DBMS_OUTPUT.PUT_LINE(RPAD('Palabra', 20) || ' | Resultado');
  DBMS_OUTPUT.PUT_LINE(RPAD('-', 20, '-') || '-+-' || RPAD('-', 15, '-'));

  FOR i IN 1..v_palabras.COUNT LOOP
    v_palabra := v_palabras(i);

    -- Invertir la palabra manualmente
    v_invertida := '';
    FOR j IN REVERSE 1..LENGTH(v_palabra) LOOP
      v_invertida := v_invertida || SUBSTR(v_palabra, j, 1);
    END LOOP;

    -- Comparar (ignorando mayúsculas/minúsculas)
    v_es_palindromo := (UPPER(v_palabra) = UPPER(v_invertida));

    IF v_es_palindromo THEN
      v_resultado := 'SI es palíndromo';
    ELSE
      v_resultado := 'NO es palíndromo';
    END IF;

    DBMS_OUTPUT.PUT_LINE(RPAD(v_palabra, 20) || ' | ' || v_resultado);
  END LOOP;
END;
/
```

**Explicación:** Se recorre la palabra carácter por carácter con un `FOR REVERSE` (desde el último al primero). Cada carácter se extrae con `SUBSTR(palabra, j, 1)` y se concatena a `v_invertida`. La comparación entre original e invertida determina si es palíndromo.

---

## Ejercicio 10: Números primos

```plsql
SET SERVEROUTPUT ON;

DECLARE
  v_es_primo     BOOLEAN;
  v_contador     NUMBER := 0;
  v_linea        VARCHAR2(500);
  v_limite_superior  NUMBER := 2;
BEGIN
  DBMS_OUTPUT.PUT_LINE('=== NRevisarMEROS PRIMOS ENTRE 2 Y 100 ===');
  DBMS_OUTPUT.PUT_LINE('');

  FOR n IN 2..100 LOOP
    v_es_primo := TRUE;

    -- Solo probar divisores desde 2 hasta SQRT(n)
    v_limite_superior := TRUNC(SQRT(n));

    FOR d IN 2..v_limite_superior LOOP
      IF MOD(n, d) = 0 THEN
        v_es_primo := FALSE;
        EXIT;  -- Salir del loop interno, ya sabemos que no es primo
      END IF;
    END LOOP;

    IF v_es_primo THEN
      IF v_contador = 0 THEN
        v_linea := LPAD(n, 3);
      ELSE
        v_linea := v_linea || ' | ' || LPAD(n, 3);
      END IF;
      v_contador := v_contador + 1;

      -- Mostrar 10 por línea
      IF MOD(v_contador, 10) = 0 THEN
        DBMS_OUTPUT.PUT_LINE(v_linea);
        v_linea := '';
      END IF;
    END IF;
  END LOOP;

  -- Mostrar resto de la última línea si quedó incompleta
  IF v_linea IS NOT NULL AND LENGTH(v_linea) > 0 THEN
    DBMS_OUTPUT.PUT_LINE(v_linea);
  END IF;

  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('Total de primos encontrados: ' || v_contador);
END;
/
```

**Explicación:**
- Loop externo: recorre cada número del 2 al 100
- Loop interno: busca divisores desde 2 hasta `SQRT(n)`. Si un número `n` no es primo, tiene un divisor `d ? SQRT(n)` (porque si tuviera un divisor > SQRT(n), su complemento sería < SQRT(n))
- `EXIT` dentro del loop interno corta apenas encuentra un divisor (optimización)
- `v_contador` controla formato: 10 números por línea con `MOD(v_contador, 10) = 0`

**Reflexión:** La optimización `SQRT(n)` reduce las iteraciones de ~n a ~^sn. Por ejemplo, para n=97, en vez de probar 95 divisores (2..96), solo prueba 9 (2..9). En nested loops, `EXIT WHEN` evita iteraciones innecesarias una vez que se encontró la respuesta.

