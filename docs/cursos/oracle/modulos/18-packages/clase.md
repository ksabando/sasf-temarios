---
sidebar_label: "Clase"
---

## 5. Sinónimos para Packages

Los sinónimos crean alias para objetos de base de datos. Permiten ocultar la ubicación real del objeto y simplificar el acceso.

### Sinónimo Privado

Visible solo para el usuario que lo crea.

```sql
CREATE SYNONYM tareas_pkg FOR pkg_tareas;

-- Ahora se puede invocar sin el prefijo del dueño
EXEC tareas_pkg.asignar(100, 5);
```

### Sinónimo Público

Visible para todos los usuarios de la base de datos.

```sql
CREATE PUBLIC SYNONYM pkg_pacientes FOR pac.pkg_pacientes;

-- Cualquier usuario puede invocar:
BEGIN
    pkg_pacientes.crear_paciente(...);
END;
/
```

### Ventajas de usar sinónimos

| Ventaja         | Descripción                                         |
|-----------------|-----------------------------------------------------|
| Abstracción     | Oculta el esquema propietario del objeto            |
| Portabilidad    | Si el package se mueve a otro esquema, solo cambia el sinónimo |
| Seguridad       | Se puede otorgar acceso al sinónimo sin revelar el esquema origen |
| Simplificación  | El usuario no necesita conocer el dueño del objeto  |

### Sinónimos para DBLinks

```sql
-- Crear sinónimo para objetos remotos
CREATE SYNONYM pacientes_suc FOR PACIENTES@dblink_sucursal;

-- El usuario trabaja como si fuera local
SELECT * FROM pacientes_suc;
```
