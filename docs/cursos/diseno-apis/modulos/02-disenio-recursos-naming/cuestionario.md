---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] La Google API Design Guide y la Microsoft REST API Guidelines difieren en recomendaciones de naming. ¿En qué puntos concretos discrepan y qué revela cada posición sobre la filosofía de diseño de cada empresa?

**Respuesta**: Puntos de discrepancia: **(1) Nombres de campos:** Google usa snake_case (`created_at`, `display_name`) por legibilidad y compatibilidad con protobuf; Microsoft usa camelCase (`createdAt`, `displayName`) por alineación con JSON/JavaScript. **(2) Versionado:** Google usa `/v1/` en el path; Microsoft acepta path (`/v1/`), query (`?api-version=2021-01`) o header (`api-version`). **(3) Métodos custom:** Google permite custom methods con verbo en URL (`POST /v1/resources:batchGet`) usando `:` como separador; Microsoft prefiere action endpoints con sustantivo (`POST /resources/batch`). **(4) Paginación:** Google estandariza `pageToken` (cursor) y `pageSize`; Microsoft soporta `$top`, `$skip`, `$skiptoken` estilo OData. La diferencia refleja: Google viene de protobuf/gRPC donde el rendimiento y consistencia de toolchain dominan; Microsoft viene de OData y enterprise donde la flexibilidad del cliente es prioritaria.

**Por qué**: Google API Design Guide (cloud.google.com/apis/design, actualizada 2024) tiene influencia de protobuf, gRPC y la consistencia de la Google Cloud Platform. Microsoft REST API Guidelines (github.com/microsoft/api-guidelines) vienen de la experiencia de Azure y Office 365, con fuerte influencia de OData. La diferencia en snake_case vs camelCase es más profunda de lo que parece: Google usa protobuf que se serializa a JSON con snake_case por convención; Microsoft trabaja en ecosistema .NET/TypeScript donde camelCase es natural. Ambas guías son excelentes; la lección es que no hay un estándar universal sino decisiones de diseño que deben ser consistentes dentro de tu API.

---

### 3. [Investigar] ¿Qué es la especificación JSON:API y cómo su enfoque de naming y estructura de recursos difiere del estilo de URLs planas que enseña la clase? ¿Qué problema resuelve que el enfoque simple no?

**Respuesta**: JSON:API (jsonapi.org) es una especificación completa para construir APIs en JSON que define no solo el formato de respuesta sino la estructura de URLs, parámetros de query, y relaciones. Diferencias clave con el enfoque de la clase: (1) **Compound Documents:** permite incluir recursos relacionados en una sola respuesta con el parámetro `include` (`GET /articles?include=author,comments.author`), eliminando N+1 requests sin GraphQL. (2) **Sparse Fieldsets estandarizado:** `fields[articles]=title,body` (la clase lo menciona pero JSON:API lo estandariza a nivel de spec). (3) **Relaciones tipadas:** cada relación tiene `links` y `data`, consistente en toda la API. (4) **Naming:** usa hyphens en URLs, camelCase en atributos, y siempre plurales.

**Por qué**: JSON:API fue creado por Yehuda Katz (ember.js, Rails) en 2014 como respuesta a que cada API REST inventaba su propia forma de manejar relaciones, includes y paginación. Mientras que la clase enseña un enfoque pragmático (referencing vs embedding según el caso), JSON:API estandariza ambos y delega la decisión al cliente con `?include=`. El costo: las respuestas JSON:API son más verbosas y complejas de implementar en el servidor. La adopción es significativa (Ember Data, Drupal, Laravel) pero menor que HAL en ecosistema Java. Representa un tradeoff entre simplicidad (enfoque de la clase) y estandarización cross-team (JSON:API).

---

### 4. [Investigar] ¿Cuál es el límite máximo de longitud de URL según los estándares HTTP y cómo afecta la decisión de anidación de recursos y query parameters? ¿Qué pasa cuando una URL excede este límite?

**Respuesta**: La especificación HTTP (RFC 7230, Sección 3.1.1) no define un límite máximo de longitud de URL, pero recomienda que los servidores sean capaces de manejar al menos 8000 octetos. En la práctica: Internet Explorer limita a 2083 caracteres, Apache por defecto acepta ~8190, Nginx ~8KB, y muchos load balancers (AWS ALB, HAProxy) tienen límites configurables pero típicamente 8-16KB. Cuando una URL excede el límite, el servidor retorna `414 URI Too Long` (RFC 7231, Sección 6.5.12). Esto afecta directamente el diseño de APIs: URLs profundamente anidadas (`/a/{id}/b/{id}/c/{id}/d/{id}`) con múltiples query parameters pueden fácilmente exceder estos límites.

**Por qué**: Este límite práctico es una razón más allá de la estética para la regla de "máximo 3 niveles de anidación". Un endpoint como `GET /api/v1/tasks/123/comments/456/attachments?filter[type]=image&sort=createdAt,desc` puede estar cerca de 100 caracteres — manejable. Pero si un API tiene filtros complejos con valores largos (UUIDs de 36 caracteres cada uno), el límite de 8000 octetos se vuelve relevante. RFC 7230 sugiere que si los parámetros de query son muy largos, se use POST con un body (aunque esto rompe la semántica GET). La alternativa moderna es `QUERY` method (draft-ietf-httpbis-safe-method-w-body) que propone un método seguro con body, pero aún no es un estándar aprobado.

