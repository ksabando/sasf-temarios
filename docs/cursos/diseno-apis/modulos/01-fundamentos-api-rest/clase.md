---
sidebar_label: "Clase"
---

# Módulo 01 — Fundamentos de APIs y REST

## 1. ¿Qué es una API?

**API (Application Programming Interface):** conjunto de reglas y protocolos que permite que dos aplicaciones se comuniquen entre sí. Una API define los métodos, formatos y contratos para que un cliente consuma recursos de un servidor.

| Concepto | Definición |
|----------|-----------|
| **API** | Interfaz de comunicación entre sistemas |
| **SDK** | Kit de desarrollo que incluye APIs, herramientas y documentación |
| **Librería** | Código reutilizable empaquetado para un propósito específico |
| **Servicio** | Componente independiente que expone funcionalidad via red |

## 2. Historia de las APIs

```
SOAP (1998) → XML-RPC (1998) → REST (2000) → GraphQL (2015) → gRPC (2015)
```

- **SOAP (Simple Object Access Protocol):** Protocolo basado en XML, pesado, estricto, con WSDL. Usado en sistemas empresariales (bancos, gobierno).
- **XML-RPC:** Predecesor de SOAP, llamadas a procedimientos remotos con XML.
- **REST (Representational State Transfer):** Estilo arquitectónico definido por Roy Fielding en su tesis doctoral (2000). Basado en recursos, HTTP, y representaciones.
- **GraphQL:** Lenguaje de consulta creado por Facebook (2015). El cliente especifica exactamente qué datos necesita.
- **gRPC:** Framework de Google basado en Protocol Buffers y HTTP/2. Alto rendimiento, streaming nativo.

## 3. Las 6 Restricciones de REST (Fielding)

1. **Cliente-Servidor:** Separación de responsabilidades. UI independiente del almacenamiento.
2. **Stateless:** Cada petición contiene toda la información necesaria. El servidor no almacena estado de sesión.
3. **Cacheable:** Las respuestas deben declarar explícitamente si son cacheables (Cache-Control, ETag).
4. **Layered System:** El cliente no puede saber si se comunica directamente con el servidor final o con un intermediario.
5. **Uniform Interface:** Identificación de recursos, manipulación via representaciones, mensajes auto-descriptivos, HATEOAS.
6. **Code on Demand (opcional):** El servidor puede extender la funcionalidad del cliente enviando código ejecutable.

## 4. Richardson Maturity Model

| Nivel | Nombre | Descripción |
|-------|--------|-------------|
| 0 | **Swamp of POX** | Usa HTTP como túnel. Un solo endpoint POST. SOAP/XML-RPC |
| 1 | **Resources** | Múltiples URLs (recursos), pero un solo método HTTP |
| 2 | **HTTP Verbs** | Usa GET, POST, PUT, DELETE correctamente + códigos de estado |
| 3 | **HATEOAS** | Hypermedia controls. El servidor guía al cliente via links |

## 5. Recursos vs Endpoints

- **Recurso:** Entidad conceptual (Task, User, Order). Es la abstracción.
- **Endpoint:** URL concreta donde se accede al recurso via HTTP.

```
Recurso: Task (tarea)
Endpoint: GET /api/tasks       → colección de tareas
Endpoint: GET /api/tasks/{id}  → tarea específica
```

`/tasks` NO es el recurso, es el endpoint que expone la colección del recurso Task.

## 6. Idempotencia

| Método | Idempotente | Seguro |
|--------|-------------|--------|
| GET | Sí | Sí |
| POST | No | No |
| PUT | Sí | No |
| PATCH | No | No |
| DELETE | Sí | No |

## 7. Proyecto Base: TaskFlow API

API de gestión de tareas personales. Tecnología: Spring Boot 3.x.

### Requerimientos funcionales
- CRUD de tareas
- Asignación de tareas a usuarios
- Comentarios en tareas
- Archivos adjuntos
- Categorización y etiquetado

### Setup del proyecto

```xml
<!-- pom.xml dependencies -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Modelo inicial: Task

```java
@Entity
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private LocalDateTime createdAt;
    // getters y setters
}
```

### Primer endpoint

```java
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final List<Task> tasks = new ArrayList<>();

    @GetMapping
    public List<Task> getAllTasks() {
        return tasks;
    }
}
```

## 8. Statelessness en detalle

Cada request HTTP contiene toda la información necesaria para procesarla:
- Authentication headers (Authorization: Bearer <token>)
- Contexto en headers (Accept, Content-Type)
- Datos en body, query params, path params

El servidor **no almacena** sesión entre requests. Esto permite escalabilidad horizontal.

## 9. Cacheabilidad

Respuestas deben indicar si son cacheables:
```
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Expires: Wed, 21 Oct 2026 07:28:00 GMT
```

## 10. Uniform Interface

1. **Identificación de recursos:** `/api/tasks/123`
2. **Manipulación via representaciones:** Client envía JSON, server responde JSON
3. **Mensajes auto-descriptivos:** Headers Content-Type, Accept definen formato
4. **HATEOAS:** Links que guían al cliente (Nivel 3 Richardson)
