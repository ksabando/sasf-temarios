---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 3: findByTitleContaining

```java
@DataJpaTest
@Sql({"/test-data/users.sql", "/test-data/tasks.sql"})
void shouldFindByTitleContaining() {
    List<Task> tasks = taskRepository.findByTitleContaining("Fix");
    assertThat(tasks).isNotEmpty();
    assertThat(tasks.get(0).getTitle()).isEqualTo("Fix login bug");
}
```

---

## Respuesta 4: TestContainers

```java
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TaskRepositoryTCTest {

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
    void shouldSaveTask() {
        Task task = taskRepository.save(new Task("TC Task", "TestContainers task"));
        assertThat(task.getId()).isNotNull();
    }
}
```

Dependencias necesarias:
- `org.testcontainers:testcontainers`
- `org.testcontainers:postgresql`
- `org.testcontainers:junit-jupiter`

---

## Respuesta 5: AssertJ avanzado

```java
@DataJpaTest
@Sql({"/test-data/users.sql", "/test-data/tasks.sql"})
void shouldVerifyTaskDetails() {
    List<Task> tasks = taskRepository.findAll();

    assertThat(tasks)
        .isNotEmpty()
        .allSatisfy(task -> assertThat(task.getUser()).isNotNull())
        .extracting(Task::getTitle, Task::getStatus)
        .contains(
            tuple("Fix login bug", TaskStatus.IN_PROGRESS),
            tuple("Write documentation", TaskStatus.PENDING)
        );
}
```

