---
sidebar_label: "Clase"
---

## 3. Stakeholders en Arquitectura

Un stakeholder es cualquier persona o grupo con interés en el sistema. Cada stakeholder tiene preocupaciones diferentes:

| Stakeholder | Preocupación principal |
|-------------|----------------------|
| **Desarrolladores** | Mantenibilidad, testabilidad, claridad |
| **Operaciones/DevOps** | Disponibilidad, escalabilidad, monitoreo |
| **Negocio/Producto** | Tiempo de entrega, costo, alineación con objetivos |
| **Usuarios finales** | Performance, usabilidad, disponibilidad |
| **Inversores/Dueños** | ROI, riesgo, deuda técnica |
| **Seguridad** | Integridad, confidencialidad, autenticación |
| **Cumplimiento (Compliance)** | Regulaciones, auditoría, retención de datos |

El arquitecto debe balancear las preocupaciones de todos los stakeholders. No todos pueden ser totalmente satisfechos — de ahí la necesidad de trade-offs.

---

## 4. Decisiones Arquitectónicas

Son las decisiones que tienen el mayor impacto en la estructura y calidad del sistema. Características:

- **Alto costo de cambio**: una vez implementadas, revertirlas es costoso.
- **Afectan múltiples componentes**: trascienden un solo módulo.
- **Impactan atributos de calidad**: determinan performance, disponibilidad, seguridad.
- **Deben ser conscientes**: no por defecto o por accidente.

Ejemplos de decisiones arquitectónicas:
- Elegir entre monólogo y microservicios
- Base de datos SQL vs NoSQL
- Comunicación síncrona (REST) vs asíncrona (eventos)
- Framework de UI (React, Angular) y su integración
- Patrón de despliegue (monolítico, serverless, containers)

### Cómo documentar decisiones: ADR (Architecture Decision Record)

Formato estándar:
1. **Título**: número + nombre corto
2. **Estado**: Propuesto, Aceptado, Deprecado, Superseded
3. **Contexto**: problema que motiva la decisión
4. **Decisión**: qué se decidió y por qué
5. **Consecuencias**: implicaciones, trade-offs, riesgos

---

## 5. Atributos de Calidad (No Funcionales)

Los atributos de calidad son propiedades del sistema que determinan su efectividad operativa. Son tan importantes como los requisitos funcionales.

### Principales Atributos de Calidad

| Atributo | Definición | Métrica | Estrategias |
|----------|-----------|---------|-------------|
| **Disponibilidad** | Tiempo que el sistema está operativo | 99.9% (8.76h/año), 99.99% | Redundancia, failover, health checks |
| **Performance** | Velocidad de respuesta | Latencia p50/p95/p99, throughput | Caching, async, compresión |
| **Seguridad** | Protección contra amenazas | Nivel de madurez (OWASP) | Autenticación, encriptación, rate limiting |
| **Mantenibilidad** | Facilidad de modificar y extender | Tiempo de implementar cambios | Modularidad, bajo acoplamiento |
| **Escalabilidad** | Capacidad de manejar crecimiento | Usuarios concurrentes, volumen de datos | Escalado horizontal, stateless, sharding |
| **Testabilidad** | Facilidad de probar | Cobertura, tiempo de ejecución de tests | DI, puertos/adaptadores, test doubles |

### Escenarios de Calidad

Formato para definir escenarios concretos:

```
**Estímulo** → **Fuente** → **Artefacto** → **Entorno** → **Respuesta** → **Medida**
```

Ejemplo:
> "Cuando 1000 usuarios concurrentes realizan búsquedas (estímulo) desde la web (fuente), el sistema de catálogo (artefacto) bajo carga normal (entorno) responde en menos de 200ms p95 (respuesta, medida)."

---

## 6. Trade-offs

Toda decisión arquitectónica implica un trade-off. No existe la "bala de plata" — no hay una solución óptima para todos los contextos.

### Trade-offs comunes

| Decisión | Ventaja | Desventaja |
|----------|---------|------------|
| Monolito | Simplicidad, baja latencia | Escalado difícil, acoplamiento |
| Microservicios | Escalabilidad, equipos autónomos | Complejidad distribuida, latencia de red |
| SQL (ACID) | Consistencia fuerte | Escalado horizontal complejo |
| NoSQL (BASE) | Escalado horizontal | Consistencia eventual |
| Síncrono (REST) | Simple, familiar | Acoplamiento temporal |
| Asíncrono (Eventos) | Desacoplamiento | Complejidad, debugging |

### Principio de Pareto para la arquitectura

