---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Trade-off Analysis

Para cada par de alternativas, identifica:

1. **Ventajas** de cada opción
2. **Desventajas** de cada opción
3. **¿En qué contexto elegirías cada una?**

| Escenario | Opción A | Opción B |
|-----------|----------|----------|
| a) Estilo de arquitectura | Monolito | Microservicios |
| b) Base de datos | PostgreSQL (SQL) | MongoDB (NoSQL) |
| c) Comunicación | REST síncrono | Eventos asíncronos (Kafka) |
| d) Despliegue | Servidor dedicado | Serverless (AWS Lambda) |
| e) Frontend | Server-side rendering | Single Page Application |

---

## Ejercicio 4: Definir Escenarios de Calidad

Para la E-Commerce Platform, define escenarios de calidad concretos usando el formato:

```
**Estímulo** → **Fuente** → **Artefacto** → **Entorno** → **Respuesta** → **Medida**
```

Crea escenarios para los siguientes atributos de calidad:

**a) Disponibilidad**: el sistema debe seguir operando aunque el servicio de pagos falle.

**b) Performance**: la búsqueda de productos debe ser rápida incluso con millones de productos.

**c) Seguridad**: los datos de pago deben estar protegidos.

**d) Escalabilidad**: el sistema debe soportar picos de tráfico en Cyber Monday.

**e) Mantenibilidad**: agregar un nuevo método de pago debe requerir cambios mínimos.
