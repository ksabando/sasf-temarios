---
sidebar_label: "Clase"
---

## Agregaciones, Vistas y Procedimientos

Las agregaciones resumen datos. Las vistas encapsulan consultas. Los procedimientos almacenados permiten ejecutar operaciones parametrizadas dentro de la base.

### Reporte ejemplo

```sql
SELECT CategoriaId, COUNT(*) AS TotalProductos, AVG(Precio) AS PrecioPromedio
FROM Productos
GROUP BY CategoriaId;
```

## Uso recomendado

- Vista: consulta reutilizable de lectura.
- Procedimiento: operacion con parametros o pasos multiples.
