---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es la "Onion Architecture" de Jeffrey Palermo (2008) y en qué se diferencia de la Arquitectura Hexagonal que la precedió?

**Respuesta**: La Onion Architecture, propuesta por Jeffrey Palermo en su blog (2008), organiza el sistema en anillos concéntricos alrededor del Domain Model (el centro), con la regla de que las dependencias solo apuntan hacia adentro. Se diferencia de Hexagonal en: (1) el centro es explícitamente el Domain Model (no toda la aplicación como en Hexagonal), (2) define capas nombradas —Domain Model, Domain Services, Application Services, Infrastructure— en lugar de los genéricos "inside/outside", y (3) introduce la interfaz como mecanismo explícito de inversión de dependencias en cada frontera entre anillos. Palermo fue influenciado por Cockburn pero buscó un modelo más intuitivo y nombrado que el abstracto "hexágono con puertos."

**Por qué**: La Onion Architecture es el eslabón perdido entre Hexagonal (2005) y Clean Architecture (2012). Robert C. Martin reconoce la influencia de Palermo en *Clean Architecture*. La diferencia práctica: en Hexagonal, decís "este es un puerto inbound"; en Onion, decís "esta interfaz vive en Application Services y apunta hacia Domain Services." Para los desarrolladores, los anillos nombrados son más accesibles que los puertos abstractos. La clase mencionó Hexagonal extensamente pero no Onion, que es su evolución intermedia más usada en la práctica antes de Clean Architecture.

---

### 3. [Investigar] ¿Cómo se implementa la Arquitectura Hexagonal en el frontend? ¿Existen "puertos y adaptadores" para React/Angular según lo propuesto por Jean-Paul Petillon y la comunidad de frontend architecture?

