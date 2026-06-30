---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Policy" (o "Strategy as a Service") en arquitecturas modernas y cómo extiende Strategy GoF a nivel de infraestructura? Investigá Open Policy Agent (OPA) como ejemplo.

**Por qué**: OPA fue creado por Tim Hinrichs y Torin Sandall (Styra) y es CNCF graduated. Netflix, Pinterest, y Capital One usan OPA para políticas de autorización. El concepto de "Policy as Code" extiende Strategy GoF a sistemas distribuidos: la estrategia vive fuera del proceso y se consulta via API. Spring Security + OPA es una integración moderna: el bean de autorización consulta OPA en lugar de tener lógica hardcodeada.

---

### 3. [Investigar] ¿Cómo implementa Rust el patrón Visitor sin herencia de clases, usando `enum` y pattern matching? ¿Es esto equivalente al Visitor de GoF?

**Respuesta**: En Rust, el equivalente de Visitor se implementa con `enum` + `match` exhaustivo. Los tipos que serían clases en GoF se modelan como variantes de `enum`: `enum Shape { Circle { radius: f64 }, Rectangle { width: f64, height: f64 } }`. Las operaciones externas son funciones con `match`:
```rust
fn to_json(shape: &Shape) -> String {
    match shape {
        Shape::Circle { radius } => format!("{{\"type\":\"circle\",\"radius\":{}}}", radius),
        Shape::Rectangle { width, height } => format!("{{\"type\":\"rect\",\"w\":{},\"h\":{}}}", width, height),
    }
}
```
¿Es equivalente a Visitor? **Sí en funcionalidad, no en estructura**. El `match` exhaustivo obliga a cubrir todos los tipos (como Visitor). Agregar una nueva variante `Triangle` causa error de compilación en TODOS los `match` que no la cubran. Esto es el MISMO trade-off de Visitor (fácil agregar operaciones, difícil agregar tipos). La diferencia: Rust no necesita interfaz `Visitor`, método `accept()`, ni double dispatch — el compilador garantiza la exhaustividad con el `match`. No hay jerarquía de clases — el `enum` es un "closed set" de tipos, equivalente a `sealed interface` en Java 21.

**Por qué**: El Rust Book dedica una sección a "Refactoring with Enums" donde explica que `enum` + `match` reemplaza el Visitor pattern OOP. En Rust, `enum` es un sum type (tagged union) nativo del lenguaje — la exhaustividad del match es el sustituto del double dispatch. Java está convergiendo a esto con sealed types + pattern matching.

---

### 4. [Investigar] ¿Qué es el patrón "Extension Object" (o "Extension Interface") y cómo se relaciona con Visitor? ¿Por qué Microsoft COM y Eclipse usaron Extension Object en lugar de Visitor?

**Respuesta**: **Extension Object** (Gamma, Helm, Vlissides — discutido en GoF p. 355, formalizado por Martin Fowler) permite que un objeto sea extendido con nuevas interfaces sin modificar su clase. A diferencia de Visitor (donde el visitante conoce a todos los elementos), Extension Object es inverso: un objeto expone `getExtension(Class<T>)` y retorna una implementación de esa interfaz. Ejemplo: `shape.getExtension(Serializable.class)` podría retornar un objeto que sabe serializar `shape`. Esto es más flexible que Visitor: (a) no necesitás modificar la jerarquía de elementos para agregar nuevas operaciones, (b) no hay una interfaz Visitor central con `visit()` para cada tipo, (c) las extensiones pueden ser agregadas en runtime (plugin architecture). Microsoft COM usó `IUnknown.QueryInterface()` como Extension Object: cualquier objeto COM puede ser consultado por una interfaz específica. Eclipse IDE usa Extension Points (similar). La desventaja: menos type-safety (cast necesario), y los objetos deben soportar la consulta de extensiones (requiere modificar las clases base).

**Por qué**: Gamma y Vlissides (2 del GoF) describieron Extension Object como complemento a Visitor. Martin Fowler lo documenta en PoEAA. Microsoft COM (Don Box, "Essential COM") construyó el modelo de componentes alrededor de Extension Object. En Java, `java.sql.Wrapper.unwrap(Class<T>)` implementa Extension Object: un `Connection` puede unwrappearse a `OracleConnection` para acceder a features específicas de Oracle.

