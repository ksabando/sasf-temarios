---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué son los "Self-Contained Systems" (SCS) y en qué se diferencian de los microservicios y de la Service-Based Architecture?

**Respuesta**: Self-Contained Systems (SCS) es un estilo arquitectónico formalizado por Stefan Tilkov y la comunidad de innoQ que propone sistemas autónomos que contienen su propia UI, lógica de negocio y base de datos. A diferencia de microservicios, donde una UI web puede componerse de múltiples servicios, en SCS cada sistema tiene su propia UI completa. A diferencia de Service-Based Architecture, los SCS no comparten base de datos e incluyen la capa de presentación. La regla fundamental es "cada SCS es una aplicación web independiente" que puede desplegarse, escalarse y desarrollarse de forma autónoma, con integración solo a través de enlaces en la UI y eventos asíncronos en el backend.

**Por qué**: Tilkov argumenta que SCS resuelve el principal dolor de microservicios: la composición de UI. En microservicios con una SPA React, el frontend se convierte en un monolito que orquesta llamadas a múltiples servicios —perdiendo autonomía de equipo. En SCS, el equipo de Pedidos es dueño de la página de pedidos completa (frontend + backend + DB). Esto tiene más sentido en dominios donde las funcionalidades son naturalmente independientes (ej: un portal bancario con secciones de cuentas, inversiones, préstamos). La clase cubrió microservicios y SBA pero no exploró cómo la UI impacta la descomposición arquitectónica.

---

### 3. [Investigar] ¿Cómo utiliza Netflix el patrón "Backends for Frontends" (BFF) junto con su estilo de microservicios y qué problema arquitectónico resuelve?

**Respuesta**: El patrón Backends for Frontends (BFF), documentado por Sam Newman y utilizado extensivamente por Netflix, consiste en crear una capa de backend específica por tipo de cliente (mobile BFF, web BFF, TV BFF, etc.). Cada BFF orquesta llamadas a múltiples microservicios y adapta la respuesta al formato óptimo para ese cliente. Resuelve el problema de que una API de microservicios genérica obliga a cada cliente a hacer múltiples round-trips (N+1 problem en el frontend) y a procesar datos en formatos no óptimos. Con BFF, el cliente mobile recibe exactamente los datos que necesita en un solo request, reduciendo latencia y consumo de batería.

**Por qué**: Netflix presentó este patrón en su blog técnico y Sam Newman lo formalizó en *Building Microservices* (2ª edición). La clase mencionó API Gateway pero no BFF. La diferencia es sutil pero importante: un API Gateway es una capa de ruteo y cross-cutting concerns (auth, rate limiting), mientras que un BFF contiene lógica de orquestación específica por cliente. Para E-Commerce Platform, un Mobile BFF podría agrupar datos de catálogo, carrito y recomendaciones en una sola respuesta optimizada para la app mobile, mientras que el Web BFF devolvería datos más detallados porque la web tiene más ancho de banda y pantalla.

---

### 4. [Investigar] ¿Qué es el patrón "Strangler Fig Application" modernizado con feature flags y cómo lo implementan empresas como LaunchDarkly para migración de estilos arquitectónicos?

**Respuesta**: El Strangler Fig Application modernizado utiliza **feature flags** para redirigir tráfico incrementalmente entre la vieja y la nueva implementación sin cambiar el routing a nivel de infraestructura. En lugar de configurar un proxy o API Gateway para redirigir `/orders` al nuevo servicio, se usa un feature flag que el código del monolito evalúa en runtime: si `use-new-payment-service` está activo para el 10% de usuarios, el monolito delega la operación de pago al nuevo microservicio; para el 90% restante, usa la lógica legacy. LaunchDarkly y otras plataformas permiten modificar estos porcentajes desde un dashboard sin deploy, e incluso hacer targeting por atributos de usuario (país, plan, tenant).

**Por qué**: Aunque la clase cubrió Strangler Fig, no abordó su implementación moderna con feature flags, que es cómo se hace en la práctica hoy. Martin Fowler destacó esta evolución en su blog (2016), y empresas como Facebook y Google migran infraestructura crítica con este enfoque. La ventaja arquitectónica es enorme: podés probar el nuevo servicio en producción con 1% de tráfico, monitorear errores y performance, y solo escalar al 100% cuando tenés confianza. Si algo falla, desactivás el flag en segundos sin tocar infraestructura.

