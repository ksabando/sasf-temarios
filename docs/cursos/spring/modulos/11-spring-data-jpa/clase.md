---
sidebar_label: "Clase"
---

## 2. Configuración en `application.properties`

```properties
spring.datasource.url=jdbc:h2:mem:taskdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

- `ddl-auto=update`: Hibernate crea/actualiza tablas automáticamente
- `show-sql`: muestra las consultas SQL generadas
- `h2.console`: permite inspeccionar H2 en `/h2-console`

---

## 3. Entidades

### Task.java

```java
package com.sasf.taskapi.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private TaskPriority priority = TaskPriority.MEDIUM;

    private LocalDate dueDate;

    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToMany
    @JoinTable(
        name = "task_labels",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    private Set<Label> labels = new HashSet<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    public Task() {}

    public Task(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Set<Label> getLabels() { return labels; }
    public void setLabels(Set<Label> labels) { this.labels = labels; }
    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
}
```

### TaskStatus.java

```java
package com.sasf.taskapi.model;

public enum TaskStatus {
    PENDING, IN_PROGRESS, COMPLETED, CANCELLED
}
```

### TaskPriority.java

```java
package com.sasf.taskapi.model;

public enum TaskPriority {
    LOW, MEDIUM, HIGH, CRITICAL
}
```

### User.java

```java
package com.sasf.taskapi.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    private String fullName;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Comment> comments = new ArrayList<>();

    public User() {}

    public User(String username, String email, String fullName) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
}
```

### Label.java

```java
package com.sasf.taskapi.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "labels")
public class Label {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String color;

    @ManyToMany(mappedBy = "labels")
    @JsonIgnore
    private Set<Task> tasks = new HashSet<>();

    public Label() {}

    public Label(String name, String color) {
        this.name = name;
        this.color = color;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public Set<Task> getTasks() { return tasks; }
    public void setTasks(Set<Task> tasks) { this.tasks = tasks; }
}
```

### Project.java

```java
package com.sasf.taskapi.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Task> tasks = new ArrayList<>();

    public Project() {}

    public Project(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
}
```

### Comment.java

```java
package com.sasf.taskapi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnore
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    public Comment() {}

    public Comment(String content, Task task, User user) {
        this.content = content;
        this.task = task;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
```

---

## 4. Fetch Types: LAZY vs EAGER

| Fetch Type | Comportamiento |
|------------|----------------|
| `LAZY` | Las colecciones/relaciones se cargan bajo demanda. Requiere transacción activa. |
| `EAGER` | Las colecciones/relaciones se cargan inmediatamente con la entidad principal. |

- Usar `LAZY` por defecto para evitar problemas de rendimiento
- `@ManyToOne` es `EAGER` por defecto; `@OneToMany` y `@ManyToMany` son `LAZY`

---

## 5. Repositorios JPA

### TaskRepository.java

```java
package com.sasf.taskapi.repository;

import com.sasf.taskapi.model.Task;
import com.sasf.taskapi.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByCompleted(boolean completed);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByTitleContaining(String title);
    List<Task> findByProjectId(Long projectId);
    long countByCompleted(boolean completed);
}
```

### UserRepository.java

```java
package com.sasf.taskapi.repository;

import com.sasf.taskapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
}
```

### LabelRepository.java

```java
package com.sasf.taskapi.repository;

import com.sasf.taskapi.model.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LabelRepository extends JpaRepository<Label, Long> {
    Optional<Label> findByName(String name);
}
```

### CommentRepository.java

```java
package com.sasf.taskapi.repository;

import com.sasf.taskapi.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskId(Long taskId);
    List<Comment> findByUserId(Long userId);
}
```

### ProjectRepository.java

```java
package com.sasf.taskapi.repository;

import com.sasf.taskapi.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByName(String name);
}
```

---

## 6. @JsonIgnore para evitar referencias circulares

Sin `@JsonIgnore`, serializar un `User` con sus `Task` que a su vez tienen un `User` causaría recursión infinita. La anotación rompe el ciclo.

Alternativas:
- `@JsonManagedReference` / `@JsonBackReference`
- `@JsonIgnoreProperties`

---

## 7. Diagrama de Relaciones

```
User ────1:N────► Task
Project ─1:N────► Task
Task ────N:M────► Label
Task ────1:N────► Comment
User ────1:N────► Comment
```

---

## 8. Resumen

- `@Entity` mapea clases Java a tablas
- `@Id` + `@GeneratedValue` definen la clave primaria
- `@ManyToOne`, `@OneToMany`, `@ManyToMany` modelan relaciones
- `JpaRepository` proporciona CRUD automático
- Los repositorios heredan métodos `findAll()`, `findById()`, `save()`, `deleteById()`
- `@JsonIgnore` evita loops en la serialización JSON
