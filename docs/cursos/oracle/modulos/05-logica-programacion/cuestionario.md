---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

## Pregunta 2

**¿Por qué es recomendable escribir pseudocódigo antes de programar?**

---

## Pregunta 3

**¿Cuál es la diferencia entre un bucle FOR y un bucle WHILE? Da un ejemplo de cuándo usarías cada uno en PL/SQL.**

---

## Pregunta 4

**¿Qué es la técnica "divide y vencerás"? Aplica el concepto a un problema real de base de datos.**

---

## Pregunta 5

**Explica el patrón "acumulador" y da un ejemplo en PL/SQL con datos de empleados.**

---

## Pregunta 6

**¿Qué estructuras de control conoces? Explica cada una con un ejemplo simple en PL/SQL.**

---

## Pregunta 7

**¿Cómo harías "tracing" (depuración mental) de un bloque PL/SQL? Describe el proceso paso a paso.**

---

## Pregunta 8

**¿Qué son los parámetros IN, OUT e IN OUT en un procedimiento PL/SQL? ¿En qué situación usarías cada uno?**

---

## Pregunta 9

**Si un bloque PL/SQL tiene muchos IF/ELSIF anidados, ¿qué podría estar mal en la lógica o en el modelo de datos? Propón una alternativa.**

---

## Pregunta 10

**Explica cómo la lógica de programación influye en el diseño de tablas. Da un ejemplo concreto con código SQL y PL/SQL.**

---

## Respuestas

### Respuesta 1

Un algoritmo es una secuencia finita de pasos ordenados que resuelven un problema. Tres características fundamentales:

1. **Preciso:** Cada paso debe ser claro y no ambiguo. No puede haber interpretaciones subjetivas como "hacer algo razonable".
2. **Finito:** Debe terminar después de un número limitado de pasos. No puede ejecutarse indefinidamente.
3. **Definido:** Para la misma entrada, siempre produce la misma salida. El resultado es determinístico.

```plsql
-- Ejemplo de algoritmo: Determinar si un empleado recibe bono
DECLARE
  v_salary  NUMBER := 8500;
  v_bono    NUMBER := 0;
BEGIN
  -- Paso 1: Evaluar condición
  -- Paso 2: Calcular bono según regla
  -- Paso 3: Mostrar resultado
  IF v_salary > 10000 THEN
    v_bono := v_salary * 0.15;
  ELSIF v_salary > 5000 THEN
    v_bono := v_salary * 0.10;
  ELSE
    v_bono := v_salary * 0.05;
  END IF;
  DBMS_OUTPUT.PUT_LINE('Bono: ' || v_bono);
END;
/
```

---

### Respuesta 2

Escribir pseudocódigo antes de programar es recomendable porque:

1. **Separa la lógica de la sintaxis:** Permite enfocarse en resolver el problema sin distraerse con los detalles del lenguaje (punto y coma, tipos de datos, sintaxis exacta).
2. **Facilita la comunicación:** El pseudocódigo es entendible por cualquier persona, incluso sin conocimientos de PL/SQL. Sirve para validar la solución con el equipo antes de invertir tiempo en codificar.
3. **Reduce errores:** Detectar fallos lógicos en pseudocódigo es más rápido y barato que depurar código compilado.
4. **Sirve como documentación:** El pseudocódigo documenta la intención del programa, lo que ayuda al mantenimiento futuro.

**Ejemplo:**

```
-- Pseudocódigo: Calcular impuesto
SI salario > 10000 ENTONCES
  impuesto = salario * 0.30
SINO SI salario > 5000 ENTONCES
  impuesto = salario * 0.20
SINO
  impuesto = salario * 0.10
FIN SI
```

El pseudocódigo se traduce directamente a cualquier lenguaje sin cambiar la lógica.

---

### Respuesta 3

| Característica | FOR | WHILE |
|---------------|-----|-------|
| Número de iteraciones | Conocido de antemano | Desconocido, depende de una condición |
| Condición de parada | Automática al llegar al límite | Condición booleana evaluada en cada iteración |
| Estructura | `FOR i IN 1..N LOOP` | `WHILE condicion LOOP` |

**Cuándo usar FOR:**
Cuando sabes exactamente cuántas veces iterar, por ejemplo procesar N registros o un rango fijo.

```plsql
-- Procesar exactamente 10 registros
FOR i IN 1..10 LOOP
  DBMS_OUTPUT.PUT_LINE('Procesando lote ' || i);
END LOOP;
```

