---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Cómo funciona el sistema de versionado de la API de Stripe (basado en fecha, no en semver) y por qué eligieron este enfoque sobre Semantic Versioning? ¿Qué ventajas y desventajas tiene en la práctica?

**Respuesta**: Stripe versiona por fecha: el cliente envía `Stripe-Version: 2023-10-16` en cada request. La fecha corresponde a la versión de la API que el cliente quiere usar. Cambios: Stripe puede publicar breaking changes en nuevas fechas, pero las versiones viejas siguen funcionando para siempre (Stripe nunca depreca versiones por fecha). Ventajas: (1) El cliente elige explícitamente cuándo migrar a una nueva versión. (2) No hay números MAJOR.MINOR que crear ansiedad sobre compatibilidad. (3) La fecha es auto-documentada: sabés exactamente cuándo se introdujo un cambio. Desventajas: (1) El servidor debe mantener todas las versiones históricas funcionando simultáneamente — costo de mantenimiento masivo. (2) Semver comunica magnitud del cambio (MAJOR = breaking); con fechas, cada fecha puede ser breaking o no, y el cliente debe leer el changelog.

**Por qué**: Stripe documenta su filosofía en stripe.com/docs/api/versioning. Amber Feng (Stripe) en "APIs as infrastructure: future-proofing Stripe with versioning" (Stripe Blog, 2017) explica que eligieron este sistema porque los pagos son infraestructura crítica: no podés forzar a un comercio a migrar su integración de pagos en 6 meses. La API debe ser "infinitely backwards compatible" dentro de cada versión-fecha. Esto es viable para Stripe porque tienen recursos de ingeniería masivos. Para un equipo pequeño, mantener 50 versiones-fecha simultáneas sería inviable. La lección: la estrategia de versionado debe dimensionarse según los recursos del equipo y la criticidad de la API.

---

### 3. [Investigar] ¿Cuál es la historia de Semantic Versioning (semver) según su creador Tom Preston-Werner? ¿Fue diseñado para APIs o para librerías? ¿Cuáles son los argumentos en contra de aplicar semver a APIs REST?

**Respuesta**: Tom Preston-Werner (co-fundador de GitHub) creó Semantic Versioning en 2011 en semver.org, explícitamente para librerías de código y package managers. El problema que resolvía era la "dependency hell" en gestores de paquetes como RubyGems y npm: ¿si actualizo esta librería, mis dependencias se rompen? Semver responde con MAJOR.MINOR.PATCH y reglas claras de compatibilidad. No fue diseñado para APIs REST. Los argumentos en contra de aplicarlo a APIs: (1) En APIs, la "interfaz pública" es el contrato HTTP, no una API de código — los cambios semánticos no siempre mapean a MAJOR/MINOR. (2) Los consumidores de APIs no hacen "dependency resolution" como npm; no eligen automáticamente entre v1.2.3 y v1.2.4. (3) Semver sugiere que PATCH es backward-compatible, pero en APIs, hasta un cambio de formato de error puede romper un cliente frágil.

**Por qué**: Preston-Werner escribe en el prefacio de semver.org: "In the world of software management there exists a dreaded place called 'dependency hell'." El contexto original es claramente librerías. Sin embargo, la industria adoptó semver para APIs porque provee un vocabulario común. Phil Sturgeon en "Build APIs You Won't Hate" (2015) argumenta que semver en APIs es "mostly fine" porque comunica intención, pero advierte que el contrato real es la especificación OpenAPI, no el número. La alternativa de Stripe (fechas) y de algunos equipos (solo MAJOR, sin MINOR/PATCH: v1, v2, v3) son igualmente válidas.

---

### 4. [Investigar] ¿Qué es el principio "Postel's Law" en su formulación original por Jon Postel en RFC 760, y cómo fue posteriormente cuestionado en el contexto de seguridad de protocolos? ¿Sigue siendo válido para APIs REST en 2026?

**Respuesta**: Jon Postel formuló el "Robustness Principle" en RFC 760 (Internet Protocol, 1980): "be conservative in what you do, be liberal in what you accept from others." Para APIs REST: el servidor debe enviar respuestas precisas y bien formadas (conservador), pero aceptar requests con variaciones razonables (liberal). Sin embargo, esta postura fue fuertemente cuestionada en RFC 9413 (2023) por Martin Thomson y otros, quienes argumentan que "ser liberal en lo que aceptás" genera vulnerabilidades de seguridad: si aceptás requests malformadas, los atacantes explotan las ambigüedades. El principio fue refinado: "assume the other party is malicious" — validar estrictamente todo input.

**Por qué**: La crítica a Postel's Law en APIs está documentada en RFC 9413 "Maintaining Robust Protocols" (2023): "The 'liberal in what you accept' aspect of the robustness principle has led to security problems." Ejemplo concreto: un API que acepta `"completed": "true"` (string) cuando espera `"completed": true` (boolean) es "liberal" — pero eventualmente un cliente envía `"completed": "false"` que es string truthy en JavaScript y el comportamiento se vuelve impredecible. Para APIs REST en 2026, la recomendación es: sé conservador en lo que enviás (respuestas bien documentadas, schemas estrictos) y sé estricto en lo que aceptás (validación con schemas, rechazo de campos desconocidos si no se soportan explícitamente).

