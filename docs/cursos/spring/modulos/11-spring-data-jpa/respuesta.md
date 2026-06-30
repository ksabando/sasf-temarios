---
sidebar_label: "Soluciones"
---
# Respuestas: Spring Data JPA y ORM

## Respuesta 1: Crear entidad Task

```java
package com.sasf.taskapi.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    private boolean completed = false;

    private LocalDate dueDate;

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
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
```

---

## Respuesta 2: Relaciones entre entidades

```java
// En Task.java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private User user;

@ManyToMany
@JoinTable(
    name = "task_labels",
    joinColumns = @JoinColumn(name = "task_id"),
    inverseJoinColumns = @JoinColumn(name = "label_id")
)
private Set<Label> labels = new HashSet<>();

@OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Comment> comments = new ArrayList<>();
```

```java
// User.java
package com.sasf.taskapi.model;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String username;
    private String email;
    @OneToMany(mappedBy = "user")
    private List<Task> tasks = new ArrayList<>();
    public User() {}
    public User(String username, String email) { this.username = username; this.email = email; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
}
```

```java
// Label.java
package com.sasf.taskapi.model;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "labels")
public class Label {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    private String color;
    @ManyToMany(mappedBy = "labels")
    private Set<Task> tasks = new HashSet<>();
    public Label() {}
    public Label(String name, String color) { this.name = name; this.color = color; }
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

```java
// Comment.java
package com.sasf.taskapi.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 1000)
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    public Comment() {}
    public Comment(String content) { this.content = content; }
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

## Respuesta 3: Repositorio JPA para Task

```java
package com.sasf.taskapi.repository;

import com.sasf.taskapi.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCompleted(boolean completed);
    List<Task> findByUserId(Long userId);
    List<Task> findByTitleContaining(String title);
}
```

---

## Respuesta 4: Repositorios adicionales

```java
// UserRepository.java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}

// LabelRepository.java
public interface LabelRepository extends JpaRepository<Label, Long> {
    Optional<Label> findByName(String name);
}

// CommentRepository.java
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskId(Long taskId);
}
```

---

## Respuesta 5: @JsonIgnore en propiedades

```java
// User.java
@OneToMany(mappedBy = "user")
@JsonIgnore
private List<Task> tasks;

@OneToMany(mappedBy = "user")
@JsonIgnore
private List<Comment> comments;

// Label.java
@ManyToMany(mappedBy = "labels")
@JsonIgnore
private Set<Task> tasks;

// Comment.java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "task_id")
@JsonIgnore
private Task task;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
@JsonIgnore
private User user;
```

Agregar `import com.fasterxml.jackson.annotation.JsonIgnore;` en cada archivo.

