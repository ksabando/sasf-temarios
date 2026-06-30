---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Cuál es la historia de HAL (Hypertext Application Language)? ¿Quién lo creó, cómo fue su proceso de estandarización y por qué expiró como draft IETF sin convertirse en RFC?

**Respuesta**: HAL fue creado por Mike Kelly en 2011 como un formato minimalista para hypermedia en JSON. Fue adoptado rápidamente por Spring HATEOAS (2012) como su formato de serialización principal, lo que le dio tracción masiva en el ecosistema Java. Kelly llevó HAL al IETF como draft-kelly-json-hal (2013-2016), pero el draft expiró sin convertirse en RFC. Causas: (1) El HTTP Working Group estaba enfocado en HTTP/2, no en formatos de mensaje. (2) HAL competía con otros formatos (Siren, Collection+JSON, JSON:API) y el IETF no quería elegir un ganador. (3) HAL es deliberadamente simple — el IETF tiende a estandarizar protocolos completos, no formatos de convención. HAL quedó como un estándar de facto, no de jure.

**Por qué**: La historia de HAL es un caso de estudio de "consorcio vs. adopción". HAL nunca fue RFC, pero es el formato hypermedia más adoptado por ecosistema (Spring, .NET HAL, HAL Browser). El IETF no lo estandarizó, pero la industria sí. La lección: la estandarización formal (IETF) es menos importante que la adopción por frameworks y ecosistemas. Mike Kelly documenta la historia en el sitio de HAL (stateless.group/hal_specification.html). El hecho de que HAL Browser y Spring HATEOAS lo usen como default es más relevante que un RFC.

---

### 3. [Investigar] ¿Cuál es la filosofía de diseño de APIs de AWS? ¿Por qué Amazon, siendo pionero en arquitecturas orientadas a servicios, no usa HATEOAS en sus APIs públicas (API Gateway, Lambda, S3, DynamoDB)?

**Respuesta**: AWS sigue un diseño RPC-style con acciones en los headers (`X-Amz-Target`) y bodies JSON estructurados, no REST/HATEOAS. La filosofía de Amazon: las APIs son contratos programáticos entre servicios, no experiencias de navegación hypermedia. Steve Yegge (ex-Amazon) en su famoso "platform rant" (2011) reveló el mandato de Bezos de que todos los equipos debían exponer sus datos y funcionalidad a través de "service interfaces" — pero esas interfaces eran RPC internas, no REST públicas. Cuando AWS expuso APIs públicas (S3, EC2), mantuvieron el diseño RPC porque era consistente con su toolchain interno y porque HATEOAS no ofrecía valor medible para su caso de uso: clientes que usan AWS SDKs generados automáticamente.

**Por qué**: El memo de Bezos de 2002 (hecho público por Yegge) decía: "All teams will henceforth expose their data and functionality through service interfaces. [...] The only communication allowed is via service interface calls over the network. [...] It doesn't matter what technology you use." AWS eligió tecnologías que maximizaran la automatización de SDKs, no la navegabilidad hypermedia. Sus APIs son deliberadamente RPC porque un SDK generado por codegen no necesita descubrir URLs dinámicamente — las hardcodea. Esto contradice directamente la filosofía HATEOAS pero escala a cientos de servicios y SDKs en 10+ lenguajes. La lección: HATEOAS resuelve un problema que AWS no tiene (desacoplamiento de URLs); AWS resuelve ese problema con codegen.

---

### 4. [Investigar] ¿Qué fue JSON Hyper-Schema y por qué el intento del IETF de estandarizar hypermedia para APIs fracasó? ¿Qué lecciones dejó para HAL, Siren y JSON:API?

