---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 3: @Modifying

```java
@Modifying
@Query("UPDATE Task t SET t.completed = true WHERE t.project.id = :projectId")
int markTasksAsCompletedByProject(@Param("projectId") Long projectId);

@Modifying
@Query("DELETE FROM Task t WHERE t.completed = true AND t.dueDate < :date")
int deleteOldCompletedTasks(@Param("date") LocalDate date);
```

---

## Respuesta 4: Specifications

```java
public class TaskSpecification {
    public static Specification<Task> hasTitle(String title) {
        return (root, query, cb) ->
            title == null ? null :
                cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }
    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, cb) ->
            status == null ? null : cb.equal(root.get("status"), status);
    }
    public static Specification<Task> hasUserId(Long userId) {
        return (root, query, cb) ->
            userId == null ? null : cb.equal(root.get("user").get("id"), userId);
    }
}
```

```java
// Uso
Specification<Task> spec = Specification
    .where(TaskSpecification.hasTitle(title))
    .and(TaskSpecification.hasStatus(status))
    .and(TaskSpecification.hasUserId(userId));
List<Task> tasks = taskRepository.findAll(spec);
```

---

## Respuesta 5: Proyección con DTO

```java
package com.sasf.taskapi.dto;

public class TaskSummaryDTO {
    private Long id;
    private String title;
    private String status;
    private String userName;

    public TaskSummaryDTO(Long id, String title, String status, String userName) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.userName = userName;
    }
    // getters...
}
```

```java
@Query("SELECT new com.sasf.taskapi.dto.TaskSummaryDTO(" +
       "t.id, t.title, t.status, u.username) " +
       "FROM Task t JOIN t.user u")
List<TaskSummaryDTO> findAllTaskSummaries();
```

