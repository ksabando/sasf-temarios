---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Repositorio JPA para Task

Crea `TaskRepository` que extienda `JpaRepository<Task, Long>` con los métodos derivados:
- `List<Task> findByCompleted(boolean completed)`
- `List<Task> findByUserId(Long userId)`
- `List<Task> findByTitleContaining(String title)`

---

## Ejercicio 4: Repositorios para User, Label y Comment

Crea los repositorios:
- `UserRepository` con `findByUsername(String username)`
- `LabelRepository` con `findByName(String name)`
- `CommentRepository` con `findByTaskId(Long taskId)`

---

## Ejercicio 5: Evitar referencias circulares

Agrega `@JsonIgnore` en las propiedades que puedan causar recursión infinita al serializar:
- `User.tasks`
- `User.comments`
- `Label.tasks`
- `Comment.task`
- `Comment.user`