**Respuesta**: Jean-Paul Petillon y otros arquitectos frontend (como quienes documentan el patrón en Martin Fowler's blog) proponen que el frontend también puede aplicar puertos y adaptadores. En React, los "puertos" son hooks o servicios de dominio (`useOrderService`, `ProductRepository` interface), y los "adaptadores" son implementaciones concretas: un adaptador REST (`fetchProductRepository`), un adaptador GraphQL (`apolloProductRepository`), un adaptador mock (`inMemoryProductRepository`). El núcleo de dominio en frontend incluye la lógica de presentación (cálculo de totales, validación de formularios), y los adaptadores manejan la comunicación con APIs, localStorage o IndexedDB.

**Por qué**: La clase limitó Hexagonal al backend Spring Boot, pero el principio de Cockburn ("el núcleo no depende de infraestructura") aplica igual al frontend. La comunidad de frontend architecture (Luca Mezzalira, Max Stoiber) ha documentado patrones como "Clean Architecture on Frontend" que mapean directamente los conceptos hexagonales. Para E-Commerce Platform, esto significa que el componente React `OrderSummary` no debería hacer fetch directamente; debería usar un puerto `OrderQueryPort` implementado por un adaptador REST. Esto permite testear el componente con mock data y cambiar el backend sin tocar los componentes.

---

### 4. [Investigar] ¿Qué es el patrón "Delegate" en Arquitectura Hexagonal propuesto por Tom Hombergs y cómo resuelve el problema de dependencias cíclicas entre puertos?

**Respuesta**: Tom Hombergs, en *Get Your Hands Dirty on Clean Architecture* (2019), propone el patrón "Delegate" cuando un caso de uso necesita llamar a otro caso de uso dentro del mismo bounded context. En lugar de que el Interactor A importe directamente el Interactor B (creando acoplamiento), se define un puerto `UseCaseBPort` y el Interactor A depende de la interfaz, mientras que el Interactor B la implementa. Esto mantiene la regla de dependencia y evita ciclos. Hombergs también documenta el anti-patrón de "use case llamando use case" como un smell que sugiere que quizás ambos deberían fusionarse en un caso de uso más grande o los datos deberían compartirse vía eventos.

**Por qué**: La clase no abordó cómo los casos de uso se relacionan entre sí, asumiendo implícitamente que son independientes. En sistemas reales, un `CreateOrderUseCase` puede necesitar datos que `GetCustomerUseCase` ya resuelve. La solución de Hombergs es similar al patrón Mediator: un bus central despacha comandos/queries, y los casos de uso no se conocen entre sí. Esto complementa Hexagonal con una capa de mediación que Cockburn no especificó.

---

### 5. [Conectar] La clase enfatiza que "el dominio no debe depender de infraestructura". ¿Cómo se relaciona esto con el "Dependency Inversion Principle" (la D de SOLID) y qué paper de Robert C. Martin formaliza esta conexión?

**Respuesta**: El Dependency Inversion Principle (DIP), formulado por Robert C. Martin en su paper *"The Dependency Inversion Principle"* (1996) y luego en *Agile Software Development: Principles, Patterns, and Practices* (2002), establece: (1) módulos de alto nivel no deben depender de módulos de bajo nivel, ambos deben depender de abstracciones; (2) abstracciones no deben depender de detalles, los detalles deben depender de abstracciones. La Arquitectura Hexagonal es una aplicación directa del DIP a nivel de sistema: el "dominio" (alto nivel) define interfaces (puertos), y la "infraestructura" (bajo nivel) depende de esas interfaces. Cockburn mismo cita el DIP como inspiración en su paper.

**Por qué**: La clase menciona la inversión de dependencias pero no explícitamente su origen en SOLID. El DIP es el principio de diseño detrás de Hexagonal: sin DIP, los adaptadores serían llamados directamente por el dominio. Con DIP, el dominio define qué necesita (OrderRepository) y la infraestructura se adapta. Martin Fowler, en *Patterns of Enterprise Application Architecture*, llama a esto "Separated Interface" y es uno de los patrones fundamentales de la arquitectura empresarial.

---

### 6. [Conectar] La clase presenta la estructura de paquetes recomendada (domain, application, infrastructure). ¿Cómo la extiende el concepto de "Package by Feature" dentro de cada capa, según las prácticas de Oliver Gierke y Spring Modulith?

**Respuesta**: Oliver Gierke (antiguo lead de Spring Data) y el proyecto Spring Modulith proponen que dentro de una arquitectura Hexagonal, la estructura no debe ser `domain/Order.java, domain/Payment.java` sino `orders/domain/Order.java, payments/domain/Payment.java`. Es decir, **package by bounded context** en el nivel superior, y **package by layer** dentro de cada contexto. Esto permite que cada contexto sea un módulo con su propio domain, application e infrastructure, verificable con herramientas como ArchUnit o Spring Modulith. La ventaja: podés ver de un vistazo qué bounded contexts tenés y cómo se relacionan, en lugar de tener todos los `OrderRepository` dispersos en una carpeta `repository/`.

**Por qué**: La clase presentó una estructura genérica por capa para un solo módulo, pero E-Commerce Platform tiene múltiples bounded contexts (Pedidos, Catálogo, Pagos). La estructura de Gierke es la evolución natural para sistemas con múltiples contextos. Spring Modulith (proyecto oficial de Spring) valida que los módulos no tengan dependencias cíclicas y que la API pública de cada módulo sea respetada, implementando la disciplina de Modular Monolith que la clase mencionó en Módulo 08.

---

### 7. [Conectar] La clase muestra cómo testear un caso de uso mockeando puertos. ¿Cómo se implementan "Consumer-Driven Contract Tests" (PACT) en una arquitectura hexagonal para verificar que los adaptadores cumplen el contrato definido por los puertos?

**Respuesta**: En una arquitectura hexagonal, el puerto es el contrato entre el núcleo y el mundo exterior. PACT testing invierte la dirección de verificación: en lugar de que el productor publique su contrato y los consumidores se adapten, los consumidores definen sus expectativas (los puertos inbound/outbound) y el productor (el adaptador) debe satisfacerlas. En práctica: el caso de uso define `ProductRepository.findById()` como puerto outbound. Un test PACT del lado del consumidor especifica "espero que findById('123') devuelva un Product con estos atributos". El adaptador JPA/MongoDB se prueba contra ese contrato. Si el adaptador cambia su implementación y rompe el contrato, el test PACT falla.

**Por qué**: Beth Skurrie y Ron Holshausen crearon PACT para resolver el problema de integración en microservicios, pero es especialmente poderoso en Hexagonal: los puertos son los contratos naturales para PACT. Esto extiende lo visto en clase sobre testing con mocks: los mocks verifican que el caso de uso funciona *asumiendo* que el adaptador cumple el contrato. PACT verifica que el adaptador *realmente* cumple el contrato. La combinación de ambos da una cobertura completa del flujo entre núcleo y adaptadores.

---

### 8. [Cuestionar] ¿La Arquitectura Hexagonal agrega demasiada indirección para proyectos medianos? Contrastá la defensa de Alistair Cockburn con la crítica pragmática de Simon Brown.

**Respuesta**: Alistair Cockburn defiende que la indirección de los puertos es una inversión: "el costo extra inicial se paga con creces la primera vez que cambiás de base de datos o de framework de UI sin tocar el dominio." Simon Brown, en *Software Architecture for Developers*, es más escéptico: "para la mayoría de proyectos, el framework y la base de datos no van a cambiar, así que la indirección es un costo hundido." Brown propone que la separación de responsabilidades no requiere puertos formales: alcanza con una buena estructura de paquetes y una interfaz Java que separe el dominio de la implementación.

**Por qué**: Esta es una de las controversias más vivas en arquitectura. Cockburn responde que el beneficio principal no es cambiar de tecnología (que rara vez ocurre), sino la testabilidad: poder probar el dominio sin base de datos ni HTTP es el verdadero valor de los puertos. Brown contraargumenta que con test containers (TestContainers de Docker) podés probar con base de datos real en CI/CD y la necesidad de mocks es menor. La verdad probablemente está en el medio: puertos para los límites externos que más cambian (APIs de terceros, UI); acoplamiento pragmático con la base de datos si PostgreSQL es una decisión firme.

---

### 9. [Cuestionar] ¿Es realmente necesario separar puertos inbound y outbound como interfaces distintas? ¿No alcanza con una sola interfaz de "Servicio"? Discusión entre la pureza hexagonal y el pragmatismo.

**Respuesta**: La distinción inbound/outbound de Cockburn refleja quién inicia la interacción: inbound es llamado desde afuera (driver), outbound es llamado desde adentro (driven). Críticos argumentan que en Java con Spring, la distinción es artificial: tanto `ProductRepository` (outbound) como `CreateOrderUseCase` (inbound) son interfaces que Spring inyecta. Lo que importa es la dirección de dependencia (hacia el dominio), no el rol. Pragmáticos como Maciej Winnicki proponen solo dos tipos: "interfaces que el dominio ofrece" y "interfaces que el dominio necesita" —que es exactamente inbound/outbound pero sin la terminología confusa.

**Por qué**: El mismo Cockburn admite en charlas posteriores que inbound/outbound es una distinción secundaria; lo fundamental es la regla de dependencia. En equipos que recién adoptan Hexagonal, la terminología puede ser una barrera más que una ayuda. La postura pragmática (solo separar "lo que el dominio necesita" en interfaces) captura el 90% del valor con 50% de la complejidad conceptual.

---

### 10. [Cuestionar] ¿Deberían los puertos secundarios (outbound) ser específicos de un caso de uso o genéricos? El conflicto entre el Interface Segregation Principle y la proliferación de interfaces.

**Respuesta**: El Interface Segregation Principle (ISP) de SOLID sugiere que las interfaces deben ser específicas para el cliente que las usa. Esto implicaría que `CreateOrderUseCase` debería tener su propio `OrderWriter` con exactamente el método `save(Order)`, y `CancelOrderUseCase` su propio `OrderCanceller` con el método `cancel(OrderId)`, aunque ambos los implemente la misma clase JPA. Esto genera una proliferación de interfaces diminutas. La alternativa es un `OrderRepository` genérico con `save()`, `findById()`, `delete()` compartido por todos los casos de uso. Cockburn no tomó posición; Vaughn Vernon en *Implementing DDD* recomienda repositorios por aggregate (genérico para ese aggregate).

**Por qué**: El debate es real. ISP puro crea interfaces hiper-específicas que son excelentes para testing (mockeás exactamente lo que necesitás) pero generan una cantidad de archivos que abruma. Repositorios genéricos son más simples pero violan ISP. La práctica de la industria (Vernon, Hombergs) es un punto medio: repositorios por aggregate root (`OrderRepository`) pero no por caso de uso (`OrderCreator`, `OrderFinder`, `OrderCanceller` por separado). La clase asumió repositorios por aggregate, pero no discutió la tensión con ISP.

---

