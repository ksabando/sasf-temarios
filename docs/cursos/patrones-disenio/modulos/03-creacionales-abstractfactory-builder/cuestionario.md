---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Cómo implementa Kotlin el patrón Builder sin escribir una línea de Builder manual? Compará `data class` con named parameters + defaults vs el Builder de `clase.md`.

**Respuesta**: Kotlin elimina la necesidad del Builder manual mediante tres features del lenguaje: (1) **Named parameters**: `Usuario(nombre = "Ana", email = "ana@mail.com", edad = 30)` — cada argumento va nombrado, eliminando el problema de orden de parámetros; (2) **Default parameter values**: `data class Usuario(val nombre: String, val email: String, val edad: Int = 0, val telefono: String? = null)` — los campos opcionales tienen defaults, eliminando telescoping constructors; (3) **`copy()` autogenerado**: `data class` genera automáticamente `copy()` que permite crear una copia modificando campos específicos (`usuario.copy(edad = 31)`). Estas tres features combinadas hacen que los Builders explícitos sean innecesarios en Kotlin. Un Builder Java de 80 líneas colapsa a una declaración de `data class` de 1 línea.

**Por qué**: Andrey Breslav (lead designer de Kotlin) diseñó `data class` con named + default parameters explícitamente para eliminar el boilerplate de Builders. La documentación oficial de Kotlin dedica una sección a "Builders" explicando que son "mostly unnecessary in Kotlin." Sin embargo, Kotlin retiene Builder para casos específicos: (a) DSLs type-safe con `@DslMarker` (ej. `html { body { p { +"Hello" } } }`), (b) cuando necesitás validación multi-campo en `build()` que no puede expresarse con defaults, (c) para APIs Java-friendly (Kotlin `apply {}` como pseudo-Builder). En la práctica 2026, Lombok `@Builder` sigue siendo popular en Java porque Java no tiene named parameters — es una feature request open desde 2008.

---

### 3. [Investigar] Investigá el patrón "Builder con Director" del GoF original vs el "Fluent Builder" moderno popularizado por Effective Java. ¿Por qué el Director casi desapareció en las implementaciones modernas?

**Por qué**: GoF diseñaron RTFReader como Director que construía diferentes representaciones (ASCII, TeX, Word) desde el mismo documento RTF — un caso legítimo de Director. Pero en la práctica empresarial, el caso más común es "objeto con 10 campos opcionales" (Pedido, Usuario), donde el Fluent Builder de Bloch es más práctico. El equipo de Lombok implementó `@Builder` como Fluent Builder (sin Director) porque cubre el 95% de los casos de uso.

---

### 4. [Investigar] ¿Qué son los "Object Mothers" y "Test Data Builders" en testing y cómo se relacionan con el patrón Builder de GoF?

**Respuesta**: **Object Mother** (Peter Schuh, 2006) es un patrón de testing: una clase con métodos factory estáticos que devuelven instancias pre-configuradas de objetos de dominio para tests (`UsuarioMother.unUsuarioValido()`, `UsuarioMother.unUsuarioConEmailInvalido()`). **Test Data Builder** (Nat Pryce, 2007) es una variante de Builder específica para tests: un builder que comienza con defaults sensibles y permite sobrescribir solo los campos relevantes para el test (`UsuarioBuilder().conEmail("invalido").build()`). Ambos se basan en Builder de GoF, pero adaptados para testing: (a) eliminan ruido en los tests (solo especificás los campos que IMPORTAN para el test), (b) centralizan los defaults (si `Usuario` agrega un campo `edad` obligatorio, actualizás el Mother/TestBuilder, no 200 tests), (c) hacen el test más expresivo (el builder nombra la intención: `.sinEmail()` es más claro que `new Usuario(null, "Ana", ...)`).

**Por qué**: Nat Pryce y Steve Freeman documentan Test Data Builders en "Growing Object-Oriented Software, Guided by Tests" (2009). La diferencia: Object Mother es más rígido (métodos estáticos con configuraciones predefinidas), Test Data Builder es más flexible (composición de pasos). Ambos son Builders de GoF especializados para testing. En la práctica: Test Data Builder es preferible para objetos complejos con muchas variaciones; Object Mother funciona bien para fixtures simples.

---

### 5. [Conectar] La clase muestra telescoping constructors como anti-patrón y Builder como solución. Conectá esto con el patrón "Parameter Object" (Martin Fowler, Refactoring) y explicá cuándo Parameter Object es suficiente y cuándo necesitás Builder completo.

