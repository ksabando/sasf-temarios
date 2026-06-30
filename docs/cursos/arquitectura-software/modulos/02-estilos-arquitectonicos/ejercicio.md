---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Análisis de Trade-offs (Monolito vs Microservicios)

Para el siguiente escenario, analiza si conviene monolito o microservicios:

> "Una startup de e-commerce con 5 desarrolladores, presupuesto limitado, que necesita lanzar un MVP en 3 meses. Planean escalar a 50 desarrolladores en 2 años si el producto tiene éxito."

**a)** ¿Qué estilo recomendarías para el MVP y por qué?

**b)** ¿Qué condiciones indicarían que es momento de migrar a microservicios?

**c)** Dibuja un plan de evolución arquitectónica a 2 años.

---

## Ejercicio 4: Diseñar un Sistema con Pipes-and-Filters

Diseña un sistema de procesamiento de pedidos usando el estilo Pipes-and-Filters. El flujo debe ser:

1. **Validación**: validar datos del pedido (formato, campos requeridos)
2. **Verificación de stock**: consultar inventario
3. **Cálculo de precios**: aplicar descuentos, impuestos, envío
4. **Autorización de pago**: procesar pago
5. **Confirmación**: generar confirmación y notificar

Para cada filtro:
- Describe su función
- Indica el formato de entrada y salida
- ¿Qué pasa si el filtro falla? (manejo de errores)

Dibuja el diagrama de pipes-and-filters correspondiente.
