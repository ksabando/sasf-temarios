---
sidebar_label: "Clase"
---

## ¿Por qué es crucial para PL/SQL?

PL/SQL combina SQL declarativo con lógica procedural imperativa. Esto crea desafíos únicos:

- **Un error común** es intentar resolver todo con SQL cuando se necesita un cursor y lógica iterativa
- **Otro error** es hacer procesamiento row-by-row (fila por fila) de lo que SQL puede resolver en una sola sentencia
- **La lógica correcta** produce código eficiente, mantenible y sin bugs

Un desarrollador PL/SQL con buena lógica de programación:
- Sabe cuándo usar SQL puro vs. PL/SQL procedural
- Escribe bloques que son fáciles de leer y depurar
- Diseña soluciones que escalan bien con el volumen de datos
- Anticipa condiciones de borde y las maneja apropiadamente

---

## Fundamentos de la lógica de programación

### 1. Algoritmos

Un **algoritmo** es una secuencia finita de pasos para resolver un problema.

**Características que debe cumplir:**
- **Preciso:** cada paso debe ser claro y sin ambigüedad
- **Finito:** debe terminar después de un número limitado de pasos
- **Definido:** siempre produce el mismo resultado para la misma entrada
- **Entrada:** puede recibir cero o más datos de entrada
- **Salida:** produce al menos un resultado

**Formas de representar un algoritmo:**
- Pseudocódigo
- Diagrama de flujo
- Código fuente en un lenguaje de programación

**Ejemplo: Algoritmo para calcular el bono de un empleado**

```
INICIO
  Obtener salario del empleado
  SI salario < 5000 ENTONCES
    bono = salario * 0.15
  SINO SI salario < 10000 ENTONCES
    bono = salario * 0.10
  SINO
    bono = salario * 0.05
  FIN SI
  Mostrar bono
FIN
```

**Traducción a PL/SQL:**

```plsql
DECLARE
  v_salario NUMBER := 7500;
  v_bono    NUMBER;
BEGIN
  IF v_salario < 5000 THEN
    v_bono := v_salario * 0.15;
  ELSIF v_salario < 10000 THEN
    v_bono := v_salario * 0.10;
  ELSE
    v_bono := v_salario * 0.05;
  END IF;
  DBMS_OUTPUT.PUT_LINE('Bono calculado: ' || v_bono);
END;
/
```

### 2. Pseudocódigo

Es una descripción en lenguaje natural de un algoritmo. **No tiene sintaxis estricta** pero debe ser claro y consistente.

**Ventajas del pseudocódigo:**
- Diseñar **antes** de codificar ahorra tiempo de depuración
- Ayuda a **comunicar** la lógica a otros miembros del equipo
- Se traduce fácilmente a cualquier lenguaje de programación
- Permite enfocarse en la lógica sin distraerse con la sintaxis

**Ejemplo de pseudocódigo: Buscar empleado por ID**

```
PROCEDIMIENTO buscar_empleado(id_buscado)
  PARA CADA empleado EN tabla_empleados:
    SI empleado.employee_id = id_buscado ENTONCES
      RETORNAR empleado
    FIN SI
  FIN PARA
  RETORNAR NULL  -- no encontrado
FIN PROCEDIMIENTO
```

**Traducción a PL/SQL:**

```plsql
CREATE OR REPLACE FUNCTION buscar_empleado(p_id IN NUMBER)
RETURN employees%ROWTYPE
IS
  v_emp employees%ROWTYPE;
  CURSOR c_emp IS SELECT * FROM employees;
BEGIN
  FOR r_emp IN c_emp LOOP
    IF r_emp.employee_id = p_id THEN
      RETURN r_emp;
    END IF;
  END LOOP;
  RETURN NULL;
END;
/
```

### 3. Diagramas de flujo

Representación gráfica del algoritmo usando símbolos estandarizados:

| Símbolo | Nombre | Significado |
|---------|--------|-------------|
| —valo | Inicio/Fin | Marca el comienzo o final del algoritmo |
| Rectángulo | Proceso | Representa una acción o cálculo |
| Rombo | Decisión | Evalúa una condición (verdadero/falso) |
| Paralelogramo | Entrada/Salida | Lectura de datos o impresión de resultados |
| Flechas | Flujo | Dirección de ejecución de los pasos |

**Ejemplo conceptual en texto:**

