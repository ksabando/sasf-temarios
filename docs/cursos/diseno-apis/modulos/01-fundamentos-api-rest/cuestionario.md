---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿De dónde proviene exactamente la distinción entre "REST" y "RESTful" y quién fue el primero en articularla formalmente? ¿Qué opina Fielding de esta distinción?

**Respuesta**: La distinción "REST" (estilo arquitectónico puro con las 6 constraints) vs "RESTful" (API que sigue la mayoría de las constraints pero quizás no HATEOAS) fue popularizada por Leonard Richardson en su charla "Justice Will Take Us Millions Of Intricate Moves" (QCon 2008), donde presentó el modelo de madurez. Sin embargo, Fielding ha sido explícito: "There is no such thing as a RESTful API. Something is either REST or it isn't." Para Fielding no hay grados; la distinción es una concesión pragmática de la industria que él rechaza.

**Por qué**: Richardson, al presentar su modelo en QCon SF 2008 (y posteriormente codificado por Martin Fowler en su blog "Richardson Maturity Model", 2010), creó los niveles 0-3 justamente porque la industria ya llamaba "REST" a cosas que no lo eran. La evidencia está en que el propio Fowler escribe: "I've spoken to Roy Fielding and he would say that to be truly RESTful you need level 3." La distinción REST vs RESTful es, por tanto, un artefacto de la industria para resolver la tensión entre pureza arquitectónica y pragmatismo — Fielding nunca la aceptó, pero el mercado la adoptó.

---

### 3. [Investigar] ¿Cuál fue el rol de Roy Fielding en la especificación HTTP/1.1 original y en su revisión? ¿Cómo influyó la arquitectura REST en el diseño del protocolo HTTP?

**Respuesta**: Fielding fue co-autor principal de RFC 2616 (HTTP/1.1, 1999) y uno de los editores principales de las RFCs 7230-7235 que revisaron y reemplazaron RFC 2616 en 2014. Su tesis doctoral analizó la arquitectura de la Web existente y destiló REST como el estilo arquitectónico que explica su éxito. El diseño de HTTP refleja REST: métodos bien definidos (GET seguro e idempotente, PUT idempotente), headers de caché (Cache-Control, ETag), negociación de contenido (Accept, Content-Type), y códigos de estado semánticos — todas construcciones que provienen de aplicar las restricciones REST al protocolo.

**Por qué**: La tesis de Fielding (UC Irvine, 2000) se titula "Architectural Styles and the Design of Network-based Software Architectures" y dedica el capítulo 6 a "Experience and Evaluation" donde explica cómo REST se derivó del diseño de HTTP. No es casualidad: Fielding fue el principal arquitecto de HTTP/1.1 en el IETF. La revisión RFC 7230-7235 (2014) que él co-editó clarificó exactamente los conceptos que la industria usaba mal (idempotencia de DELETE, respuesta 201 con Location, semántica de PATCH que quedó en RFC 5789). Esta conexión entre su rol en el IETF y su tesis demuestra que REST no es teoría abstracta sino ingeniería de protocolos aplicada.

---

### 4. [Investigar] ¿Qué otras restricciones arquitectónicas exploró Fielding en su tesis doctoral que no llegaron a formar parte de REST? ¿Por qué fueron descartadas?

**Respuesta**: La tesis de Fielding analiza estilos arquitectónicos como Pipe and Filter, Client-Server, Layered, Replicated Repository, Cache, Mobile Code, Event-based Integration, y Distributed Objects antes de derivar REST. REST es la combinación de restricciones que Fielding dedujo al analizar por qué la Web funcionaba. Las restricciones que exploró pero no incluyó como necesarias incluyen: procesamiento peer-to-peer simétrico (porque la Web es inherentemente cliente-servidor asimétrico), estado compartido entre capas (rechazado por la restricción stateless), y objetos distribuidos al estilo CORBA/DCOM (rechazados por acoplar interfaz con implementación, violando la uniform interface).

**Por qué**: El proceso de Fielding fue inductivo, no deductivo: no inventó REST y luego diseñó HTTP, sino que observó HTTP/1.1 y la Web temprana y destiló qué restricciones explicaban su escalabilidad y flexibilidad. En el Capítulo 5 de su tesis, deriva REST como un "architectural style for distributed hypermedia systems" evaluando sistemáticamente las propiedades inducidas por cada restricción: simplicidad, visibilidad, escalabilidad, modificabilidad, portabilidad y confiabilidad. El estilo Mobile Code fue incluido como opcional (Code on Demand) porque Fielding reconoció que JavaScript y applets ya existían pero no eran esenciales para la arquitectura. Los objetos distribuidos fueron rechazados explícitamente por requerir binding estático entre interfaz e implementación.

---

