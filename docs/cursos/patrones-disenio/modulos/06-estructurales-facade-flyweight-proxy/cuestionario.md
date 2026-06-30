---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Cómo implementa Go (golang) el patrón Flyweight con `sync.Pool` y qué diferencia tiene con el Flyweight de GoF?

**Por qué**: `sync.Pool` fue diseñado por Dmitry Vyukov (Go team, Google) para resolver problemas de GC pressure en servidores HTTP y gRPC. A diferencia de GoF Flyweight, `sync.Pool` no requiere una fábrica con clave — es un conjunto homogéneo de objetos idénticos. En GoF, los flyweights se diferencian por estado intrínseco (`Caracter('A', 'Arial')`). En `sync.Pool`, todos los objetos son idénticos y el estado solo existe mientras el objeto está en uso.

---

### 3. [Investigar] ¿Cómo el patrón Proxy es la base de las capacidades de `java.lang.reflect.Proxy` y qué limitaciones llevaron a la creación de CGLIB y ByteBuddy?

**Respuesta**: `java.lang.reflect.Proxy` implementa un Proxy dinámico que crea una clase en runtime que implementa una o más interfaces. Cada llamada a un método de la interfaz es interceptada por un `InvocationHandler` que decide qué hacer. Limitaciones: (1) **Solo interfaces**: no puede proxyar clases concretas ni métodos `final` — si el bean no implementa una interfaz, JDK Proxy es inútil; (2) **Solo métodos públicos de interfaz**: si la interfaz extiende otra con métodos `default`, el proxy los hereda y no los intercepta; (3) **Performance**: cada invocación pasa por reflection (`Method.invoke()`), con overhead de boxing/unboxing y chequeo de accesibilidad. **CGLIB** (Code Generation Library, creado por la comunidad Hibernate) resuelve (1) creando una subclase de la clase concreta en bytecode — puede proxyar clases sin interfaz. **ByteBuddy** (Rafael Winterhalter, 2014) es el sucesor moderno: genera bytecode más eficiente, soporta Java 17+ features, y es usado por Mockito, Hibernate, y Spring Boot 2+ como default proxy mechanism.

**Por qué**: El patrón Proxy en GoF (p. 207) era manual (escribir una clase wrapper). Java 1.3 (2000) introdujo Dynamic Proxy, transformando el patrón de "escribir wrappers" a "declarar interceptors". Spring AOP se construyó sobre JDK Proxy (para beans con interfaz) y CGLIB (para beans sin interfaz). Spring Boot 2.0 (2018) cambió el default a CGLIB porque la mayoría de los beans no tienen interfaz. ByteBuddy reemplazó a CGLIB como el generador subyacente en Mockito 3+, Hibernate 5.3+, y Spring Framework 6.1+.

---

### 4. [Investigar] La clase menciona el cache de `Integer.valueOf(-128..127)` como Flyweight en JDK. Investigá cómo `String.intern()` implementa Flyweight en el String Pool y por qué su abuso causa memory leaks en versiones antiguas de Java.

**Respuesta**: `String.intern()` implementa Flyweight puro: el String Pool es una fábrica de flyweights que garantiza que para cada secuencia de caracteres, existe exactamente UN objeto `String` canónico. `s1.intern() == s2.intern()` es `true` si `s1.equals(s2)`. El pool residía en **PermGen** (Java 7-) o **Metaspace/Heap** (Java 7+). El problema de memory leak en Java 6-: PermGen tenía tamaño fijo (`-XX:MaxPermSize=64m`), y cada string internado permanecía allí para siempre — si un crawler internaba URLs, el PermGen se llenaba con strings únicos que nunca se liberaban, causando `OutOfMemoryError: PermGen space`. Java 7 movió el String Pool al heap (garbage collectable) y Java 8 eliminó PermGen completamente (reemplazado por Metaspace). Aún así, abusar de `intern()` en strings generados dinámicamente puede causar GC pressure porque el pool usa una tabla hash con locking.

**Por qué**: `String.intern()` está documentado como Flyweight en Effective Java Item 6 (Bloch). El String Pool es una implementación de Flyweight donde el estado intrínseco es la secuencia de caracteres y el estado extrínseco es la posición del string en el código. En Java moderno (9+), las strings usan `CompactString` (byte[] en lugar de char[]) reduciendo memoria a la mitad, y el deduplicador de G1 GC (`-XX:+UseStringDeduplication`) elimina strings duplicados automáticamente sin necesidad de `intern()` manual.