```
     [INICIO]
        |
        v
 [Leer número N]
        |
        v
   <N % 2 = 0?>
    /        \
  SI          NO
  /            \
[Mostrar     [Mostrar
 "PAR"]       "IMPAR"]
  \            /
   \          /
    v        v
     [FIN]
```

### 4. Estructuras de control

#### 4.1 Secuencial

Las instrucciones se ejecutan una tras otra, en el orden en que aparecen.

```
```

**Ejemplo PL/SQL:**

```plsql
DECLARE
  v_nombre VARCHAR2(100);
BEGIN
  -- Paso 1: Obtener el nombre
  SELECT first_name || ' ' || last_name
    INTO v_nombre
    FROM employees
   WHERE employee_id = 100;
  -- Paso 2: Convertir a mayúsculas
  v_nombre := UPPER(v_nombre);
  -- Paso 3: Mostrar resultado
  DBMS_OUTPUT.PUT_LINE('Empleado: ' || v_nombre);
END;
/
```

#### 4.2 Condicional (Selección)

El flujo se bifurca según una condición booleana.

**IF simple:**

```plsql
IF v_salario > 10000 THEN
  DBMS_OUTPUT.PUT_LINE('Salario alto');
END IF;
```

**IF/ELSE:**

```plsql
IF v_salario > 10000 THEN
  DBMS_OUTPUT.PUT_LINE('Salario alto');
ELSE
  DBMS_OUTPUT.PUT_LINE('Salario estándar');
END IF;
```

**IF/ELSIF/ELSE:**

```plsql
IF v_nota >= 90 THEN
  v_calificacion := 'A';
ELSIF v_nota >= 80 THEN
  v_calificacion := 'B';
ELSIF v_nota >= 70 THEN
  v_calificacion := 'C';
ELSE
  v_calificacion := 'D';
END IF;
```

**CASE (selección múltiple por valor):**

```plsql
v_dia_semana := TO_CHAR(SYSDATE, 'D');
CASE v_dia_semana
  WHEN '1' THEN v_nombre_dia := 'Domingo';
  WHEN '2' THEN v_nombre_dia := 'Lunes';
  WHEN '3' THEN v_nombre_dia := 'Martes';
  WHEN '4' THEN v_nombre_dia := 'Miércoles';
  WHEN '5' THEN v_nombre_dia := 'Jueves';
  WHEN '6' THEN v_nombre_dia := 'Viernes';
  WHEN '7' THEN v_nombre_dia := 'Sábado';
  ELSE v_nombre_dia := 'Inválido';
END CASE;
```

**CASE expresion (en SQL y PL/SQL):**

```plsql
v_categoria := CASE
  WHEN v_salario > 15000 THEN 'Premium'
  WHEN v_salario > 8000  THEN 'Gold'
  WHEN v_salario > 4000  THEN 'Silver'
  ELSE 'Bronze'
END;
```

#### 4.3 Iterativa (Repetición / Bucles)

Repetir un bloque de código mientras se cumpla una condición.

**FOR (número conocido de iteraciones):**

```plsql
-- FOR numérico
FOR i IN 1..10 LOOP
  DBMS_OUTPUT.PUT_LINE('Iteración: ' || i);
END LOOP;

-- FOR inverso
FOR i IN REVERSE 10..1 LOOP
  DBMS_OUTPUT.PUT_LINE('Cuenta regresiva: ' || i);
END LOOP;
```

**Cursor FOR LOOP (recorrer resultados de consulta):**

```plsql
FOR r_emp IN (
  SELECT employee_id, first_name, salary
    FROM employees
   WHERE department_id = 90
) LOOP
  DBMS_OUTPUT.PUT_LINE(r_emp.first_name || ' - ' || r_emp.salary);
END LOOP;
```

**WHILE (mientras condición sea verdadera):**

```plsql
v_contador := 1;
WHILE v_contador <= 5 LOOP
  DBMS_OUTPUT.PUT_LINE('Contador: ' || v_contador);
  v_contador := v_contador + 1;
END LOOP;
```

**LOOP/EXIT WHEN (bucle con salida condicional):**

```plsql
v_encontrado := FALSE;
v_idx := 1;
LOOP
  EXIT WHEN v_encontrado OR v_idx > v_total;
  IF v_datos(v_idx) = v_buscado THEN
    v_encontrado := TRUE;
    v_posicion := v_idx;
  END IF;
  v_idx := v_idx + 1;
END LOOP;
```