**Respuesta**: **Parameter Object** (Fowler) es un refactoring donde reemplazás un grupo de parámetros que siempre viajan juntos por un único objeto que los contiene. Ej.: `void registrar(String nombre, String email, int edad, String tel)` → `void registrar(DatosPersonales datos)`. Parameter Object es suficiente cuando: (1) los parámetros son una unidad conceptual (siempre aparecen juntos), (2) no hay opcionalidad compleja, (3) el objeto contenedor no tiene validación entre campos. **Builder** es necesario cuando: (1) hay alta opcionalidad (10 campos, 3 obligatorios, 7 opcionales), (2) necesitás validación multi-campo en `build()`, (3) querés que el objeto final sea inmutable, (4) la construcción es un proceso paso a paso. Parameter Object resuelve "muchos parámetros en un método"; Builder resuelve "muchas combinaciones de parámetros para construir un objeto inmutable". Son complementarios: a menudo el Builder construye un Parameter Object.

**Por qué**: Martin Fowler describe "Introduce Parameter Object" en "Refactoring" (Cap 10, 2da edición, 2018). El refactoring es simple: `new Usuario(String nombre, String email, int edad, String telefono)` → `new Usuario(DatosPersonales datos)`. Pero Parameter Object no resuelve el problema de opcionalidad: si `telefono` es opcional, necesitás que `DatosPersonales` tenga `telefono` nullable o multiple constructors (volvemos a telescoping). Builder resuelve esto elegantemente. En Spring MVC, `@ModelAttribute` usa Parameter Object automáticamente: Spring mapea request params a un objeto y lo pasa al controller.

---

### 6. [Conectar] La clase presenta Abstract Factory con el ejemplo de UI multiplataforma (Windows/Mac). Conectá esto con el patrón MVC/MVP/MVVM: ¿cómo Abstract Factory permite inyectar diferentes familias de Views según la plataforma en una app mobile cross-platform?

**Respuesta**: En una app mobile cross-platform, Abstract Factory crea familias de **Views** por plataforma. Definís `FabricaUI` con métodos `crearBoton()`, `crearTexto()`, `crearLista()`. Tenés `FabricaUIAndroid` (retorna `AndroidButton`, `AndroidTextView`, `AndroidListView`) y `FabricaUIiOS` (retorna `UIButton`, `UILabel`, `UITableView`). El patrón MVC/MVP/MVVM usa esta factory para crear la View correcta: el Controller/Presenter/ViewModel recibe una `FabricaUI` y crea componentes de UI sin saber si está en Android o iOS. En MVVM, el ViewModel no conoce la View — la factory se usa en la capa de View binding. React Native y Flutter llevan esto más lejos: en lugar de Abstract Factory por plataforma, usan un motor de renderizado que compila a widgets nativos — la factory es el runtime mismo. Kotlin Multiplatform (KMP) con Compose Multiplatform implementa esto: `expect class PlatformButton` (Abstract Factory a nivel de compilador) + `actual class PlatformButton` para cada plataforma.

**Por qué**: GoF mostraban UI multiplataforma con Abstract Factory. En mobile 2026, el patrón evolucionó: React Native usa `Platform.select({ ios: IOSButton, android: AndroidButton })` (Strategy + Factory inline). Flutter usa widgets Material/Cupertino como familias de UI. Kotlin Multiplatform usa `expect`/`actual` para Abstract Factory a nivel de compilación. La esencia es la misma (familias de productos por plataforma), pero la implementación pasó de clases Java a features del lenguaje y frameworks.

---

### 7. [Conectar] La clase menciona `DocumentBuilderFactory` como Abstract Factory en JDK. Investigá cómo el patrón "Provider" (introducido en Java 6 junto con ServiceLoader) es una evolución de Abstract Factory que desacopla completamente la factory de sus implementaciones.

**Respuesta**: El patrón **Provider** (SPI) extiende Abstract Factory eliminando el acoplamiento entre la factory abstracta y las factories concretas. En Abstract Factory clásico, `FabricaUI` conoce sus implementaciones (`FabricaWindows`, `FabricaMac`) al menos por nombre de clase. Con Provider + ServiceLoader, la factory abstracta NO conoce ninguna implementación: las factories concretas se registran a sí mismas en `META-INF/services/` y `ServiceLoader` las descubre dinámicamente. El código: `ServiceLoader.load(ProveedorUI.class)` devuelve todas las factories disponibles, y el cliente itera preguntando `proveedor.supports(Plataforma.WINDOWS)` hasta encontrar la adecuada. Agregar una nueva plataforma (Linux) no requiere modificar la factory abstracta ni el código cliente — solo agregar un JAR con `ProveedorUILinux` y su archivo `META-INF/services`.

