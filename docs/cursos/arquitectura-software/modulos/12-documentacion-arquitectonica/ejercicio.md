---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Diagrama de Secuencia (Comunicación entre Servicios)

Dibuja un **diagrama de secuencia** para el flujo:

> "Un cliente crea un pedido → se verifica stock → se procesa pago → se inicia envío → se notifica al cliente"

Muestra:
- Actores: Cliente
- Servicios: Web App, Orders Service, Inventory Service, Payment Service, Shipping Service, Notification Service
- Mensajes síncronos (REST) y asíncronos (eventos)
- Tiempo de respuesta esperado

Usa Mermaid o PlantUML.

---

## Ejercicio 4: Arquitectura como Tests (ArchUnit)

Escribe tests de arquitectura usando ArchUnit (o pseudocódigo) para verificar que la E-Commerce Platform cumple con las reglas arquitectónicas:

### Reglas a verificar
1. Las capas de dominio no deben depender de infraestructura
2. Los controladores REST solo deben llamar a casos de uso (no directamente a repositorios)
3. No deben existir dependencias cíclicas entre módulos
4. Los nombres de clases deben seguir la convención: terminación en Service, Repository, Controller, etc.
5. Los paquetes de dominio no deben importar nada de Spring

Implementa cada regla y explica qué problema previene.
