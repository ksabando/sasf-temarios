---
sidebar_label: "Clase"
---

## Consultas Avanzadas

CTEs y window functions permiten construir reportes legibles sin perder capacidad analitica.

```sql
WITH Ventas AS (
  SELECT ClienteId, SUM(Total) AS Total
  FROM Pedidos
  GROUP BY ClienteId
)
SELECT *, RANK() OVER (ORDER BY Total DESC) AS Ranking
FROM Ventas;
```

## Resumen

Usar CTEs para claridad y window functions para rankings, acumulados y comparaciones por grupo.