**Cuándo usar cada tipo de bucle en PL/SQL:**

| Estructura | Cuándo usarla |
|-----------|---------------|
| FOR numérico | Cuando sabes exactamente cuántas iteraciones |
| Cursor FOR LOOP | Para procesar todas las filas de una consulta |
| WHILE | Cuando la condición de parada depende de un cálculo |
| LOOP/EXIT WHEN | Cuando hay múltiples condiciones de salida |
| Recursión | Para estructuras jerárquicas (árboles, organigramas) |

---

### 5. Variables y tipos de datos

#### ¿Qué es una variable?

Una variable es un **espacio en memoria** identificado por un nombre, que tiene un tipo de dato y almacena un valor que puede cambiar durante la ejecución.

**Declaración en PL/SQL:**

```plsql
DECLARE
  v_nombre    VARCHAR2(100);        -- texto
  v_edad      NUMBER(3);            -- número (máx 3 dígitos)
  v_salario   NUMBER(10,2);         -- número con 2 decimales
  v_activo    BOOLEAN := TRUE;      -- booleano con valor inicial
  v_fecha     DATE := SYSDATE;      -- fecha con valor por defecto
  v_constante CONSTANT NUMBER := 3.1416; -- constante (no cambia)
BEGIN
  -- ...
END;
/
```

#### Tipos de datos en PL/SQL

**Escalares (simples):**
- `NUMBER(p,s)`: numérico con precisión y escala
- `VARCHAR2(n)`: texto de largo variable
- `CHAR(n)`: texto de largo fijo
- `DATE`: fecha y hora
- `TIMESTAMP`: fecha y hora con fracción de segundo
- `BOOLEAN`: verdadero, falso o NULL
- `CLOB`: texto grande (character large object)
- `BLOB`: datos binarios (binary large object)

**Compuestos:**
- **RECORD:** agrupa múltiples campos de distinto tipo

```plsql
DECLARE
  TYPE t_empleado IS RECORD (
    id      NUMBER,
    nombre  VARCHAR2(100),
    salario NUMBER(10,2)
  );
  v_emp t_empleado;
BEGIN
  v_emp.id := 100;
  v_emp.nombre := 'Steven King';
  v_emp.salario := 24000;
END;
/
```

- **VARRAY:** array de tamaño fijo

```plsql
DECLARE
  TYPE t_numeros IS VARRAY(5) OF NUMBER;
  v_arr t_numeros := t_numeros(10, 20, 30, 40, 50);
BEGIN
  DBMS_OUTPUT.PUT_LINE('Tercer elemento: ' || v_arr(3));
END;
/
```

- **NESTED TABLE:** tabla anidada (tamaño variable)

```plsql
DECLARE
  TYPE t_lista IS TABLE OF VARCHAR2(100);
  v_lista t_lista := t_lista('Oracle', 'PL/SQL', 'SQL');
BEGIN
  v_lista.EXTEND;
  v_lista(4) := 'Desarrollo';
  FOR i IN 1..v_lista.COUNT LOOP
    DBMS_OUTPUT.PUT_LINE(v_lista(i));
  END LOOP;
END;
/
```

- **ASSOCIATIVE ARRAY:** array indexado por clave (PL/SQL table)

```plsql
DECLARE
  TYPE t_salarios IS TABLE OF NUMBER INDEX BY VARCHAR2(100);
  v_sal t_salarios;
BEGIN
  v_sal('King') := 24000;
  v_sal('Kochhar') := 17000;
  DBMS_OUTPUT.PUT_LINE('Salario de King: ' || v_sal('King'));
END;
/
```

#### Scope (alcance) de variables

El scope determina dónde es visible una variable:

```plsql
DECLARE
  v_global VARCHAR2(20) := 'Nivel externo';  -- visible en todo el bloque
BEGIN
  DBMS_OUTPUT.PUT_LINE(v_global);
  DECLARE
    v_local VARCHAR2(20) := 'Nivel interno'; -- solo visible en sub-bloque
  BEGIN
    DBMS_OUTPUT.PUT_LINE(v_global); -- OK
    DBMS_OUTPUT.PUT_LINE(v_local);  -- OK
  END;
  -- DBMS_OUTPUT.PUT_LINE(v_local); -- ERROR: fuera de scope
END;
/
```

#### Inicialización

**Siempre inicializar las variables** para evitar comportamientos inesperados con NULL:

```plsql
-- MAL: puede causar problemas si se usa en cálculos
DECLARE
  v_total NUMBER;
BEGIN
  v_total := v_total + 100; -- v_total es NULL, resultado = NULL
END;
/

-- BIEN: inicializar explícitamente
DECLARE
  v_total NUMBER := 0;
BEGIN
  v_total := v_total + 100; -- v_total = 100
END;
/
```

---

### 6. Operadores

#### Aritméticos

```plsql
v_resultado := 10 + 5;     -- suma: 15
v_resultado := 10 - 5;     -- resta: 5
v_resultado := 10 * 5;     -- multiplicación: 50
v_resultado := 10 / 5;     -- división: 2
v_resultado := MOD(10, 3); -- módulo (resto): 1
v_resultado := 2 ** 3;     -- potencia: 8
```

#### Relacionales (comparación)

```plsql
IF a = b THEN ...          -- igual
IF a <> b THEN ...         -- distinto
IF a != b THEN ...         -- distinto (alternativo)
IF a < b THEN ...          -- menor que
IF a > b THEN ...          -- mayor que
IF a <= b THEN ...         -- menor o igual
IF a >= b THEN ...         -- mayor o igual
IF a BETWEEN x AND y THEN  -- entre x e y (inclusive)
IF a IN (1, 2, 3) THEN    -- pertenece a un conjunto
IF texto LIKE '%ABC%' THEN -- patrón de texto
IF campo IS NULL THEN      -- es nulo
IF campo IS NOT NULL THEN  -- no es nulo
```

#### Lógicos

```plsql
IF condicion1 AND condicion2 THEN  -- ambas verdaderas
IF condicion1 OR condicion2 THEN   -- al menos una verdadera
IF NOT condicion THEN              -- negación
```

**Orden de evaluación (precedencia):** NOT → AND → OR

```plsql
-- Usar paréntesis para claridad
IF (v_edad >= 18 AND v_edad <= 65) OR v_es_estudiante THEN
  DBMS_OUTPUT.PUT_LINE('Aplica descuento');
END IF;
```

#### Concatenación de texto

```plsql
v_nombre_completo := first_name || ' ' || last_name;
v_mensaje := 'El empleado ' || v_id || ' gana ' || TO_CHAR(v_salario);
```

---

### 7. Funciones y Procedimientos

#### Diferencia fundamental

| Aspecto | Función | Procedimiento |
|---------|---------|---------------|
| Retorna valor | Sí (obligatorio) | No (opcional vía OUT) |
| Uso en SQL | Sí | No |
| Propósito | Calcular y devolver | Ejecutar acciones |
| RETURN | RETURN valor; | RETURN; (solo para salir) |

#### Función

```plsql
CREATE OR REPLACE FUNCTION calcular_bono(
  p_salario    IN NUMBER,
  p_porcentaje IN NUMBER DEFAULT 10
) RETURN NUMBER
IS
  v_bono NUMBER;
BEGIN
  v_bono := p_salario * (p_porcentaje / 100);
  RETURN v_bono;
END calcular_bono;
/

-- Uso:
SELECT employee_id, salary, calcular_bono(salary, 15) AS bono
  FROM employees
 WHERE department_id = 90;
```

#### Procedimiento

```plsql
CREATE OR REPLACE PROCEDURE actualizar_salario(
  p_emp_id    IN  employees.employee_id%TYPE,
  p_porcentaje IN  NUMBER,
  p_nuevo_sal OUT NUMBER
)
IS
BEGIN
  UPDATE employees
     SET salary = salary * (1 + p_porcentaje / 100)
   WHERE employee_id = p_emp_id
  RETURNING salary INTO p_nuevo_sal;
  COMMIT;
END actualizar_salario;
/

-- Uso:
DECLARE
  v_nuevo NUMBER;
BEGIN
  actualizar_salario(100, 10, v_nuevo);
  DBMS_OUTPUT.PUT_LINE('Nuevo salario: ' || v_nuevo);
END;
/
```

#### Parámetros: IN, OUT, IN OUT

```plsql
CREATE OR REPLACE PROCEDURE demo_parametros(
  p_entrada    IN  NUMBER,      -- solo lectura
  p_salida     OUT NUMBER,      -- solo escritura
  p_ent_sal    IN OUT NUMBER    -- lectura y escritura
)
IS
BEGIN
  p_salida := p_entrada * 2;
  p_ent_sal := p_ent_sal + 100;
END;
/
```

