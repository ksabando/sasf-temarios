---
sidebar_label: "Clase"
---

## 3. Costo del Interés de la Deuda

| Síntoma | Impacto |
|---------|---------|
| **Tiempo extra** | Implementar features toma 2x o 3x más tiempo |
| **Bugs frecuentes** | Alta tasa de defectos en producción |
| **Onboarding lento** | Nuevos desarrolladores tardan meses en ser productivos |
| **Baja moral** | El equipo evita tocar ciertas partes del código |
| **Dificultad de testing** | Código acoplado no es testeable |
| **Deploy doloroso** | Cada deploy es riesgoso y lento |

### Ejemplo de cálculo de interés

```
Sin deuda:      Implementar feature X toma 5 días.
Con deuda:      Implementar feature X toma 12 días (7 días de interés).
Interés acumulado: 7 días × 20 features/año = 140 días perdidos al año.
```

---

## 4. Identificación y Medición

### Herramientas

| Herramienta | Mide | Señales |
|-------------|------|---------|
| **SonarQube** | Deuda técnica (días), code smells, duplicación, coverage | >20% de deuda es alarmante |
| **Análisis estático** | Complejidad ciclomática, acoplamiento | >10 por método es alto |
| **Code reviews** | Calidad percibida por el equipo | Patrones repetidos de malas prácticas |
| **Métricas de equipo** | Tiempo de implementación, bugs | Tendencias crecientes |
| **Dependencias** | Número de dependencias externas, versiones obsoletas | Dependencias sin actualizar >2 años |

### Métricas clave

| Métrica | Qué mide | Valor saludable |
|---------|----------|-----------------|
| **Duplicación** | % de código duplicado | <5% |
| **Complejidad ciclomática** | Complejidad de cada método | <10 |
| **Coverage de tests** | % de código cubierto por tests | >70% |
| **Deuda técnica** | Días estimados para pagar la deuda | <20 días |
| **Tiempo de deploy** | Tiempo de deploy a producción | <30 min |

---

## 5. Estrategias de Reducción

### 1. Identificar y Medir
- SonarQube en CI/CD
- Métricas de equipo en retrospectivas
- Code reviews sistemáticos

### 2. Priorizar
- **Impacto en negocio** (features bloqueadas) vs **esfuerzo de refactorización**
- Usar la matriz: Alto impacto + Bajo esfuerzo = Prioridad 1

### 3. Planificar
- **20% Rule**: dedicar 20% del sprint a reducir deuda
- **Refactoring sprints**: sprints dedicados a mejora técnica
- **Boy Scout Rule**: "Deja el código mejor de lo que lo encontraste"

### 4. Ejecutar
- Refactorización incremental (un cambio pequeño a la vez)
- Tener tests antes de refactorizar (red-green-refactor)
- Strangler Fig para cambios arquitectónicos grandes

### 5. Prevenir
- Estándares de código (checkstyle, eslint, prettier)
- Code reviews (toda PR revisada)
- Pair programming en código crítico
- Formación continua (tech talks, workshops)

---

## 6. Deuda Técnica Consciente

La deuda técnica **consciente y documentada** es una herramienta de gestión.

### Cómo documentar

```markdown
# ADR-042: Deuda técnica - Uso de consultas nativas SQL

## Estado
ACEPTADO (deuda técnica aceptada)

## Contexto
Para el reporte de ventas mensual, necesitábamos una consulta
compleja que no podía expresarse fácilmente con JPA Criteria.

## Decisión
Usamos @Query nativa SQL en lugar de Criteria API o QueryDSL.
Esto nos permitió entregar el reporte a tiempo.

## Consecuencias
**Deuda**:
- La consulta nativa no es type-safe
- Difícil de mantener si el esquema cambia
- No se beneficia del cache de segundo nivel de JPA

**Plan de pago**:
- Refactorizar a QueryDSL en Q2 (antes de cambiar esquema de BD)
- Costo estimado: 2 días-hombre
- Interés: cada cambio en esquema requerirá actualizar 5 consultas nativas
```

---

## 7. Refactorización Arquitectónica vs de Código

| Aspecto | Refactorización de Código | Refactorización Arquitectónica |
|---------|--------------------------|-------------------------------|
| **Alcance** | Clase, método | Sistema, módulo |
| **Ejemplos** | Renombrar, extraer método, mover clase | Monolito → Microservicios, CRUD → CQRS |
| **Riesgo** | Bajo | Alto |
| **Duración** | Horas o días | Semanas o meses |
| **Tests** | Unitarios | Integración, E2E |
| **Herramientas** | IDE (refactoring automático) | Strangler Fig, feature flags |

### Pasos para refactorización arquitectónica

1. **Evaluar**: ¿El dolor justifica el cambio?
2. **Planificar**: diseño target, pasos intermedios, riesgos
3. **Asegurar**: tests de regresión, feature flags
4. **Ejecutar**: Strangler Fig, migración incremental
5. **Validar**: monitorear, comparar métricas (latencia, errores)
6. **Limpiar**: eliminar código legacy

---

## 8. Big Ball of Mud (Bola de Barro)

Anti-patrón descrito por **Brian Foote y Joseph Yoder**: sistemas sin arquitectura clara.

### Señales de alerta
- **Código espagueti**: dependencias confusas, flujo ilegible
- **Dependencias cíclicas**: A depende de B, B depende de A
- **Falta de pruebas**: el código legacy no tiene tests
- **Acoplamiento excesivo**: cambiar X requiere cambiar Y, Z, W
- **Crecimiento descontrolado**: sin patrones, sin estructura

### Solución

1. **Establecer límites** (bounded contexts): separar responsabilidades
2. **Strangler Fig**: reemplazar partes gradualmente
3. **Pagar deuda progresivamente**: priorizar por impacto
4. **Prevenir nueva deuda**: estándares, reviews, tests
5. **Documentar**: ADRs de deuda, plan de pago

---

## 9. Boy Scout Rule

> "Deja el código mejor de lo que lo encontraste." — Robert C. Martin

Cada vez que tocas un archivo para cualquier cambio, dejas una mejora:
- Renombrar una variable confusa
- Extraer un método largo
- Agregar un test faltante
- Mejorar un nombre de clase
- Agregar documentación

No necesitas permiso. Es parte de ser profesional.

---

## 10. Laboratorio

Auditar E-Commerce Platform (código de ejemplo):
1. Identificar deuda técnica: code smells, dependencias cíclicas, falta de tests
2. Clasificar en el cuadrante de Fowler
3. Calcular interés de la deuda
4. Proponer plan de refactorización
5. Escribir ADRs de deuda técnica
6. Priorizar: qué pagar primero, qué diferir
