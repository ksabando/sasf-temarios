---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Por qué tomó desde 2017 (OpenAPI 3.0) hasta 2021 (OpenAPI 3.1) lograr compatibilidad completa con JSON Schema 2020-12? ¿Qué limitaciones tenía el "subconjunto" de JSON Schema en 3.0 y qué unlocks trae 3.1?

**Respuesta**: OpenAPI 3.0 usaba un "subconjunto extendido" de JSON Schema Draft 4 (de 2013) con divergencias significativas: `nullable` como keyword propio de OpenAPI (no de JSON Schema), `example` vs `examples`, `discriminator` con semántica diferente, y keywords como `oneOf`/`anyOf` con restricciones. Esto significaba que un schema JSON Schema estándar no era directamente usable en OpenAPI y viceversa — requería traducción. OpenAPI 3.1 (2021) eliminó el subconjunto y adoptó JSON Schema 2020-12 completo. Unlocks: (1) Keywords avanzadas como `if`/`then`/`else` para validación condicional, `const` para valores fijos, `contains` para arrays. (2) Interoperabilidad: podés usar herramientas JSON Schema estándar para validar schemas OpenAPI. (3) `nullable` ya no es necesario porque JSON Schema maneja `null` con `type: [object, null]`.

**Por qué**: La demora se debió a que JSON Schema evolucionaba en paralelo con OpenAPI bajo diferentes comités. JSON Schema Draft 2019-09 y 2020-12 introdujeron cambios significativos, y la OpenAPI Initiative esperó a que se estabilizara. Ben Hutton (OpenAPI TSC) explicó en 2021: "The biggest change in 3.1 is full JSON Schema compatibility — it's something we've wanted since 3.0." La transición no es automática: los schemas 3.0 deben migrarse (remover `nullable`, adaptar `discriminator`, cambiar `example` a `examples`). Pero para proyectos nuevos en 2026, usar 3.1 es obligatorio por la compatibilidad con el ecosistema JSON Schema.

---

### 3. [Investigar] ¿Cómo funciona la gobernanza de la OpenAPI Initiative bajo la Linux Foundation? ¿Qué empresas son miembros, cómo se toman las decisiones, y cómo se relaciona con otros estándares como AsyncAPI y JSON Schema?

**Respuesta**: La OpenAPI Initiative (OAI) es un proyecto de la Linux Foundation con: **Governing Board** (miembros pagos: Google, Microsoft, IBM, SAP, SmartBear, Postman, eBay, entre otros) que financia y define dirección estratégica. **Technical Steering Committee (TSC)** que toma decisiones técnicas con miembros elegidos por mérito. **Technical Developer Community (TDC)** que contribuye código y specs. Las decisiones técnicas requieren consenso del TSC. OAI se relaciona con: **JSON Schema**: colaboración para alineamiento (3.1 alineado con JSON Schema 2020-12). **AsyncAPI**: proyecto hermano bajo Linux Foundation para event-driven APIs (WebSockets, Kafka, MQTT), complementario a OpenAPI que cubre REST. **GraphQL**: relación más distante; GraphQL Foundation está bajo Linux Foundation pero GraphQL no se alinea con OpenAPI (son specs incompatibles por diseño).

**Por qué**: La gobernanza es abierta pero la membresía del Governing Board requiere pago corporativo (similar a CNCF, Eclipse Foundation). Esto asegura financiamiento sostenible pero también significa que las empresas que pagan tienen más influencia en la dirección estratégica. El TSC es donde ocurren las decisiones técnicas reales: aceptar o rechazar proposals, definir features de nuevas versiones, y mantener retrocompatibilidad. La OpenAPI Specification se desarrolla en github.com/OAI/OpenAPI-Specification con proceso de proposal → discussion → PR → merge. Cualquiera puede proponer cambios, pero necesitan un "sponsor" del TSC para avanzar.

---

### 4. [Investigar] ¿Qué son APIs.json y APIs.guru? ¿Cómo se relacionan con OpenAPI en el ecosistema de descubrimiento y documentación de APIs?

