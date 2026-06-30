---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 3: Locking pesimista

```java
// TaskRepository.java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT t FROM Task t WHERE t.id = :id")
Optional<Task> findByIdWithPessimisticLock(@Param("id") Long id);
```

```java
// TaskService.java
@Transactional
public void reassignTaskWithLock(Long taskId, Long newUserId) {
    Task task = taskRepository.findByIdWithPessimisticLock(taskId)
        .orElseThrow(() -> new RuntimeException("Task not found"));
    User user = userRepository.findById(newUserId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    task.setUser(user);
    taskRepository.save(task);
}
```

Con `PESSIMISTIC_WRITE`, la base de datos bloquea el registro con `SELECT ... FOR UPDATE`, impidiendo que otras transacciones lo modifiquen hasta que la transacción actual finalice.

---

## Respuesta 4: V1__create_tasks_table.sql

```sql
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    completed BOOLEAN DEFAULT FALSE,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Respuesta 5: V2 y V3

**V2__seed_initial_data.sql**

```sql
INSERT INTO users (username, email) VALUES ('admin', 'admin@taskapi.com');
INSERT INTO users (username, email) VALUES ('jdoe', 'jdoe@taskapi.com');

INSERT INTO tasks (title, description, status, user_id) VALUES
('Setup development environment', 'Install Java, Maven, Docker', 'PENDING', 1),
('Create REST API', 'Implement Task CRUD endpoints', 'IN_PROGRESS', 2),
('Write unit tests', 'Cover service layer with JUnit', 'PENDING', 2);
```

**V3__add_priority_column.sql**

```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM';
```

