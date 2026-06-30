---
sidebar_label: "Clase"
---

## 2. @AutoConfigureTestDatabase

Por defecto, `@DataJpaTest` usa una base de datos H2 en memoria.

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
// o usar la base de datos real:
// @AutoConfigureTestDatabase(replace = Replace.NONE)
class TaskRepositoryTest {
    // tests...
}
```

---

## 3. @Sql para carga de datos

```java
@DataJpaTest
@Sql({"/test-data/users.sql", "/test-data/tasks.sql"})
class TaskRepositorySqlTest {

    @Autowired
    private TaskRepository taskRepository;

    @Test
    void shouldFindTasksByStatus() {
        List<Task> tasks = taskRepository.findByStatus(TaskStatus.IN_PROGRESS);
        assertThat(tasks).hasSize(2);
        assertThat(tasks).extracting(Task::getTitle)
            .contains("Fix login bug", "Update dependencies");
    }

    @Test
    void shouldCountCompletedTasks() {
        long count = taskRepository.countByCompleted(true);
        assertThat(count).isEqualTo(1);
    }
}
```

### Archivos SQL de prueba

`src/test/resources/test-data/users.sql`

```sql
INSERT INTO users (id, username, email, full_name) VALUES
(1, 'admin', 'admin@test.com', 'Admin User'),
(2, 'jdoe', 'jdoe@test.com', 'John Doe');
```

`src/test/resources/test-data/tasks.sql`

```sql
INSERT INTO tasks (id, title, description, status, completed, user_id) VALUES
(1, 'Fix login bug', 'Users cannot login', 'IN_PROGRESS', false, 1),
(2, 'Update dependencies', 'Update to Spring Boot 3.x', 'IN_PROGRESS', false, 2),
(3, 'Write documentation', 'API docs needed', 'PENDING', false, 2),
(4, 'Deploy to production', 'Release v1.0', 'PENDING', true, 1);
```

---

## 4. TestContainers con PostgreSQL

### Dependencias

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

### Test con PostgreSQL container

```java
package com.sasf.taskapi.repository;

import com.sasf.taskapi.model.Task;
import com.sasf.taskapi.model.TaskStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TaskRepositoryTestContainersTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TaskRepository taskRepository;

    @Test
    void shouldSaveAndRetrieveTask() {
        Task task = new Task("Test with PostgreSQL", "Testing with real database");
        task = taskRepository.save(task);

        Task found = taskRepository.findById(task.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getTitle()).isEqualTo("Test with PostgreSQL");
    }
}
```

---

## 5. AssertJ para aserciones

AssertJ ofrece aserciones fluidas y legibles.

```java
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

@Test
void shouldFindTasksByUserId() {
    List<Task> tasks = taskRepository.findByUserId(1L);

    assertThat(tasks)
        .isNotEmpty()
        .hasSize(2)
        .extracting(Task::getTitle, Task::getStatus)
        .contains(
            tuple("Fix login bug", TaskStatus.IN_PROGRESS),
            tuple("Deploy to production", TaskStatus.PENDING)
        );
}

@Test
void shouldReturnEmptyWhenNoTasks() {
    List<Task> tasks = taskRepository.findByUserId(999L);
    assertThat(tasks).isEmpty();
}

@Test
void shouldFindByTitleContaining() {
    List<Task> tasks = taskRepository.findByTitleContaining("login");
    assertThat(tasks).hasSize(1);
    assertThat(tasks.get(0).getTitle()).containsIgnoringCase("LOGIN");
}
```

---

## 6. Test de consultas @Query

```java
@Test
void shouldFindOverdueTasks() {
    List<Task> overdue = taskRepository.findOverdueTasks();
    assertThat(overdue).isNotEmpty();
    assertThat(overdue).allSatisfy(task -> {
        assertThat(task.getDueDate()).isBefore(LocalDate.now());
        assertThat(task.isCompleted()).isFalse();
    });
}

@Test
void shouldCountByPriority() {
    long count = taskRepository.countByPriority(TaskPriority.HIGH);
    assertThat(count).isPositive();
}
```

---

## 7. Test con @Transactional

```java
@DataJpaTest
@Transactional
class TaskServiceTest {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldCreateTaskForUser() {
        User user = userRepository.save(new User("test", "test@test.com", "Test"));

        Task task = new Task("New Task", "Description");
        task.setUser(user);
        task = taskRepository.save(task);

        assertThat(task.getId()).isNotNull();
        assertThat(taskRepository.count()).isEqualTo(1);
    }
}
```

---

## 8. Resumen

- `@DataJpaTest` configura solo la capa de datos
- H2 en memoria por defecto para tests rápidos
- `@Sql` carga datos SQL antes de los tests
- TestContainers permite probar con PostgreSQL real
- AssertJ proporciona aserciones expresivas
- Cada test es transaccional y se revierte al finalizar
