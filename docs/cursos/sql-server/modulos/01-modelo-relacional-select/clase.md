---
sidebar_label: "Clase"
---

## Modelo Relacional y SELECT

SQL Server organiza la informacion en tablas relacionadas. Una buena base de datos define claves primarias, claves foraneas y restricciones para proteger la integridad.

### SELECT basico

```sql
SELECT Nombre, Precio
FROM Productos
WHERE Activo = 1
ORDER BY Nombre;
```

## Reglas practicas

- Evitar `SELECT *` en consultas de aplicacion.
- Filtrar lo antes posible.
- Nombrar tablas y columnas de forma consistente.