---

### 5. [Conectar] La clase menciona "sparse fieldsets" como `?fields=id,title,completed`. ¿Cómo se relaciona este concepto con la selección de campos en GraphQL y con el `select=` de OData? ¿Es suficiente para evitar la motivación de migrar a GraphQL?

**Respuesta**: Los sparse fieldsets en REST (`?fields=id,title`) son funcionalmente equivalentes a la selección de campos en GraphQL (`{ tasks { id title } }`) y a OData `$select=id,title`. Todos resuelven el over-fetching permitiendo al cliente elegir los campos. Sin embargo, los sparse fieldsets en REST solo operan sobre recursos planos — no resuelven el over-fetching de relaciones anidadas (si necesitás `user.name` dentro de `task`, un REST con sparse fieldsets requeriría `?include=user` o seguir el link HATEOAS manualmente). GraphQL resuelve ambos problemas con una sola query anidada. Para APIs con datos profundamente anidados donde el over-fetching de relaciones es el problema principal, los sparse fieldsets planos no son suficientes.

**Por qué**: La motivación para migrar a GraphQL típicamente no es solo over-fetching de campos, sino la composición de datos de múltiples fuentes en una sola request. Si el problema es solo "no quiero recibir `description` cuando solo muestro títulos", los sparse fieldsets REST son perfectamente suficientes. Si el problema es "necesito `task.title`, `task.user.name`, `task.project.team.lead.email` en una sola llamada", REST requeriría múltiples endpoints o un endpoint BFF especialmente diseñado — ahí GraphQL ofrece una ventaja genuina. La decisión de migrar debería basarse en medir over-fetching real (bytes transmitidos no usados por el cliente), no en hype.

---

### 6. [Conectar] Los "action endpoints" (`POST /tasks/{id}/complete`) son un escape hatch cuando una acción no calza en CRUD. ¿Dónde está exactamente la línea entre un action endpoint legítimo y RPC-style disfrazado? ¿Qué criterios objetivos aplican empresas como Stripe?

**Respuesta**: La línea se define por si la acción modela un **recurso** o un **procedimiento**. Criterios de Stripe: (1) ¿La acción tiene estado y ciclo de vida? → recurso. (2) ¿La acción produce un efecto secundario sin crear/modificar una entidad persistente? → action endpoint. (3) ¿La acción es una transición de estado de un recurso existente? → PATCH sobre el recurso. Ejemplos: `POST /charges/{id}/capture` en Stripe es un action endpoint porque "capturar" un pago es una acción idempotente con semántica financiera específica que es más clara como acción que como `PATCH /charges/{id}` con `{"status": "captured"}`. `POST /invoices/{id}/send` envía un email — no crea un recurso, produce un efecto.

**Por qué**: Las API guidelines de Stripe (github.com/stripe/api-guidelines) son muy influyentes. Establecen: "Use verbs for non-CRUD operations: `/capture`, `/pay`, `/close`, `/void`." La distinción clave no es si la URL contiene un verbo, sino si la operación es una transición de estado del recurso (→ PATCH/PUT) o un comando sobre el recurso (→ POST con verbo). En DDD (Domain-Driven Design), esto mapea a comandos vs. modificaciones de estado. La clase enseña `POST /tasks/{id}/complete` como action endpoint; la versión más RESTful sería `PATCH /tasks/{id}` con `{"status": "completed"}` si "completar" es simplemente cambiar el status. Pero si completar una tarea dispara notificaciones, limpia subtareas, y es irreversible, modelarlo como action endpoint comunica mejor la semántica.

---

### 7. [Conectar] La clase recomienda kebab-case para URLs. ¿Qué dice exactamente RFC 3986 sobre los caracteres permitidos en URIs y cómo se relaciona con la legibilidad de kebab-case vs snake_case en diferentes contextos (logs, navegadores, herramientas CLI)?

**Respuesta**: RFC 3986 define los caracteres permitidos en URIs como unreserved (`A-Z a-z 0-9 - _ . ~`) y reserved (`: / ? # [ ] @ ! $ & ' ( ) * + , ; =`). Tanto `-` (guion) como `_` (guion bajo) son unreserved y técnicamente válidos. La preferencia por kebab-case (`task-assignments`) sobre snake_case (`task_assignments`) es una decisión de legibilidad, no de especificación: en navegadores y terminales, los URLs se subrayan, ocultando visualmente el underscore (`task_assignments` se ve `task assignments`). En logs y código, los underscores pueden confundirse con espacios en fuentes monoespaciadas pequeñas. Además, Google y otros motores de búsqueda interpretan `-` como separador de palabras pero `_` como conector (parte de una palabra compuesta), lo que afecta SEO de APIs documentadas.

