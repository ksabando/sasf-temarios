---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3: Plan de Refactorización

### a) Priorización

| Prioridad | Problema | Razón |
|-----------|----------|-------|
| 1 | **Dependencias cíclicas** | Bloquea la evolución, impide extraer servicios |
| 2 | **Falta de tests** | Sin tests, cualquier cambio es riesgoso |
| 3 | **Sin API contracts** | Impide modularización y trabajo en paralelo |
| 4 | **Código duplicado** | Aumenta esfuerzo de cambios, propaga bugs |
| 5 | **BD compartida** | El último paso (después de definir módulos) |

### b) Soluciones y esfuerzo estimado

| Problema | Solución | Esfuerzo |
|----------|----------|----------|
| 1. Dependencias cíclicas | Identificar ciclo, aplicar Dependency Inversion, extraer interfaces | 5 días |
| 2. Falta de tests | Escribir tests para funcionalidades críticas (coverage >50%) | 20 días |
| 3. Sin API contracts | Definir interfaces de módulos, implementar eventos entre módulos | 10 días |
| 4. Código duplicado | Extraer métodos compartidos, crear utilidades comunes | 5 días |
| 5. BD compartida | Separar schemas de BD por módulo, migrar datos | 15 días |

### c) Plan en 3 fases

**Fase 1 - Corto plazo (Mes 1-2)**
1. Resolver dependencias cíclicas (prioridad máxima)
2. Definir API contracts entre módulos
3. Agregar tests para funcionalidades core (pagos, pedidos)
4. ArchUnit tests para prevenir nuevas violaciones

**Fase 2 - Mediano plazo (Mes 3-4)**
1. Eliminar código duplicado
2. Alcanzar 50% de coverage
3. Separar schemas de BD
4. Establecer CI/CD con SonarQube

**Fase 3 - Largo plazo (Mes 5-8)**
1. Extraer primer microservicio (Catálogo)
2. Migrar BD a servicio independiente
3. Continuar con Strangler Fig para otros módulos

### d) Métricas de progreso

| Métrica | Línea base | Target 3 meses | Target 6 meses |
|---------|-----------|----------------|----------------|
| Coverage de tests | <10% | >50% | >70% |
| Deuda técnica (SonarQube) | 60 días | <30 días | <15 días |
| Dependencias cíclicas | 5 ciclos | 0 ciclos | 0 ciclos |
| Tiempo de deploy | 2 días | <4 horas | <1 hora |
| Duplicación de código | 25% | <10% | <5% |

---

## Solución Ejercicio 4: ADR de Deuda Técnica - Carrito en Session

```markdown
# ADR-015: Carrito de compras en sesión HTTP (deuda técnica)

## Estado
ACEPTADO (deuda técnica documentada)

## Contexto
Necesitábamos implementar el carrito de compras para el MVP
de la E-Commerce Platform con plazo de 2 meses. La solución
ideal (Redis) requería:
- Configurar y desplegar cluster Redis
- Implementar sincronización carrito anónimo → autenticado
- Tiempo estimado: 3 semanas adicionales

## Decisión
Implementamos el carrito usando la sesión HTTP del servidor
(Spring Session con almacenamiento en memoria).
Alternativa considerada: Redis (rechazada por tiempo).

## Consecuencias - Deuda contraída

**Problemas actuales**:
1. El carrito se pierde al cerrar el navegador
2. El carrito no persiste entre dispositivos
3. El carrito se pierde si el servidor se reinicia
4. No funciona bien con balanceo de carga (sticky session requerido)

**Interés estimado**:
- Usuarios frustrados: ~15% de carritos abandonados por pérdida de datos
- Soporte técnico: 5 tickets/semana por carritos perdidos
- Sticky session: complejidad operativa en Kubernetes

## Plan de pago
- **Fecha**: Q3 2026 (mes 7 del proyecto)
- **Solución**: Migrar carrito a Redis con persistencia
- **Esfuerzo estimado**: 10 días-hombre
- **Feature flag**: desactivar session carrito, activar Redis carrito
- **Rollback**: mantener session carrito como fallback 1 mes

## Alternativas futuras
- Redis Cluster con persistencia RDB
- Evaluar carrito serverless (DynamoDB) si el costo de Redis es alto
```

**Interés estimado**:
- 15% de carritos abandonados - 1000 pedidos/mes - $50 ticket promedio = $7,500/mes en ventas perdidas
- 5 tickets/semana - $30 costo de soporte = $600/mes
- **Interés total**: ~$8,100/mes vs. inversión de $2,000 (10 días-hombre)
- **ROI**: <1 semana