**Por qué**: El sistema de Providers fue diseñado por el equipo de JDBC (Jon Ellis, Mark Reinhold) como respuesta al problema de `Class.forName("com.mysql.jdbc.Driver")` que acoplaba el código a nombres de clase. ServiceLoader invierte el control: las implementaciones se registran pasivamente y el runtime las descubre. Spring Boot `@AutoConfiguration` usa el mismo principio con `spring.factories`. Este es el "Holy Grail" del OCP: extensibilidad sin modificar NINGRevisarN archivo existente.

---

### 8. [Cuestionar] ¿Es `Cloneable` de Java un error de diseño como afirma Josh Bloch? ¿Debería el patrón Prototype implementarse con copy constructors en lugar de `clone()`?

**Por qué**: Bloch dedicó el Item 13 de Effective Java a destrozar `Cloneable`. La comunidad acordó: "never implement Cloneable." Spring nunca usa `clone()` — su scope `prototype` crea instancias frescas. El JDK moderno usa copy constructors/factories: `Stream.concat()`, `List.copyOf()`, `Set.copyOf()`. El patrón Prototype como concepto sobrevive (necesitar copias eficientes de objetos pre-configurados), pero la implementación vía `Cloneable` está muerta.

---

### 9. [Cuestionar] La clase muestra Lombok `@Builder` como solución al boilerplate de Builder. Debate: ¿debería un curso de patrones enseñar la implementación manual del Builder o directamente Lombok `@Builder`? ¿Qué se pierde al usar la anotación sin entender el código generado?

**Respuesta**: **A favor de enseñar el manual primero**: entender el Builder manual te permite: (a) saber qué hace Lombok y depurar cuando algo falla, (b) implementar variantes que Lombok no soporta (Step Builder, validación custom compleja, lazy builders), (c) reconocer el patrón en código legacy sin Lombok, (d) entender los trade-offs (el Builder interno es una clase estática acoplada al producto). **A favor de enseñar Lombok directamente**: en 2026, la mayoría del código profesional usa Lombok, y el Builder manual es boilerplate que ningún empleador quiere ver en una code review. Lo que se pierde al no entender el código generado es la capacidad de extender el patrón: si necesitás un Builder con lógica condicional compleja (ej. `build()` llama a un servicio de validación externa), Lombok `@Builder` no alcanza y tenés que escribirlo manualmente — pero si nunca aprendiste la estructura, no sabés cómo.

**Por qué**: Esta es una tensión pedagógica real. John O'Hanley (IBM, autor de "Modern Java in Action") argumenta que las anotaciones son "leaky abstractions" — funcionan hasta que no funcionan, y cuando fallan necesitás entender qué hay debajo. En contraste, los bootcamps modernos enseñan Lombok desde el día 1. La respuesta equilibrada: aprendé la estructura manual UNA vez, usá Lombok SIEMPRE en producción, y mantené la capacidad de leer/criticar el código generado.

---

### 10. [Cuestionar] ¿Es Abstract Factory realmente útil en la era de microservicios, o es un patrón para monolitos? ¿Qué patrones de creación son más relevantes en arquitecturas distribuidas?

**Respuesta**: Abstract Factory es menos relevante en microservicios porque: (1) cada microservicio típicamente tiene UN tipo de base de datos y UN conjunto de dependencias — no necesitás crear "familias" de objetos por plataforma dentro de un mismo servicio, (2) la creación de objetos se simplifica con DI — el contenedor inyecta la implementación correcta según el perfil (`@Profile`), eliminando la necesidad de una factory abstracta con múltiples implementaciones concretas, (3) en arquitecturas distribuidas, la variabilidad se maneja a nivel de configuración externa (ConfigMap, feature flags), no a nivel de código. Patrones más relevantes en microservicios: **Factory (simple)** para crear clientes HTTP/gRPC con timeouts específicos por downstream; **Builder** para construir mensajes de eventos y DTOs complejos; **Object Pool** (no GoF) para conexiones; **Abstract Factory** sobrevive en el edge case de multi-tenancy (crear familias de conexiones por tenant) y en testing (familias de mocks).

**Por qué**: Sam Newman en "Building Microservices" (2nd ed., 2021) no menciona Abstract Factory. En su lugar, habla de "configuration as code" y "infrastructure as code". Los patrones creacionales GoF asumen que la variación está en el C—DIGO (diferentes clases), mientras que en microservicios la variación está en la CONFIGURACI—N (diferentes URLs, credenciales, feature flags). Spring Cloud Config + `@RefreshScope` ejemplifican esto: cambiás el comportamiento sin recompilar. Sin embargo, Abstract Factory sigue siendo relevante para librerías y frameworks (no para aplicaciones).

