---
sidebar_label: "Clase"
---

## Transacciones e Indices

Una transaccion agrupa operaciones que deben completarse juntas. Un indice acelera consultas a cambio de costo extra en escritura y almacenamiento.

### Transaccion basica

```sql
BEGIN TRAN;
UPDATE Productos SET Stock = Stock - 1 WHERE Id = 1;
INSERT INTO MovimientosStock (ProductoId, Cantidad) VALUES (1, -1);
COMMIT;
```

## Criterio

Usar transacciones cuando una regla de negocio involucra varias escrituras que deben mantenerse consistentes.
