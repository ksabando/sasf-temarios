---
sidebar_label: "Clase"
---

## 2. @Query con JPQL

JPQL (Java Persistence Query Language) trabaja con objetos Java, no con tablas.

```java
@Query("SELECT t FROM Task t WHERE t.status = :status ORDER BY t.dueDate ASC")
List<Task> findByStatusOrderedByDueDate(@Param("status") TaskStatus status);

@Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.completed = :completed")
List<Task> findByUserIdAndCompleted(@Param("userId") Long userId,
                                     @Param("completed") boolean completed);

@Query("SELECT COUNT(t) FROM Task t WHERE t.priority = :priority")
long countByPriority(@Param("priority") TaskPriority priority);
```

### Consultas con JOIN

```java
@Query("SELECT t FROM Task t JOIN FETCH t.user WHERE t.id = :id")
Optional<Task> findByIdWithUser(@Param("id") Long id);

@Query("SELECT t FROM Task t LEFT JOIN FETCH t.labels WHERE t.id = :id")
Optional<Task> findByIdWithLabels(@Param("id") Long id);

@Query("SELECT DISTINCT t FROM Task t LEFT JOIN FETCH t.labels LEFT JOIN FETCH t.comments")
List<Task> findAllWithDetails();
```

### Consultas nativas

```java
@Query(value = "SELECT * FROM tasks WHERE due_date < CURRENT_DATE AND completed = false",
       nativeQuery = true)
List<Task> findOverdueTasksNative();
```

---

## 3. @Modifying

Para operaciones de escritura con `@Query`.

```java
@Modifying
@Query("UPDATE Task t SET t.completed = true WHERE t.id = :id")
int markAsCompleted(@Param("id") Long id);

@Modifying
@Query("UPDATE Task t SET t.status = :status WHERE t.id = :id")
int updateStatus(@Param("id") Long id, @Param("status") TaskStatus status);

@Modifying
@Query("DELETE FROM Task t WHERE t.completed = true AND t.dueDate < :date")
int deleteCompletedBefore(@Param("date") LocalDate date);
```

Requiere `@Transactional` en el servicio que llama al método.

---

## 4. Criteria API

API tipada para construir consultas dinámicamente.

```java
@Service
public class TaskSearchService {

    @Autowired
    private EntityManager entityManager;

    public List<Task> searchTasks(String title, TaskStatus status, Long userId) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Task> query = cb.createQuery(Task.class);
        Root<Task> task = query.from(Task.class);

        List<Predicate> predicates = new ArrayList<>();

        if (title != null && !title.isEmpty()) {
            predicates.add(cb.like(cb.lower(task.get("title")),
                                   "%" + title.toLowerCase() + "%"));
        }
        if (status != null) {
            predicates.add(cb.equal(task.get("status"), status));
        }
        if (userId != null) {
            predicates.add(cb.equal(task.get("user").get("id"), userId));
        }

        query.where(cb.and(predicates.toArray(new Predicate[0])));
        query.orderBy(cb.desc(task.get("dueDate")));

        return entityManager.createQuery(query).getResultList();
    }
}
```

---

## 5. JpaSpecificationExecutor

Abstracción más limpia para consultas dinámicas.

### TaskSpecification.java

```java
package com.sasf.taskapi.specification;

import com.sasf.taskapi.model.Task;
import com.sasf.taskapi.model.TaskStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

public class TaskSpecification {

    public static Specification<Task> hasTitle(String title) {
        return (root, query, cb) ->
            title == null ? null : cb.like(cb.lower(root.get("title")),
                                            "%" + title.toLowerCase() + "%");
    }

    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, cb) ->
            status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Task> hasUserId(Long userId) {
        return (root, query, cb) ->
            userId == null ? null : cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Task> isOverdue() {
        return (root, query, cb) ->
            cb.and(cb.lessThan(root.get("dueDate"), LocalDate.now()),
                   cb.equal(root.get("completed"), false));
    }

    public static Specification<Task> hasPriority(TaskPriority priority) {
        return (root, query, cb) ->
            priority == null ? null : cb.equal(root.get("priority"), priority);
    }
}
```

### TaskRepository extendido

```java
public interface TaskRepository extends JpaRepository<Task, Long>,
                                        JpaSpecificationExecutor<Task> {
    // métodos existentes...
}
```

### Uso en servicio

```java
public List<Task> searchTasks(String title, TaskStatus status, Long userId) {
    Specification<Task> spec = Specification
        .where(TaskSpecification.hasTitle(title))
        .and(TaskSpecification.hasStatus(status))
        .and(TaskSpecification.hasUserId(userId));
    return taskRepository.findAll(spec);
}
```

---

## 6. Pageable y Sort

```java
Page<Task> findByUserId(Long userId, Pageable pageable);
List<Task> findByCompleted(boolean completed, Sort sort);
```

```java
// Uso
Pageable pageable = PageRequest.of(0, 10, Sort.by("dueDate").descending());
Page<Task> page = taskRepository.findByUserId(1L, pageable);
```

---

## 7. Proyecciones

### Interface-based Projection

```java
public interface TaskSummary {
    Long getId();
    String getTitle();
    TaskStatus getStatus();
    String getUserName();
}
```

```java
@Query("SELECT t.id AS id, t.title AS title, t.status AS status, " +
       "u.username AS userName FROM Task t JOIN t.user u")
List<TaskSummary> findAllTaskSummaries();
```

### Class-based Projection (DTO)

```java
public class TaskDTO {
    private Long id;
    private String title;
    private TaskStatus status;
    private String userName;

    public TaskDTO(Long id, String title, TaskStatus status, String userName) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.userName = userName;
    }
    // getters...
}
```

```java
@Query("SELECT new com.sasf.taskapi.dto.TaskDTO(t.id, t.title, t.status, u.username) " +
       "FROM Task t JOIN t.user u WHERE t.completed = :completed")
List<TaskDTO> findTaskDTOsByCompleted(@Param("completed") boolean completed);
```

---

## 8. Resumen

- **Derived methods**: consultas simples por nombre de método
- **@Query**: JPQL o SQL nativo para consultas complejas
- **@Modifying**: operaciones INSERT/UPDATE/DELETE con `@Query`
- **Criteria API**: consultas dinámicas programáticas
- **JpaSpecificationExecutor**: Specifications reutilizables para filtros dinámicos
- **Pageable/Sort**: paginación y ordenamiento
- **Projections**: DTOs y interfaces para optimizar consultas