### 5. [Conectar] La clase enseña que REST es stateless por escalabilidad. ¿Cómo interactúa el principio de statelessness con legislaciones de privacidad como GDPR que requieren "derecho al olvido"? ¿Dónde se almacena realmente el estado en una API RESTful?

**Respuesta**: El estado no desaparece — se traslada al cliente o se persiste como recurso. En una API RESTful stateless, los datos del usuario no están en sesiones efímeras del servidor sino en la base de datos como recursos. Para GDPR, esto es una ventaja: los datos son recursos con URLs, lo que facilita implementar el derecho al olvido (DELETE del recurso `User` y sus recursos relacionados). Pero también crea responsabilidad: si el estado está en el cliente (ej. un JWT con claims), el servidor no lo "recuerda" — pero el token puede contener PII (Personal Identifiable Information) que el cliente almacena, y bajo GDPR el cliente (frontend) es un procesador de datos.

**Por qué**: La conexión REST-GDPR no es obvia. GDPR Artículo 17 establece el derecho de supresión ("right to be forgotten"). En arquitecturas stateful, el estado en sesión del servidor es difícil de rastrear y eliminar completamente. En REST, cada dato tiene una URL, y cada recurso puede ser eliminado con DELETE. Sin embargo, el IETF Naveed et al. (2015) en "Privacy Considerations for Internet Protocols" (RFC 6973) advierte que los tokens JWT transportados en headers pueden ser logs en proxies y load balancers que no se eliminan con DELETE. La solución: tokens con claims mínimos (solo `sub`), y datos sensibles siempre del lado del servidor.

---

### 6. [Conectar] ¿Cómo se relaciona la restricción de "Cacheability" de REST con el funcionamiento de CDNs modernos como CloudFront, Akamai y Cloudflare? ¿Qué headers de la clase son esenciales para esta integración?

**Respuesta**: La cacheability de REST es exactamente lo que permite a las CDNs funcionar como "intermediarios transparentes" en el Layered System de REST. Una CDN es esencialmente un reverse proxy cache que implementa la restricción de cache. Los headers clave son: `Cache-Control: public, max-age=3600` (le dice a la CDN que puede cachear la respuesta y por cuánto tiempo), `ETag` + `If-None-Match` (permite revalidación condicional: la CDN pregunta al origen "¿cambió esto?"), y `Vary: Accept, Authorization` (le dice a la CDN cómo particionar el caché). Sin estos headers configurados correctamente, la CDN no cachea o —peor— cachea incorrectamente.

**Por qué**: La restricción de cache (Fielding, tesis 2000, Sección 5.1.4) establece que "los datos de respuesta deben ser implícita o explícitamente etiquetados como cacheables o no cacheables". CloudFront (AWS) y Akamai son implementaciones masivas de esta restricción a escala de Internet. CloudFront respeta `Cache-Control`, `Expires`, y `Vary` exactamente como Fielding lo definió. Los errores comunes en APIs REST que desperdician CDNs son: usar `Cache-Control: no-store` globalmente (deshabilita la CDN completamente), olvidar `Vary` cuando la respuesta varía por header (puede cachear el resultado del usuario A y servírselo al usuario B), o no configurar `ETag` para requests condicionales (cada request llega al origen innecesariamente). La especificación de HTTP Caching está en RFC 7234.

---

### 7. [Conectar] ¿Cómo se mapea la restricción "Layered System" de REST a las arquitecturas modernas de API Gateway con microservicios? ¿Es Kong, Apigee o Envoy una implementación directa de esta restricción?

**Respuesta**: La restricción "Layered System" establece que un cliente no puede distinguir si está conectado directamente al servidor final o a un intermediario. Un API Gateway moderno (Kong, Apigee, Envoy, AWS API Gateway) es exactamente un intermediario que implementa esta restricción: el cliente cree que habla con "la API", pero el gateway enruta a múltiples microservicios internos, aplica rate limiting, autenticación, logging y transformación. El cliente no sabe ni necesita saber que detrás del gateway hay 20 servicios diferentes.

**Por Qué**: Fielding describe la restricción "Layered System" como aquella donde "cada componente no puede ver más allá de la capa inmediata con la que interactúa" (tesis, Sección 5.1.6). Esto permite balanceadores de carga (HAProxy, Nginx), firewalls (WAF), y caches compartidos (Varnish) que mejoran escalabilidad y seguridad sin que el cliente modifique su código. Kong y Apigee añaden capacidades que Fielding anticipó: transformación de protocolos, composición de respuestas, y seguridad perimetral. La diferencia clave: un API Gateway que expone endpoints diferentes internamente de los que el cliente ve implementa Layered System; uno que obliga al cliente a saber cuál microservicio llamar directamente lo viola. RFC 7230 (Sección 2.2) formaliza los intermediarios HTTP como "proxies, gateways y túneles."

---