**Respuesta**: APIs.json (apisjson.org) es un formato de discovery para APIs: un archivo JSON que describe dónde encontrar la especificación OpenAPI, documentación, términos de servicio, y otros metadatos de una API. Funciona como un "sitemap para APIs". APIs.guru (apis.guru) es un directorio open-source que indexa miles de especificaciones OpenAPI públicas usando APIs.json como formato de indexación. Relación con OpenAPI: APIs.json no reemplaza OpenAPI — lo indexa. OpenAPI describe CÓMO usar una API específica; APIs.json describe DÓNDE encontrar APIs y sus specs. El ecosistema: un search engine de APIs (como ProgrammableWeb, RapidAPI) usa APIs.guru como backend para descubrir APIs, y luego OpenAPI para mostrar documentación interactiva.

**Por qué**: Kin Lane (API Evangelist) y Steven Willmott crearon APIs.json en 2014 para resolver el problema de "cómo encuentro APIs disponibles en mi organización o en Internet". Sin un formato de discovery, cada portal de APIs (RapidAPI, Postman API Network) reinventa su propio catálogo. APIs.guru, mantenido por Ivan Goncharov y la comunidad, es el mayor directorio open-source de specs OpenAPI con más de 2500 APIs indexadas. Para TaskFlow, si se expone como API pública, incluir un `apis.json` y registrar la spec en APIs.guru es una buena práctica de discoverability.

---

### 5. [Conectar] ¿Cómo se relacionan los `callbacks` de OpenAPI con los webhooks y con la especificación AsyncAPI? ¿Cuándo un callback en OpenAPI es suficiente y cuándo necesitás AsyncAPI?

**Respuesta**: **OpenAPI callbacks**: describen requests outbound que el servidor hará al cliente como parte de una operación. Ejemplo: creás una tarea con `POST /tasks` y el servidor notificará al cliente en `POST {callbackUrl}` cuando la tarea cambie de estado. El cliente provee el `callbackUrl` y el servidor llama a esa URL. Son sincrónicos en el flujo de la operación original. **AsyncAPI**: describe APIs event-driven asincrónicas completas — canales (topics Kafka, queues RabbitMQ), mensajes, schemas, y bindings de protocolo. Es para arquitecturas donde los eventos son el producto principal, no un side-effect. **Regla**: si la notificación es un callback de una operación REST (request-response), OpenAPI callbacks son suficientes. Si la API es fundamentalmente event-driven (streaming de eventos, pub/sub como producto), necesitás AsyncAPI.

**Por qué**: La relación formal: AsyncAPI es un proyecto hermano de OpenAPI bajo Linux Foundation. Usa JSON Schema compatible con OpenAPI 3.1. Muchas organizaciones usan ambos: OpenAPI para la API REST pública, AsyncAPI para los eventos internos y webhooks. Un callback en OpenAPI puede describir la forma del payload de un webhook, pero no la semántica de entrega (reintentos, ordenamiento, suscripción). AsyncAPI sí lo hace. Para TaskFlow: si solo tenés webhooks de notificación (taskCreated, taskCompleted), OpenAPI callbacks alcanzan. Si evolucionás a un sistema de eventos con múltiples consumidores, streams y dead letter queues, necesitás AsyncAPI.

---

### 6. [Conectar] ¿Cómo difiere la resolución de `$ref` en OpenAPI de la resolución de `$ref` en JSON Schema? ¿Qué problemas causa la diferencia en la práctica?

**Respuesta**: **JSON Schema `$ref`**: solo puede aparecer donde se espera un schema, y reemplaza completamente el objeto donde aparece (cualquier keyword hermano es ignorado). **OpenAPI `$ref`** (en 3.0): solo puede usarse en lugares específicos del documento (no en cualquier lado), pero permite keywords hermanos que se combinan con el `$ref` (comportamiento diferente a JSON Schema). **OpenAPI 3.1**: alineó `$ref` con JSON Schema 2020-12 dentro de la sección `schema`, pero mantuvo el comportamiento viejo para referencias a otros componentes (parameters, responses). Esto crea dos comportamientos de `$ref` en el mismo documento. Los problemas: circular `$ref` (A → B → A) no es soportado por todos los parsers; `$ref` externos a archivos remotos requieren resolución de red que puede fallar en CI/CD; y `$ref` a paths internos con fragmentos (`#/components/schemas/Task`) requieren que el parser soporte JSON Pointer (RFC 6901).

