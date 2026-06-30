---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es Keyset Pagination en el estándar SQL y cómo se relaciona la sintaxis `WHERE (col1, col2) > (val1, val2)` (row-value comparison, SQL:2003) con la implementación eficiente de cursores en APIs REST?

**Respuesta**: La comparación de valores de fila (`row-value comparison`) es una característica del estándar SQL:2003 que permite comparar tuplas completas: `WHERE (created_at, id) > ('2026-01-01', 12345) ORDER BY created_at, id`. Esto implementa keyset pagination de forma eficiente porque el índice compuesto sobre `(created_at, id)` puede buscar directamente desde el cursor sin escanear filas previas. En APIs REST, el cursor se codifica como base64 de la tupla y se pasa como `?cursor=eyJjcmVhdGVkX2F0IjoiMjAyNi0wMS0wMSIsImlkIjoxMjM0NX0=`. El servidor decodifica y construye la cláusula `WHERE (created_at, id) > (val1, val2)` directamente en SQL.

**Por qué**: Markus Winand explica este patrón en detalle en "SQL Performance Explained" (use-the-index-luke.com) y en su charla "Pagination Done the Right Way" (2018). La ventaja sobre `WHERE id > :lastId` simple es que permite ordenamiento por cualquier columna (no solo la primary key), manteniendo rendimiento de índice. La sintaxis de row-value es soportada por PostgreSQL, MySQL 8.0+, y Oracle, pero no por H2 en modo legacy. Para TaskFlow con H2 en desarrollo, habría que usar una alternativa (`WHERE created_at > :lastCreatedAt OR (created_at = :lastCreatedAt AND id > :lastId)`) que es funcionalmente equivalente pero más verbosa. La lección: la implementación de cursor pagination depende del motor de base de datos subyacente.

---

### 3. [Investigar] ¿Cuál es el origen de RSQL/FIQL (Feed Item Query Language) y por qué algunas APIs lo adoptan como DSL de filtros? ¿Qué ventajas ofrece sobre query parameters planos?

**Respuesta**: FIQL (Feed Item Query Language) fue definido originalmente en un draft IETF (draft-nottingham-atompub-fiql, 2007) por Mark Nottingham como lenguaje de filtrado para feeds Atom. RSQL es una evolución que agrega operadores lógicos más expresivos. Sintaxis: `?filter=title==*spring*;(priority==high,priority==medium);status==completed`. Operadores: `==` (equal), `!=` (not equal), `=gt=` (greater than), `=lt=` (less than), `=in=` (in), `*value*` (contains). Ventajas sobre query params planos: (1) Un solo parámetro `filter` en lugar de múltiples parámetros que interactúan. (2) Expresividad booleana completa: AND con `;`, OR con `,`, agrupación con `()`. (3) Estándar documentado, no ad-hoc.

**Por qué**: Mark Nottingham (Yahoo! en ese momento, luego IETF HTTP WG Chair) diseñó FIQL para Atom Publishing Protocol. El draft expiró pero fue adoptado por comunidades Java (rsql-parser) y proyectos como OLingo (OData). APIs como Jira y algunos sistemas enterprise lo usan. La desventaja es complejidad: los query params planos (`?status=completed&priority=high`) son inmediatamente entendibles; RSQL requiere aprender una sintaxis. Para APIs públicas simples, query params planos son preferibles. Para APIs internas o enterprise donde los clientes necesitan queries complejas, RSQL ofrece expresividad sin inventar un DSL propio. La alternativa moderna es GraphQL como capa de query.

---

### 4. [Investigar] ¿Cómo maneja Elasticsearch la paginación profunda y qué patrones como `search_after` y Point in Time (PIT) han influido en el diseño de APIs REST para grandes datasets?

**Respuesta**: Elasticsearch ofrece tres estrategias de paginación: (1) `from`/`size` (equivalente a offset): limitado a 10,000 resultados por defecto porque requiere cargar y descartar documentos previos. (2) `search_after` (equivalente a cursor): usa los valores de ordenamiento del último documento visto para la siguiente página. No tiene límite de profundidad pero no permite saltar páginas. Requiere un Point in Time (PIT) para mantener una vista consistente del índice mientras se pagina. (3) `scroll`: mantiene un contexto de búsqueda en el servidor por tiempo limitado. Legacy, reemplazado por `search_after` + PIT para la mayoría de casos. La influencia en APIs REST: el patrón PIT muestra que cursor pagination en datos que cambian constantemente requiere una snapshot consistente, no solo un cursor de ID.

**Por qué**: Elasticsearch documenta esto en "Paginate search results" (elastic.co/guide). El problema de paginación profunda con offset es universal: en bases de datos SQL, `OFFSET 100000` requiere que el motor lea y descarte 100,000 filas. En Elasticsearch, `from: 100000` carga 100,000 documentos en memoria del coordinador. `search_after` resuelve esto buscando directamente desde el punto de ordenamiento. Para APIs REST que exponen búsquedas sobre índices grandes (millones de registros), limitar `page` máximo (ej. `maxPage=100`) es una práctica defensiva. Si el caso de uso requiere paginación profunda (ej. exportación masiva), usar cursor + procesamiento asincrónico (202 Accepted + job status).