---

### 5. [Conectar] La clase cubre Monolito como estilo con sus ventajas y desventajas. ¿Cómo se relaciona esto con el concepto de "Majestic Monolith" que defiende DHH (David Heinemeier Hansson) en Basecamp?

**Respuesta**: DHH defiende el "Majestic Monolith" como una arquitectura donde toda la lógica de negocio reside en un solo proceso (Ruby on Rails en el caso de Basecamp) pero con patrones internos de modularización fuertes: bounded contexts lógicos, servicios de dominio explícitos, y extracción de responsabilidades transversales (jobs asíncronos con ActiveJob, caching agresivo). La diferencia con el monolito tradicional de la clase es que el Majestic Monolith aplica **disciplina de arquitectura sin abandonar el deploy único**. DHH argumenta que la complejidad distribuida de microservicios no se justifica para la mayoría de aplicaciones web, y que un monólogo bien diseñado puede escalar a millones de usuarios con caching y background jobs.

**Por qué**: DHH formalizó el término en su blog (2020) como respuesta a la "microservicio-manía." Sam Newman, en la 2ª edición de *Building Microservices*, cita a Basecamp como ejemplo de que "no necesitás microservicios para escalar." Esto conecta con lo visto en clase sobre el Monolito Modular, pero agrega una perspectiva polémica: tal vez el monolito no sea un estado transitorio hacia microservicios, sino el destino final correcto para la mayoría de sistemas. La diferencia clave con la clase es que DHH considera el monolito como fin, no como medio.

---

### 6. [Conectar] La clase menciona la Arquitectura en Capas y sus desventajas (sangría de capas, Big Ball of Mud). ¿Cómo aborda la "Clean Layered Architecture" de Simon Brown este problema usando el C4 Model como guía?

**Respuesta**: Simon Brown propone que la Arquitectura en Capas no es inherentemente mala —el problema es que los equipos la implementan sin **límites explícitos entre capas**. Su "Clean Layered Architecture" usa el C4 Model como herramienta de diseño: en el Nivel 3 (Component), cada componente tiene una interfaz pública explícita y la regla de dependencia es unidireccional. La novedad es que Brown insiste en que la estructura de paquetes debe reflejar las capas lógicas, y que herramientas como ArchUnit deben validar en CI/CD que no haya violaciones. No es la estructura de capas lo que falla, es la falta de disciplina para mantenerla.

**Por qué**: En *Software Architecture for Developers* (2014-2023), Brown argumenta que la Arquitectura en Capas es perfectamente válida como "estilo por defecto" si se aplica con: (1) inversión de dependencias entre capas (interfaces en capa de dominio), (2) verificación automatizada de dependencias, y (3) separación en componentes, no solo paquetes. Esto conecta lo visto en clase (Capas como estilo con desventajas) con una perspectiva más matizada: Capas + disciplina = arquitectura mantenible; Capas sin disciplina = Big Ball of Mud. La diferencia es la ingeniería, no el estilo.

---

### 7. [Conectar] La clase cubre Event-Driven Architecture como estilo arquitectónico. ¿Cómo relaciona *"Flow Architecture"* de James Urquhart el estilo Pipes-and-Filters con EDA para crear arquitecturas de streaming reactivas?

**Respuesta**: James Urquhart, en *Flow Architectures* (2021), propone que el futuro de la integración de sistemas es el modelo de "flow": eventos (EDA) como transporte y pipes-and-filters como procesamiento. Un evento llega a un topic de Kafka, un stream processor (Kafka Streams, Apache Flink) aplica una cadena de filtros y transformaciones, y emite nuevos eventos o actualiza materialized views. Esto combina la desacoplación temporal de EDA con la composicionalidad de Pipes-and-Filters. El resultado es una arquitectura donde el flujo de datos es el ciudadano de primera clase, no los servicios. Wardley llama a esto "the future of integration" porque elimina el acoplamiento punto a punto entre servicios y lo reemplaza con procesamiento sobre streams.

**Por qué**: La clase trató EDA y Pipes-and-Filters como estilos separados, pero Urquhart argumenta que la convergencia de ambos es la tendencia dominante en arquitecturas modernas (event streaming + stream processing). Empresas como Netflix (Keystone), Uber (real-time pipelines) y LinkedIn (Apache Samza) implementan esta convergencia. Para E-Commerce Platform, esto significa que en lugar de que el servicio de Pagos llame a Inventario y Notificaciones, todos los servicios publican eventos a streams y consumen de streams procesados.

