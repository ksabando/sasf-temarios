---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] La evolución de RFC 2616 a RFC 7230-7235 en 2014 clarificó muchos conceptos. ¿Qué cambios específicos se hicieron respecto a la semántica de PUT, DELETE y los códigos de estado que afectan directamente el diseño de APIs REST?

**Respuesta**: Cambios clave: **(1) PUT**: RFC 7231 (Sección 4.3.4) clarificó que PUT debe reemplazar completamente el recurso, y que un PUT exitoso puede retornar 200 (con body del recurso actualizado), 201 (si se creó), o 204 (sin body). **(2) DELETE**: Se clarificó que DELETE es idempotente (N > 0 solicitudes idénticas = mismo efecto que 1), pero el código de respuesta puede variar (204 éxito; 404 si ya no existe; 202 si es asincrónico). **(3) Códigos de estado**: Se eliminaron 306 (Unused, reservado en 2616), y se desalentó explícitamente 302 en favor de 303/307 por ambigüedad histórica. **(4) POST**: Se reafirmó que POST no es idempotente ni seguro y que la respuesta más apropiada es 201 con Location o 200 con el recurso procesado.

**Por qué**: La revisión 7230-7235 fue liderada por Roy Fielding (editor) y Julian Reschke. Fielding explicó en el IETF que RFC 2616 tenía ambigüedades porque fue escrita antes de que la comunidad entendiera completamente las implicaciones de REST. Por ejemplo, la idempotencia de DELETE en 2616 era confusa: "the side-effects of N > 0 identical requests is the same as for a single request" — pero no aclaraba si 404 contaba como "mismo efecto". RFC 7231 lo explicita mejor. Esta revisión es la base técnica de todo diseño REST moderno: leer RFC 7230-7235 es más importante para un diseñador de APIs que leer la RFC 2616 original.

---

### 3. [Investigar] ¿Qué es y por qué existe el código de estado `418 I'm a Teapot`? ¿Cuál es su estatus actual en el registro IANA de códigos de estado HTTP y qué debate generó en la comunidad?

**Respuesta**: `418 I'm a Teapot` fue definido en RFC 2324 (Hyper Text Coffee Pot Control Protocol, HTCPCP, 1998) como una broma de April Fools' del IETF. El código significaba que la cafetera es una tetera y no puede preparar café. En 2017, el IETF propuso eliminarlo del registro IANA durante la limpieza de RFCs experimentales para liberar el código. Esto generó una controversia — desarrolladores lo usaban como easter egg y como código de prueba para "no implementado". La protesta fue tan intensa que se preservó en RFC 7168 como parte del protocolo HTCPCP revisado. Hoy es un código "reservado" en el registro IANA (no asignado formalmente pero no reutilizable).

**Por qué**: El debate de 2017 sobre 418 revela cómo los estándares técnicos tienen dimensión social. Shane Brunswick inició una campaña "Save 418" argumentando que removerlo rompería sistemas legacy que lo usan. Mark Nottingham (IETF HTTP Working Group Chair) argumentó que los easter eggs no pertenecen a estándares. El compromiso fue RFC 7168 que lo preservó para HTCPCP. Para APIs REST, la lección es seria: nunca usar 418 en producción. El registro IANA oficial (iana.org/assignments/http-status-codes) lista los códigos realmente estandarizados; 418 es una curiosidad histórica.

---

### 4. [Investigar] ¿Cómo funciona el proceso formal del IETF para proponer un nuevo código de estado HTTP? ¿Qué códigos se han propuesto recientemente y cuál es su estado?

**Respuesta**: El proceso es: (1) Escribir un Internet-Draft en el HTTP Working Group (httpbis). (2) El draft debe justificar el nuevo código, explicar por qué los códigos existentes no son suficientes, y definir semántica precisa. (3) Revisión por el grupo, iterations, consenso. (4) Si se aprueba, el IESG lo publica como RFC y se registra en el IANA HTTP Status Code Registry. Códigos recientes: `425 Too Early` (RFC 8470, 2018) para rechazar requests replayed durante 0-RTT de TLS 1.3. `103 Early Hints` (RFC 8297, 2017) para enviar headers antes de la respuesta final. Propuestos en drafts activos: `428 Precondition Required` ya existe (RFC 6585, 2012), y se discuten códigos para API rate limiting granular.

**Por qué**: El proceso es deliberadamente lento para evitar proliferación de códigos. Cada nuevo código debe ser implementado por navegadores, proxies, servidores y clientes HTTP. RFC 6585 (2012, Nottingham & Fielding) introdujo 428, 429, 431 y 511 explícitamente para llenar gaps comunes en APIs web. La comunidad HTTP es conservadora: prefieren reutilizar códigos existentes con significado extendido (ej. 400 con body explicativo) que crear nuevos códigos. Para diseñadores de APIs, la recomendación es usar los códigos existentes de la IANA registry — no inventar códigos propios.

---

