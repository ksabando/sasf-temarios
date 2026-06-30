---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el "Quality Attribute Workshop" (QAW) del SEI y cómo se diferencia de ATAM en el ciclo de vida del proyecto?

**Respuesta**: El QAW, también del SEI (Barbacci, Ellison, 2001), es un método para **elicitar** atributos de calidad y escenarios antes de diseñar la arquitectura, mientras que ATAM es para **evaluar** una arquitectura ya diseñada. QAW se ejecuta en la fase de requisitos, con stakeholders de negocio y técnicos, y produce un "utility tree" de escenarios de calidad priorizados que guían el diseño arquitectónico. ATAM se ejecuta después, evalúa si la arquitectura propuesta satisface esos escenarios, e identifica riesgos. La clase presentó escenarios de calidad y ATAM como si fueran parte del mismo proceso, pero en la práctica industrial, QAW es el input de ATAM: primero elicitás escenarios con negocio (QAW), luego diseñás la arquitectura, luego evaluás (ATAM).

**Por qué**: La metodología completa del SEI distingue entre elicitación (QAW) y evaluación (ATAM). Para E-Commerce Platform: primero harías un QAW con stakeholders para priorizar disponibilidad (99.9%) sobre performance, luego diseñás la arquitectura hexagonal + microservicios, luego ATAM para evaluar si ese diseño cumple los escenarios. La clase no mencionó QAW, dejando un vacío sobre cómo se llega a los escenarios de calidad.

---

### 3. [Investigar] ¿Qué es el modelo "Availability, Latency, Throughput, Freshness" (ALTF) de Google y cómo extiende los 9s de disponibilidad que cubre la clase?

**Respuesta**: Google, en su *Site Reliability Engineering* book (2016), define 4 métricas de calidad operacional: **Availability** (fracción de tiempo que el sistema responde exitosamente, medido en 9s), **Latency** (tiempo para servir un request, medido en percentiles), **Throughput** (tasa de requests procesados), y **Freshness** (cuán actualizados están los datos servidos). La clase cubre disponibilidad (9s) y performance (latencia), pero no **Freshness** como métrica separada. Freshness es crítico en sistemas con consistencia eventual: un usuario puede recibir respuesta en 50ms (buena latencia), pero los datos pueden tener 5 minutos de antigüedad (mala freshness). Google define SLOs para las 4 dimensiones y monitorea su cumplimiento con "error budgets."

**Por qué**: El concepto de "freshness" es poco conocido fuera de Google pero esencial para sistemas CQRS y EDA. Si tu read model tiene 30 segundos de lag respecto al write model, tu disponibilidad y latencia pueden ser excelentes (el sistema "funciona"), pero la experiencia del usuario puede ser pésima (datos desactualizados). La clase no mencionó freshness como dimensión de calidad.

---

### 4. [Investigar] ¿Qué es "Chaos Engineering" según *Principles of Chaos Engineering* (Netflix) y cómo se relaciona con la verificación de atributos de calidad en producción vs las tácticas de diseño?

**Respuesta**: Chaos Engineering, formalizado por Netflix (Casey Rosenthal, Nora Jones) en *Principles of Chaos Engineering* (2017) y el libro *Chaos Engineering* (2020), es la disciplina de experimentar en un sistema en producción para generar confianza en su capacidad de resistir condiciones turbulentas. A diferencia de las tácticas arquitectónicas (que son **diseño** preventivo: circuit breaker, redundancia), Chaos Engineering es **verificación** empírica: inyectás fallos controlados (latencia, caída de servicio, partición de red) y verificás que el sistema se comporte como esperás. La premisa: no sabés si tu arquitectura es resiliente hasta que la probás en producción. Netflix creó Chaos Monkey, Chaos Kong, y FIT (Failure Injection Testing) para automatizar esta verificación.

---

### 5. [Conectar] La clase presenta ATAM como método de evaluación. ¿Cómo se relaciona esto con el "Utility Tree" del SEI y cómo se construye un utility tree para E-Commerce Platform?