---

### 5. [Conectar] El patrón de migración de bases de datos "expand and contract" (Pramod Sadalage y Scott Ambler) propone evolucionar esquemas sin downtime. ¿Cómo se aplica este mismo principio a la evolución de APIs REST, y cómo se relaciona con la coexistencia de versiones v1/v2?

**Respuesta**: El patrón "expand and contract" para APIs REST: **(1) Expand**: agregás el nuevo campo/schema/endpoint en paralelo con el viejo, sin modificar el viejo. Ambos coexisten. Los clientes empiezan a migrar al nuevo cuando están listos. **(2) Migrate**: los clientes migran gradualmente. Monitoreás quién usa qué. **(3) Contract**: cuando el viejo ya no tiene tráfico, lo eliminás (en una nueva MAJOR version o con suficiente preaviso). Esto es exactamente lo que describe la coexistencia v1/v2: durante la transición, ambos endpoints funcionan, el servicio de negocio se comparte (expand), los clientes migran, y eventualmente v1 se elimina (contract).

**Por qué**: Pramod Sadalage y Scott Ambler describen este patrón en "Refactoring Databases" (2006). Aplicado a APIs: nunca hagas un cambio de schema "in-place" que rompa clientes. Siempre expandí primero (agregá el nuevo comportamiento sin tocar el viejo), luego contraé (eliminá el viejo cuando sea seguro). La coexistencia de versiones en la clase sigue este patrón implícitamente. La relación con feature flags: podés deployar el código nuevo con un feature flag, activarlo para testing, y luego exponerlo como v2. El principio subyacente es "make the change easy, then make the easy change" (Kent Beck).

---

### 6. [Conectar] ¿Cómo se comparan los headers `Deprecation` y `Sunset` (RFC 8594) de REST con el mecanismo `@deprecated` de GraphQL? ¿Puede GraphQL realmente "no versionar" como promete?

**Respuesta**: **REST**: headers `Deprecation: true` y `Sunset: Sat, 31 Dec 2026 23:59:59 GMT` (RFC 8594, Wilde, 2019) comunican el ciclo de vida de un endpoint a nivel de protocolo HTTP. El cliente puede detectarlos automáticamente. **GraphQL**: usa la directiva `@deprecated(reason: "Use title instead of taskName")` en campos del schema, y `isDeprecated` en la respuesta de introspección. La diferencia fundamental: en REST, deprecás endpoints enteros o versiones; en GraphQL, deprecás campos individuales del schema. GraphQL promete "no versionar" porque podés deprecar campos viejos y agregar nuevos en el mismo schema — el cliente simplemente actualiza sus queries.

**Por qué**: La promesa de GraphQL de "no versionar" funciona en la práctica porque: (1) Podés agregar campos nuevos sin romper queries existentes. (2) Podés deprecar campos viejos con `@deprecated` sin eliminarlos. (3) Los clientes piden exactamente lo que necesitan, así que los campos nuevos no afectan a clientes viejos. Sin embargo, esto tiene límites: si cambiás el tipo de un campo de `String` a `Int`, incluso en GraphQL es un breaking change (el schema debe mantener el tipo original o crear un campo nuevo con otro nombre). La realidad: GraphQL reduce la necesidad de versionado, no la elimina completamente. Facebook (creador de GraphQL) mantiene múltiples versiones de su API interna por razones de negocio, no técnicas.

---

### 7. [Conectar] ¿Dónde está el límite entre un cliente "tolerante" que sigue Postel's Law y un cliente que sufre "silent data corruption" por ignorar cambios que debería haber notado? ¿Qué mecanismos existen para detectar estos casos?

**Respuesta**: El límite está en si el campo ignorado es opcional o estructural. Un cliente tolerante debe: (1) Ignorar campos desconocidos en la respuesta (el servidor agregó `"eta": "2026-12-01"`, el cliente lo ignora → seguro). (2) Tratar campos ausentes como opcionales con defaults (el servidor dejó de enviar `"description"` → el cliente usa `null` o `""`). Pero un cliente tolerante también debe detectar cuando un cambio afecta su lógica de negocio: si el servidor removió `"price"`, el cliente no debería asumir `price=0` silenciosamente — debería fallar o alertar. Mecanismos de detección: contract testing (Pact), schema validation en el cliente (validar response contra JSON Schema al recibirla), monitoreo de breaking changes (alertas si campos esperados faltan).

**Por qué**: El concepto de "tolerant reader" fue popularizado por Martin Fowler (2009). La diferencia entre tolerancia y corrupción es: si el campo es parte del contrato core de negocio (sin `price` no podés facturar), su ausencia debe ser un error. Si el campo es metadata opcional (sin `createdBy` la app funciona igual), podés ignorarlo. La solución técnica más robusta: el cliente valida la respuesta contra un JSON Schema mínimo que solo checkea los campos críticos para su funcionamiento, no todos los campos. Si `price` está en el schema mínimo y falta → error. Si `createdBy` no está en el schema mínimo → ignorado. Esto logra tolerancia donde es segura y detección donde es necesaria.