**Por qué**: La diferencia es una de las fuentes más comunes de bugs en specs OpenAPI. En OpenAPI 3.0, `$ref: '#/components/schemas/Task'` con `description: "A task"` al lado — el `description` es ignorado (comportamiento JSON Schema). En OpenAPI 3.1, dentro de `schema`, `$ref` tiene comportamiento JSON Schema (keywords hermanos ignorados); fuera de `schema`, `$ref` tiene comportamiento OpenAPI (keywords hermanos se mergean). Herramientas de bundling como `swagger-cli bundle` y `redocly bundle` resuelven `$ref` externos en un solo archivo para evitar problemas de red. La lección: siempre "bundlear" la spec antes de usarla en producción.

---

### 7. [Conectar] ¿Cómo se comparan las herramientas de linting para OpenAPI: Spectral, Redocly, y Vacuum? ¿Qué reglas cubre cada una y cuál es la más adoptada?

**Respuesta**: **Spectral** (Stoplight): la más adoptada. Reglas en JavaScript/YAML (`ruleset`). Viene con reglas built-in para OpenAPI 3.0/3.1, y permite reglas custom. Gran ecosistema de reglas compartidas. **Redocly CLI** (antes OpenAPI CLI): linting + bundling + preview. Reglas en YAML, orientado a documentación de calidad. Ideal si usás Redoc para visualización. **Vacuum** (Quobix): linting en Go, muy rápido, compatible con reglas de Spectral. Orientado a performance (CI/CD con specs grandes). Cobertura: todas cubren reglas básicas (paths válidos, `$ref` resueltos, parámetros requeridos). Spectral tiene la comunidad más grande y plugins IDE (VS Code, IntelliJ). Redocly se destaca en reglas de estilo de documentación (descripciones requeridas, ejemplos). Vacuum se destaca en velocidad.