**Respuesta**: El utility tree es el artefacto central de ATAM. Tiene una estructura jerárquica: raíz = "Utility" (utilidad del sistema), nivel 1 = atributos de calidad (Performance, Availability, Security, etc.), nivel 2 = sub-atributos (bajo Performance: Latencia, Throughput), nivel 3 = escenarios de calidad concretos priorizados por importancia (H, M, L) y dificultad de implementación (H, M, L). Por ejemplo: Performance → Latencia → "Bajo carga de 500 usuarios concurrentes, la búsqueda de productos responde en <200ms p95" (H, M). El utility tree prioriza escenarios para que ATAM se concentre en los de alta importancia y alta dificultad.

**Por qué**: La clase mencionó ATAM y escenarios de calidad, pero no el utility tree que los conecta. Kazman y Clements en *Evaluating Software Architectures* dedican un capítulo al utility tree como herramienta de priorización. Sin utility tree, tenés una lista plana de escenarios; con utility tree, sabés exactamente cuáles son los escenarios que hacen o rompen la arquitectura.

---

### 6. [Conectar] La clase cubre performance con latencia p50/p95/p99. ¿Cómo se relaciona esto con la "Long Tail" de latencia que documenta Gil Tene y cómo impacta decisiones arquitectónicas?

**Respuesta**: Gil Tene (CTO de Azul Systems, creador de C4 garbage collector) popularizó el concepto de "long tail latency" en su charla *"How NOT to Measure Latency"* (2015). Su insight clave: el promedio de latencia es engañoso porque la distribución de latencia tiene una "cola larga" (algunos requests son muchísimo más lentos que el promedio). Si 1 de cada 1000 requests tarda 10 segundos, el promedio puede ser 100ms (aceptable), pero para un usuario que experimentó los 10 segundos, el sistema "no funciona." Las decisiones arquitectónicas impactan la cola: un GC pause de 2 segundos en Java no afecta el p50 pero destruye el p99.9. Las tácticas: timeouts agresivos, hedged requests, y evitar puntos de serialización (locks, GC, single-threaded bottlenecks).

**Por qué**: La clase presentó percentiles, pero Tene explica por qué el p99.9 es la métrica que importa para experiencia de usuario. Si tenés 10K usuarios concurrentes en E-Commerce Platform y 1 de cada 1000 experimenta 10 segundos de latencia, tenés 10 usuarios furiosos por segundo. Las decisiones arquitectónicas (síncrono vs asíncrono, con pooling vs sin pooling, con ORM vs SQL directo) tienen impacto directo en la cola larga, no en el promedio.

---

### 7. [Conectar] La clase cubre seguridad con CIA Triad y estrategias. ¿Cómo se relaciona esto con el "Zero Trust Architecture" (NIST SP 800-207) y qué implicancias arquitectónicas tiene?

**Respuesta**: Zero Trust Architecture (ZTA), definido por NIST SP 800-207 (2020), es un modelo de seguridad donde no se confía en ningún actor, dispositivo o red por defecto, incluso dentro del perímetro corporativo. Las implicancias arquitectónicas son profundas: (1) **micro-segmentación**: cada servicio autentica cada request, incluso entre servicios internos (mTLS en service mesh), (2) **identity-based access**: tokens JWT con claims específicos, no API keys compartidas, (3) **continuous verification**: cada request se verifica contra políticas en tiempo real (no solo al iniciar sesión), y (4) **least privilege**: cada servicio tiene acceso solo a los datos que necesita. La clase mencionó autenticación y autorización, pero Zero Trust va más allá: asume que la red está comprometida y diseña defensa en profundidad a nivel de aplicación.

**Por qué**: NIST SP 800-207 es el estándar de referencia para Zero Trust. Para E-Commerce Platform, Zero Trust significa que el Servicio de Pagos no confía en el Servicio de Pedidos solo porque está en la misma VPC: cada request debe traer un token JWT con scope `payment:create` y el Servicio de Pagos lo valida contra el identity provider.

