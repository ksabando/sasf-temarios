---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3

**ValidationGroups.java**

```java
package com.sasf.taskapi.validation;

public interface ValidationGroups {
    interface Create {}
    interface Update {}
}
```

**TaskRequest.java**

```java
public class TaskRequest {

    @NotBlank(message = "Title is required", groups = ValidationGroups.Create.class)
    @Size(min = 3, max = 100, groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    @ValidTaskTitle(groups = {ValidationGroups.Create.class, ValidationGroups.Update.class})
    private String title;

    @Size(max = 500)
    private String description;

    private boolean completed;

    // getters y setters
}
```

**TaskController.java**

```java
@PostMapping
public ResponseEntity<TaskResponse> create(
        @RequestBody @Validated(ValidationGroups.Create.class) TaskRequest request) { ... }

@PutMapping("/{id}")
public ResponseEntity<TaskResponse> update(
        @PathVariable Long id,
        @RequestBody @Validated(ValidationGroups.Update.class) TaskRequest request) { ... }
```

---

## Solución Ejercicio 4

```java
package com.sasf.taskapi.dto;

import jakarta.validation.constraints.Size;

public class TaskPartialUpdateRequest {

    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private Boolean completed; // Usamos Boolean (wrapper) para detectar null

    // getters y setters
}
```

**TaskService.java**

```java
public TaskResponse partialUpdate(Long id, TaskPartialUpdateRequest request) {
    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task", id));

    if (request.getTitle() != null) {
        task.setTitle(request.getTitle());
    }
    if (request.getDescription() != null) {
        task.setDescription(request.getDescription());
    }
    if (request.getCompleted() != null) {
        task.setCompleted(request.getCompleted());
    }

    Task updated = taskRepository.save(task);
    return taskMapper.toResponse(updated);
}
```

**TaskController.java**

```java
@PatchMapping("/{id}")
public ResponseEntity<TaskResponse> partialUpdate(
        @PathVariable Long id,
        @RequestBody @Valid TaskPartialUpdateRequest request) {
    TaskResponse updated = taskService.partialUpdate(id, request);
    return ResponseEntity.ok(updated);
}
```

---

## Solución Ejercicio 5

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationErrors(MethodArgumentNotValidException ex) {
        log.error("Validation error: {}", ex.getMessage());

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Validation Error");
        problem.setDetail("One or more fields are invalid");
        problem.setType(URI.create("https://api.taskflow.com/errors/validation"));

        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        problem.setProperty("errors", errors);

        return ResponseEntity.badRequest().body(problem);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        // ...
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGeneral(Exception ex) {
        log.error("Unexpected error: ", ex);

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setTitle("Internal Server Error");
        problem.setDetail("An unexpected error occurred");
        problem.setType(URI.create("https://api.taskflow.com/errors/internal"));

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}
```

