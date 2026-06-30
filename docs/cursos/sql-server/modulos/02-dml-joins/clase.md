---
sidebar_label: "Clase"
---

## DML y Joins

Las sentencias DML modifican datos. Los joins combinan filas de varias tablas segun una relacion.

### DML

```sql
INSERT INTO Productos (Nombre, Precio) VALUES ('Mouse', 25.00);
UPDATE Productos SET Precio = 30.00 WHERE Id = 1;
DELETE FROM Productos WHERE Id = 1;
```

### Join comun

```sql
SELECT p.Nombre, c.Nombre AS Categoria
FROM Productos p
INNER JOIN Categorias c ON c.Id = p.CategoriaId;
```
