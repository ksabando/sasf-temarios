---
sidebar_label: "Clase"
---

## 3. Microservicios

### ¿Qué es?
Cada funcionalidad es un servicio independiente con su propio deploy, base de datos y equipo.

```
+------------------------------------------------------+
|                    MICROSERVICIOS                     |
|                                                        |
|  +----------+  +----------+  +----------+  +------+   |
|  | Orders   |  | Payments |  | Products |  | Users|   |
|  | Service  |  | Service  |  | Service  |  | Srv. |   |
|  | [Deploy] |  | [Deploy] |  | [Deploy] |  |[Dep.]|   |
|  +----------+  +----------+  +----------+  +------+   |
|       |              |             |            |      |
|  +----------+  +----------+  +----------+  +------+   |
|  | Orders   |  | Payments |  | Products |  |Users |   |
|  | DB (SQL) |  | DB (SQL) |  | DB (Doc) |  | DB  |   |
|  +----------+  +----------+  +----------+  +------+   |
|                                                        |
|  +--------------------------------------------------+ |
|  |   API Gateway (Spring Cloud Gateway, Kong)       | |
|  +--------------------------------------------------+ |
|                                                        |
|  +--------------------------------------------------+ |
|  |   Message Broker (Kafka)                         | |
|  +--------------------------------------------------+ |
+------------------------------------------------------+
```

### Ventajas
| Ventaja | Explicación |
|---------|-------------|
| **Escalado independiente** | Escalar solo el servicio que lo necesita |
| **Equipos autónomos** | Equipos dueños de servicios específicos |
| **Deploys independientes** | Desplegar cambios en un servicio sin afectar otros |
| **Tecnología heterogénea** | Cada servicio puede usar tecnología diferente |
| **Aislamiento de fallos** | Un fallo en un servicio no derriba todo el sistema |
| **Organización por dominio** | Alineado con bounded contexts (DDD) |

### Desventajas
| Desventaja | Explicación |
|------------|-------------|
| **Complejidad distribuida** | Red, latencia, consistencia eventual, debugging |
| **Overhead operacional** | Múltiples deploys, monitoreo, logging, CI/CD |
| **Testing integrado complejo** | Tests que cruzan servicios son difíciles |
| **Network latency** | Comunicación remota en lugar de llamadas en proceso |
| **Duplicación de datos** | Cada servicio tiene su BD (datos duplicados entre servicios) |
| **Coordinación de cambios** | Cambios que afectan múltiples servicios requieren coordinación |

---

## 4. ¿Monolito o Microservicios? Criterios de Decisión

| Factor | Monolito | Microservicios |
|--------|----------|----------------|
| **Tamaño del equipo** | <10 personas | >15 personas |
| **Complejidad del dominio** | Baja o media | Alta |
| **Velocidad de cambio** | Baja | Alta (cambios frecuentes en partes aisladas) |
| **Escalabilidad requerida** | Baja o media | Alta (componentes específicos escalan) |
| **Madurez operacional** | Baja (no hay DevOps) | Alta (CI/CD, infraestructura como código) |
| **Tolerancia a latencia** | Baja (todo en proceso) | Alta (puede tolerar latencia de red) |
| **Tiempo de desarrollo** | Corto (MVP) | Largo (overhead inicial) |

### Regla práctica

> **Empieza con Modular Monolith. Evoluciona a microservicios solo cuando el monolito duele.**

---

## 5. Modular Monolith (Monolito Modular)

Un monólogo con **disciplina de microservicios**: módulos bien delimitados, dependencias controladas, pero un solo deploy.

```
+----------------------------------------------------+
|              MODULAR MONOLITH                       |
|  +--------+  +--------+  +--------+  +--------+    |
|  | Orders |  |Payment |  |Product |  | Users  |    |
|  | Module |  | Module |  | Module |  | Module |    |
|  +--------+  +--------+  +--------+  +--------+    |
|       |           |           |           |         |
|  +----------------------------------------------+  |
|  |   Shared Kernel (Entities, VOs comunes)       |  |
|  +----------------------------------------------+  |
|  |   Common (Security, Config, Utils)            |  |
|  +----------------------------------------------+  |
|  |   Database (PostgreSQL - schemas separados)   |  |
|  +----------------------------------------------+  |
+----------------------------------------------------+
```