---

### 5. [Conectar] La clase presenta Spring AOP @Transactional como Proxy. Conectá esto con el patrón Proxy en gRPC: ¿cómo los stubs generados de gRPC implementan Proxy Remoto?

**Respuesta**: gRPC implementa **Proxy Remoto** (GoF p. 208) con generación de código. El compilador protobuf (`protoc`) genera un **stub cliente** que implementa la misma interfaz que el servicio remoto. Cuando tu código llama a `stub.saludar(request)`, el stub: (1) serializa el request a protobuf, (2) envía por HTTP/2 al servidor, (3) espera la respuesta, (4) deserializa a tu tipo de respuesta. El código cliente no sabe que `stub.saludar()` está llamando a otro proceso — es transparente. Esto es Proxy Remoto exactamente como GoF lo definió: "a local representative for an object in a different address space." La diferencia con `@Transactional`: el proxy de Spring es local (intercepta llamadas dentro del mismo proceso); el stub de gRPC es remoto (serializa, envía por red, deserializa). Ambos comparten: misma interfaz, transparencia, y el cliente no sabe si habla con el objeto real o con un proxy.

**Por qué**: GoF Proxy Remoto (p. 208) fue inspirado por CORBA y DCOM. gRPC (Google, 2015, basado en Stubby interno) es la evolución moderna: usa protobuf (schema-driven), HTTP/2 (multiplex), y genera stubs tipados. Java gRPC genera `GreeterBlockingStub` para llamadas síncronas y `GreeterStub` para Streaming/async. Spring gRPC Boot Starter integra gRPC stubs como beans inyectables, ocultando el Proxy detrás de DI.

---

### 6. [Conectar] La clase explica Flyweight con renderizado de caracteres. Conectá esto con TextKit/CoreText en iOS/macOS: ¿cómo implementan Flyweight para renderizado rápido de texto?

**Respuesta**: CoreText (Apple) implementa Flyweight a nivel de framework de texto. Los **glyphs** (representaciones visuales de caracteres) son flyweights: cada glifo único (letra + fuente + tamaño + estilo) se almacena una sola vez en un cache del sistema (`CTFont`). Cuando renderizás un párrafo de 10,000 caracteres con la misma fuente Arial 12, solo ~52 glifos únicos existen (mayúsculas, minúsculas, dígitos), pero cada glifo se posiciona en 10,000 coordenadas diferentes (estado extrínseco). `CTLine` (una línea de texto) referencia estos glifos por posición, no almacena cada carácter como objeto independiente. El `CGFont` carga la fuente una sola vez (estado intrínseco) y genera `CGGlyph` bajo demanda con caching. Esto permite rendering de texto a 60 FPS con cientos de miles de caracteres en pantalla, algo imposible si cada carácter fuera un objeto con toda su métrica.

**Por qué**: GoF motivan Flyweight con editores de texto (GoF, p. 195). CoreText es la implementación industrial de ese concepto: `CTTypesetter` es la fábrica de flyweights, `CTRun` es un run de glifos con el mismo estado intrínseco, y `CGContext` recibe el estado extrínseco (posición x, y). Apple WWDC 2011 "Core Text and Fonts" explica esta arquitectura. En Android, `android.graphics.Paint` + `android.text.Layout` implementan el mismo concepto. Es Flyweight maduro: el framework lo oculta tanto que los desarrolladores no saben que están usando un patrón GoF.

---

### 7. [Conectar] La clase presenta Proxy Virtual (lazy loading). Conectá esto con el patrón "Ghost" (Martin Fowler): ¿en qué se diferencia un Ghost de un Proxy Virtual y por qué Hibernate/JPA usa Ghosts para lazy loading de colecciones?

**Por qué**: Martin Fowler describe Ghost en PoEAA (2002) como una optimización de carga más fina que Virtual Proxy. Hibernate (Gavin King) implementa ambos: Proxy para asociaciones (el objeto entero es un proxy vacío) y Ghost/bytecode enhancement para propiedades lazy individuales. La diferencia práctica: con Proxy, `cliente.getId()` dispara carga completa; con Ghost, `cliente.getId()` retorna el ID ya conocido sin acceder a BD.

---