El 80% del valor arquitectónico proviene del 20% de las decisiones. Enfoque:
1. Identificar las decisiones críticas (alto impacto, alto costo de cambio)
2. Invertir tiempo en analizar alternativas
3. Documentar la decisión y los trade-offs
4. Para el resto, aplicar YAGNI (You Ain't Gonna Need It)

---

## 7. Arquitectura como Conjunto de Decisiones Conscientes

Una arquitectura bien diseñada no ocurre por accidente. Es el resultado de decisiones deliberadas y documentadas.

### Anti-patrones a evitar

- **Architecture by Default**: usar siempre la misma tecnología sin cuestionar.
- **Architecture by Resume**: elegir tecnologías solo porque están de moda.
- **Architecture by Committee**: decisiones diluidas por muchos tomadores.
- **Big Design Up Front**: diseñar todo en detalle antes de empezar.
- **No Architecture**: "ya lo arreglaremos después" — deuda técnica imprudente.

### El Principio de la Última Decisión Responsable

> "Posponer decisiones hasta el último momento responsable en que deben ser tomadas."

Esto permite:
- Aprender más antes de decidir
- Evitar over-engineering
- Mantener opciones abiertas

---

## 8. El Rol del Arquitecto

El arquitecto moderno no es un "dios en una torre de marfil". Es un facilitador que:

| Rol | Descripción |
|-----|-------------|
| **Visionario** | Define y comunica la visión técnica |
| **Comunicador** | Traduce entre negocio y tecnología |
| **Facilitador** | Guía al equipo, no impone |
| **Tomador de decisiones** | Decide cuando es necesario |
| **Mentor** | Enseña y eleva al equipo |
| **Guardián de calidad** | Vela por los atributos de calidad |

### Habilidades clave

- Pensamiento sistémico (ver el todo, no solo las partes)
- Comunicación efectiva (técnica y no técnica)
- Conocimiento técnico profundo pero práctico
- Capacidad de negociación y manejo de conflictos
- Visión de negocio y entendimiento del dominio

---

## 9. Costo de la Arquitectura

### ¿Cuándo invertir en arquitectura?

- Cuando hay incertidumbre técnica significativa (spike o proof of concept).
- Cuando una decisión tiene alto costo de cambio.
- Cuando el equipo no tiene experiencia en el dominio.
- Cuando los atributos de calidad son críticos (disponibilidad 99.99%, seguridad financiera).

### ¿Cuándo diferir?

- Cuando el requisito es incierto (aplicar YAGNI).
- En etapas tempranas de un MVP.
- Cuando el costo de la solución supera el riesgo de no tenerla.
- Cuando se puede refactorizar después con costo aceptable.

### Deuda técnica consciente

No toda deuda técnica es mala. La deuda técnica **consciente y planificada** puede ser una decisión inteligente:
1. Identificar la deuda
2. Documentarla (ADR)
3. Estimar su interés (costo de mantenerla)
4. Planificar su pago

---

## 10. Proyecto Base: E-Commerce Platform

A lo largo del curso, trabajaremos con un proyecto base: **E-Commerce Platform**.

### Requerimientos funcionales principales

- Catálogo de productos con búsqueda y filtros
- Carrito de compras (persistente, anónimo → autenticado)
- Gestión de pedidos (crear, pagar, despachar, entregar)
- Notificaciones (email, push)
- Panel de administración (reportes, gestión de productos)

### Atributos de calidad target

- Disponibilidad: 99.9%
- Performance: <200ms p95 en APIs críticas
- Escalabilidad: 10K usuarios concurrentes
- Mantenibilidad: alta (equipo en crecimiento)

### Casos de estudio transversales

1. **Sistema de pagos**: alta disponibilidad, consistencia de datos
2. **Catálogo de productos**: búsqueda eficiente, escalabilidad de lectura
3. **Gestión de pedidos**: flujo complejo, transacciones distribuidas

---

## Resumen del Módulo

- La arquitectura define la estructura y las decisiones difíciles de cambiar.
- Arquitectura ≠ Diseño: la arquitectura es diseño de alto nivel.
- Los stakeholders tienen preocupaciones diversas que deben balancearse.
- Las decisiones arquitectónicas deben ser conscientes y documentadas.
- Los atributos de calidad son tan importantes como los funcionales.
- Toda decisión tiene trade-offs — no hay soluciones perfectas.
- El rol del arquitecto es facilitar, comunicar y guiar.
- Invertir en arquitectura cuando el riesgo lo justifica; diferir cuando no.