| Modo | Descripción | Cuándo usar |
|------|-------------|-------------|
| IN | Solo lectura dentro del subprograma | Datos que el procedimiento necesita |
| OUT | Solo escritura; se devuelve al llamador | Resultados adicionales |
| IN OUT | Lectura y escritura | Valor que se modifica y se devuelve |

#### Abstracción

Ocultar la complejidad detrás de un nombre simple:

```plsql
-- Sin abstracción: lógica compleja expuesta
BEGIN
  FOR r IN (SELECT * FROM employees) LOOP
    IF r.hire_date < ADD_MONTHS(SYSDATE, -120) THEN
      IF r.salary < 5000 THEN
        -- cálculo complejo...
      END IF;
    END IF;
  END LOOP;
END;

-- Con abstracción: lógica encapsulada
BEGIN
  FOR r IN (SELECT * FROM employees) LOOP
    IF es_empleado_antiguo(r.hire_date) THEN
      ajustar_salario_antiguedad(r.employee_id);
    END IF;
  END LOOP;
END;
```

---

### 8. Descomposición de problemas (Divide y vencerás)

Técnica fundamental: dividir un problema grande en subproblemas más pequeños y manejables.

**Metodología:**

1. **Entender el problema**: ¿qué datos entran? ¿qué resultado se espera?
2. **Identificar las partes**: dividir en subproblemas independientes
3. **Resolver cada parte por separado**: diseñar, probar
4. **Integrar las soluciones**: unir las partes en el programa final
5. **Probar con casos de ejemplo**: verificar con datos reales y casos borde

**Ejemplo: "Generar reporte de nómina"**

```
PROBLEMA PRINCIPAL: Generar reporte de nómina
—,
—,
—,
—,
—,
```

**Implementación en PL/SQL:**

```plsql
CREATE OR REPLACE PROCEDURE generar_reporte_nomina
IS
  -- Subproblema 2: función de bono
  FUNCTION calcular_bono(p_sal NUMBER, p_rating CHAR) RETURN NUMBER IS
  BEGIN
    RETURN CASE p_rating
      WHEN 'A' THEN p_sal * 0.20
      WHEN 'B' THEN p_sal * 0.10
      WHEN 'C' THEN p_sal * 0.05
      ELSE 0
    END;
  END;
  -- Subproblema 3: función de deducción
  FUNCTION calcular_deduccion(p_total NUMBER) RETURN NUMBER IS
  BEGIN
    RETURN p_total * 0.15; -- 15% impuesto + seguro simplificado
  END;
  v_linea VARCHAR2(200);
BEGIN
  -- Subproblema 1 + 4: obtener y formatear en un solo recorrido
  FOR r_emp IN (
    SELECT employee_id, first_name, last_name, salary
      FROM employees
  ) LOOP
    -- Subproblema 2
    v_total := r_emp.salary + calcular_bono(r_emp.salary, 'B');
    -- Subproblema 3
    v_neto := v_total - calcular_deduccion(v_total);
    -- Subproblema 4
    v_linea := LPAD(r_emp.employee_id, 6) || ' | ' ||
               RPAD(r_emp.first_name || ' ' || r_emp.last_name, 25) || ' | ' ||
               TO_CHAR(v_neto, '$999,999.00');
    DBMS_OUTPUT.PUT_LINE(v_linea);
  END LOOP;
END generar_reporte_nomina;
/
```

---

### 9. Depuración mental (Tracing)

Ejecutar el código "en papel" (o mentalmente) con valores de prueba, rastreando el valor de cada variable en cada paso.

**Proceso de tracing:**

1. Elegir datos de entrada de prueba
2. Recorrer el código línea por línea
3. Anotar el valor de cada variable después de cada instrucción
4. Verificar que las condiciones se evalúan como se espera
5. Detectar: loops infinitos, condiciones nunca alcanzadas, variables sin inicializar

**Ejemplo de tabla de tracing:**

```plsql
DECLARE
  v_i     NUMBER := 1;
  v_suma  NUMBER := 0;
BEGIN
  WHILE v_i <= 3 LOOP
    v_suma := v_suma + v_i;
    v_i := v_i + 1;
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('Suma: ' || v_suma);
END;
```

Tabla de tracing:

