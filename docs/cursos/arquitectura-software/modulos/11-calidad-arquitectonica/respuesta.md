---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3: Análisis ATAM

### a) QAs favorecidos
- **Performance de lecturas**: queries rápidas contra modelo desnormalizado
- **Escalabilidad**: reads y writes escalan independientemente
- **Trazabilidad**: event store provee auditoría completa
- **Mantenibilidad**: modelos separados y especializados

### b) QAs perjudicados
- **Consistencia**: eventual entre write y read models
- **Complejidad**: más componentes, Event Store, projectors
- **Performance de writes**: overhead de event store (append + proyección)
- **Testabilidad**: tests de integración más complejos

### c) Sensitivity Points
1. **Tamaño de la ventana de consistencia eventual**: si es muy grande (>5s), afecta experiencia de usuario.
2. **Frecuencia de snapshots**: snapshots muy frecuentes mejoran reconstrucción pero afectan writes.

### d) Trade-off Points
1. **Número de particiones del Event Store**: más particiones = mejor escalabilidad pero peor ordenamiento de eventos por aggregate.
2. **Desnormalización del read model**: más desnormalización = queries más rápidas pero más work al actualizar proyecciones.

### e) Risks y Non-risks
**Risk**: Si el proyector de eventos falla, el read model se desincroniza y las consultas devuelven datos obsoletos. **Mitigación**: health checks periódicos de sincronización, alertas de lag de eventos.

**Non-Risk**: El Event Store es append-only, por lo que no hay riesgo de pérdida de datos de escritura. Los datos nunca se sobrescriben.

### f) Recomendación
**Sí, bajo estas condiciones**:
1. El equipo tiene experiencia previa con CQRS/ES (o tiempo para aprender).
2. Hay un requerimiento explícito de auditoría/trazabilidad.
3. Las lecturas son significativamente diferentes de las escrituras.
4. Se acepta consistencia eventual (el usuario no necesita ver el pedido inmediatamente en todos los lugares).

**Contraindicado** si:
1. CRUD simple donde el modelo de lectura es casi idéntico al de escritura.
2. El equipo es pequeño y no tiene experiencia.
3. Se requiere consistencia fuerte inmediata.

---

## Solución Ejercicio 4: Tácticas Arquitectónicas

| QA | Táctica | Justificación | Implementación |
|----|---------|---------------|----------------|
| **Disponibilidad (99.9%)** | Redundancia activo-activo + Circuit Breaker | Múltiples instancias en diferentes zonas de disponibilidad. Circuit Breaker para evitar fallos en cascada cuando un servicio externo falla. | Kubernetes con 3+ réplicas por servicio, distribuidas en 2+ zonas. Resilience4j Circuit Breaker en llamadas a servicios externos. |
| **Performance (<200ms p95)** | Caching multinivel (Redis local + CDN) | Reducir latencia de consultas frecuentes. CDN para contenido estático, Redis para datos de consulta frecuente (catálogo, sesiones). | Redis cache para consultas de catálogo (TTL 5 min). CDN CloudFront para imágenes y assets. HTTP caching con ETag. |
| **Seguridad (PCI-DSS)** | Autenticación OAuth 2.0 + JWT + Encriptación | Cumplir con PCI-DSS requiere autenticación fuerte, control de acceso y datos encriptados. | OAuth 2.0 con Keycloak. JWT con RSA256. Encriptación AES-256 en reposo. TLS 1.3 en tránsito. |
| **Escalabilidad (10K concurrentes)** | Auto-scaling (Kubernetes HPA) + Stateless services | 10K usuarios requiere escalado horizontal automático. Servicios stateless permiten agregar/remover instancias sin impacto. | Kubernetes HPA basado en CPU/memory + custom metrics (requests por segundo). Servicios sin estado de sesión local. |
| **Mantenibilidad (alta)** | Clean Architecture + Ports & Adapters | Separar el dominio de la infraestructura permite cambiar tecnologías sin afectar la lógica de negocio. | Hexagonal Architecture con puertos y adaptadores. ArchUnit tests para verificar dependencias. ADRs para decisiones. |