**Respuesta**: JSON Hyper-Schema (draft-luff-json-hyper-schema, 2010-2017) fue un intento de extender JSON Schema para describir no solo la estructura de datos, sino los links y acciones disponibles en una respuesta JSON. Agregaba `links` (con `rel`, `href`, `method`, `schema`) y `targetSchema` — esencialmente incrustando documentación OpenAPI-like dentro del JSON de respuesta. Fracasó porque: (1) Era excesivamente complejo (mezclaba validación de datos con hypermedia). (2) Intentaba ser todo (schema + links + formularios) en una sola especificación. (3) No tenía un "happy path" simple: implementar el spec completo requería un motor de hypermedia genérico que nadie construyó. Lecciones para HAL: mantener scope limitado (solo links y recursos embebidos, no schemas ni formularios) fue la decisión correcta.

**Por qué**: Henry Andrews (autor de JSON Schema) y Austin Wright intentaron hacer hyper-schema funcionar durante años. El problema de fondo: hypermedia en APIs requiere que el cliente sepa qué hacer con los links. Un link HAL `"complete": {"href": "/tasks/1/complete"}` es útil solo si el cliente sabe que debe hacer POST. HAL omite el método deliberadamente (por simplicidad), delegando ese conocimiento a documentación out-of-band. Hyper-Schema intentaba incluir el método, los parámetros esperados, y los schemas de request/response — pero esto duplica lo que OpenAPI ya hace mejor como documentación estática. La lección: no intentes que el mensaje de respuesta sea completamente autodescriptivo; es un objetivo inalcanzable y contraproducente.

---

### 5. [Conectar] ¿Cómo se diferencia la "máquina de hypermedia" de un navegador web de la "máquina de hypermedia" de un cliente API REST? Si la Web es la prueba viviente de que hypermedia funciona, ¿por qué los clientes API no la usan?

**Respuesta**: La diferencia es el intérprete: un navegador web tiene un motor de hypermedia genérico que renderiza HTML ejecutable (links clickeables, formularios con métodos y campos). El usuario humano decide qué link seguir. Un cliente API REST es un programa — no tiene "usuario humano" que decida dinámicamente. Para seguir un link HATEOAS, el cliente debe estar programado para reconocer el `rel`, saber qué método HTTP usar, y saber cómo procesar la respuesta. Esto significa que el cliente ya tiene codificado el conocimiento semántico de los `rel` names — si ya sabés que `rel="complete"` significa "hacé POST a esta URL", ¿qué ganás no hardcodeando la URL? Muy poco. El hardcoding de URLs agrega acoplamiento mínimo adicional sobre el hardcoding de `rel` semantics.

**Por qué**: Esta es la "paradoja HATEOAS" articulada por muchos críticos. Mike Amundsen ("RESTful Web APIs", 2013) argumenta que el verdadero valor no es solo links, sino que el servidor controle el flujo de la aplicación (workflow). Si la tarea completada muestra `uncomplete` en lugar de `complete`, el cliente no necesita saber la máquina de estados — solo renderiza las affordances disponibles. Esto funciona para UIs humanas pero requiere que el cliente API sea una "generic hypermedia engine" que no hardcodee ni URLs ni rel semantics. En la práctica, casi ningún cliente API es genérico — siempre conoce la semántica del dominio. La Web funciona con hypermedia porque el humano interpreta la semántica; en APIs, el código debe pre-conocerla.

---

### 6. [Conectar] ¿Cómo se comparan las "actions" de Siren con la especificación de operaciones en OpenAPI? ¿Puede Siren reemplazar la necesidad de documentación externa como pretende?

**Respuesta**: Siren define `actions` incluyendo: `name`, `method`, `href`, `type` (Content-Type del body), `fields` (array con `name`, `type`, `value`, `required`). Esto es esencialmente una definición de operación embebida en la respuesta, similar a cómo un formulario HTML define sus campos y método. Comparado con OpenAPI: Siren es runtime (cada respuesta incluye las acciones disponibles para ESE estado); OpenAPI es diseño (documentación estática de todas las operaciones). Teóricamente, Siren podría reemplazar documentación externa: un "API browser" genérico podría leer respuestas Siren y mostrar formularios al usuario, igual que un navegador con `<form>`. En la práctica, casi ningún cliente usa esto — los desarrolladores prefieren documentación OpenAPI legible por humanos y SDKs tipados.

