---
sidebar_label: "Clase"
---

## 3. TABLE MODELING — CHECK constraints vs Lógica PL/SQL

Una de las decisiones más importantes en el modelado es determinar **dónde** implementar cada regla de negocio.

### Reglas que van como CHECK constraint

- Validan una sola fila/columna sin consultar otras tablas.
- No requieren subconsultas ni lógica procedural.
- Se ejecutan a nivel de base de datos, son más rápidas y siempre se aplican (incluso desde INSERT directo).

| Regla | CHECK |
|---|---|
| `precio > 0` | `CHECK (precio > 0)` |
| `anio >= 1900` | `CHECK (anio_publicacion >= 1900)` |
| `estado IN ('A','I','S')` | `CHECK (estado IN ('A','I','S'))` |
| `fecha_devolucion > fecha_prestamo` | `CHECK (fecha_devolucion > fecha_prestamo)` |

### Reglas que van en PL/SQL

- Requieren consultar **otras filas** u **otras tabas** (COUNT, SUM, subconsultas).
- Implican lógica condicional compleja (cálculos, actualizaciones en cascada).
- Dependen del estado del sistema en un momento dado.

| Regla | PL/SQL |
|---|---|
| "Un miembro no puede tener más de 5 libros prestados" | Contar préstamos activos antes de insertar |
| "Si libro perdido, multa = precio * 3" | Calcular en función del estado |
| "Aplicar descuento del 10% si el miembro tiene más de 10 préstamos" | Contar historial y ajustar precio |
| "Notificar al administrador si un libro no se devuelve en 30 días" | Job programado o lógica en UPDATE |

### Decisión del modelador

1. ¿La regla se aplica a una sola fila? → **CHECK**
2. ¿Requiere COUNT, SUM, AVG sobre otros registros? → **PL/SQL**
3. ¿Es una validación de formato o rango? → **CHECK**
4. ¿Implica lógica de negocio variable que puede cambiar? → **PL/SQL**
5. ¿Debe aplicar incluso si se hace INSERT directo desde SQL? → **CHECK** (en PL/SQL habría que centralizar todo)

---

## 4. Ejemplos integrados

### Recorrer miembros y clasificar su estado con CASE searched

```sql
BEGIN
    FOR r IN (SELECT id_miembro, nombre, estado_membresia FROM miembros) LOOP
        CASE
            WHEN r.estado_membresia = 'A' THEN
                DBMS_OUTPUT.PUT_LINE(r.nombre || ' está Activo');
            WHEN r.estado_membresia = 'I' THEN
                DBMS_OUTPUT.PUT_LINE(r.nombre || ' está Inactivo');
            WHEN r.estado_membresia = 'S' THEN
                DBMS_OUTPUT.PUT_LINE(r.nombre || ' está Suspendido');
            ELSE
                DBMS_OUTPUT.PUT_LINE(r.nombre || ' tiene estado desconocido');
        END CASE;
    END LOOP;
END;
/

---

## 5. Temas Complementarios — Objetos de Base de Datos

### Secuencias (Sequences)

Las secuencias generan valores numéricos únicos y secuenciales, ideales para claves primarias.

```sql
-- Crear una secuencia
CREATE SEQUENCE seq_id_miembro
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Usar NEXTVAL (obtiene el siguiente valor)
INSERT INTO miembros (id_miembro, nombre, fecha_registro, estado_membresia)
VALUES (seq_id_miembro.NEXTVAL, 'Nuevo Miembro', SYSDATE, 'A');

-- Usar CURRVAL (obtiene el valor actual de la sesión)
SELECT seq_id_miembro.CURRVAL FROM dual;
```

**Parámetros importantes:**

| Parámetro | Descripción |
|-----------|-------------|
| `START WITH` | Valor inicial de la secuencia |
| `INCREMENT BY` | Paso entre valores (positivo ascendente, negativo descendente) |
| `MINVALUE` / `MAXVALUE` | Límites del rango |
| `CACHE n` | Pre-genera n valores en memoria para mejorar rendimiento |
| `CYCLE` / `NOCYCLE` | Indica si se reinicia al llegar al límite |
| `ORDER` / `NOORDER` | Garantiza orden de generación en RAC |

### Sinónimos (Synonyms)

Un sinónimo es un alias para un objeto de base de datos (tabla, vista, secuencia, etc.). Permite ocultar el nombre real y el esquema.

**Sinónimo público:** Accesible por todos los usuarios.

```sql
CREATE PUBLIC SYNONYM libros FOR biblioteca.libros;
```

**Sinónimo privado:** Accesible solo por el usuario que lo crea.

```sql
CREATE SYNONYM lib FOR libros;
```

Una vez creado el sinónimo, se puede consultar sin calificar con el esquema:

```sql
SELECT * FROM libros;  -- Funciona gracias al sinónimo público
```

**Usos comunes:**
- Simplificar nombres largos o complejos.
- Ocultar la ubicación real del objeto (esquema, base de datos en un dblink).
- Facilitar migraciones (el sinónimo apunta al nuevo objeto y las aplicaciones siguen funcionando).

### Database Links (DBLINKS)

Un dblink es un objeto que permite acceder a objetos de otra base de datos Oracle remota.

```sql
-- Crear un dblink a otra base de datos
CREATE DATABASE LINK bd_remota
    CONNECT TO usuario_remoto IDENTIFIED BY password_remoto
    USING 'nombre_conexion_remota';
```

Una vez creado, se puede consultar tablas remotas añadiendo `@nombre_dblink`:

```sql
SELECT * FROM libros@bd_remota;

-- También se pueden combinar con sinónimos
CREATE SYNONYM libros_remotos FOR libros@bd_remota;
SELECT * FROM libros_remotos;
```

**Consideraciones:**
- El usuario debe tener privilegio `CREATE DATABASE LINK`.
- Para acceder a través del dblink se requiere una conexión de red entre ambas bases.
- Las consultas remotas pueden ser más lentas que las locales.
- Se pueden usar en sentencias INSERT, UPDATE, DELETE y SELECT.

### Diccionario de datos (Data Dictionary)

Oracle almacena metadatos sobre la estructura de la base de datos en vistas del diccionario de datos. Se clasifican en tres prefijos:

| Prefijo | Contenido |
|---------|-----------|
| `DBA_` | Todos los objetos de la base de datos (requiere privilegios DBA) |
| `ALL_` | Objetos accesibles por el usuario actual (propios + con privilegios) |
| `USER_` | Solo los objetos que pertenecen al usuario actual |

```sql
-- USER_: tablas del usuario actual
SELECT table_name, tablespace_name FROM user_tables;

-- ALL_: tablas a las que el usuario actual tiene acceso
SELECT owner, table_name FROM all_tables WHERE owner = 'BIBLIOTECA';

-- DBA_: tablas de todos los esquemas (requiere privilegios DBA)
SELECT owner, table_name, tablespace_name FROM dba_tables;

-- Otras vistas útiles del diccionario
SELECT * FROM user_sequences;     -- Secuencias del usuario
SELECT * FROM user_synonyms;      -- Sinónimos del usuario
SELECT * FROM user_db_links;      -- DBLinks del usuario
SELECT * FROM user_views;         -- Vistas del usuario
SELECT * FROM user_constraints;   -- Constraints del usuario
SELECT * FROM user_tab_columns;   -- Columnas de las tablas
SELECT * FROM user_objects;       -- Todos los objetos del usuario
```
```
