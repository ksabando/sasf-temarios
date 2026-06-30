---
sidebar_label: "Clase"
---

## 2. Propagation

```java
@Transactional(propagation = Propagation.REQUIRED)  // por defecto
@Transactional(propagation = Propagation.REQUIRES_NEW) // nueva transacción
@Transactional(propagation = Propagation.NESTED)    // subtransacción
@Transactional(propagation = Propagation.MANDATORY) // debe existir transacción
@Transactional(propagation = Propagation.NEVER)     // no debe haber transacción
@Transactional(propagation = Propagation.SUPPORTS)  // opcional
@Transactional(propagation = Propagation.NOT_SUPPORTED) // pausa la transacción actual
```

---

## 3. Isolation Levels

```java
@Transactional(isolation = Isolation.READ_UNCOMMITTED)
@Transactional(isolation = Isolation.READ_COMMITTED)   // por defecto en PostgreSQL
@Transactional(isolation = Isolation.REPEATABLE_READ)
@Transactional(isolation = Isolation.SERIALIZABLE)
```

| Aislamiento | Dirty Read | Non-repeatable | Phantom |
|-------------|-----------|----------------|---------|
| READ_UNCOMMITTED | Sí | Sí | Sí |
| READ_COMMITTED | No | Sí | Sí |
| REPEATABLE_READ | No | No | Sí |
| SERIALIZABLE | No | No | No |

---

## 4. Locking Optimista con @Version

```java
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Integer version;

    // resto de campos...
}
```

Cuando dos usuarios intentan modificar la misma tarea simultáneamente, el primero en commitear gana. El segundo recibe `OptimisticLockException`.

```java
@Transactional
public void updateTaskTitle(Long id, String newTitle) {
    Task task = taskRepository.findById(id).orElseThrow();
    task.setTitle(newTitle);
    taskRepository.save(task);
    // Si otro usuario ya actualizó esta tarea desde que se cargó,
    // se lanza OptimisticLockException al hacer flush
}
```

---

## 5. Locking Pesimista

```java
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Task t WHERE t.id = :id")
    Optional<Task> findByIdWithPessimisticLock(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT t FROM Task t WHERE t.id = :id")
    Optional<Task> findByIdWithPessimisticRead(@Param("id") Long id);
}
```

```java
@Transactional
public void reassignWithLock(Long taskId, Long newUserId) {
    Task task = taskRepository.findByIdWithPessimisticLock(taskId)
        .orElseThrow(() -> new RuntimeException("Task not found"));
    User user = userRepository.findById(newUserId).orElseThrow();
    task.setUser(user);
    taskRepository.save(task);
}
```

`PESSIMISTIC_WRITE` bloquea el registro con `SELECT ... FOR UPDATE`.

---

## 6. Flyway - Migraciones

### Dependencia en pom.xml

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

### Configuración

```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.jpa.hibernate.ddl-auto=validate
```

Con `ddl-auto=validate`, Flyway gestiona el esquema y Hibernate solo valida que las entidades coincidan.

### Migraciones

Archivos SQL en `src/main/resources/db/migration/` con formato `V<numero>__<descripcion>.sql`.

#### V1__create_users_table.sql

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### V2__create_projects_table.sql

```sql
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### V3__create_tasks_table.sql

```sql
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    version INTEGER DEFAULT 0,
    user_id BIGINT,
    project_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

#### V4__create_labels_table.sql

```sql
CREATE TABLE labels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#007bff'
);
```

#### V5__create_task_labels_table.sql

```sql
CREATE TABLE task_labels (
    task_id BIGINT NOT NULL,
    label_id BIGINT NOT NULL,
    PRIMARY KEY (task_id, label_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (label_id) REFERENCES labels(id)
);
```

#### V6__create_comments_table.sql

```sql
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### V7__seed_data.sql

```sql
INSERT INTO users (username, email, full_name) VALUES
('admin', 'admin@taskapi.com', 'Admin User'),
('jdoe', 'jdoe@taskapi.com', 'John Doe');

INSERT INTO projects (name, description) VALUES
('Project Alpha', 'First project'),
('Project Beta', 'Second project');

INSERT INTO labels (name, color) VALUES
('bug', '#dc3545'),
('feature', '#28a745'),
('documentation', '#17a2b8');

INSERT INTO tasks (title, description, status, user_id, project_id) VALUES
('Fix login bug', 'User cannot login with special characters', 'IN_PROGRESS', 2, 1),
('Add export feature', 'Export tasks to CSV', 'PENDING', 2, 1),
('Write API docs', 'Document all endpoints', 'PENDING', 1, 2);
```

---

## 7. Comandos Flyway

```bash
# En la terminal
mvn flyway:migrate    # Ejecuta migraciones pendientes
mvn flyway:info       # Muestra estado de migraciones
mvn flyway:repair     # Repara la tabla de historial
mvn flyway:baseline   # Establece línea base
```

---

## 8. Resumen

- `@Transactional` simplifica el manejo de transacciones
- `@Version` habilita locking optimista
- `@Lock` proporciona locking pesimista con `PESSIMISTIC_WRITE`/`READ`
- Flyway gestiona el esquema de base de datos con migraciones versionadas
- Las migraciones SQL se colocan en `db/migration/` con prefijo `V<numero>__`