---

### 5. [Conectar] La clase enseña offset pagination con `totalElements`. ¿Qué impacto real tiene calcular `SELECT COUNT(*)` en tablas con cientos de millones de registros y cómo lo manejan APIs como Slack, Twitter, o Reddit?

**Respuesta**: `SELECT COUNT(*)` en tablas grandes (100M+ filas) puede tomar segundos o incluso decenas de segundos porque requiere un full table scan o index scan completo. Las soluciones reales: **Slack**: usa cursor pagination sin total — simplemente `hasMore: true/false`. **Twitter API v2**: cursor pagination con `next_token` y `previous_token`, sin total count en la mayoría de endpoints. **Reddit**: usa offset con `count` aproximado (estimado, actualizado periódicamente). **GitHub Search API**: limita resultados a 1000 items máximo (no permite paginar más allá) porque el count exacto es costoso e irrelevante para el usuario. **Alternativa**: HyperLogLog para counts aproximados con error < 2% y costo constante.

**Por qué**: La realidad del `COUNT(*)` es uno de los problemas de rendimiento más subestimados en diseño de APIs. La clase enseña `totalElements` como parte del modelo, pero en producción esto colapsa con datasets grandes. La solución pragmática: ofrece `totalElements` con offset pagination solo para datasets pequeños/medianos (<100K registros) o admin dashboards internos. Para APIs públicas con datos masivos, usa cursor pagination sin count (como hace Slack) o count aproximado (como hace Reddit). Si el negocio realmente necesita counts exactos, mantenelos en una tabla de contadores separada, actualizada asincrónicamente — nunca un COUNT(*) en vivo en la request del usuario. El libro "Designing Data-Intensive Applications" (Kleppmann, 2017, Capítulo 3) cubre este problema en profundidad.

---

### 6. [Conectar] ¿Cómo se comparan los query parameters de OData (`$filter`, `$orderby`, `$top`, `$skip`, `$select`, `$expand`) con los patrones de filtros que enseña la clase? ¿Qué nivel de adopción tiene OData fuera del ecosistema Microsoft?

**Respuesta**: OData estandariza todos los aspectos de query en un solo protocolo: `$top` = size, `$skip` = page*size (offset calculado), `$filter=status eq 'completed' and priority eq 'high'`, `$orderby=createdAt desc`, `$select=id,title`, `$expand=user`. La clase enseña patrones equivalentes pero con nombres de parámetros ad-hoc (`?page=0&size=10`, `?status=completed`, `?sort=createdAt,desc`, `?fields=id,title`). OData es más completo y estandarizado; los patrones de la clase son más simples y directos. Adopción fuera de Microsoft: SAP (SAP Gateway), Tableau, Apache Olingo (Java), y algunas APIs enterprise. En startups y APIs públicas modernas, OData es raro — la mayoría prefiere patrones ad-hoc simples como los de la clase.

**Por qué**: OData (odata.org) es un estándar OASIS (no de Microsoft, aunque Microsoft es el principal contribuyente). Su complejidad es su mayor barrera de adopción: implementar OData completo implica soportar un lenguaje de query con operadores lógicos, funciones de string/date/math, navegación de propiedades anidadas, y expansión de relaciones. Es sobredimensionado para una API CRUD simple. Sin embargo, si estás en el ecosistema Microsoft (Dynamics 365, SharePoint, Azure), OData es la convención estándar y tus clientes lo esperan. Para TaskFlow, los patrones simples de la clase son más apropiados porque la API es de alcance acotado.

---

### 7. [Conectar] ¿Cómo se relaciona el header HTTP `Link` (RFC 8288, antes RFC 5988) con los links de paginación en HAL (`_links`)? ¿Cuál es más estándar y cuándo usar cada uno?

**Respuesta**: **Header `Link`** (RFC 8288, Nottingham, 2017): define un formato estándar para transportar links en headers HTTP. Sintaxis: `Link: <https://api.example.com/tasks?page=2>; rel="next"`. Ventaja: es parte nativa del protocolo HTTP, los proxies y caches pueden usarlo. Desventaja: solo en headers, no acompaña al body JSON. **HAL `_links`**: links embebidos en el body JSON de la respuesta. Ventaja: están junto a los datos, más fáciles de consumir para clientes que ya parsean JSON. Desventaja: no es un estándar IETF (aunque HAL es un draft IETF expirado). **GitHub API** usa AMBOS: `Link` header para paginación + `_links` en algunos endpoints hipermedia.

**Por qué**: RFC 8288 define `Link` como header genérico de HTTP, no específico de REST. La ventaja del header es que no modifica la representación del recurso: podés agregar links de paginación sin cambiar el body. La ventaja de HAL es que coloca todos los links juntos (paginación + affordances de recurso) en un solo lugar. Para TaskFlow, una API moderna debería implementar ambos: `Link` header para navegación de paginación (soportado nativamente por GitHub clients, Octokit, etc.) y `_links` en el body HAL para affordances HATEOAS. No son mutuamente excluyentes.