**Ventajas**: simplicidad del monólogo + disciplina de microservicios.
**Desventajas**: no hay escalado independiente ni deploys separados.

---

## 6. Patrones de Descomposición

### Por Capacidad de Negocio
Cada microservicio cubre una capacidad de negocio.

```
+-----------+  +---------+  +----------+  +--------+
| Payments |  | Catalog |  | Shipping |  | Orders |
+-----------+  +---------+  +----------+  +--------+
```

### Por Subdominio DDD
Cada microservicio = un bounded context.

```
+-----------+  +-----------+  +-----------+  +-----------+
| Order BC |  | Product BC |  | Payment BC|  | User BC  |
+-----------+  +-----------+  +-----------+  +-----------+
```

### Por Cambio (volatility)
Servicios separados por frecuencia de cambio.

```
+----------+  +-----------+  +----------+
| Core     |  | Feature A |  | Feature B|
| (cambia  |  | (cambia   |  | (cambia  |
|  lento)  |  |  rápido)  |  |  rápido) |
+----------+  +-----------+  +----------+
```

---

## 7. Strangler Fig Pattern

Patrón para migrar incrementalmente de monólogo a microservicios.

```
Fase 1: Monolito existente
+------------------+
|    MONOLITO      |
|  (Legacy App)    |
+------------------+

Fase 2: Extraer primer servicio
+--------+  +------------------+
| Nuevo   |  |    MONOLITO      |
| Servicio|  |  (menos módulo)  |
+--------+  +------------------+

Fase 3: Redirigir tráfico
+--------+  +------------------+
| Nuevo   |  |    MONOLITO      |
| Servicio|<--- (Gateway/Mesh)  |
+--------+  +------------------+

Fase 4: Eliminar código legacy
+--------+  +--------+  +--------+  +--------+
| Serv A |  | Serv B |  | Serv C |  | Serv D |
+--------+  +--------+  +--------+  +--------+
```

### Pasos
1. **Identificar** módulo candidato (bounded context)
2. **Extraer** como servicio independiente
3. **Redirigir** tráfico gradualmente
4. **Eliminar** código original del monólogo

---

## 8. Conway's Law

> "Las organizaciones diseñan sistemas que reflejan su estructura de comunicación." — Melvin Conway (1968)

### Implicaciones
- Si tienes 3 equipos que se comunican como silos, tendrás 3 servicios acoplados.
- Si quieres microservicios independientes, organiza equipos independientes.

### Inverse Conway Maneuver
Reestructurar la organización para lograr la arquitectura deseada.

```
Organización actual:
[Frontend Team] ←→ [Backend Team] ←→ [DB Team]
         → Monolito natural

Organización deseada (por dominio):
[Orders Team] [Payments Team] [Catalog Team] [Shipping Team]
         → Microservicios naturales
```

---

## 9. Tamaño del Microservicio

> "Suficientemente pequeño para ser manejable por un equipo, suficientemente grande para tener sentido de negocio."

### Señales de que un servicio es demasiado pequeño
- Tiene solo CRUD de una tabla
- Necesita coordinar con muchos otros servicios para hacer algo útil
- El overhead del servicio (CI/CD, BD, monitoreo) supera su beneficio

### Señales de que un servicio es demasiado grande
- Cubre múltiples bounded contexts
- Requiere más de un equipo para mantenerlo
- Tiene múltiples bases de datos lógicas en el mismo servicio

---

## 10. Laboratorio

Analizar E-Commerce Platform:
1. Identificar bounded contexts candidatos a microservicios
2. Diseñar la descomposición
3. Proponer Modular Monolith como paso intermedio
4. Planificar migración con Strangler Fig
5. Aplicar Conway's Law: ¿cómo organizarías los equipos?
