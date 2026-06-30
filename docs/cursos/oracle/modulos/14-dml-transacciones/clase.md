---
sidebar_label: "Clase"
---

## 6. Secuencias (SEQUENCE)

Las secuencias generan valores numéricos únicos de forma automática. Ideales para claves primarias.

```sql
CREATE SEQUENCE SEQ_PACIENTES
    START WITH     1
    INCREMENT BY   1
    MINVALUE       1
    MAXVALUE       999999999
    NOCACHE
    NOCYCLE;

-- Obtener el siguiente valor
SELECT SEQ_PACIENTES.NEXTVAL FROM DUAL;

-- Obtener el valor actual de la sesión
SELECT SEQ_PACIENTES.CURRVAL FROM DUAL;
```

### Uso en INSERT

```sql
INSERT INTO PACIENTES (id, nombre)
VALUES (SEQ_PACIENTES.NEXTVAL, 'María García')
RETURNING id INTO v_id;
```

| Cláusula       | Descripción                                    |
|----------------|------------------------------------------------|
| `START WITH`   | Primer valor de la secuencia                   |
| `INCREMENT BY` | Paso entre valores (negativo para descendente) |
| `MINVALUE`     | Valor mínimo permitido                         |
| `MAXVALUE`     | Valor máximo permitido                         |
| `CACHE`        | Número de valores precargados en memoria       |
| `CYCLE`        | Reinicia cuando alcanza MAXVALUE               |

## 7. Subconsultas Correlacionadas

Una subconsulta correlacionada hace referencia a columnas de la consulta externa. Se evalúa una vez por cada fila externa.

```sql
-- Pacientes con más citas que el promedio
SELECT p.nombre,
       (SELECT COUNT(*) FROM CITAS c WHERE c.paciente_id = p.id) AS total_citas
FROM PACIENTES p
WHERE (SELECT COUNT(*) FROM CITAS c WHERE c.paciente_id = p.id) >
      (SELECT AVG(COUNT(*)) FROM CITAS GROUP BY paciente_id);
```

### UPDATE con subconsulta correlacionada

```sql
-- Actualizar médicos con el total de citas
UPDATE MEDICOS m
SET total_citas = (SELECT COUNT(*) FROM CITAS c WHERE c.medico_id = m.id)
WHERE EXISTS (SELECT 1 FROM CITAS c WHERE c.medico_id = m.id);
```

### DELETE con subconsulta correlacionada

```sql
-- Eliminar pacientes sin ninguna cita
DELETE FROM PACIENTES p
WHERE NOT EXISTS (SELECT 1 FROM CITAS c WHERE c.paciente_id = p.id);
```
