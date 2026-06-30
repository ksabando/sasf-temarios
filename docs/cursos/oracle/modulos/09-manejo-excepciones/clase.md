---
sidebar_label: "Clase"
---

# Módulo 04: Manejo de Excepciones e Integridad Referencial

## 1. Excepciones en PL/SQL

### Estructura EXCEPTION

```sql
BEGIN
    -- Código que puede lanzar error
EXCEPTION
    WHEN excepcion1 THEN
        -- Manejo
    WHEN excepcion2 THEN
        -- Manejo
    WHEN OTHERS THEN
        -- Captura cualquier otra excepción
END;
/
```

### Excepciones predefinidas más comunes

| Excepción | ORA | ¿Cuándo ocurre? |
|---|---|---|
| `NO_DATA_FOUND` | ORA-01403 | `SELECT ... INTO` devuelve 0 filas |
| `TOO_MANY_ROWS` | ORA-01422 | `SELECT ... INTO` devuelve más de 1 fila |
| `DUP_VAL_ON_INDEX` | ORA-00001 | INSERT o UPDATE viola PK o UNIQUE |
| `ZERO_DIVIDE` | ORA-01476 | División por cero |
| `VALUE_ERROR` | ORA-06502 | Error aritmético o de conversión/truncamiento |
| `CASE_NOT_FOUND` | ORA-06592 | Ninguna rama de WHEN se cumple y no hay ELSE |
| `LOGIN_DENIED` | ORA-01017 | Credenciales inválidas |
| `STORAGE_ERROR` | ORA-06500 | Memoria agotada |

### RAISE_APPLICATION_ERROR

Permite lanzar errores personalizados con código entre -20000 y -20999:

```sql
RAISE_APPLICATION_ERROR(-20001, 'El miembro no puede tener más de 5 libros prestados.');
```

### PRAGMA EXCEPTION_INIT

Asocia un código de error Oracle no predefinido a un nombre simbólico:

```sql
DECLARE
    e_fk_violated EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_violated, -02292);
BEGIN
    DELETE FROM libros WHERE isbn = '978-987-1234-01-1';
EXCEPTION
    WHEN e_fk_violated THEN
        DBMS_OUTPUT.PUT_LINE('No se puede eliminar: hay préstamos asociados al libro.');
END;
/
```

---

## 2. TABLE MODELING — Integridad Referencial

### Tipos de constraints y las excepciones que generan

| Constraint | Propósito | Excepción en PL/SQL |
|---|---|---|
| `PRIMARY KEY` | Identifica cada fila de forma única | `DUP_VAL_ON_INDEX` (al insertar duplicado) |
| `UNIQUE` | Garantiza unicidad en columna(s) | `DUP_VAL_ON_INDEX` (al violar unicidad) |
| `FOREIGN KEY` | Garantiza integridad referencial | ORA-02291 (hijo sin padre) / ORA-02292 (padre con hijos) |
| `NOT NULL` | Evita valores nulos | `VALUE_ERROR` o constraint ORA-01400 |
| `CHECK` | Valida condición en fila | ORA-02290 (violación de CHECK) |

### Diseñar tablas pensando en excepciones

Cada operación DML puede lanzar excepciones. El diseñador debe anticipar:

| Operación | Excepción posible | Causa |
|---|---|---|
| `INSERT INTO prestamos (isbn, ...) VALUES (...)` | ORA-02291 | ISBN no existe en LIBROS (FK violada) |
| `INSERT INTO libros VALUES (...)` | ORA-00001 | ISBN duplicado (PK violada) |
| `UPDATE miembros SET id_miembro = ...` | ORA-00001 | Nuevo ID duplicado (PK violada) |
| `DELETE FROM libros WHERE isbn = ...` | ORA-02292 | Hay préstamos que referencian el libro (FK violada) |

### Ejemplo de modelo físico — Tablas relacionadas

```sql
CREATE TABLE libros (
    isbn   VARCHAR2(13) PRIMARY KEY,
    titulo VARCHAR2(200) NOT NULL
);

CREATE TABLE miembros (
    id_miembro NUMBER PRIMARY KEY,
    nombre     VARCHAR2(100) NOT NULL
);

CREATE TABLE prestamos (
    id_prestamo    NUMBER PRIMARY KEY,
    isbn           VARCHAR2(13) NOT NULL,
    id_miembro     NUMBER NOT NULL,
    fecha_prestamo DATE DEFAULT SYSDATE,
    estado         CHAR(1) CHECK (estado IN ('P','D','R')),  -- Pendiente, Devuelto, Perdido
    CONSTRAINT fk_prestamo_libro   FOREIGN KEY (isbn)       REFERENCES libros(isbn),
    CONSTRAINT fk_prestamo_miembro FOREIGN KEY (id_miembro) REFERENCES miembros(id_miembro)
);
```

### Buenas prácticas

1. **Capturar excepciones específicas**, no usar `WHEN OTHERS` como regla general.
2. **Usar `SQL%ROWCOUNT`** después de DML para verificar filas afectadas.
3. **RAISE_APPLICATION_ERROR** para errores de negocio con mensajes claros.
4. **Log de errores**: insertar en tabla de log los errores inesperados.

```sql
BEGIN
    INSERT INTO prestamos (id_prestamo, isbn, id_miembro)
    VALUES (1, 'ISBN-INEXISTENTE', 1);
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        RAISE_APPLICATION_ERROR(-20002, 'El préstamo ya existe.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error inesperado: ' || SQLERRM);
        RAISE;  -- Relanzar la excepción
END;
/
```