---

### 8. [Cuestionar] ¿Son los "9's de disponibilidad" una métrica útil o un mito de marketing? La crítica de Charity Majors (Honeycomb) sobre SLOs significativos.

**Respuesta**: Charity Majors, CTO de Honeycomb, argumenta en su blog y charlas que los 9s son una métrica pobre porque miden "¿está el sistema up?" pero no "¿está el sistema útil?" Un sistema puede estar "up" (servidor responde 200 OK) pero ser inútil (respuestas vacías, latencia de 30 segundos, datos incorrectos). Majors propone SLOs basados en **eventos de negocio** (¿el usuario pudo completar la compra?) en lugar de métricas técnicas (¿el load balancer recibió respuesta?). Su crítica: obsesionarse con 99.99% lleva a arquitecturas conservadoras que evitan cualquier cambio con riesgo, sacrificando velocidad de desarrollo.

**Por qué**: Majors es una voz influyente en observabilidad. La clase presentó disponibilidad como métrica de 9s sin cuestionarla, pero la tendencia de la industria (Google SRE book, Honeycomb) es hacia SLOs orientados al negocio. Para E-Commerce: "99.9% de usuarios que intentan comprar, completan la compra en <10 segundos" es más significativo que "el API Gateway responde 99.99% del tiempo."

---

### 9. [Cuestionar] ¿Es ATAM demasiado pesado para equipos ágiles? ¿Puede la evaluación de arquitectura ser continua en lugar de un evento puntual?

**Respuesta**: ATAM fue diseñado en los 90s para procesos waterfall o RUP, con talleres de 2-3 días. En entornos ágiles con sprints de 2 semanas, ATAM completo es inviable. La alternativa propuesta por Neal Ford en *Building Evolutionary Architectures*: **fitness functions continuas** que validan los atributos de calidad en cada build de CI/CD, reemplazando la evaluación puntual de ATAM con verificación continua automatizada. Sin embargo, Kazman y el SEI argumentan que ciertos análisis de trade-offs (especialmente riesgos de seguridad) requieren juicio humano y no pueden ser automatizados. La postura intermedia: ATAM "light" (2-4 horas, solo para decisiones de alto impacto) + fitness functions para atributos automatizables.

**Por qué**: Esta es la tensión entre arquitectura tradicional (SEI) y arquitectura evolutiva (Ford). La clase presentó ATAM sin discutir su aplicabilidad ágil. La práctica emergente en ThoughtWorks: usar "Architecture Decision Records" como ATAM distribuido (cada ADR incluye un mini trade-off analysis) + fitness functions automatizadas.

---

### 10. [Cuestionar] ¿Es la seguridad un atributo de calidad "no funcional" o es un atributo funcional? El debate sobre si la seguridad debe ser diseñada como requisito funcional desde el inicio.

**Respuesta**: Tradicionalmente, la seguridad se clasifica como "non-functional requirement" (NFR) junto con performance y disponibilidad. La crítica moderna (Jim Manico, OWASP) es que tratar la seguridad como NFR la relega a una preocupación secundaria que se "agrega después." La seguridad debería ser tratada como requisito funcional: "el sistema DEBE autenticar usuarios con OAuth 2.0 + PKCE" y "el sistema DEBE encriptar datos PII en reposo con AES-256" son tan funcionales como "el sistema DEBE permitir crear pedidos." La ventaja de este framing: la seguridad entra en la definición de done, en las historias de usuario, y en los criterios de aceptación, no en un documento separado de NFR que nadie lee.

**Por qué**: OWASP y el BSIMM (Building Security In Maturity Model) promueven tratar seguridad como requisito de primera clase. La clase la clasificó como NFR siguiendo la taxonomía tradicional del SEI, pero la tendencia en DevSecOps es integrar seguridad como parte del diseño desde el día 1, no como atributo no funcional a verificar después.

---