---

### 5. [Conectar] La clase explica Strategy con `CalculadorImpuesto`. Conectá esto con el sistema de `AuthenticationProvider` en Spring Security: explicá cómo múltiples providers implementan Strategy y cómo el `AuthenticationManager` los compone.

**Respuesta**: Spring Security usa **Strategy compuesta con Chain**. `AuthenticationProvider` es la interfaz Strategy: `authenticate(Authentication auth)` y `supports(Class<?> authType)`. Diferentes providers implementan diferentes estrategias: `DaoAuthenticationProvider` (autentica contra BD), `LdapAuthenticationProvider` (contra LDAP), `JwtAuthenticationProvider` (valida JWT), `OAuth2LoginAuthenticationProvider` (OAuth2). El `AuthenticationManager` (típicamente `ProviderManager`) compone múltiples providers en una CADENA: itera la lista de providers, para cada uno consulta `supports(auth)` (Chain + Strategy combinado), y ejecuta `authenticate()` en el primer provider que retorne `true`. Si el provider lanza `AuthenticationException`, el Manager prueba con el siguiente provider. Esto permite: (a) múltiples métodos de autenticación coexistiendo (password, JWT, OAuth2) sin modificar el manager, (b) agregar un nuevo método es crear un nuevo `AuthenticationProvider` y registrarlo — OCP, (c) el orden importa (Strategy + Chain), (d) `supports()` es el "filtro" de la cadena.

**Por qué**: Spring Security (Ben Alex, Luke Taylor) diseñó `AuthenticationManager` como Strategy compuesto. GoF Strategy (p. 315) muestra un solo Strategy; Spring muestra cómo componer MRevisarLTIPLES Strategies con Chain. Es un ejemplo de cómo los patrones se combinan en frameworks reales. `PasswordEncoder` dentro de `DaoAuthenticationProvider` es otra capa de Strategy (BCrypt, SCrypt, PBKDF2).

---

### 6. [Conectar] La clase presenta Template Method con `BebidaCaliente`. Conectá esto con el ciclo de vida de un bean Spring: `AbstractApplicationContext.refresh()` como Template Method orquestando la inicialización del contenedor.

**Por qué**: `AbstractApplicationContext.refresh()` es el corazón de Spring. Juergen Hoeller (Spring Core) diseñó este Template Method en 2003. En Spring Boot, `ServletWebServerApplicationContext.onRefresh()` inicia el servidor web (Tomcat/Jetty/Undertow). Este Template Method ejecuta cientos de beans y post-processors, pero su estructura es idéntica al `BebidaCaliente` de la clase: esqueleto fijo + pasos delegados a subclases.

---

### 7. [Conectar] La clase muestra `Comparator` como Strategy en JDK. Conectá esto con `Spark RDD` y `DataFrame` transformations: ¿cómo Spark implementa Strategy a través de funciones de orden superior en ejecución distribuida?

**Por qué**: Spark fue creado por Matei Zaharia (UC Berkeley, Databricks). El modelo de programación es: el usuario define ESTRATEGIAS de transformación; Spark maneja la EJECUCI—N distribuida. Esto es Strategy GoF a nivel de cluster: el algoritmo de ejecución (shuffle, map-side combine, pipelining) es fijo; lo que varía es la función que el usuario provee. `DataFrame API` + `Dataset API` llevan esto al extremo con encoders y tipos fuertes.

---

### 8. [Cuestionar] ¿Es Visitor realmente útil en 2026 o es un patrón que debería enseñarse como "esto es lo que pattern matching resolvió"? ¿Hay casos donde Visitor sigue siendo la mejor opción?

