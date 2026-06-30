---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Testing de Capa de Datos

**1. ¿Qué anotación configura solo los beans de JPA para testing?**
- a) @SpringBootTest
- b) @DataJpaTest
- c) @JpaTest
- d) @RepositoryTest

**2. ¿Qué base de datos usa @DataJpaTest por defecto?**
- a) PostgreSQL
- b) MySQL
- c) H2
- d) HSQLDB

**3. ¿Qué anotación carga archivos SQL antes de ejecutar tests?**
- a) @LoadSQL
- b) @Sql
- c) @SQLFile
- d) @DataSQL

**4. ¿Qué anotación de TestContainers inicia el contenedor?**
- a) @Container
- b) @TestContainer
- c) @PostgresContainer
- d) @DockerContainer

**5. ¿Qué propiedad dinámica se usa para configurar TestContainers?**
- a) @DynamicPropertySource
- b) @PropertySource
- c) @TestPropertySource
- d) @DynamicProperty

**6. ¿Cómo se evita que @DataJpaTest reemplace la BD por H2?**
- a) @AutoConfigureTestDatabase(replace = Replace.NONE)
- b) @DisableH2
- c) @UseRealDatabase
- d) @KeepDatabase

**7. ¿Qué biblioteca de aserciones se recomienda con Spring Boot?**
- a) JUnit asserts
- b) Hamcrest
- c) AssertJ
- d) Truth

**8. ¿Cómo se verifica que una lista tenga exactamente 3 elementos con AssertJ?**
- a) assertThat(list).size(3)
- b) assertThat(list).hasSize(3)
- c) assertThat(list).count(3)
- d) assertThat(list).isSize(3)

**9. ¿Qué método de AssertJ verifica que todos los elementos cumplan una condición?**
- a) allMatch
- b) allSatisfy
- c) everyMatch
- d) forEach

**10. ¿Los tests con @DataJpaTest son transaccionales por defecto?**
- a) Sí, se revierten al finalizar
- b) No, persisten los cambios
- c) Solo si se anota @Transactional
- d) Depende de la configuración

