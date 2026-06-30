---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Plan de Refactorización Arquitectónica

La E-Commerce Platform actual es un **monolito** Spring Boot con código mezclado. Se ha identificado como "Big Ball of Mud".

### Problemas identificados
1. **Dependencias cíclicas**: `OrderService` → `PaymentService` → `NotificationService` → `OrderService`
2. **Código duplicado**: lógica de validación de productos en 3 lugares diferentes
3. **Falta de tests**: coverage <10%, sin tests unitarios de lógica de negocio
4. **BD compartida**: todos los módulos usan las mismas tablas sin separación
5. **Sin API contracts**: los servicios se llaman directamente por instancias de clases

### Tareas
a) Prioriza los problemas del 1 al 5 (mayor prioridad = más urgente)
b) Para cada problema, propón una solución y estima el esfuerzo
c) Diseña un plan de refactorización en 3 fases (corto, mediano, largo plazo)
d) ¿Qué métricas usarías para medir el progreso?

---

## Ejercicio 4: ADR de Deuda Técnica

Escribe un ADR completo para documentar la siguiente deuda técnica:

> El equipo decidió implementar el carrito de compras usando **session HTTP** en lugar de Redis porque no tenían tiempo de configurar Redis y la funcionalidad era crítica para el MVP. Sin embargo, esto significa que el carrito se pierde si el usuario cierra el navegador o cambia de dispositivo. Saben que a mediano plazo (6 meses) deben migrar a Redis para tener carrito persistente.

Completa:
- Título y número de ADR
- Estado
- Contexto (por qué se tomó esta decisión)
- Decisión (qué se decidió exactamente)
- Consecuencias (deuda contraída, plan de pago)
- Interés estimado (impacto en usuarios, costos de mantenimiento)