### 5. [Conectar] ¿Cómo se comparan los formatos de error RFC 9457 (Problem Details), OData error format, y JSON:API error format? ¿Qué use case cubre cada uno que los otros no?

**Respuesta**: **RFC 9457 Problem Details**: minimalista y genérico. Campos: `type` (URI del tipo de error), `title`, `status`, `detail`, `instance`. Ideal para APIs REST genéricas, fácil de implementar, extensible con campos adicionales. **OData error**: más completo y enterprise-focused. Campos: `code`, `message`, `target`, `details` (array de errores anidados), `innererror` (stack trace). Ideal para APIs enterprise con errores anidados complejos. **JSON:API errors**: orientado a colecciones de errores en una sola respuesta. Campos: `errors` (array), cada uno con `status`, `code`, `title`, `detail`, `source` (pointer al campo JSON que falló). Ideal para validación de formularios donde múltiples campos pueden fallar simultáneamente.

**Por qué**: La elección depende del caso de uso: RFC 9457 es la opción más RESTful porque es un estándar IETF (no un formato propietario de una empresa o framework). OData es dominante en el ecosistema Microsoft (Dynamics 365, SharePoint). JSON:API es popular en frontend frameworks que necesitan mapear errores a campos de formulario (Ember, React con librerías JSON:API). Ninguno es universalmente mejor. Lo que la clase enseña (RFC 9457) es la recomendación más alineada con estándares IETF, pero en la práctica deberías saber que tus clientes pueden esperar otros formatos según su stack tecnológico.

---

### 6. [Conectar] ¿Cómo cambia la semántica de los métodos HTTP cuando se usan sobre HTTP/2 o HTTP/3 en lugar de HTTP/1.1? ¿La idempotencia de PUT o DELETE se ve afectada?

**Respuesta**: La semántica de los métodos HTTP no cambia con la versión del protocolo — GET sigue siendo seguro, PUT/DELETE idempotentes, POST no idempotente. HTTP/2 (RFC 7540) y HTTP/3 (RFC 9114) mantienen la misma semántica de métodos que HTTP/1.1 (RFC 7231). Lo que cambia es el transporte: HTTP/2 permite multiplexing de requests sobre una sola conexión TCP (eliminando head-of-line blocking de HTTP/1.1), y HTTP/3 usa QUIC (UDP) en lugar de TCP para reducir latencia de establecimiento de conexión. La idempotencia no se ve afectada porque es una propiedad semántica, no de transporte.

**Por qué**: La separación entre semántica y transporte es un principio fundamental de HTTP. RFC 7230 dice explícitamente: "HTTP is a stateless application-level protocol." Cada versión del protocolo (HTTP/1.0, HTTP/1.1, HTTP/2, HTTP/3) define la capa de mensajería, pero la semántica (métodos, códigos de estado, headers) está en RFC 7231 que es independiente de la versión. Sin embargo, HTTP/2 y HTTP/3 introducen consideraciones de diseño nuevas: con multiplexing, reintentar un POST fallido puede hacerse más agresivamente porque no bloquea otras requests. Con HTTP/3, los requests durante migración de conexión (cambio de WiFi a 4G) son más resilientes, pero los reintentos automáticos de requests no idempotentes siguen siendo peligrosos.

---

### 7. [Conectar] ¿Cómo se relacionan los mecanismos de control de concurrencia HTTP (ETag/If-Match/If-Unmodified-Since) con el debate sobre la idempotencia de PATCH? ¿Pueden hacer que PATCH sea efectivamente idempotente?

**Respuesta**: ETag + If-Match permite optimistic concurrency control: el cliente envía `If-Match: "etag123"` con su PATCH. Si otro cliente modificó el recurso después, el servidor retorna `412 Precondition Failed`. Esto previene el "lost update problem" pero no hace que PATCH sea idempotente en el sentido HTTP. Un PATCH con `{"op":"increment","field":"priority"}` aplicado 5 veces con ETag correcto incrementa la prioridad 5 veces — la idempotencia HTTP es sobre el efecto de múltiples requests idénticas, no sobre la prevención de conflictos. Sin embargo, un PATCH diseñado como `{"priority": 5}` (estado absoluto, no relativo) ES idempotente aunque use el método PATCH — porque aplicar "set priority=5" 5 veces da el mismo resultado que aplicarlo 1 vez.

**Por qué**: La confusión viene de que idempotencia HTTP y control de concurrencia son conceptos ortogonales. La idempotencia garantiza que reintentar la misma request no cause efectos duplicados. El control de concurrencia garantiza que la request solo se aplique si el recurso no cambió desde que el cliente lo leyó. Son complementarios pero no intercambiables. Un sistema robusto implementa ambos: idempotencia para seguridad de reintentos ante fallos de red; ETag/If-Match para prevenir conflictos entre múltiples clientes concurrentes. RFC 7232 detalla el mecanismo de validación condicional.

---

