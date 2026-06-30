---
sidebar_label: "Clase"
---

## 3. Health Checks Arquitectónicos

Evaluaciones periódicas del estado de la arquitectura.

| Dimensión | Preguntas clave | Métricas |
|-----------|----------------|----------|
| **Calidad** | ¿Se cumplen los QAs objetivo? | Latencia p95, disponibilidad, coverage |
| **Deuda técnica** | ¿Está creciendo la deuda? | SonarQube, días de deuda |
| **Alineación** | ¿La arquitectura soporta el negocio? | Velocity de features, time-to-market |
| **Riesgos** | ¿Hay decisiones que pueden fallar? | Risks del ATAM, dependencias externas |
| **Obsolescencia** | ¿Hay tecnologías deprecadas? | Versiones de frameworks, librerías |

### Frecuencia

| Tipo | Frecuencia | Participantes |
|------|-----------|---------------|
| **Lightweight** | Mensual | Arquitecto + TLs |
| **Full review** | Trimestral | Arquitecto equipo + stakeholders |
| **Health check** | Semestral | Arquitecto enterprise + externo |

---

## 4. El Rol del Arquitecto

### Tipos de Arquitecto

| Rol | Enfoque | Alcance |
|-----|---------|---------|
| **Arquitecto de Solución** | Proyecto/sistema específico | Técnico, decisiones del sistema |
| **Arquitecto Enterprise** | Visión global de la organización | Estratégico, estándares, plataformas |
| **Arquitecto Técnico** | Tecnología y plataformas | Infraestructura, frameworks, herramientas |
| **Arquitecto de Dominio** | Dominio de negocio específico | Modelado de dominio, bounded contexts |

### Responsabilidades

```mermaid
graph LR
    A[Arquitecto] --> B[Definir visión técnica]
    A --> C[Tomar decisiones de alto impacto]
    A --> D[Comunicar y evangelizar]
    A --> E[Mentorar equipos]
    A --> F[Revisar decisiones (architecture review)]
    A --> G[Mantener documentación]
    A --> H[Evaluar tecnologías]
```

---

## 5. Comunicación y Evangelismo

| Audiencia | Formato | Lenguaje |
|-----------|---------|----------|
| **Ejecutivos** | Brief de 1 página, ROI, riesgos | Negocio |
| **Stakeholders** | Presentación ejecutiva | Mixto |
| **Desarrolladores** | Tech talks, RFCs, ADRs | Técnico |
| **Pares (arquitectos)** | Design reviews, whiteboarding | Técnico + conceptual |

### RFCs (Request for Comments)

Proceso para propuestas técnicas:

```
Idea → Draft RFC → Team Review → Refine → Decision → Document (ADR)
```

---

## 6. Architecture Review Boards (ARB)

Comité que revisa decisiones arquitectónicas significativas.

### Miembros típicos

- Arquitecto(s) senior
- Líderes técnicos de equipos
- Stakeholders de negocio (cuando aplica)
- DevOps/Security representative

### Proceso

```
Propuesta (RFC)
    │
    v
Revisión por el equipo
    │
    v
Discusión en ARB
    │
    v
Decisión: Approve / Reject / Changes Required
    │
    v
Documentación (ADR)
    │
    v
Implementación
```

### Riesgo: Burocracia excesiva

| Síntoma | Solución |
|---------|----------|
| Cada decisión pasa por ARB | Definir umbrales (solo decisiones de alto impacto) |
| ARB se reúne 1 vez por semana | ARB on-demand + decisión asíncrona |
| Decisiones tardan semanas | Timebox: 48h para decisiones urgentes |
| Equipos evitan ARB | Cultura de colaboración, no de aprobación |

---

## 7. Estándares de Codificación y Arquitectura

### Style Guides

| Lenguaje | Guía |
|----------|------|
| Java | Google Style, Spring Codestyle |
| JavaScript | Airbnb, Standard |
| TypeScript | Google TS Style |
| Python | PEP 8 |

### Patrones Aprobados

Documentar qué patrones están aprobados, cuándo y por qué usarlos:

```markdown
# Patrones Aprobados - E-Commerce Platform

## Patrones de arquitectura
- ✅ Hexagonal Architecture (obligatorio)
- ✅ CQRS (para módulos con alta diferencia read/write)
- ✅ Event-Driven (para comunicación asíncrona)

## Patrones de diseño
- ✅ Strategy (para algoritmos intercambiables)
- ✅ Factory (para creación de objetos complejos)
- ⚠️ Singleton (evitar, usar DI)
- ❌ Service Locator (anti-patrón, no usar)
```

### Tecnologías Aprobadas: Tech Radar

ThoughtWorks Tech Radar clasifica tecnologías en 4 categorías:

```
      Adopt
     /      \
    /        \
Assess ---- Trial
    \        /
     \      /
      Hold
```

| Categoría | Significado | Ejemplo |
|-----------|-------------|---------|
| **Adopt** | Tecnología probada, usarla | Spring Boot, React, PostgreSQL |
| **Trial** | Prometedora, probar en piloto | Kotlin, WebFlux, MongoDB |
| **Assess** | Investigar, puede ser útil | Cassandra, GraphQL, Rust |
| **Hold** | Evitar o esperar | Node.js (para este proyecto), EJB |

---

## 8. Cultura de Arquitectura

### Prácticas recomendadas

| Práctica | Descripción |
|----------|-------------|
| **Tech talks** | Charlas técnicas semanales/mensuales |
| **Pair design** | Dos arquitectos diseñando juntos |
| **Architecture kata** | Ejercicios de diseño (como coding dojo) |
| **Design reviews** | Revisión de diseño antes de implementar |
| **Post-mortems** | Análisis de fallos sin culpa |
| **Mentoría** | Arquitectos senior mentorizando juniors |

---

## 9. Medición del Gobierno

¿Cómo saber si el gobierno está funcionando?

| Indicador | Bueno | Malo |
|-----------|-------|------|
| **Time-to-market** | Disminuye con el tiempo | Aumenta o se mantiene alto |
| **Deuda técnica** | Disminuye o se mantiene baja | Aumenta cada trimestre |
| **Satisfacción del equipo** | El equipo siente que la arquitectura ayuda | El equipo siente que la arquitectura estorba |
| **Incidentes** | Disminuyen | Aumentan |
| **Onboarding** | Nuevos miembros productivos en 2 semanas | Tardan meses |

---

## 10. Laboratorio

1. Diseñar estructura de gobierno para E-Commerce Platform
2. Crear RFC template
3. Proponer Tech Radar para el proyecto
4. Definir Architecture Review Process
5. Escribir política de estándares y patrones
