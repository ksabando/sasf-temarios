---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Transacciones y Migraciones

**1. ¿Qué anotación se usa para declarar transacciones?**
- a) @Transaction
- b) @Transactional
- c) @Transact
- d) @Commit

**2. ¿Qué propagación crea una transacción nueva pausando la actual?**
- a) REQUIRED
- b) REQUIRES_NEW
- c) NESTED
- d) NEVER

**3. ¿Qué nivel de aislamiento evita Dirty Reads?**
- a) READ_UNCOMMITTED
- b) READ_COMMITTED
- c) REPEATABLE_READ
- d) SERIALIZABLE

**4. ¿Qué anotación de JPA habilita locking optimista?**
- a) @Optimistic
- b) @Version
- c) @Lock
- d) @Concurrency

**5. ¿Qué excepción se lanza en un conflicto de locking optimista?**
- a) DataAccessException
- b) OptimisticLockException
- c) ConcurrencyException
- d) StaleStateException

**6. ¿Qué modo de bloqueo pesimista usa SELECT ... FOR UPDATE?**
- a) PESSIMISTIC_READ
- b) PESSIMISTIC_WRITE
- c) PESSIMISTIC_FORCE_INCREMENT
- d) OPTIMISTIC

**7. ¿Dónde se colocan los archivos SQL de Flyway?**
- a) src/main/resources/sql
- b) src/main/resources/db/migration
- c) src/main/java/migration
- d) src/main/resources/flyway

**8. ¿Qué formato tienen los nombres de migraciones Flyway?**
- a) V1__description.sql
- b) migration_1.sql
- c) 1_description.sql
- d) flyway_V1.sql

**9. ¿Qué propiedad se recomienda para ddl-auto con Flyway?**
- a) create
- b) update
- c) validate
- d) none

**10. ¿Qué comando Maven muestra el estado de las migraciones?**
- a) mvn flyway:status
- b) mvn flyway:info
- c) mvn flyway:check
- d) mvn flyway:list

