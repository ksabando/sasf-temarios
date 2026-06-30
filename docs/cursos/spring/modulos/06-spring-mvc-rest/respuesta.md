---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3

**TaskService.java**

```java
public Task markAsCompleted(Long id) {
    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    task.setCompleted(true);
    return taskRepository.save(task);
}
```

**TaskController.java**

```java
@PatchMapping("/{id}/complete")
public ResponseEntity<Task> markAsCompleted(@PathVariable Long id) {
    Task updated = taskService.markAsCompleted(id);
    return ResponseEntity.ok(updated);
}
```

---

## Solución Ejercicio 4

```java
@PostMapping
public ResponseEntity<Task> create(@RequestBody Task task) {
    Task created = taskService.save(task);
    URI location = URI.create("/api/tasks/" + created.getId());
    return ResponseEntity.created(location).body(created);
}
```

`ResponseEntity.created(location)` automáticamente establece status 201 y el header `Location`.

---

## Solución Ejercicio 5

**pom.xml**

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>
```

**TaskController.java**

```java
@GetMapping(produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
public ResponseEntity<List<Task>> getAll() {
    List<Task> tasks = taskService.findAll();
    return ResponseEntity.ok(tasks);
}
```

Con Jackson XML en el classpath, Spring lo detecta automáticamente y negocia el formato según el header `Accept`. Para probar:

```bash
curl -H "Accept: application/json" http://localhost:8080/api/tasks
curl -H "Accept: application/xml" http://localhost:8080/api/tasks
```