**Por qué**: Kevin Swiber creó Siren en 2012 con la visión de "hypermedia APIs con formularios". Es el formato hypermedia más completo: entities, links, actions (formularios), y sub-entities. Pero su completitud es su debilidad: la respuesta se vuelve muy verbosa (acciones con fields detallados) y el cliente necesita un motor genérico para parsear y renderizar acciones dinámicamente. La paradoja: cuánto más autodescriptiva es la respuesta, menos probable es que los desarrolladores la usen porque prefieren control y tipado estático. Siren es técnicamente superior a HAL en expresividad, pero HAL ganó en adopción por ser más simple.

---

### 7. [Conectar] El concepto de "affordance" en HATEOAS fue tomado de la psicología ecológica de James Gibson y popularizado en diseño de UX por Don Norman. ¿Cómo se traduce exactamente el concepto original al diseño de APIs?

**Respuesta**: Gibson (1979) definió affordance como lo que el entorno "ofrece" al animal — una propiedad relacional entre el objeto y el actor. Una silla ofrece "sentabilidad" a un humano pero no a un elefante. Norman ("The Design of Everyday Things", 1988, 2013) lo aplicó a HCI: una affordance es lo que un objeto sugiere que podés hacer con él (un botón sugiere "presioname"). En APIs HATEOAS: la affordance es un link en `_links` que sugiere al cliente "podés hacer esta transición desde el estado actual". Si la tarea está `completed: false`, el link `complete` es una affordance. Si está `completed: true`, el link `complete` desaparece y aparece `uncomplete`. El servidor define qué affordances están disponibles según el estado del recurso y los permisos del usuario.

**Por qué**: La conexión Gibson → Norman → HATEOAS es explícita en el trabajo de Mike Amundsen y Leonard Richardson. Gibson definió affordances como propiedades objetivas del entorno (existen independientemente de si el actor las percibe). Norman enfatizó que en diseño, lo importante es que el usuario PERCIBA la affordance correcta (affordance percibida). En HATEOAS, esto mapea a: no alcanza con que el link `complete` esté técnicamente en `_links` — el cliente debe entender el `rel` y saber qué hacer. Si el cliente no entiende `complete`, la affordance existe pero no es percibida. Esto explica por qué HAL no es suficiente sin documentación del significado de los rels — necesitás que el desarrollador "perciba" (lea la documentación) la affordance.

---

### 8. [Cuestionar] ¿Cuáles son las razones reales —técnicas, organizacionales y económicas— por las que HATEOAS tiene adopción cercana a cero en APIs públicas? ¿Es un fracaso del estándar o de la industria?

**Respuesta**: Razones técnicas: (1) Complejidad del cliente: implementar un cliente que navegue `_links` dinámicamente requiere un motor de hypermedia que casi nadie construye. (2) Debugging difícil: no podés ver en un log "llamé a GET /tasks/42" porque la URL se descubrió en runtime. (3) Sin tipado: los clientes HATEOAS no tienen tipos generados — perdés autocompletado y type safety. Razones organizacionales: (4) Equipos frontend y backend trabajan en paralelo con contratos estáticos (OpenAPI) — HATEOAS requiere que el frontend espere al backend para descubrir URLs. (5) Documentación: los equipos de API quieren documentación fija y predecible (Stripe Docs), no respuestas que varían por usuario y estado. Económicas: (6) No hay ROI medible: ¿cuánto dinero ahorra HATEOAS vs. el costo de implementarlo?