**Cuándo usar WHILE:**
Cuando el número de iteraciones depende de una condición que se evalúa en tiempo de ejecución, por ejemplo procesar hasta que se alcance un objetivo.

```plsql
-- Procesar empleados hasta alcanzar un presupuesto
v_presupuesto_usado := 0;
WHILE v_presupuesto_usado < 100000 LOOP
  -- dar aumento al siguiente empleado
  v_presupuesto_usado := v_presupuesto_usado + v_aumento;
END LOOP;
```

---

### Respuesta 4

**"Divide y vencerás"** (divide and conquer) es una técnica que consiste en:

1. Dividir un problema grande y complejo en subproblemas más pequeños y manejables
2. Resolver cada subproblema de forma independiente
3. Combinar las soluciones para resolver el problema original

**Ejemplo aplicado a base de datos: "Migrar datos de un sistema legacy a uno nuevo"**

```
PROBLEMA: Migrar empleados de sistema A a sistema B
—,
—,
—,
—,
—,
```

```plsql
-- Cada subproblema se implementa como un procedimiento independiente
CREATE OR REPLACE PROCEDURE migrar_empleados IS
BEGIN
  extraer_datos_legacy();      -- Subproblema 1
  limpiar_transformar();       -- Subproblema 2
  validar_integridad();        -- Subproblema 3
  insertar_en_destino();       -- Subproblema 4
  generar_reporte_migracion(); -- Subproblema 5
END;
/
```

---

### Respuesta 5

El patrón **acumulador** consiste en inicializar una variable en 0 (o en un valor neutro) y luego sumarle valores en cada iteración de un bucle para obtener un total.

**Estructura genérica:**
```
acumulador := 0
PARA CADA elemento:
  acumulador := acumulador + elemento.valor
FIN PARA
Mostrar acumulador
```

**Ejemplo PL/SQL con datos de empleados:**

```plsql
DECLARE
  v_masa_salarial NUMBER := 0;
  v_empleados     NUMBER := 0;
BEGIN
  FOR r IN (SELECT salary FROM employees WHERE department_id = 60) LOOP
    v_masa_salarial := v_masa_salarial + r.salary;  -- acumular
    v_empleados := v_empleados + 1;                  -- contar
  END LOOP;

  DBMS_OUTPUT.PUT_LINE('Departamento 60:');
  DBMS_OUTPUT.PUT_LINE('  Empleados: ' || v_empleados);
  DBMS_OUTPUT.PUT_LINE('  Masa salarial: ' || v_masa_salarial);
  DBMS_OUTPUT.PUT_LINE('  Promedio: ' || ROUND(v_masa_salarial / v_empleados, 2));
END;
/
```

El acumulador `v_masa_salarial` comienza en 0 y en cada iteración se le suma el salario del empleado actual. Al final contiene la suma total.

---

### Respuesta 6

Las tres estructuras de control fundamentales son:

#### 1. Secuencial
Las instrucciones se ejecutan una después de otra, en orden.

```plsql
BEGIN
  DBMS_OUTPUT.PUT_LINE('Paso 1: Iniciando proceso');
  DBMS_OUTPUT.PUT_LINE('Paso 2: Procesando datos');
  DBMS_OUTPUT.PUT_LINE('Paso 3: Finalizando');
END;
/
```

#### 2. Condicional (Selección)
El flujo se bifurca según una condición.

```plsql
-- IF/ELSE simple
IF v_salario > 10000 THEN
  DBMS_OUTPUT.PUT_LINE('Alto');
ELSE
  DBMS_OUTPUT.PUT_LINE('Estándar');
END IF;

-- CASE (selección múltiple)
CASE v_dia
  WHEN 1 THEN DBMS_OUTPUT.PUT_LINE('Lunes');
  WHEN 2 THEN DBMS_OUTPUT.PUT_LINE('Martes');
  ELSE DBMS_OUTPUT.PUT_LINE('Otro día');
END CASE;
```

#### 3. Iterativa (Bucles)
Repite un bloque de código.

```plsql
-- FOR: número conocido de iteraciones
FOR i IN 1..5 LOOP
  DBMS_OUTPUT.PUT_LINE('Iteración: ' || i);
END LOOP;

-- WHILE: mientras se cumpla condición
WHILE v_contador < 5 LOOP
  v_contador := v_contador + 1;
END LOOP;

-- LOOP/EXIT WHEN: bucle con salida condicional
LOOP
  v_intento := v_intento + 1;
  EXIT WHEN v_intento > 3 OR v_exitoso;
END LOOP;
```

Estas tres estructuras son suficientes para expresar cualquier algoritmo (Teorema de la estructura de Böhm-Jacopini).