### 8. [Cuestionar] ¿Es `JdbcTemplate` una Facade o un Template Method? La clase lo presenta como Facade. Pero Spring lo describe como "Template". ¿Es un error de clasificación o un caso legítimo de patrón híbrido?

**Por qué**: Rod Johnson diseñó `JdbcTemplate` en 2003 como parte de Spring Framework. La documentación de Spring lo describe como "the central class in the JDBC core package... it handles the creation and release of resources, which helps to avoid common errors." Esto es Facade. Internamente, `execute(ConnectionCallback)` es Template Method. Juergen Hoeller (co-fundador de Spring) confirmó en SpringOne 2018 que las *Template classes (JdbcTemplate, RestTemplate, TransactionTemplate) son "Facades built on Template Method pattern." Es un ejemplo de cómo los patrones se componen en sistemas reales, no como entidades aisladas.

---

### 9. [Cuestionar] ¿Es `Proxy` de Spring AOP realmente seguro? Un método `@Transactional` llamado desde `this` dentro del mismo bean no pasa por el proxy. ¿Es esto un bug de diseño o una limitación aceptable?

**Respuesta**: Es una **limitación inherente al patrón Proxy basado en wrappers**, no un bug. El proxy envuelve al bean por fuera: el código externo ve el proxy y las llamadas pasan por él. Pero `this.metodoTransaccional()` dentro del bean invoca al método directamente en el target (el bean real), eludiendo al proxy. Esto no es exclusivo de Spring — cualquier Proxy GoF basado en composición tiene este problema: si el objeto real tiene una referencia a sí mismo, esa referencia apunta al target, no al proxy. Las soluciones existen: (1) **AspectJ weaving** (modifica bytecode en compilación, no usa Proxy — los aspectos se insertan directamente en el target), (2) **auto-inyección** (`@Autowired private MiServicio self`) para obtener la referencia al proxy, (3) **`AopContext.currentProxy()`** con `exposeProxy = true`. La limitación es aceptable porque: (a) es conocida y documentada, (b) la solución es simple (separar en dos beans), (c) el patrón Proxy es la opción menos invasiva comparada con weaving de bytecode.

**Por qué**: GoF (p. 208) documentan que "the Proxy forwards requests to the RealSubject." Pero no documentan el problema de auto-referencias porque en C++/Smalltalk el problema es diferente (y menos común porque no hay DI/AOP). La documentación oficial de Spring AOP dedica una sección completa a "Understanding AOP Proxies" explicando el problema de self-invocation. Es una pregunta de entrevista clásica que evalúa comprensión profunda del patrón.

---

### 10. [Cuestionar] ¿Debería el patrón Flyweight aplicarse automáticamente a todos los objetos de valor en un sistema, o solo después de perfilar? ¿Cuál es el anti-patrón "Premature Flyweight"?

**Respuesta**: Flyweight debe aplicarse SOLO después de perfilar y medir, nunca automáticamente. El anti-patrón **Premature Flyweight** ocurre cuando: (1) implementás una fábrica de flyweights con `Map<Key, Object>` + sincronización para una clase que crea 100 instancias en toda la vida de la aplicación, (2) separás estado intrínseco/extrínseco en objetos que no comparten suficiente estado como para justificar la complejidad, (3) la fábrica de flyweights consume más memoria que las instancias duplicadas que pretendías ahorrar (el `HashMap` de 1000 entradas + sus `Entry` objects vs 1000 objetos pequeños duplicados). La regla: si la duplicación de objetos no aparece en el top 3 de consumo de heap en un perfil de producción durante pico de carga, no uses Flyweight. `Integer.valueOf()` cachea -128..127 porque estudios de uso del JDK demostraron que el 90% de los `Integer` usados en aplicaciones reales están en ese rango. Flyweight es un patrón de OPTIMIZACI—N, no de diseño general.

**Por qué**: Donald Knuth: "Premature optimization is the root of all evil." GoF (p. 199) listan condiciones estrictas para Flyweight: "The application uses a LARGE number of objects... Storage costs are HIGH because of the sheer quantity... The application DOESN'T depend on object identity." Si falla cualquiera, no uses Flyweight. Joshua Bloch (Effective Java Item 6) explica el cache de `Integer` como un ejemplo medido, no como dogma. En la práctica, Spring beans singleton son flyweights (una instancia compartida), pero Spring oculta el patrón porque lo gestiona el contenedor.