**Por qué**: La especificación RFC 3986 (Sección 2.3) dice sobre unreserved: "Characters that are allowed in a URI but do not have a reserved purpose are called unreserved." No recomienda uno sobre otro. La preferencia por kebab-case es una convención de la industria documentada en Google API Design Guide: "Use hyphens (kebab-case) to separate words in resource names" y Microsoft REST API Guidelines: "Use hyphens to separate words in path segments." La evidencia empírica: GitHub, Stripe, Shopify, Atlassian usan kebab-case. Prácticamente ninguna API pública moderna usa snake_case en URLs.

---

### 8. [Cuestionar] Plural vs singular en nombres de recursos: Stripe usa singular (`/charge`, `/customer`), GitHub usa plural (`/repos`, `/issues`). ¿Existe una justificación técnica para cada postura o es puramente estética? ¿Qué implicancias tiene para la consistencia de la API?

**Respuesta**: No existe una justificación técnica fuerte para plural vs singular — ambas son válidas y HTTP no define una convención. El argumento a favor de plural: `GET /tasks` es una colección, `GET /tasks/42` es un item de esa colección — la jerarquía colección/item es natural y consistente. El argumento a favor de singular: `GET /task/42` es más cercano a cómo pensamos en entidades individuales, y para recursos singleton (`GET /profile`, `GET /settings`) el plural sería forzado. Stripe usa singular porque modela cada recurso como una entidad de negocio concreta (`Charge`, `Customer`), no como colecciones. GitHub usa plural por la influencia de Rails (que por convención usa plurales para controladores REST).

**Por qué**: La inconsistencia en la industria es evidencia de que no hay una respuesta correcta. Lo crítico —y donde la clase acierta— es la consistencia interna: no mezclar `/task/42` con `/users/5`. Lo que realmente importa es que una vez elegida una convención, se mantenga en toda la API. La peor opción es inconsistencia. Algunas APIs como Shopify usan plural para colecciones (`/products`) y singular para recursos singleton (`/shop`). La recomendación de la clase (plural) es la más común en APIs nuevas (GitHub, GitLab, Twilio, Heroku), mientras que singular es más común en APIs más antiguas o con fuerte cultura de "entidad de negocio" (Stripe, Square, algunas APIs de AWS).

---

### 9. [Cuestionar] ¿Es compatible el diseño de recursos orientado a REST con los agregados del Domain-Driven Design (DDD)? ¿Qué sucede cuando un agregado de DDD no mapea 1:1 a un recurso REST?

**Respuesta**: Hay una tensión inherente: en DDD, un agregado es una unidad de consistencia transaccional con una raíz y entidades internas que no deben ser accedidas externamente. En REST, cada recurso tiene su propia URL y puede ser accedido independientemente. El conflicto aparece cuando: (1) Una entidad interna del agregado es un recurso REST anidado (`/orders/{id}/items/{itemId}`) — técnicamente posible pero si el agregado de DDD dice que los items solo se modifican a través de la Order raíz, el acceso directo viola la invariante. (2) Un recurso REST necesita datos de múltiples agregados — en DDD esto requeriría un domain service o read model.

**Por qué**: Vaughn Vernon en "Implementing Domain-Driven Design" (2013) dedica un capítulo a "Integrating Bounded Contexts with REST" donde recomienda que los recursos REST se diseñen como "published language" (lenguaje publicado) del bounded context, no como mapeo 1:1 de agregados. La solución es: exponer APIs REST a nivel de bounded context, no de agregado individual. Un `/orders` REST puede internamente usar múltiples agregados (Order, Customer, Inventory) coordinados por un application service. La tensión se resuelve entendiendo que REST es la interfaz externa (capa de aplicación) y DDD es el modelo interno (capa de dominio). No tienen por qué mapear 1:1.

---

### 10. [Cuestionar] ¿Qué nivel de adopción real tienen los formatos hypermedia (HAL, JSON:API, Siren, Collection+JSON) en APIs públicas? ¿Cuál es el estándar de facto y por qué HAL lidera a pesar de sus limitaciones?

**Respuesta**: Según el directorio APIs.guru (que indexa miles de specs OpenAPI públicas) y el estudio "State of API 2024" de Postman: **HAL** es el formato hypermedia más usado (~8% de APIs REST públicas incluyen `_links` en formato HAL), seguido de **JSON:API** (~3%), y **Siren/Collection+JSON** (<0.5%). La gran mayoría (~88%) no usa ningún formato hypermedia estándar. HAL lidera por: (1) Es el default de Spring HATEOAS y Spring Data REST — el ecosistema Java lo empuja. (2) Es el más simple de implementar (solo `_links` y `_embedded`). (3) Es lo suficientemente flexible para la mayoría de los casos.

**Por qué**: La encuesta State of API 2024 (Postman, N=40,000+ desarrolladores) reporta que solo 12% de APIs REST usan hypermedia, y de ellas HAL domina. La limitación de HAL —que los links no especifican el método HTTP— es precisamente su fortaleza: al no intentar ser completamente autodescriptivo, es más simple y no compite con la documentación OpenAPI. JSON:API es más completo pero más complejo; muchas APIs que empiezan con JSON:API terminan simplificando a HAL o abandonando hypermedia completamente. La lección: la industria prioriza simplicidad sobre completitud en hypermedia.