**Respuesta**: Visitor **sobrevive en nichos específicos** donde el pattern matching actual no alcanza. Casos donde Visitor sigue siendo superior: (1) **AST transformations con estado**: compiladores que realizan type-checking, code generation o optimización necesitan Visitor con estado acumulativo (symbol table, scope stack, type environment). El patrón Visitor permite que el visitante mantenga estado entre visitas a diferentes nodos, algo que un `switch` plano no maneja limpiamente. (2) **Traversals complejos**: si la operación requiere recorrer el árbol en un orden específico (pre-order, post-order, top-down con memoization), Visitor encapsula la estrategia de recorrido. (3) **Double dispatch real**: si necesitás despachar basado en el tipo de DOS objetos (visitante + visitado) sin pattern matching multi-dispatch. (4) **Extensibilidad de operaciones en librerías**: si publicás una librería con tipos sellados (`sealed interface ASTNode`) y querés que los USUARIOS de la librería puedan agregar nuevas operaciones sin modificar la librería, Visitor les da esa capacidad — pattern matching con `switch` la da también, pero los usuarios pueden agregar sus propios Visitors sin tocar tu código. Conclusión: Visitor como patrón MANUAL está en declive; Visitor como CONCEPTO (añadir operaciones a tipos cerrados) persiste y es implementado por pattern matching + sealed types.

**Por qué**: GoF Visitor (p. 331) fue diseñado para lenguajes sin pattern matching. Java 21 reduce la necesidad de Visitor en ~70% de los casos. Pero el equipo de GraalVM (compilador JIT en Java) todavía usa Visitor internamente porque los traversals de AST requieren estado complejo. La comunidad de IntelliJ IDEA (PSI tree) usa Visitor masivamente. La tendencia es: Visitor manual → pattern matching → eventualmente multi-dispatch nativo en el lenguaje.

---

### 9. [Cuestionar] ¿Debería `Template Method` ser evitado en favor de `Strategy` con composición? Hay un debate activo sobre si Template Method fomenta herencia frágil.

**Por qué**: GoF (p. 330) mencionan este trade-off. Robert Martin en "Clean Architecture" recomienda preferir Strategy. Allen Holub en "Why extends is evil" (2003) argumentó que Template Method es uno de los pocos usos legítimos de herencia. La comunidad moderna (2020s) prefiere composición + callbacks.

---

### 10. [Cuestionar] La clase presenta Strategy con `CalculadorImpuesto`. Pero en la práctica, ¿no es Strategy una solución over-engineered cuando podrías usar `switch` o `Map<TipoImpuesto, Function<Double, Double>>`?

**Respuesta**: Para un **sistema SIMPLE** con 3 tipos de impuestos que NO cambiarán, un `Map<Enum, Function<Double, Double>>` es MÁS SIMPLE y PREFERIBLE a crear una interfaz `CalculadorImpuesto` + 3 clases concretas. La interfaz + 3 clases es Strategy GoF purista pero over-engineered para este caso. **Strategy se justifica cuando**: (1) la lógica de la estrategia es COMPLEJA (más de 10 líneas, necesita dependencias inyectadas, hace llamadas a BD o APIs), (2) la estrategia se crea en CONTEXTOS DIFERENTES (no solo en un `switch` — viene de configuración externa, base de datos, o es inyectada por un contenedor DI), (3) la lista de estrategias CRECE en el tiempo (OCP — agregar nuevo impuesto no modifica el código que las usa), (4) necesitás TESTEAR cada estrategia en AISLAMIENTO con mocks de sus dependencias. La regla: empezá con `Map<Enum, Function<>>` o `switch`. Cuando la función crece a más de 20 líneas o necesita dependencias, extraé a clase e interfaz (Strategy). Cuando tengas 3+ estrategias con lógica compleja, la interfaz Strategy se justifica plenamente.

**Por qué**: Kent Beck: "Make it work, make it right, make it fast." Strategy es "make it right" — no es el punto de partida. Joshua Bloch en Effective Java Item 42 ("Prefer lambdas to anonymous classes") argumenta que lambdas son suficientes para estrategias pequeñas (`list.sort((a,b) -> ...)`). La interfaz Strategy es para estrategias que son OBJETOS con dependencias y estado, no solo funciones puras. En Spring, `PasswordEncoder` es Strategy; `Comparator` es Strategy a nivel de lambda — ambos coexisten.