---

### Respuesta 7

El **tracing** (depuración mental) consiste en ejecutar el código "manualmente", simulando ser la computadora.

**Proceso paso a paso:**

1. **Preparar datos de entrada:** Elegir valores concretos para las variables de entrada. Incluir valores normales, límite y anómalos.

2. **Crear una tabla de tracing:** Columnas para cada variable y para las condiciones evaluadas.

3. **Ejecutar línea por línea:** Leer cada instrucción y actualizar los valores de las variables como lo haría el motor PL/SQL.

4. **Evaluar condiciones:** Verificar que cada IF, WHILE, EXIT WHEN se evalúa como se espera.

5. **Detectar anomalías:**
   - Variables sin inicializar (NULL inesperado)
   - Bucles infinitos (condición de salida nunca se cumple)
   - Código inalcanzable (condición siempre falsa)
   - Errores de lógica (cálculo equivocado)

**Ejemplo de tabla de tracing:**

```plsql
DECLARE
  v_x NUMBER := 2;
  v_y NUMBER := 3;
  v_z NUMBER;
BEGIN
  IF v_x > v_y THEN
    v_z := v_x;
  ELSE
    v_z := v_y;
  END IF;
  DBMS_OUTPUT.PUT_LINE('Mayor: ' || v_z);
END;
```

| Línea | v_x | v_y | v_z | v_x > v_y? | Acción |
|-------|-----|-----|-----|------------|--------|
| DECLARE | 2 | 3 | NULL | -- | -- |
| IF | 2 | 3 | NULL | FALSE | Ir a ELSE |
| ELSE | 2 | 3 | 3 | -- | v_z := 3 |
| PUT_LINE | 2 | 3 | 3 | -- | Output: "Mayor: 3" |

El tracing confirma que el algoritmo funciona: v_z obtiene el valor 3 (el mayor entre 2 y 3).

---

### Respuesta 8

Los parámetros en PL/SQL definen cómo se pasan los datos entre el llamador y el subprograma:

| Modo | Dirección | Lectura | Escritura | Uso típico |
|------|-----------|---------|-----------|------------|
| **IN** | Llamador → Subprograma | Sí | No | Datos que el procedimiento necesita para trabajar |
| **OUT** | Subprograma → Llamador | No | Sí | Devolver resultados adicionales |
| **IN OUT** | Bidireccional | Sí | Sí | Modificar un valor que entra y devolverlo modificado |

**Ejemplo:**

```plsql
CREATE OR REPLACE PROCEDURE calcular_estadisticas(
  p_dept_id    IN     NUMBER,        -- entra: ID del departamento
  p_promedio   OUT    NUMBER,        -- sale: salario promedio
  p_total      IN OUT NUMBER         -- entra: presupuesto, sale: presupuesto restante
)
IS
  v_suma NUMBER;
  v_count NUMBER;
BEGIN
  SELECT SUM(salary), COUNT(*) INTO v_suma, v_count
    FROM employees WHERE department_id = p_dept_id;

  p_promedio := v_suma / v_count; -- OUT: calculado y devuelto
  p_total := p_total - v_suma;    -- IN OUT: modifica el valor que entró
END;
/
```

**¿Cuándo usar cada uno?**

- **IN:** Cuando el procedimiento necesita información pero no debe modificarla. Es el más común y seguro (por defecto).
- **OUT:** Cuando necesitas devolver más de un valor. Como PL/SQL no permite múltiples RETURN, usas OUT para resultados adicionales.
- **IN OUT:** Cuando quieres que el procedimiento modifique el valor que le pasaste y además quieres leer el valor original. Revisartil para contadores o acumuladores que el llamador quiere seguir usando después.

---

### Respuesta 9

**Problema:** Muchos IF/ELSIF anidados indican que la lógica de decisión está **hardcodeada** en el código, lo que causa:

- **Código difícil de mantener:** Agregar una nueva condición requiere modificar el código fuente, recompilar y desplegar.
- **Código difícil de leer:** La lógica de negocio queda enterrada en anidamientos largos.
- **Duplicación de lógica:** Las mismas condiciones pueden repetirse en múltiples procedimientos.
- **Problema de modelado:** Las reglas de negocio deberían ser datos, no código.

**Alternativa: Tabla de reglas**

En lugar de:

```plsql
IF p_dept = 10 AND p_antiguedad > 5 THEN
  v_bono := 10;
ELSIF p_dept = 10 AND p_antiguedad <= 5 THEN
  v_bono := 5;
ELSIF p_dept = 20 AND p_antiguedad > 10 THEN
  v_bono := 15;
ELSIF p_dept = 20 AND p_antiguedad <= 10 THEN
  v_bono := 7;
-- ... 30 condiciones más
END IF;
```

Crear una tabla de reglas:

```sql
CREATE TABLE reglas_bono (
  dept_id        NUMBER,
  antiguedad_min NUMBER,
  antiguedad_max NUMBER,
  porcentaje     NUMBER
);

INSERT INTO reglas_bono VALUES (10, 0,  5,   5);
INSERT INTO reglas_bono VALUES (10, 6,  99, 10);
INSERT INTO reglas_bono VALUES (20, 0,  10,  7);
INSERT INTO reglas_bono VALUES (20, 11, 99, 15);
```

Y consultarla:

```plsql
SELECT porcentaje INTO v_bono
  FROM reglas_bono
 WHERE dept_id = p_dept
   AND p_antiguedad BETWEEN antiguedad_min AND NVL(antiguedad_max, 999);

v_resultado := p_salario * v_bono / 100;
```

**Ventajas:**
- Agregar una regla nueva = INSERT en la tabla (sin tocar código)
- Las reglas son visibles y auditables
- Se pueden crear interfaces de administración para las reglas
- Una sola consulta reemplaza docenas de IFs

---

### Respuesta 10

La lógica de programación influye en el diseño de tablas porque **la forma en que necesitas procesar los datos determina cómo deben almacenarse**.

**Principios:**

1. **Si un cálculo se repite frecuentemente en el código, considera una columna calculada o vista materializada** para evitar recalcular cada vez.

2. **Si la lógica requiere buscar por ciertos campos repetidamente, necesitas índices** sobre esos campos.

3. **Si la lógica tiene reglas de validación complejas, decide qué va en constraints (CHECK) y qué en triggers/procedimientos.**

**Ejemplo concreto: Sistema de descuentos por antigüedad**

**Sin considerar la lógica en el modelo (MAL):**

```sql
CREATE TABLE empleados (
  id     NUMBER PRIMARY KEY,
  nombre VARCHAR2(100),
  salario NUMBER,
  fecha_ingreso DATE
);
```

```plsql
-- Cada vez que se necesita el descuento, se recalcula la antigüedad
SELECT nombre, salario, fecha_ingreso,
       CASE
         WHEN MONTHS_BETWEEN(SYSDATE, fecha_ingreso) / 12 > 20 THEN salario * 0.80
         WHEN MONTHS_BETWEEN(SYSDATE, fecha_ingreso) / 12 > 10 THEN salario * 0.90
         ELSE salario
       END AS salario_con_descuento
  FROM empleados;
```

**Considerando la lógica en el modelo (BIEN):**

```sql
-- La tabla refleja la necesidad de la lógica de negocio
CREATE TABLE empleados (
  id              NUMBER PRIMARY KEY,
  nombre          VARCHAR2(100),
  salario         NUMBER,
  fecha_ingreso   DATE,
  antiguedad_anios NUMBER GENERATED ALWAYS AS
    (TRUNC(MONTHS_BETWEEN(SYSDATE, fecha_ingreso) / 12)) VIRTUAL
);

-- Índice para búsquedas por antigüedad (la lógica requiere filtrar por esto)
CREATE INDEX idx_emp_antiguedad ON empleados(antiguedad_anios);

-- Tabla de reglas de descuento (las reglas son datos, no código)
CREATE TABLE reglas_descuento (
  antiguedad_min NUMBER,
  antiguedad_max NUMBER,
  descuento_pct  NUMBER
);

INSERT INTO reglas_descuento VALUES (0,  10,  0);
INSERT INTO reglas_descuento VALUES (11, 20, 10);
INSERT INTO reglas_descuento VALUES (21, 99, 20);
```

```plsql
-- La lógica ahora es simple y performante
SELECT e.nombre, e.salario, e.antiguedad_anios,
       e.salario * (1 - NVL(r.descuento_pct, 0) / 100) AS salario_final
  FROM empleados e
  LEFT JOIN reglas_descuento r
    ON e.antiguedad_anios BETWEEN r.antiguedad_min AND r.antiguedad_max;
```

**Resultado:** La lógica de programación reveló que necesitábamos:
- Una columna virtual `antiguedad_anios` (cálculo frecuente)
- Un índice sobre ella (filtro frecuente)
- Una tabla de reglas externa (evitar IFs hardcodeados)

El modelo de datos y la lógica de programación se diseñan juntos, no por separado.

