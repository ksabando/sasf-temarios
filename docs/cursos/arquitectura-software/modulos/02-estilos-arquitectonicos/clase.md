---
sidebar_label: "Clase"
---

## 3. Arquitectura en Capas (Layered)

Organiza el sistema en capas horizontales, donde cada capa tiene una responsabilidad específica. La capa superior usa los servicios de la capa inferior.

```
+------------------------------------------------------+
|  Capa de Presentación (UI/API)                        |
|  Controladores REST, Vistas, DTOs                     |
+------------------------------------------------------+
          |  llamadas / dependencias
          v
+------------------------------------------------------+
|  Capa de Negocio (Business Logic)                     |
|  Servicios, Reglas de negocio, Validaciones           |
+------------------------------------------------------+
          |  llamadas / dependencias
          v
+------------------------------------------------------+
|  Capa de Persistencia (Data Access)                   |
|  Repositorios, DAOs, Mappers ORM                      |
+------------------------------------------------------+
          |  llamadas / dependencias
          v
+------------------------------------------------------+
|  Capa de Base de Datos                                |
|  PostgreSQL, MongoDB, etc.                            |
+------------------------------------------------------+
```

### Ventajas
- Separación de responsabilidades clara.
- Familiar para la mayoría de desarrolladores.
- Las capas pueden ser desarrolladas por equipos diferentes.
- Cada capa puede ser probada independientemente.

### Desventajas
- **Sangría de capas (Layers sandwich)**: una capa puede saltarse la inmediata inferior.
- **Acoplamiento**: cambios en capas inferiores afectan superiores.
- **Big Ball of Mud**: la capa de negocio tiende a crecer sin control.
- **Dependencias unidireccionales**: difícil de lograr en la práctica.

---

## 4. Pipes-and-Filters

Procesa datos en una secuencia de pasos (filtros) conectados por canales (pipes). Cada filtro transforma los datos de entrada y pasa el resultado al siguiente.

```
Datos   +--------+   +--------+   +--------+   +--------+
Entrada | Filtro |-->| Filtro |-->| Filtro |-->| Filtro |--> Salida
------->|  A     |   |  B     |   |  C     |   |  D     |
        +--------+   +--------+   +--------+   +--------+
           |             |             |             |
        Transforma    Filtra        Agrega        Formatea
        formato       datos         datos         salida
```

### Casos de uso
- **Unix pipes**: `cat log.txt | grep ERROR | sort | uniq -c`
- **ETL**: Extract → Transform → Load
- **Stream processing**: Apache Kafka Streams, Apache Flink
- **Compiladores**: análisis léxico → sintáctico → semántico → generación de código

### Ventajas
- Composición flexible (se pueden agregar/remover filtros).
- Componentes reutilizables.
- Procesamiento paralelo posible (pipeline).
- Fácil de entender y depurar.

### Desventajas
- Formato de datos compartido entre filtros (acoplamiento).
- No ideal para sistemas interactivos.
- Overhead de serialización/deserialización entre filtros.

---

## 5. Cliente-Servidor

Divide el sistema en dos roles: cliente (solicita servicios) y servidor (provee servicios). Puede tener múltiples variantes.

### Two-Tier

```
+--------+         +-----------+
| Cliente|  HTTP   | Servidor  |
| (React)|<------->| (Spring)  |
+--------+         +-----------+
                       |
                       v
                  +-----------+
                  | BD (SQL)  |
                  +-----------+
```

### Three-Tier

```
+--------+         +-----------+         +-----------+
| Cliente|  HTTP   | Servidor  |   JDBC  | Base de   |
| (React)|<------->| Aplicación|<------->| Datos     |
+--------+         +-----------+         +-----------+
                   | Lógica de |
                   | Negocio   |
                   +-----------+
```

### n-Tier
Múltiples capas de servidores: balanceador de carga → servidores de aplicación → caché → base de datos → colas.

### Ventajas
- Escalado independiente de clientes y servidores.
- Centralización de datos y lógica.
- Seguridad controlada en el servidor.
- Múltiples tipos de clientes (web, mobile, desktop).

### Desventajas
- Punto único de fallo (servidor).
- Latencia de red.
- Costo de infraestructura de servidores.
- Acoplamiento entre versiones de cliente y servidor.

---

## 6. Peer-to-Peer (P2P)

Todos los nodos son iguales (peers). No hay servidor central. Cada peer actúa como cliente y servidor simultáneamente.

```
       +------+
       | Peer |
       |  A   |
       +------+
       /      \
      /        \
+------+      +------+
| Peer |<---->| Peer |
|  B   |      |  C   |
+------+      +------+
    |            |
    v            v
+------+      +------+
| Peer |      | Peer |
|  D   |      |  E   |
+------+      +------+
```