| Iteración | v_i (inicio) | v_suma (inicio) | v_suma := v_suma + v_i | v_i := v_i + 1 | ¿v_i <= 3? |
|-----------|-------------|-----------------|------------------------|----------------|------------|
| 1 | 1 | 0 | 1 | 2 | SÍ |
| 2 | 2 | 1 | 3 | 3 | SÍ |
| 3 | 3 | 3 | 6 | 4 | NO → SALE |

Resultado: Suma = 6

**Tracing de un bloque con cursores:**

```plsql
DECLARE
  v_contador NUMBER := 0;
BEGIN
  FOR r IN (SELECT salary FROM employees WHERE department_id = 10) LOOP
    v_contador := v_contador + 1;
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('Total empleados dept 10: ' || v_contador);
END;
```

| Iteración | r.salary | v_contador (inicio) | v_contador (fin) |
|-----------|----------|---------------------|------------------|
| Antes del loop | -- | 0 | 0 |
| 1 | 4400 | 0 | 1 |
| 2 | 13000 | 1 | 2 |
| Sale del loop | -- | 2 | 2 |

---

### 10. Patrones de lógica comunes

#### 10.1 Acumulador

Acumular (sumar) valores de una colección:

```plsql
DECLARE
  v_total NUMBER := 0;
BEGIN
  FOR r IN (SELECT salary FROM employees WHERE department_id = 90) LOOP
    v_total := v_total + r.salary;
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('Suma total de salarios: ' || v_total);
END;
/
```

#### 10.2 Búsqueda

Encontrar un elemento que cumpla una condición:

```plsql
DECLARE
  v_encontrado BOOLEAN := FALSE;
  v_nombre     VARCHAR2(100);
BEGIN
  FOR r IN (SELECT first_name, last_name, salary FROM employees) LOOP
    IF r.salary > 15000 THEN
      v_encontrado := TRUE;
      v_nombre := r.first_name || ' ' || r.last_name;
      EXIT;  -- salir al encontrar el primero
    END IF;
  END LOOP;
  IF v_encontrado THEN
    DBMS_OUTPUT.PUT_LINE('Encontrado: ' || v_nombre);
  ELSE
    DBMS_OUTPUT.PUT_LINE('No se encontró ningún empleado con salario > 15000');
  END IF;
END;
/
```

#### 10.3 Máximo/Mínimo

Encontrar el valor extremo en una colección:

```plsql
DECLARE
  v_max_sal   NUMBER := 0;
  v_emp_max   VARCHAR2(100);
BEGIN
  FOR r IN (SELECT first_name, last_name, salary FROM employees) LOOP
    IF r.salary > v_max_sal THEN
      v_max_sal := r.salary;
      v_emp_max := r.first_name || ' ' || r.last_name;
    END IF;
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('Empleado con mayor salario: ' || v_emp_max);
  DBMS_OUTPUT.PUT_LINE('Salario: ' || v_max_sal);
END;
/
```

#### 10.4 Contador condicional

Contar elementos que cumplen una o varias condiciones:

```plsql
DECLARE
  v_altos  NUMBER := 0;
  v_medios NUMBER := 0;
  v_bajos  NUMBER := 0;
BEGIN
  FOR r IN (SELECT salary FROM employees) LOOP
    IF r.salary > 10000 THEN
      v_altos := v_altos + 1;
    ELSIF r.salary >= 5000 THEN
      v_medios := v_medios + 1;
    ELSE
      v_bajos := v_bajos + 1;
    END IF;
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('Salarios > 10000:    ' || v_altos);
  DBMS_OUTPUT.PUT_LINE('Salarios 5000-10000: ' || v_medios);
  DBMS_OUTPUT.PUT_LINE('Salarios < 5000:     ' || v_bajos);
END;
/
```

#### 10.5 Intercambio (Swap)

Intercambiar los valores de dos variables:

```plsql
DECLARE
  v_a    NUMBER := 10;
  v_b    NUMBER := 20;
  v_temp NUMBER;
BEGIN
  DBMS_OUTPUT.PUT_LINE('Antes: a=' || v_a || ', b=' || v_b);
  -- Swap
  v_temp := v_a;
  v_a := v_b;
  v_b := v_temp;
  DBMS_OUTPUT.PUT_LINE('Después: a=' || v_a || ', b=' || v_b);
END;
/
```

#### 10.6 Bandera (Flag)

Variable booleana que indica si ocurrió un evento durante el procesamiento:

