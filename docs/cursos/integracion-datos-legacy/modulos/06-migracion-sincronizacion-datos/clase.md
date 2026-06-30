---
sidebar_label: "Clase"
---

## Migracion y Sincronizacion de Datos

Muchas integraciones no cargan todo cada vez. Las cargas incrementales procesan solo datos nuevos o modificados, reduciendo tiempo y riesgo.

| Estrategia | Uso |
|------------|-----|
| Full load | Carga completa |
| Incremental | Solo cambios |
| Upsert | Insertar o actualizar |
| Watermark | Marca de ultimo procesamiento |

## Resumen

Toda sincronizacion necesita identificar cambios y manejar reintentos sin duplicar datos.