### Casos de uso
- BitTorrent (distribución de archivos).
- Blockchain (ledger descentralizado).
- VoIP (Skype en sus inicios).
- Redes de sensores.

### Ventajas
- Descentralización total (sin punto único de fallo).
- Escalado horizontal natural (más peers = más recursos).
- Resistente a censura.
- Bajo costo de infraestructura.

### Desventajas
- Complejidad de coordinación.
- Seguridad (peers maliciosos).
- Consistencia de datos difícil.
- Latencia variable.

---

## 7. Space-Based Architecture (Arquitectura Basada en Espacio)

También conocida como Tuple Spaces. Los componentes se comunican mediante un espacio de tuplas compartido (en memoria), eliminando la necesidad de base de datos central.

```
+----------+     +----------+     +----------+
| Unidad   |     | Unidad   |     | Unidad   |
| Procesam.|     | Procesam.|     | Procesam.|
|  (PU)    |     |  (PU)    |     |  (PU)    |
+----------+     +----------+     +----------+
      \              |              /
       \             |             /
        +--------------------------+
        |    Espacio de Tuplas     |
        |   (Grid de Datos, ej:    |
        |    GigaSpaces, Hazelcast)|
        +--------------------------+
```

### Ventajas
- Escalado horizontal puro (agregar PUs).
- Alta disponibilidad (sin SPOF).
- Performance extrema (datos en memoria).

### Desventajas
- Complejidad de implementación.
- Consistencia eventual.
- Vendor lock-in.
- Costo de licencias.

---

## 8. Microkernel (Plugin Architecture)

Un núcleo mínimo (kernel) con funcionalidades básicas + plugins que extienden la funcionalidad.

```
+---------------------------------------------+
|                   APLICACIÓN                 |
|  +---------------------------------------+  |
|  |            CORE / KERNEL              |  |
|  |  Funcionalidad base, puntos de        |  |
|  |  extensión (extension points)         |  |
|  +---------------------------------------+  |
|         |          |           |             |
|         v          v           v             |
|  +----------+ +----------+ +----------+     |
|  | Plugin A | | Plugin B | | Plugin C |     |
|  | (Auth)   | | (Pagos)  | | (Reportes)|    |
|  +----------+ +----------+ +----------+     |
+---------------------------------------------+
```

### Ejemplos
- **Eclipse / VS Code**: kernel + plugins de lenguaje, themes, herramientas.
- **WordPress**: núcleo + plugins de SEO, seguridad, e-commerce.
- **Browsers**: núcleo + extensiones.

### Ventajas
- Extensible sin modificar el núcleo.
- Aislamiento de plugins (fallo en un plugin no afecta otros).
- Distribución independiente de plugins.

### Desventajas
- Complejidad del contrato plugin-core.
- Performance (indirección).
- Gestión de versiones de plugins.

---

## 9. Event-Driven Architecture (EDA)

Los componentes se comunican mediante eventos. Productores publican eventos, consumidores reaccionan. Cubierto en detalle en Módulo 07.

---

## 10. Service-Based Architecture (SBA)

Arquitectura intermedia entre monolito y microservicios. Grandes servicios modulares con cierta independencia.

### Comparación

```
Monolito:   [Todo en uno]
SBA:        [Servicio A][Servicio B][Servicio C] (servicios grandes, BD compartida)
Micro:      [A][B][C][D][E][F] (servicios pequeños, BD por servicio)
```

---

## 11. Criterios de Selección de Estilo

| Criterio | Pregunta clave |
|----------|---------------|
| **Dominio** | ¿El dominio es simple o complejo? ¿Hay procesos de negocio claros? |
| **Atributos de calidad** | ¿Qué QAs son críticos (disponibilidad, performance, escalabilidad)? |
| **Equipo** | ¿Qué tamaño y experiencia tiene el equipo? |
| **Organización** | ¿Cómo está estructurada la organización? (Conway's Law) |
| **Tecnología** | ¿Qué tecnologías están disponibles o prohibidas? |
| **Tiempo** | ¿Cuál es el horizonte de entrega? ¿MVP o sistema maduro? |
| **Crecimiento esperado** | ¿El sistema escalará significativamente? |

---

## 12. Laboratorio: Identificar Estilos

Analiza los siguientes sistemas y responde:

| Sistema | Estilo(s) predominante(s) |
|---------|--------------------------|
| Netflix | Microservicios + EDA |
| Uber | Microservicios + CQRS |
| Amazon | Service-Based + Microkernel |
| WordPress | Microkernel (Plugin) |
| BitTorrent | Peer-to-Peer |
| Google Search | Pipes-and-Filters (crawling) + Microservicios (indexing) |
| VS Code | Microkernel + Plugins |

**Propuesta inicial para E-Commerce Platform**: Modular Monolith con capas, evolucionando a microservicios por bounded context.