**Por qué**: La comparativa "API Linting Tools 2024" (APIs You Won't Hate, Phil Sturgeon) muestra Spectral como líder con ~70% de adopción entre equipos que usan linting. La ventaja de Spectral es que es un motor de reglas genérico, no solo para OpenAPI — podés usar las mismas reglas para validar JSON genérico, documentos Markdown, etc. Para TaskFlow, Spectral es la elección pragmática porque tiene la comunidad más grande, integración con CI/CD más probada, y la mayor cantidad de reglas predefinidas.

---

### 8. [Cuestionar] API-First vs Code-First: ¿qué enfoque usan realmente las grandes empresas de tecnología y por qué? ¿Cuál es el sweet spot para equipos de 5-50 desarrolladores?

**Respuesta**: Grandes empresas están divididas: **Google**: API-First para APIs cloud (Google API Design Guide + protobuf como fuente de verdad, OpenAPI generado). **Microsoft**: mixto — Azure APIs son API-First con OpenAPI como contrato; servicios internos a veces code-first. **Stripe**: API-First con su propio tooling (no OpenAPI exactamente, sino especificación interna que genera documentación y SDKs). **Netflix**: code-first con anotaciones, generación de OpenAPI para documentación externa. **Sweet spot para 5-50 devs**: Code-first para velocidad inicial (Spring doc + anotaciones), migrando gradualmente a API-First para endpoints críticos. API-First puro para equipos pequeños puede ser premature optimization si la API solo tiene un consumidor.

**Por qué**: La encuesta "State of API 2024" (Postman) muestra que 40% de equipos usan API-First, 35% code-first, 25% mixto. API-First crece en adopción pero no es mayoría. La verdad: el enfoque debe elegirse según el contexto, no según el dogma. API-First brilla cuando: múltiples consumidores (frontend web, mobile app, terceros), equipos distribuidos, API como producto. Code-first brilla cuando: un solo consumidor, iteración rápida, prototipado. El sweet spot pragmático es "spec-first but not spec-only": escribir la spec OpenAPI primero para definir el contrato, pero permitir que el código se desvíe y la spec se actualice — la spec no es fuente de verdad inmutable, es documentación viviente.

---

### 9. [Cuestionar] ¿Es OpenAPI demasiado verboso para APIs complejas? ¿Qué son TypeSpec y Smithy y por qué algunos equipos están migrando a estos formatos para DEFINIR APIs en lugar de OpenAPI?

**Respuesta**: Sí, OpenAPI se vuelve extremadamente verboso en APIs grandes (100+ endpoints, 200+ schemas). Un spec de 10,000 líneas YAML es difícil de navegar y revisar en PR. **TypeSpec** (Microsoft, 2023): lenguaje de definición de APIs con sintaxis similar a TypeScript, que compila a OpenAPI, JSON Schema y protobuf. Ejemplo: `op createTask(body: CreateTaskRequest): Task` en lugar de 30 líneas de YAML. **Smithy** (AWS, 2019): IDL para definir servicios con traits, shapes y resources; compila a OpenAPI y a código de cliente/servidor. Motivos de migración: (1) DRY: TypeSpec/Smithy permiten definir tipos reutilizables sin `$ref`. (2) Tooling: validación más rica que YAML (type checking en tiempo de escritura). (3) Multi-formato: mismo source compila a OpenAPI + protobuf, evitando duplicación.

**Por qué**: TypeSpec fue anunciado por Microsoft en 2023 como evolución de su experiencia con Azure APIs (20+ años). Mantener specs OpenAPI de Azure manualmente era inviable. Smithy fue desarrollado internamente en AWS desde 2018 para definir cientos de servicios. Ambos comparten filosofía: OpenAPI es buen formato de intercambio, pero pésimo formato de autoría. La tendencia es "author in TypeSpec/Smithy, publish as OpenAPI" — igual que authorizás TypeScript y compilás a JavaScript. Para TaskFlow, OpenAPI puro en YAML es suficiente. Para una API con 100+ recursos y múltiples equipos, TypeSpec o Smithy serían herramientas adecuadas.

---

### 10. [Cuestionar] ¿Puede OpenAPI describir GraphQL APIs de manera significativa? ¿Cuál es el estado de la integración GraphQL + OpenAPI y por qué hay tensión entre ambas comunidades?

**Respuesta**: Actualmente, OpenAPI NO puede describir GraphQL APIs de manera significativa. OpenAPI modela APIs como endpoints con métodos HTTP fijos, request/response schemas fijos, y parámetros predefinidos. GraphQL tiene un solo endpoint (`POST /graphql`), el schema es un grafo de tipos con queries dinámicas (el cliente compone la selección de campos), y la respuesta varía según la query. OpenAPI puede describir "existe un endpoint POST /graphql" pero no el schema GraphQL ni las queries posibles. La integración actual: se pueden poner links en OpenAPI que apunten a un schema GraphQL externo, pero no describirlo nativamente. La tensión: la comunidad GraphQL ve a OpenAPI como una herramienta REST-céntrica; la comunidad OpenAPI ve a GraphQL como un paradigma diferente que requiere su propio ecosistema (GraphQL SDL, GraphiQL, Apollo Studio).

**Por qué**: La OpenAPI Initiative ha discutido soporte para GraphQL en versiones futuras (hay propuestas para OpenAPI 4.0 "Moonwalk"), pero no hay consenso. Mientras tanto, la práctica es: documentar la API GraphQL por separado con su propio schema SDL y exploradores (GraphiQL). Para una API que expone tanto REST como GraphQL (como GitHub), la documentación está en dos sistemas separados: OpenAPI para REST, GraphQL Schema para GraphQL. No hay convergencia en el horizonte cercano. Esto refleja que REST y GraphQL son paradigmas fundamentalmente diferentes, no solo "formatos de documentación diferentes".