---

### 8. [Cuestionar] URL vs Header vs Query Param para versionado: ¿qué usan realmente Stripe, Twilio, GitHub, Shopify y por qué tomaron caminos diferentes? ¿Quién tiene "razón"?

**Respuesta**: **Stripe**: Header `Stripe-Version: 2023-10-16` — quieren URLs limpias y permanentes. **Twilio**: URL path `/2010-04-01/Accounts` — heredado de decisiones tempranas, hoy lo consideran legacy pero mantenido por retrocompatibilidad. **GitHub**: Header `Accept: application/vnd.github.v3+json` — la opción más RESTful, alineada con content negotiation. **Shopify**: URL path `/admin/api/2024-01/products.json` — elegido por simplicidad para sus merchants. **Microsoft Azure**: Query param `?api-version=2021-01` — permite versionado granular por recurso. Nadie tiene "razón" absoluta; cada uno eligió según su contexto: Stripe prioriza URLs limpias; Twilio prioriza simplicidad para clientes enterprise legacy; GitHub prioriza pureza REST; Shopify prioriza claridad para no-programadores.

**Por qué**: La diversidad de enfoques en APIs líderes demuestra que no hay un ganador técnico claro. Si las APIs más exitosas del mundo no se ponen de acuerdo, es porque el versionado de APIs es un problema socio-técnico, no puramente técnico. La recomendación pragmática: si tus clientes son desarrolladores (GitHub), header es viable. Si tus clientes son variados e incluyen no-programadores (Shopify merchants), URL path es más accesible. Si tu API es interna (microservicios), cualquier enfoque funciona mientras sea consistente. Lo que ninguna API exitosa hace es cambiar de estrategia a mitad de camino.

---

### 9. [Cuestionar] ¿Es Semantic Versioning para APIs un "leaky abstraction" porque fuerza a los consumidores a entender decisiones de implementación del proveedor? ¿No deberían los clientes solo preocuparse por si su integración se rompe o no?

**Respuesta**: Sí, varios críticos argumentan que semver para APIs es una abstracción con fugas. MAJOR.MINOR.PATCH comunica la intención del proveedor, pero lo que el cliente realmente necesita saber es: "¿mi código va a dejar de funcionar si actualizo?" Que el proveedor considere un cambio como PATCH (bug fix) no garantiza que el cliente no dependiera del comportamiento "buggy" original (Hyrum's Law: con suficientes usuarios, todos los comportamientos observables de tu API serán dependidos por alguien). El cliente solo debería necesitar ejecutar su test suite contra la nueva versión y verificar.

**Por qué**: Hyrum Wright (Google) formuló "Hyrum's Law": "With a sufficient number of users of an API, it does not matter what you promise in the contract: all observable behaviors of your system will be depended on by somebody." Aplicado a versionado: aunque prometas que v1.0.0 → v1.1.0 es non-breaking (MINOR), alguien probablemente dependía de un comportamiento específico que cambiaste. La solución real no es semver más riguroso sino: contract testing (Pact), API diff tools (Spectral, OpenAPI-diff) que detectan cambios objetivamente, y canary deployments para medir impacto real en clientes. Semver es una promesa humana; la validación debe ser automatizada.

---

### 10. [Cuestionar] ¿Qué nivel de adopción real tienen los headers `Deprecation` y `Sunset` (RFC 8594) en la industria? ¿Es un estándar que "pegó" o quedó como RFC de nicho?

**Respuesta**: La adopción de RFC 8594 es baja pero creciente. APIs que los implementan: **GitHub** (usa `Sunset` en algunas APIs deprecadas), **Zalando** (lo requiere en su API Guidelines internas), **IETF** (en sus propias APIs, predicando con el ejemplo). APIs que NO los implementan: la mayoría de APIs públicas incluyendo Stripe, Twilio, Shopify — estas empresas prefieren comunicar deprecaciones por canales out-of-band (email, dashboard, changelog) porque sus clientes no monitorean headers programáticamente. La RFC 8594 (Erik Wilde, 2019) fue bien recibida académicamente pero su adopción industrial es limitada.

**Por qué**: La baja adopción no significa que la RFC sea mala — es técnicamente sólida. El problema es el "chicken-and-egg" de estándares: los clientes no chequean headers porque pocas APIs los usan; pocas APIs los usan porque los clientes no los chequean. La tendencia es que herramientas de monitoreo (Datadog, New Relic) y API Gateways (Kong, Apigee) empiecen a soportarlos, lo que podría catalizar adopción. Para TaskFlow, implementarlos es una buena práctica de ingeniería aunque los clientes no los usen hoy: es "future-proofing" con costo mínimo. La clase los enseña correctamente como estándar — aunque la realidad de la industria es que la mayoría de equipos no los implementa.