**Por qué**: La encuesta "State of API 2024" (Postman, 40K+ devs) reporta que solo ~3% de APIs usan hypermedia con HATEOAS completo. No es un fracaso del estándar — es que el problema que HATEOAS resuelve (desacoplamiento total servidor-cliente a través de cambios de URLs) no es el problema más urgente para la mayoría de equipos. El problema urgente es: documentar la API, versionarla, asegurarla. HATEOAS no ayuda con eso. Fielding diseñó REST para la Web de documentos hipervinculados; su aplicación a APIs de datos programáticas fue un trasplante imperfecto desde el principio.

---

### 9. [Cuestionar] HAL vs Siren vs Collection+JSON vs JSON:API — ¿cuál "ganó" la guerra de formatos hypermedia? ¿O perdieron todos frente a OpenAPI + JSON plano?

**Respuesta**: **HAL** ganó en adopción relativa (8% de APIs con hypermedia), principalmente por Spring HATEOAS. **JSON:API** ganó en el ecosistema JavaScript/Ember (~3%). **Siren y Collection+JSON** perdieron (<0.5% cada uno). Pero la verdadera respuesta es que **ningún formato hypermedia ganó** — el ganador fue **JSON plano con documentación OpenAPI**. ~88% de APIs REST no usan ningún formato hypermedia. OpenAPI + JSON plano (sin `_links`, `_embedded`) domina abrumadoramente. La industria decidió que la documentación estática (OpenAPI/Swagger) + SDKs generados es más valiosa que la autodescubribilidad runtime. Los formatos hypermedia no murieron, pero quedaron confinados a nichos: HAL en ecosistema Java enterprise, JSON:API en frontend JavaScript con Ember Data.

**Por qué**: El directorio APIs.guru indexa miles de specs OpenAPI y confirma esta distribución. La "guerra de formatos hypermedia" fue en realidad una batalla dentro de una guerra más grande: hypermedia vs. documentación estática, y ganó documentación estática. La razón es simple: los desarrolladores prefieren leer documentación una vez y hardcodear, que implementar un motor de hypermedia que descubra dinámicamente. Es un tradeoff entre flexibilidad (hypermedia) y simplicidad (hardcoding + docs). La simplicidad ganó.

---

### 10. [Cuestionar] ¿Es Spring Data REST un "foot gun" (herramienta peligrosa) para APIs de producción? ¿Qué problemas de seguridad, performance y acoplamiento introduce al exponer directamente entidades JPA como recursos HAL?

**Respuesta**: Spring Data REST es un "foot gun" porque: **(1) Exposición de entidades JPA**: si tu entidad `User` tiene `password`, Spring Data REST la expone en las respuestas a menos que uses `@JsonIgnore` — un olvido y filtraste todas las contraseñas. **(2) Performance**: genera queries JPA sin control del developer — puede resultar en N+1 queries, falta de fetch joins, y carga lazy de colecciones enormes. **(3) Seguridad**: todos los endpoints CRUD se exponen automáticamente. `DELETE /users/1` elimina el usuario sin lógica de negocio (¿qué pasa con sus tareas?). **(4) Acoplamiento**: las respuestas están directamente acopladas al modelo JPA. Si cambiás el esquema de base de datos, la API cambia — rompiendo clientes sin querer. **(5) Personalización limitada**: customizar la lógica de negocio requiere hooks complejos (event handlers, projections) que son más frágiles que un controller manual.

**Por qué**: Oliver Gierke (Spring Data lead) recomienda Spring Data REST para "prototipado rápido y APIs administrativas internas", no para APIs públicas. Las desventajas están documentadas en la propia documentación de Spring: "Spring Data REST is designed to expose Spring Data repositories as REST resources. It is opinionated and might not fit all use cases." Para producción, el patrón recomendado es `spring-boot-starter-hateoas` con `RepresentationModelAssembler` manual — más trabajo inicial pero control total sobre seguridad, performance y contrato. Spring Data REST es una excelente herramienta para el prototipo del M01, pero no para el proyecto final de producción.

