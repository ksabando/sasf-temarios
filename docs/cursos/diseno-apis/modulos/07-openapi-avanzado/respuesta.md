---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Composición con allOf y oneOf

**Solución esperada**:

```yaml
components:
  schemas:
    BaseTask:
      type: object
      properties:
        title:
          type: string
          maxLength: 100
        description:
          type: string

    RecurringTask:
      allOf:
        - $ref: '#/components/schemas/BaseTask'
        - type: object
          required: [frequency]
          properties:
            frequency:
              type: string
              enum: [DAILY, WEEKLY, MONTHLY]
            nextOccurrence:
              type: string
              format: date-time

    EmailNotification:
      type: object
      properties:
        type:
          type: string
          enum: [email]
        subject:
          type: string
        to:
          type: string
          format: email
        body:
          type: string

    SMSNotification:
      type: object
      properties:
        type:
          type: string
          enum: [sms]
        phoneNumber:
          type: string
        message:
          type: string

    Notification:
      oneOf:
        - $ref: '#/components/schemas/EmailNotification'
        - $ref: '#/components/schemas/SMSNotification'
      discriminator:
        propertyName: type
        mapping:
          email: '#/components/schemas/EmailNotification'
          sms: '#/components/schemas/SMSNotification'
```

**Posibles mejoras**:
- Agregar un tercer tipo de notificación (`PushNotification`) al `Notification.oneOf` para demostrar extensibilidad. Con `discriminator.mapping`, agregar un nuevo tipo solo requiere agregar un schema y una entrada en el mapping — el resto de la spec no cambia.
- Incluir `description` en cada schema (especialmente `BaseTask`, `RecurringTask`, y `Notification`) explicando cuándo se usa cada uno. OpenAPI Generator usa estas descripciones para generar Javadoc en los modelos Java.
- Reemplazar `type: string` en el discriminador por una validación más robusta usando `const` (OpenAPI 3.1): `type: { const: "email" }` en lugar de `type: { type: string, enum: [email] }`. Esto es más idiomático en JSON Schema 2020-12 y evita que el campo `type` se interprete como lista de opciones cuando en realidad es un valor fijo por subtipo.

---

## Ejercicio 4: API-First con OpenAPI Generator

**Solución esperada**:

1. **Comando para generar código Spring:**
```bash
openapi-generator generate \
  -i openapi.yaml \
  -g spring \
  -o taskflow-generated \
  --api-package com.taskflow.api \
  --model-package com.taskflow.model \
  --additional-properties=useSpringBoot3=true,delegatePattern=true
```

2. **Interfaces generadas:**
   - `TasksApi` — interfaz con métodos `listTasks()` y `createTask()`
   - `TasksApiDelegate` — implementación delegada (para lógica de negocio)
   - `Task` — modelo (POJO)
   - `CreateTaskRequest` — modelo
   - `TasksApiController` — controller que implementa `TasksApi`

3. **Implementación del servicio:**
```java
@Component
public class TasksApiDelegateImpl implements TasksApiDelegate {

    private final TaskRepository taskRepository;

    public TasksApiDelegateImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public ResponseEntity<List<Task>> listTasks(String status) {
        List<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByStatus(TaskStatus.valueOf(status.toUpperCase()));
        } else {
            tasks = taskRepository.findAll();
        }
        return ResponseEntity.ok(tasks);
    }

    @Override
    public ResponseEntity<Task> createTask(CreateTaskRequest createTaskRequest) {
        Task task = new Task();
        task.setTitle(createTaskRequest.getTitle());
        task.setDescription(createTaskRequest.getDescription());
        task.setCompleted(false);
        Task saved = taskRepository.save(task);
        return ResponseEntity
            .created(URI.create("/tasks/" + saved.getId()))
            .body(saved);
    }
}
```

**Posibles mejoras**:
- Configurar `openapi-generator` para ignorar archivos que ya existen (flag `--global-property skipOverwrite=true`) para que los cambios manuales en el delegate no se pierdan al regenerar. Combinado con `.openapi-generator-ignore` para excluir archivos como `pom.xml` después de la primera generación.
- Usar el plugin de Maven/Gradle en lugar del CLI: `openapi-generator-maven-plugin` configurado en el `pom.xml` con ejecución en la fase `generate-sources`. Esto integra la generación en el build normal (no requiere un paso manual).
- Separar los modelos de OpenAPI de las entidades JPA: usar `openapi-generator` solo para los modelos de API (DTOs) y mapearlos manualmente a entidades JPA. Esto evita acoplar el contrato de la API a la estructura de la base de datos. El delegate implementa la traducción entre DTOs (generados) y entidades (manuales).

