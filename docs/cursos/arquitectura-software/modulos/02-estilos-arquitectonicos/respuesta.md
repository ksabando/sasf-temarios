---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Análisis de Trade-offs

**Solución esperada**:

**a) Estilo para el MVP**
- **Recomendación**: Modular Monolith (Monolito Modular)
- **Razones**:
  - Equipo pequeño (5 personas) puede trabajar en paralelo en módulos bien delimitados.
  - MVP en 3 meses requiere velocidad, no overhead de microservicios.
  - Sin experiencia distribuida, el equipo se enfoca en el producto.
  - Latencia mínima y testing simplificado.
  - La modularidad (paquetes, módulos Java/Spring) permite migrar después.

**b) Condiciones para migrar a microservicios**
- El equipo crece a 3+ equipos independientes (>15 personas).
- Frecuentes deploys de partes no relacionadas del sistema.
- Cuellos de botella de escalado en componentes específicos.
- Necesidad de tecnología diferente para ciertos módulos.
- El monólogo se vuelve "Big Ball of Mud" (dependencias cíclicas, cambios lentos).

**c) Plan de evolución a 2 años**

```
Año 1 - Meses 1-3:   MVP con Modular Monolith
Año 1 - Meses 4-8:   Consolidación, bounded contexts claros
Año 1 - Meses 9-12:  Extraer primer microservicio (Catálogo, alta carga de lectura)
Año 2 - Meses 1-6:   Extraer Pagos (alta disponibilidad)
Año 2 - Meses 7-12:  Extraer Pedidos (flujo complejo, CQRS)
                     Monolito residual (Usuarios, Admin)
```

**Posibles mejoras**:
- Definir *fitness functions* arquitectónicas automatizadas (Neal Ford) para cada fase del plan, como tests de acoplamiento entre módulos (ArchUnit para Java) que fallen si un módulo del monolito depende de otro que no debería, previniendo el Big Ball of Mud antes de la extracción.
- Agregar una fase "año 0" de strangling preparation: instrumentar el monolito con distributed tracing (OpenTelemetry) y métricas de negocio para identificar los bounded contexts reales basados en datos de uso, no en suposiciones del equipo.
- Evaluar si en la fase final conviene un monolith extractor pattern: mantener el monolito residual solo como orquestador (ruteo a microservicios) en lugar de mantener lógica de negocio en él, eliminando el riesgo de que el residual acumule nueva lógica.

---

## Ejercicio 4: Diseñar Pipes-and-Filters

**Solución esperada**:

```
Pedido        +------------+     +------------+     +------------+
Crudo (JSON)  | Filtro 1   |---->| Filtro 2   |---->| Filtro 3   |
-------------->| Validación  |     | Stock      |     | Precios    |
              +------------+     +------------+     +------------+
                                     |                    |
                                  Error si no         Aplicar
                                  hay stock           descuentos
                                                      e impuestos
                                     |
                                     v
              +------------+     +------------+     +------------+
              | Filtro 5   |<----| Filtro 4   |<----|             |
              | Confirmación|     | Pago       |     |             |
              +------------+     +------------+     +------------+
                    |                  |
                Notificar           Error si
                al usuario          pago falla
```

### Descripción de cada filtro

**Filtro 1 - Validación**
- **Entrada**: JSON pedido crudo (productos, cantidades, dirección)
- **Función**: Validar formato, campos requeridos, formato de email, RUT/cédula
- **Salida**: Pedido validado o error
- **Error**: Retornar error de validación al cliente

**Filtro 2 - Verificación de Stock**
- **Entrada**: Lista de productos con cantidades
- **Función**: Consultar inventario, verificar disponibilidad
- **Salida**: Stock confirmado o insuficiente
- **Error**: Si falta stock, informar productos no disponibles

**Filtro 3 - Cálculo de Precios**
- **Entrada**: Productos + cantidades + datos de usuario (ubicación)
- **Función**: Calcular subtotal, descuentos (cupones), impuestos (IVA), costo de envío
- **Salida**: Pedido con precios calculados
- **Error**: Cupón inválido, dirección fuera de cobertura

**Filtro 4 - Autorización de Pago**
- **Entrada**: Pedido con precios + datos de pago (tarjeta, transferencia)
- **Función**: Autorizar pago con gateway externo
- **Salida**: Pago autorizado o rechazado
- **Error**: Pago rechazado → notificar al usuario, no continuar

**Filtro 5 - Confirmación**
- **Entrada**: Pedido confirmado + pago autorizado
- **Función**: Guardar pedido en BD, reducir stock, enviar email de confirmación
- **Salida**: Número de pedido, confirmación al usuario
- **Error**: Si falla la persistencia, compensar pago (rollback/refund)

**Posibles mejoras**:
- Implementar el pipeline con un *Process Manager* (Saga) que orqueste la compensación en orden inverso si un filtro falla, usando un *routing slip* (Gregor Hohpe) que cada filtro sella al completarse y que el coordinador usa para saber qué deshacer.
- Agregar un *Dead Letter Channel* al final del pipeline para pedidos que fallan después de reintentos, permitiendo análisis manual y evitando pérdida de requests.
- Transformar el pipeline en un *Event-Driven Pipeline* donde cada filtro emite un evento a un topic de Kafka y el siguiente filtro lo consume, desacoplando temporalmente cada etapa y permitiendo reintentos individuales y escalado independiente por filtro (ej. el filtro de Pago puede escalar a 10 instancias mientras Validación escala a 2).