```plsql
DECLARE
  v_hay_error BOOLEAN := FALSE;
BEGIN
  FOR r IN (SELECT employee_id, salary FROM employees) LOOP
    IF r.salary < 0 THEN
      v_hay_error := TRUE;
      DBMS_OUTPUT.PUT_LINE('Error: salario negativo para empleado ' || r.employee_id);
    END IF;
  END LOOP;
  IF v_hay_error THEN
    DBMS_OUTPUT.PUT_LINE('Se encontraron errores en los datos.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('Todos los salarios son válidos.');
  END IF;
END;
/
```

---

### MODELADO: Lógica de programación y diseño de tablas

Una buena lógica de programación impacta directamente el modelado de tablas:

#### Principio 1: Si el código tiene muchos IF anidados, el modelo puede necesitar una tabla de reglas

```plsql
-- MAL: lógica hardcodeada con muchos IF
IF p_dept = 10 AND p_antiguedad > 5 THEN
  v_bono := p_salario * 0.10;
ELSIF p_dept = 10 AND p_antiguedad <= 5 THEN
  v_bono := p_salario * 0.05;
ELSIF p_dept = 20 AND p_antiguedad > 5 THEN
  v_bono := p_salario * 0.08;
-- ... y así 30 combinaciones más
END IF;

-- BIEN: tabla de reglas + consulta simple
-- Tabla: BONO_REGLA (dept_id, antiguedad_min, antiguedad_max, porcentaje)
SELECT porcentaje
  INTO v_pct
  FROM bono_regla
 WHERE dept_id = p_dept
   AND p_antiguedad BETWEEN antiguedad_min AND NVL(antiguedad_max, 99);
v_bono := p_salario * v_pct / 100;
```

#### Principio 2: Si un cálculo se repite, considerar columna calculada o vista materializada

```plsql
-- Si siempre calculas antigüedad: TRUNC(MONTHS_BETWEEN(SYSDATE, hire_date) / 12)
-- Considera agregar una columna virtual o calcularla en una vista
CREATE OR REPLACE VIEW v_empleados_detalle AS
SELECT employee_id, first_name, last_name, hire_date,
       TRUNC(MONTHS_BETWEEN(SYSDATE, hire_date) / 12) AS antiguedad_anios
  FROM employees;
```

#### Principio 3: La lógica determina qué validaciones van en CHECK vs en PL/SQL

```sql
-- CHECK: validaciones simples e invariables
ALTER TABLE employees ADD CONSTRAINT chk_salary_positive
  CHECK (salary > 0);

-- PL/SQL: validaciones complejas que dependen de otras tablas o requieren contexto
CREATE OR REPLACE TRIGGER trg_validar_salario
BEFORE INSERT OR UPDATE ON employees
FOR EACH ROW
DECLARE
  v_max_sal NUMBER;
BEGIN
  SELECT MAX(salary) INTO v_max_sal FROM employees
   WHERE department_id = :NEW.department_id;
  IF :NEW.salary > v_max_sal * 2 THEN
    RAISE_APPLICATION_ERROR(-20001, 'Salario excede el doble del máximo del departamento');
  END IF;
END;
/
```

#### Principio 4: Un algoritmo claro revela qué índices y constraints necesita el modelo

```
"Necesito buscar empleados por departamento y por fecha de contratación"
→ Índice compuesto: CREATE INDEX idx_emp_dept_hire ON employees(department_id, hire_date);

"Necesito garantizar que no haya dos empleados con el mismo email"
→ Constraint único: ALTER TABLE employees ADD CONSTRAINT uk_email UNIQUE (email);

"Necesito que cada departamento tenga al menos un empleado"
→ Esto NO se puede garantizar con constraints simples → requiere lógica en PL/SQL
```

---

## Resumen: Flujo de trabajo recomendado

1. **Entender el problema** (entrada, salida, restricciones)
2. **Escribir pseudocódigo** de la solución
3. **Hacer tracing mental** con datos de prueba
4. **Identificar subproblemas** y resolverlos por separado
5. **Traducir a PL/SQL** cada subproblema
6. **Integrar** y probar el programa completo
7. **Revisar** si el modelo de datos soporta la lógica eficientemente
8. **Optimizar**: ¿lo que hice en PL/SQL se puede hacer en SQL? ¿y viceversa?

---

*"Primero resuelve el problema. Luego escribe el código." — John Johnson*