---

### 8. [Cuestionar] ¿Es OData "demasiado complejo" para la mayoría de APIs REST y por qué fracasó en adopción masiva fuera del enterprise? ¿Qué lecciones deja para el diseño de filtros?

**Respuesta**: OData fracasó en adopción masiva por: (1) Complejidad de spec: el documento completo de OData v4 tiene cientos de páginas cubriendo no solo queries sino formato de datos, operaciones CRUD, batch processing, y metadata — es un protocolo completo, no solo una convención de query. (2) Implementación costosa: soportar `$filter` con todas las funciones de OData requiere esencialmente un parser de lenguaje de consultas. (3) URLs ilegibles: `$filter=contains(tolower(title),'spring')` no es más claro que `?q=spring`. (4) Acoplamiento: el cliente debe aprender OData, no solo REST. Lección para diseño de filtros: empezar simple (`?status=completed&q=spring`), agregar complejidad solo cuando sea necesario, y siempre documentar.

**Por qué**: Phil Sturgeon en "Build APIs You Won't Hate" (2015) dedica un capítulo a advertir contra OData para APIs públicas, llamándolo "over-engineered for 95% of use cases." Mike Amundsen en "RESTful Web APIs" (2013) señala que OData intenta resolver problemas que la mayoría de APIs no tienen. La adopción quedó confinada a enterprise Microsoft/SAP donde la estandarización del protocolo es requisito contractual. Para el resto de la industria, los query parameters simples ganaron. La lección: los filtros deben ser tan simples como sea posible pero no más simples. La mayoría de APIs solo necesitan filtros exactos, búsqueda de texto, y ordenamiento — y para eso query params planos son perfectos.

---

### 9. [Cuestionar] ¿Debe la paginación usar `page`/`size` o `offset`/`limit`? ¿Cuál semántica causa menos confusión y errores off-by-one en clientes?

**Respuesta**: `page`/`size` (basado en página) es más intuitivo para UIs con navegación de páginas ("Página 1 de 10"). El servidor calcula offset = page * size. `offset`/`limit` (basado en registro) es más directo para el servidor (no requiere multiplicación) pero confunde a clientes humanos ("¿cuál es el offset para la página 3?"). El error off-by-one es simétrico: con `page`/`size`, el cliente puede confundir base-0 vs base-1 (¿page=1 es la primera o segunda página?). Con `offset`/`limit`, el cliente debe calcular offset manualmente. La industria está dividida: GitHub usa `page`/`per_page`; Stripe usa `starting_after`/`limit` (cursor); Shopify usa `page`/`limit`.

**Por qué**: La elección debe guiarse por el consumidor principal de la API. Si el consumidor es un frontend con paginación visual (botones de página, "Página X de Y"), `page`/`size` con `totalPages` es natural. Si el consumidor es un script o backend que procesa registros secuencialmente, `offset`/`limit` puede ser más natural. Lo crítico es documentar claramente si `page` es 0-indexed (la mayoría) o 1-indexed (algunas APIs legacy) y ser consistente. La clase usa 0-indexed (`page=0`), que es la convención moderna más común.

---

### 10. [Cuestionar] ¿Es realmente "más RESTful" el cursor pagination si dos requests a la misma URL (`GET /tasks`) devuelven datos diferentes porque el estado del servidor cambió? ¿No viola esto la idempotencia y previsibilidad de GET?

**Respuesta**: No viola la idempotencia de GET porque idempotencia se refiere a efectos laterales en el servidor, no a que la respuesta sea idéntica. GET es seguro: no modifica el estado del servidor. Pero GET nunca garantiza que la respuesta sea la misma — dos llamados a `GET /tasks/42` separados por un minuto pueden retornar diferente `title` porque alguien la editó. Eso es esperable y correcto: la URL identifica el recurso, que evoluciona. En cursor pagination, `GET /tasks?cursor=abc&limit=10` con el mismo cursor podría retornar datos distintos una hora después porque el servidor insertó/eliminó tareas. Si eso es un problema, el servidor debe implementar snapshots consistentes (Point in Time, como Elasticsearch PIT), pero eso es un requisito adicional, no una violación de REST.

**Por qué**: La confusión viene de confundir "idempotencia" (mismo efecto lateral) con "determinismo" (misma respuesta). GET es seguro e idempotente en términos de efectos laterales: no crea, modifica ni elimina recursos. Pero la respuesta puede variar legítimamente porque el recurso varía en el tiempo. En cursor pagination, el cursor representa un punto en el tiempo de la consulta original. Si el servidor no mantiene snapshots, el cursor puede devolver resultados diferentes minutos después — esto es un comportamiento documentado, no un bug. La alternativa es `POST /tasks/search` con body (rompe la semántica GET) o acceptar que los datos cambian. La mayoría de APIs de feeds (Twitter, Reddit) aceptan que el feed cambia entre requests — es el comportamiento esperado.