### 8. [Cuestionar] JSON Merge Patch (RFC 7396) vs JSON Patch (RFC 6902): ¿cuál es mejor para actualizaciones parciales con PATCH y qué usan las APIs reales? ¿Por qué hay desacuerdo?

**Respuesta**: **JSON Merge Patch (RFC 7396)**: simple, define el nuevo estado parcial del recurso. `PATCH /tasks/42` con `{"completed": true}`. Los campos no mencionados se preservan. Nulo explícito (`{"description": null}`) elimina el campo. Simple de implementar y entender. Usado por: GitHub API, Stripe API. **JSON Patch (RFC 6902)**: operaciones atómicas secuenciales con `op`, `path`, `value`. `[{"op": "replace", "path": "/completed", "value": true}]`. Más expresivo (soporta move, copy, test) pero más verboso. Usado por: Azure API, algunas APIs enterprise. El desacuerdo: Merge Patch es más simple pero ambiguo con nulos y arrays; JSON Patch es más preciso pero complejo para el cliente.

**Por qué**: GitHub API documenta explícitamente que usa JSON Merge Patch para PATCH. Stripe usa su propia variante simple de merge. La mayoría de APIs REST que implementan PATCH usan Merge Patch o una variante porque: (1) Es lo que el cliente naturalmente quiere enviar (un JSON parcial del recurso). (2) JSON Patch requiere que el cliente entienda el formato de operaciones. La desventaja de Merge Patch con arrays es real: si el recurso tiene `"tags": ["java", "spring"]` y querés reemplazar todo el array, Merge Patch funciona; pero si querés agregar un tag sin perder los existentes, necesitás JSON Patch o un endpoint separado. La elección pragmática: Merge Patch para APIs CRUD simples; JSON Patch cuando necesitás operaciones atómicas complejas sobre documentos.

---

### 9. [Cuestionar] ¿Debería el IETF renombrar `401 Unauthorized` a `401 Unauthenticated`? ¿Qué argumentos hay a favor y en contra y qué impacto tendría en el ecosistema HTTP?

**Respuesta**: El argumento a favor es claridad semántica: `401` siempre significó "no autenticado" (el cliente debe proporcionar credenciales), mientras `403` significa "autenticado pero sin autorización". Usar "Unauthorized" para "no autenticado" es confuso y perpetuado por razones históricas (el header se llama `Authorization`, no `Authentication`). El argumento en contra es retrocompatibilidad: cambiar el nombre del código generaría confusión masiva, requeriría actualizar toda documentación, middleware, logs, y código que compara por nombre. El IETF es extremadamente conservador con cambios que rompen compatibilidad.

**Por qué**: Mark Nottingham (HTTP WG Chair) abordó esto en su blog "Why 401 is Unauthorized" (mnot.net, 2018). Explica que en el contexto de HTTP, "authorization" siempre se usó con el significado de "proveer credenciales" (el header `Authorization` transporta credenciales de autenticación). La confusión aumentó con OAuth (donde "authorization" tiene significado distinto). La postura oficial: la semántica de los códigos está en la RFC, no en el nombre. La industria ha aprendido a vivir con esta confusión; de hecho, la mayoría de entrevistas de API incluyen esta pregunta precisamente porque la confusión es material de enseñanza. Cambiar el nombre ahora causaría más problemas de los que resuelve.

---

### 10. [Cuestionar] En APIs REST, ¿es seguro retornar `404 Not Found` tanto para "recurso no existe" como para "no tenés permiso de ver este recurso"? ¿Qué implicancias de seguridad tiene y qué práctica siguen empresas como GitHub?

**Respuesta**: GitHub retorna `404 Not Found` en ambos casos por razones de seguridad: si un usuario no autorizado pide `GET /repos/private-org/secret-repo`, GitHub responde `404` (como si el repo no existiera) en lugar de `403 Forbidden`. Esto previene "repository enumeration" — un atacante no puede distinguir entre "el repo no existe" y "el repo existe pero no tenés acceso". La desventaja es que es semánticamente impreciso (404 significa "not found", no "found but hidden"). La ventaja es seguridad: previene information disclosure. La práctica estándar de la industria: APIs públicas con datos sensibles → 404 para todo; APIs internas entre servicios confiables → 403 para acceso denegado.

**Por qué**: El OWASP API Security Top 10 (2023) lista "Broken Object Property Level Authorization" como la vulnerabilidad #1 en APIs. Retornar 403 para recursos que existen pero no tenés permiso le permite a un atacante mapear IDs válidos (prueba `/users/1` → 403, `/users/2` → 403, `/users/3` → 404). Con 404 uniforme, el atacante no sabe si el ID 1, 2 o 3 existen. GitHub documenta esta decisión explícitamente en su API docs: "Requests that require authentication will return 404 Not Found, instead of 403 Forbidden, in some places. This is to prevent the accidental leakage of private repositories to unauthorized users." La decisión es un tradeoff: semántica REST precisa vs. seguridad. Para TaskFlow, si las tareas pueden ser privadas, la recomendación es usar 404 en consultas no autorizadas.

