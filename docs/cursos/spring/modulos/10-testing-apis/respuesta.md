---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3

```java
@ParameterizedTest
@CsvSource({
    "'', 'Title is required'",
    "'AB', 'Title must be between 3 and 100 characters'"
})
void createTask_WithInvalidTitle_ShouldReturn400(String title, String expectedError) throws Exception {
    String json = "{ \"title\": \"" + title + "\", \"description\": \"test\" }";

    mockMvc.perform(post("/api/tasks")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isBadRequest());
}

@Test
void createTask_WithDescriptionExceeding500Chars_ShouldReturn400() throws Exception {
    String longDesc = "a".repeat(501);
    String json = "{ \"title\": \"Valid title\", \"description\": \"" + longDesc + "\" }";

    mockMvc.perform(post("/api/tasks")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isBadRequest());
}
```

---

## Solución Ejercicio 4

**application-test.properties**

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
```

**Dependencia H2 en pom.xml**

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

**TaskIntegrationTest.java**

```java
@SpringBootTest
@ActiveProfiles("test")
class TaskIntegrationTest {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCreateAndRetrieveTask() {
        Task task = new Task("Integration test task", "Created during integration test");
        Task saved = taskRepository.save(task);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Integration test task");
        assertThat(saved.isCompleted()).isFalse();
        assertThat(saved.getCreatedAt()).isNotNull();

        Task found = taskRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getTitle()).isEqualTo(saved.getTitle());
    }

    @Test
    void shouldReturnTasksViaApi() {
        taskRepository.save(new Task("API task 1", "First"));
        taskRepository.save(new Task("API task 2", "Second"));

        ResponseEntity<String> response = restTemplate.getForEntity("/api/tasks", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("API task 1");
        assertThat(response.getBody()).contains("API task 2");
    }
}
```

---

## Solución Ejercicio 5

**pom.xml (JaCoCo config)**

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.12</version>
    <executions>
        <execution>
            <id>prepare-agent</id>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>verify</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <limits>
                            <limit>
                                <counter>INSTRUCTION</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
                <excludes>
                    <exclude>com/sasf/taskapi/dto/**</exclude>
                    <exclude>com/sasf/taskapi/config/**</exclude>
                    <exclude>com/sasf/taskapi/TaskFlowApplication.class</exclude>
                </excludes>
            </configuration>
        </execution>
    </executions>
</plugin>
```

Ejecutar:

```bash
mvn clean verify
```

El reporte estará en `target/site/jacoco/index.html`. Si la cobertura es menor al 80%, el build fallará.