### 8. [Cuestionar] ¿Por qué la mayoría de las APIs consideradas exitosas (Stripe, Twilio, GitHub) operan en Nivel 2 del modelo de Richardson y no en Nivel 3 (HATEOAS)? ¿Es el modelo de Richardson práctico o académico?

**Respuesta**: Stripe, Twilio y GitHub operan en Nivel 2 porque HATEOAS (Nivel 3) agrega complejidad sin suficiente retorno de inversión percibido para sus casos de uso. Estas empresas priorizan: SDKs en múltiples lenguajes que hardcodean las URLs, documentación OpenAPI de alta calidad, y versionado explícito — exactamente lo opuesto a la "autodescubribilidad" de HATEOAS. El argumento pragmático es que cuando controlás tanto el servidor como los SDKs oficiales, la descoordinación servidor-cliente que HATEOAS resuelve no es un problema real.

**Por qué**: Stripe tiene más de 20 SDKs oficiales; si cambiaran las URLs, actualizarían los SDKs. Para clientes que no usan SDKs, Stripe provee documentación interactiva y versionado basado en fecha. GitHub usa una estrategia similar con su API v3/v4. Ninguna de estas empresas reporta problemas de evolución de APIs que HATEOAS hubiera resuelto mejor. El debate es: ¿Richardson creó un modelo prescriptivo (lo que debería ser REST) o descriptivo (lo que la industria hace)? Martin Fowler en su artículo original (2010) lo presenta como "una forma de pensar en el uso de REST", no como un checklist. Sin embargo, Fielding ha dicho (en comentarios online) que el modelo es útil pero que la gente confunde "alcanzar Nivel 2" con "ser REST".

---

### 9. [Cuestionar] "Code on Demand" es la única restricción opcional de REST. ¿Por qué Fielding la hizo opcional en lugar de obligatoria? ¿Qué riesgos de seguridad introduce y por qué fracasó en APIs modernas?

**Respuesta**: Fielding la hizo opcional porque observó que la Web (HTML + JavaScript) ya usaba code-on-demand y funcionaba, pero no era esencial para la arquitectura: se puede tener una Web completamente funcional con HTML estático. Los riesgos de seguridad incluyen: ejecución de código no confiable del servidor en el cliente (XSS), violación de sandbox, y dependencia de un runtime específico (Java applets, Flash). Fracasó en APIs modernas porque: (1) los clientes de API son código programado, no navegadores que ejecutan scripts dinámicamente; (2) los riesgos de seguridad son inaceptables en entornos server-to-server; (3) el patrón se reemplazó por SDKs pre-compilados distribuidos por package managers.

**Por qué**: La tesis de Fielding (Sección 5.1.7) dice: "REST allows client functionality to be extended by downloading and executing code in the form of applets or scripts. This simplifies clients by reducing the number of features required to be pre-implemented." La palabra clave es "allows" — no "requires". En la Web de 2000, JavaScript y Java applets eran el code-on-demand natural. En APIs de 2024, el code-on-demand más cercano es OpenAPI → generación de código (pero esto ocurre en tiempo de diseño, no runtime) o los webhooks que envían payloads que el cliente procesa con lógica propia. La realidad es que esta restricción quedó como una curiosidad histórica; ningún diseño moderno de API RESTful la implementa.

---

### 10. [Cuestionar] A pesar de que REST se creó en 2000 y SOAP se considera legacy, ¿por qué sectores como banca, gobierno y healthcare siguen usando SOAP en 2026? ¿Es siempre REST técnicamente superior?

**Respuesta**: SOAP sobrevive en sectores regulados porque ofrece: (1) Contrato estricto vía WSDL que actúa como especificación legalmente vinculante entre sistemas. (2) WS-Security, WS-ReliableMessaging, WS-AtomicTransaction — estándares maduros que REST no tiene equivalentes nativos estandarizados para transacciones distribuidas y mensajería confiable. (3) Herramientas de generación de código enterprise (IBM WebSphere, Oracle WebLogic) embebidas en procesos de compliance. REST no es técnicamente superior para transacciones financieras que requieren atomicidad distribuida, ni para intercambios B2B donde el contrato WSDL es parte del acuerdo legal entre empresas.

**Por qué**: SWIFT (banca internacional) usa ISO 20022 sobre SOAP. HL7 FHIR (healthcare) migró a REST recién en 2014 pero convive con SOAP porque hospitales legacy no pueden migrar. El gobierno de EE.UU. (FISMA, FedRAMP) exige ciertos controles que WS-Security provee nativamente. Stefan Tilkov (innoQ, autor de "REST und HTTP") argumenta que REST es superior en escenarios de Internet abierto (escalabilidad, caching, simplicidad) pero que SOAP fue diseñado para escenarios enterprise con requisitos de transaccionalidad, seguridad a nivel de mensaje y contratos formales que REST no intentó resolver. No es cuestión de "REST es mejor" sino de "REST resuelve un problema distinto".

