---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Composición con allOf y oneOf

Usando composición de schemas, diseña:

1. **allOf:** Crea `RecurringTask` que extiende `BaseTask` con campos adicionales: `frequency` (enum: DAILY, WEEKLY, MONTHLY), `nextOccurrence` (date-time)
2. **oneOf:** Crea `Notification` que puede ser `EmailNotification` (subject, to, body) o `SMSNotification` (phoneNumber, message)

Escribe la sección `components/schemas` completa.

---

## Ejercicio 4: API-First con OpenAPI Generator

Dado el siguiente fragmento de spec:

```yaml
openapi: 3.1.0
info:
  title: TaskFlow API
  version: 2.0.0
paths:
  /tasks:
    get:
      operationId: listTasks
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, COMPLETED]
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
    post:
      operationId: createTask
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Created
components:
  schemas:
    Task:
      type: object
      properties:
        id: { type: integer }
        title: { type: string }
        completed: { type: boolean }
    CreateTaskRequest:
      type: object
      required: [title]
      properties:
        title: { type: string }
        description: { type: string }
```

1. ¿Qué comando usarías para generar código Spring?
2. ¿Qué interfaces/controladores se generarían?
3. Escribe la implementación del servicio `listTasks` que retorne tareas filtradas por status
