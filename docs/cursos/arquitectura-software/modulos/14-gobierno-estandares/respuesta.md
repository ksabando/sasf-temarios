---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3: Architecture Review Process

### a) Umbrales de revisión

**Requieren revisión del arquitecto (Nivel 2+):**
- Nuevo endpoint en API pública
- Cambio en schema de base de datos (nuevas tablas, columnas críticas)
- Nueva dependencia externa (API de terceros)
- Cambio en contrato de eventos (Kafka)
- Refactorización que afecta >5 archivos

**Requieren aprobación del ARB (Nivel 3):**
- Nuevo bounded context
- Cambio de base de datos (ej: PostgreSQL → MongoDB)
- Nuevo framework core (Spring → Quarkus)
- Cambio en patrón de comunicación (síncrono → eventos)
- Nueva tecnología de infraestructura (Kubernetes → Serverless)
- Cambio que afecta >3 servicios

### b) RFC Template

```markdown
# RFC: [Título descriptivo]

**Autor:** [Nombre]
**Fecha:** [Fecha]
**Estado:** DRAFT / IN REVIEW / DECIDED

## 1. Contexto
¿Qué problema estamos resolviendo? ¿Por qué es necesario este cambio?

## 2. Propuesta
Descripción detallada de la solución propuesta.
Incluir diagramas si aplica.

## 3. Alternativas Consideradas
| Alternativa | Pros | Contras |
|-------------|------|---------|
| Alternativa A | ... | ... |
| Alternativa B | ... | ... |

## 4. Trade-offs y Riesgos
- **QA afectados**: ¿Qué atributos de calidad se ven impactados?
- **Riesgos**: ¿Qué podría salir mal?
- **Mitigaciones**: ¿Cómo mitigamos los riesgos?

## 5. Plan de Implementación
- Fases
- Esfuerzo estimado
- Dependencias
- Rollback plan

## 6. Decisión
[Espacio para la decisión del ARB]
```

### c) Timeline

| Etapa | Tiempo máximo |
|-------|---------------|
| Envío de RFC | - |
| Revisión inicial | 24h |
| Discusión equipo/ARB | 48h |
| Decisión | 24h después de la discusión |
| **Total** | **<5 días hábiles** |

**Urgencia**: Si hay un blocker, el ARB puede decidir en 24h con decisión asíncrona.

### d) Escalamiento

```
Desacuerdo Squad — Arquitecto
    —,
    v
Reunión con ambos + TLs del equipo
    —,
    —,
        —,
        —,
```

---

## Solución Ejercicio 4: Health Check

### a) Áreas críticas (prioridad)

1. **Disponibilidad 99.5% (target 99.9%)**: 3 incidentes P1/mes es inaceptable. 99.5% ?^ 1.8 días de downtime/año.
2. **Latencia p95 450ms (target <200ms)**: Más del doble del target. Impacta experiencia de usuario.
3. **Deuda técnica 45 días (target <20)**: >20 días es señal de alerta. Coverage de 35% agrava el riesgo.

### b) Acciones concretas

**Disponibilidad (urgente)**:
1. Implementar Circuit Breaker en llamadas a servicios externos (1 semana)
2. Agregar health checks y auto-scaling en Kubernetes (1 semana)
3. Implementar retry con backoff para operaciones críticas (3 días)
4. Post-mortem de cada incidente P1

**Performance**:
1. Implementar Redis cache para consultas de catálogo (2 semanas)
2. Revisar queries lentas (índices faltantes) (1 semana)
3. Implementar compresión gzip en respuestas (2 días)
4. Migrar consultas pesadas a proyecciones asíncronas

**Deuda técnica**:
1. Agregar SonarQube al pipeline CI/CD (3 días)
2. 20% de cada sprint para reducir deuda
3. Enfocar en aumentar coverage a 50% primero (2 sprints)
4. Refactorizar top 10 code smells más críticos

### c) Métricas de seguimiento (próximo trimestre)

| Métrica | Mes 1 | Mes 2 | Mes 3 |
|---------|-------|-------|-------|
| Disponibilidad | 99.6% | 99.8% | 99.9% |
| Latencia p95 | 350ms | 250ms | <200ms |
| Coverage | 45% | 55% | 65% |
| Deuda técnica | 40 días | 30 días | <20 días |
| Tiempo de deploy | 8h | 2h | <30min |

### d) Resumen ejecutivo

> "La plataforma muestra signos de degradación: disponibilidad por debajo del target (99.5% vs 99.9%) y latencia duplicada (450ms vs 200ms). La deuda técnica acumulada (45 días) y el bajo coverage de tests (35%) incrementan el riesgo de nuevos incidentes. Recomendamos un plan de 3 meses enfocado en: (1) mejorar disponibilidad con circuit breakers y auto-scaling, (2) optimizar performance con caching y revisión de queries, y (3) reducir deuda técnica mediante SonarQube en CI/CD y dedicación del 20% del sprint. El equipo está comprometido y los cambios propuestos tienen bajo riesgo."

