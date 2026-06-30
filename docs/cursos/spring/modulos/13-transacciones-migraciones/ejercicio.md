---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Locking pesimista

Agrega al `TaskRepository` un método `findByIdWithPessimisticLock` que use `@Lock(LockModeType.PESSIMISTIC_WRITE)`. Crea un servicio que lo use para reasignar una tarea a otro usuario.

---

## Ejercicio 4: Migración Flyway V1

Crea el archivo `V1__create_tasks_table.sql` en `src/main/resources/db/migration/` con:
- `id` BIGINT AUTO_INCREMENT PRIMARY KEY
- `title` VARCHAR(200) NOT NULL
- `description` TEXT
- `status` VARCHAR(20) DEFAULT 'PENDING'
- `completed` BOOLEAN DEFAULT FALSE
- `user_id` BIGINT
- `created_at` TIMESTAMP

---

## Ejercicio 5: Migraciones V2 y V3

Crea:
- `V2__seed_initial_data.sql`: INSERT de 2 usuarios y 3 tareas de ejemplo
- `V3__add_priority_column.sql`: ALTER TABLE tasks ADD COLUMN priority
