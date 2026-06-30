---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3

**TaskStatsResponse.java**

```java
package com.sasf.taskapi.dto;

public class TaskStatsResponse {
    private long total;
    private long completed;
    private long pending;
    private double completionRate;

    // getters, setters, constructor
}
```

**TaskService.java**

```java
public TaskStatsResponse getStats() {
    long total = taskRepository.count();
    long completed = taskRepository.countByCompleted(true);
    long pending = total - completed;
    double rate = total > 0 ? (double) completed / total * 100 : 0;

    return new TaskStatsResponse(total, completed, pending, rate);
}
```

**TaskRepository.java**

```java
long countByCompleted(boolean completed);
```

**TaskController.java**

```java
@GetMapping("/stats")
public ResponseEntity<TaskStatsResponse> getStats() {
    return ResponseEntity.ok(taskService.getStats());
}
```

---

## Solución Ejercicio 4

**TaskRepository.java**

```java
@Query("SELECT t FROM Task t WHERE t.createdAt >= :date")
Page<Task> findByCreatedAfter(@Param("date") LocalDateTime date, Pageable pageable);
```

**TaskService.java**

```java
public Page<TaskResponse> findAll(Boolean completed, String search, LocalDateTime createdAfter, Pageable pageable) {
    // combinar con los filtros existentes
    if (createdAfter != null) {
        Page<Task> tasks = taskRepository.findByCreatedAfter(createdAfter, pageable);
        return tasks.map(taskMapper::toResponse);
    }
    // resto de filtros
}
```

**TaskController.java**

```java
@GetMapping
public ResponseEntity<Page<TaskResponse>> getAll(
        @PageableDefault(size = 10) Pageable pageable,
        @RequestParam(required = false) Boolean completed,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdAfter) {
    ...
}
```

---

## Solución Ejercicio 5

```java
package com.sasf.taskapi.mapper;

import com.sasf.taskapi.dto.TaskRequest;
import com.sasf.taskapi.dto.TaskResponse;
import com.sasf.taskapi.model.Task;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TaskMapperManual {

    public TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setCompleted(task.isCompleted());
        response.setCreatedAt(task.getCreatedAt());
        return response;
    }

    public List<TaskResponse> toResponseList(List<Task> tasks) {
        return tasks.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Task toEntity(TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setCompleted(request.isCompleted());
        return task;
    }

    public void updateEntity(Task task, TaskRequest request) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setCompleted(request.isCompleted());
    }
}
```

**Comparación:** MapStruct genera el código en tiempo de compilación, evitando errores manuales y ahorrando tiempo. Para proyectos grandes con muchos DTOs, MapStruct es muy superior. Para casos simples, el mapper manual es más fácil de depurar y no requiere configuración de build.

