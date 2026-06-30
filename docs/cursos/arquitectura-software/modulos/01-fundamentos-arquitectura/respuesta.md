---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Trade-off Analysis

**Solución esperada**:

### a) Monolito vs Microservicios

| Aspecto | Monolito | Microservicios |
|---------|----------|----------------|
| **Ventajas** | Simplicidad, baja latencia, deploy simple, testing integrado | Escalado independiente, equipos autónomos, tecnología heterogénea, aislamiento de fallos |
| **Desventajas** | Escalado vertical, acoplamiento, límite de equipo | Complejidad distribuida, latencia de red, debugging difícil, overhead operacional |
| **Cuándo elegir** | Equipo pequeño (<10), sistema simple, startup en etapa temprana | Equipo grande (>20), necesidad de escalado independiente, alta velocidad de cambio |

### b) PostgreSQL vs MongoDB

| PostgreSQL | MongoDB |
|------------|---------|
| Consistencia fuerte ACID, joins, madurez | Esquema flexible, escalado horizontal, JSON nativo |
| Escalado horizontal complejo | Consistencia eventual, sin joins nativos |
| Datos financieros, pedidos, transacciones | Catálogo de productos, contenido, sesiones |

### c) REST vs Eventos Asíncronos

| REST | Eventos (Kafka) |
|------|-----------------|
| Simple, familiar, request-response | Desacoplamiento total, escalabilidad |
| Acoplamiento temporal, fallos en cascada | Complejidad, eventual consistency |
| APIs simples, CRUD, operaciones síncronas | Flujos de varios pasos, notificaciones, pipelines |

### d) Servidor Dedicado vs Serverless

| Servidor Dedicado | Serverless |
|-------------------|------------|
| Control total, sin cold starts | Auto-escalado, pago por uso |
| Costo fijo, escalado manual | Cold starts, límites de ejecución |
| Carga predecible, aplicaciones stateful | Carga variable, event-driven, microservicios simples |

### e) SSR vs SPA

| SSR | SPA |
|-----|-----|
| SEO nativo, carga inicial rápida | UX rica, navegación fluida |
| Mayor carga del servidor | SEO complejo, JS bundle grande |
| Contenido público, landing pages | Aplicaciones interactivas, dashboards |

**Posibles mejoras**:
- Agregar una dimensión de análisis: "estrategia de migración" para cada tradeoff. Por ejemplo, monolito → microservicios mediante *Strangler Fig Pattern*, o SPA → SSR híbrido con Next.js/Nuxt que permite elegir por página.
- Incluir una columna de "costo operacional a 12/24 meses" para cuantificar el TCO (Total Cost of Ownership) de cada opción, basado en el sizing actual del equipo y la infraestructura.
- Para cada comparación, agregar el atributo de calidad que más pesa en la decisión final según el perfil del sistema (ej. para PostgreSQL vs MongoDB: si la consistencia es el driver principal → PostgreSQL; si la flexibilidad de esquema y escalado horizontal → MongoDB).

---

## Ejercicio 4: Definir Escenarios de Calidad

**Solución esperada**:

### a) Disponibilidad

> "Cuando el servicio de pagos externo falla (estímulo) desde el sistema de pedidos (fuente), el módulo de pagos (artefacto) en producción (entorno) debe permitir reintentar el pago sin perder datos (respuesta) y completar el pago dentro de 5 minutos de la caída (medida)."

### b) Performance

> "Cuando 500 usuarios concurrentes realizan búsquedas con filtros (estímulo) desde la web (fuente), el servicio de catálogo (artefacto) con 5 millones de productos (entorno) debe responder en menos de 200ms p95 (respuesta) con una tasa de error menor al 0.1% (medida)."

### c) Seguridad

> "Cuando un atacante intenta inyectar SQL en los parámetros de búsqueda (estímulo) desde la API pública (fuente), el servicio de catálogo (artefacto) en producción (entorno) debe rechazar la solicitud con código 400 (respuesta) y registrar el intento en los logs de seguridad (medida)."

### d) Escalabilidad

> "Cuando el tráfico aumenta de 1000 a 10000 usuarios concurrentes en 5 minutos (estímulo) durante Cyber Monday (fuente), el sistema completo (artefacto) bajo pico de carga (entorno) debe escalar horizontalmente sin intervención manual (respuesta) y mantener latencia p95 < 500ms (medida)."

### e) Mantenibilidad

> "Cuando se requiere agregar un nuevo método de pago (estímulo) desde el equipo de desarrollo (fuente), el módulo de pagos (artefacto) en desarrollo (entorno) debe requerir cambios solo en un archivo (respuesta) y tomar menos de 2 días-hombre de implementación (medida)."

**Posibles mejoras**:
- Agregar un escenario de **observabilidad** (no cubierto): "Cuando un pedido falla en producción, el sistema debe emitir métricas y trazas que permitan identificar el componente raíz en menos de 3 minutos."
- Incluir una **fitness function** automatizada por cada escenario (ej. test de carga con k6 para el escenario de performance, chaos engineering con Gremlin para disponibilidad) que se ejecute en el pipeline de CI/CD.
- Formalizar cada escenario con un ID único y trazabilidad a requisitos de negocio, permitiendo que el PO valide que la medida (ej. p95 < 200ms) es aceptable y que el escenario cubre un riesgo de negocio real, no un supuesto técnico.