---

### 8. [Cuestionar] ¿Es la Arquitectura Hexagonal (Puertos y Adaptadores) un estilo arquitectónico en sí mismo o es un patrón que puede aplicarse dentro de otros estilos? ¿Qué opinan Alistair Cockburn y Mark Richards al respecto?

**Respuesta**: Hay desacuerdo. Alistair Cockburn, el creador, lo llama "patrón arquitectónico" (no un estilo), argumentando que Hexagonal es una forma de estructurar **dentro** de un estilo más amplio: podés tener un microservicio con arquitectura hexagonal, un monolito con arquitectura hexagonal, o incluso un servicio en una Event-Driven Architecture con puertos y adaptadores. Mark Richards, en *Software Architecture Patterns*, lo clasifica como un patrón de diseño arquitectónico, distinguiéndolo de estilos (como microservicios o event-driven), que definen la topología del sistema completo. Hexagonal no prescribe cómo se comunican los servicios entre sí (eso lo define el estilo), sino cómo se estructura **un** servicio.

**Por qué**: La clase presentó Hexagonal como un patrón separado (Módulo 04), no como un estilo (Módulo 02). Esto refleja la opinión de Cockburn, pero hay arquitectos que lo tratan como estilo porque impone una topología específica (núcleo + puertos + adaptadores). La distinción práctica: si estás definiendo la arquitectura del sistema (estilo), elegís entre Monolito, Microservicios, SBA; si estás definiendo la estructura interna de cada componente, usás Hexagonal, Clean o Capas. Confundir niveles lleva a decisiones arquitectónicas mal calibradas.

---

### 9. [Cuestionar] ¿Son los microservicios simplemente una implementación moderna del estilo Cliente-Servidor con más capas, o representan una categoría fundamentalmente diferente?

**Respuesta**: Críticos como Stefan Tilkov argumentan que los microservicios no son un nuevo estilo —son Cliente-Servidor distribuido con Domain-Driven Design. Cada microservicio es un servidor que expone una API (REST/gRPC) y otros servicios actúan como clientes. Lo que cambió es la granularidad y la disciplina de dominio, no el estilo topológico. Defensores como Sam Newman y Chris Richardson argumentan que microservicios sí es un estilo diferente porque introduce constraints que Cliente-Servidor no tiene: database per service, smart endpoints and dumb pipes, independencia de deploy como requisito no negociable.

**Por qué**: Esta es una discusión taxonómica con implicaciones prácticas. Si microservicios es "solo" Cliente-Servidor, entonces todos los problemas de Cliente-Servidor aplican (acoplamiento temporal, punto único de fallo si no hay redundancia). Si es un estilo nuevo, entonces requiere sus propias herramientas de diseño, patrones y heurísticas. Mark Richards, en *Fundamentals of Software Architecture* con Neal Ford, trata microservicios como un estilo separado con su propio conjunto de trade-offs y patrones, posición que adoptó la clase en Módulo 02.

---

### 10. [Cuestionar] ¿Es la Arquitectura en Capas (Layered) un antipatrón en sistemas modernos? Contrastá la crítica de Robert C. Martin con la defensa de Simon Brown.

**Respuesta**: Robert C. Martin en *Clean Architecture* critica la Arquitectura en Capas porque las dependencias van hacia abajo (capa de negocio depende de capa de persistencia), lo que acopla el dominio a la infraestructura. Su solución es invertir las dependencias (el dominio define interfaces, la infraestructura las implementa). Simon Brown defiende que Capas no es inherentemente mala: el problema es que los equipos la implementan sin disciplina. Si cada capa expone una interfaz y las dependencias están controladas (con ArchUnit, por ejemplo), Capas es una arquitectura perfectamente mantenible y más simple que Clean/Hexagonal para equipos pequeños.

**Por qué**: Este debate refleja una tensión real: pragmatismo vs pureza. La clase presentó Capas con sus pros y contras, pero no profundizó en la controversia. El "sangrado de capas" que describe Uncle Bob es un problema real en proyectos longevos, pero la complejidad adicional de Clean Architecture también tiene costo. La respuesta sensata de Brown es: usá Capas pero con dependencias controladas; si el proyecto crece, refactorizá hacia dentro con inversión de dependencias progresiva.

---

