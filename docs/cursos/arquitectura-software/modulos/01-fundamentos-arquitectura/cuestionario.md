---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué son las Architecture Fitness Functions y cómo difieren de las tácticas arquitectónicas tradicionales?

**Respuesta**: Las Architecture Fitness Functions, introducidas por Neal Ford, Rebecca Parsons y Patrick Kua en *Building Evolutionary Architectures* (2017), son pruebas automatizadas que verifican que la arquitectura cumple sus atributos de calidad en cada cambio. A diferencia de las tácticas arquitectónicas tradicionales (que son decisiones de diseño puntuales), las fitness functions son **ejecutables y continuas**: se integran en el pipeline de CI/CD y fallan el build si se detecta una violación arquitectónica. Ejemplos: ArchUnit verificando que no haya dependencias circulares entre paquetes, tests de performance que fallan si la latencia p95 supera 200ms, o verificadores de convenciones de nombres.

**Por qué**: El concepto de "arquitectura evolutiva" de Ford et al. sostiene que en entornos ágiles, la arquitectura debe poder evolucionar guiada por constraints automatizados, no por revisiones manuales. Mientras las tácticas del SEI son prescriptivas ("usá heartbeat para disponibilidad"), las fitness functions son verificables y continuas, cerrando el loop de feedback arquitectónico. Esto extiende lo visto en clase sobre testabilidad y calidad: no basta con diseñar para un QA, hay que verificarlo automáticamente en cada commit.

---

### 3. [Investigar] ¿Cómo impacta Team Topologies (Matthew Skelton y Manuel Pais) en la arquitectura de software más allá de la Ley de Conway?

**Por qué**: Skelton y Pais demuestran que el tipo de interacción entre equipos determina el acoplamiento arquitectónico. Si dos Stream-Aligned Teams colaboran (collaboration mode), la interfaz entre sus bounded contexts será inestable y requerirá coordinación; si uno consume al otro como X-as-a-Service, la interfaz será un contrato estable con SLA. Esto complementa lo visto en clase sobre Conway's Law y comunicación entre servicios, pero añade la dimensión de **modos de interacción** como drivers arquitectónicos que los ADRs y el C4 Model no capturan por sí solos.

---

### 4. [Investigar] ¿Qué propone Gregor Hohpe con la metáfora del "Architect Elevator" y cómo cambia la forma de comunicar decisiones arquitectónicas a stakeholders?

**Respuesta**: En *The Software Architect Elevator* (2020), Gregor Hohpe propone que el arquitecto debe funcionar como un "ascensor" que viaja entre el piso de arriba (C-suite, negocio, estrategia) y el piso de abajo (desarrolladores, operaciones, tecnología), traduciendo en ambas direcciones sin quedarse atrapado en un solo piso. Esto implica que comunicar una decisión arquitectónica al CFO requiere hablar de ROI, riesgo y time-to-market, no de patrones de diseño, microservicios o CQRS. Hacia los desarrolladores, requiere traducir la estrategia de negocio en constraints arquitectónicos accionables.

**Por qué**: Hohpe sostiene que la mayoría de los arquitectos fallan en la comunicación vertical: o se vuelven "ivory tower architects" (desconectados de la implementación) o "tunel vision architects" (solo ven tecnología). Las herramientas de documentación como ADRs y C4 Model resuelven la comunicación horizontal (técnica-técnica), pero no la vertical (negocio-técnica). Esto conecta con lo visto en clase sobre stakeholders y el rol del arquitecto, pero agrega la dimensión de traducción bidireccional como competencia central, y propone herramientas como los "arc42" para documentación que abarque ambas audiencias.

---

### 5. [Conectar] La clase menciona que los ADRs documentan decisiones arquitectónicas. ¿Cómo se relaciona esto con el proceso de RFC (Request for Comments) que usan empresas como Spotify y cómo ambos se complementan?

**Respuesta**: Los ADRs (Michael Nygard) documentan el resultado de una decisión (contexto, decisión, consecuencias), mientras que el proceso RFC (inspirado en el IETF y adoptado por Spotify, Uber y otras) **abarca el proceso previo a la decisión**: alguien escribe un RFC con la propuesta, se somete a revisión por pares en un tiempo acotado, se incorpora feedback, y recién entonces se toma la decisión que se documenta como ADR. Son complementarios: RFC para el debate y construcción de consenso, ADR para el registro histórico de lo decidido.

**Por qué**: Phil Calçado y otros ingenieros de Spotify documentaron su proceso de RFC en su blog de ingeniería (2020). La diferencia fundamental es temporal: el ADR mira hacia atrás (¿qué decidimos?), el RFC mira hacia adelante (¿qué deberíamos decidir?). En la clase vimos el formato de ADR, pero no se cubrió el proceso previo de discusión y revisión. Un ADR sin RFC puede ser una decisión unilateral; un RFC sin ADR pierde trazabilidad. La combinación de ambos —propuesta como RFC, decisión como ADR— es el estándar emergente en equipos de plataforma y arquitectura distribuida.

---

### 6. [Conectar] La clase cubre los 6 atributos de calidad principales. ¿Cómo los amplía y estructura el estándar ISO/IEC 25010:2023 respecto a lo visto?

**Respuesta**: El estándar ISO/IEC 25010:2023 (evolución del ISO 9126) estructura los atributos de calidad en un modelo jerárquico con 8 características principales y subcaracterísticas medibles. Los 6 vistos en clase (disponibilidad, performance, seguridad, mantenibilidad, escalabilidad, testabilidad) cubren parte del modelo, pero ISO 25010 agrega: **Compatibilidad** (coexistencia, interoperabilidad), **Portabilidad** (adaptabilidad, instalabilidad, reemplazabilidad), y **Usabilidad** (reconocibilidad, aprendibilidad, operabilidad, protección contra errores de usuario). Además, "disponibilidad" en ISO 25010 es una subcaracterística de "Reliability" (junto con madurez, tolerancia a fallos y recuperabilidad), y "escalabilidad" no es una característica independiente sino parte de Performance Efficiency.

**Por qué**: El modelo ISO/IEC 25010 es el estándar internacional para evaluación de calidad de software. Lo visto en clase es un subconjunto práctico, pero en contextos de compliance (PCI-DSS, HIPAA, SOX) o contratos gubernamentales, los QAs suelen expresarse en términos ISO. Conocer el mapeo entre el framework pragmático de la clase y el estándar formal permite traducir requisitos de stakeholders regulatorios a decisiones arquitectónicas concretas.

---

### 7. [Conectar] En clase vimos que "toda decisión implica un trade-off". ¿Cómo ayuda el modelo Cynefin (Dave Snowden) a tomar decisiones arquitectónicas en diferentes contextos de complejidad?

**Respuesta**: El modelo Cynefin clasifica los problemas en cinco dominios: Clear (claro), Complicated (complicado), Complex (complejo), Chaotic (caótico) y Disorder (desorden). La clase asume implícitamente que las decisiones arquitectónicas están en el dominio Complicated (hay una respuesta correcta si se analiza suficiente), pero muchas decisiones modernas están en el dominio Complex: causa y efecto solo son visibles en retrospectiva, y la estrategia correcta es "probe-sense-respond" (experimentar, medir, ajustar). Para decisiones en dominio Clear, un ADR con trade-offs es suficiente; para Complex, necesitás spikes técnicos, canary releases y fitness functions.

**Por qué**: Dave Snowden desarrolló Cynefin en *Harvard Business Review* (2007). Aplicado a arquitectura: migrar de monolito a microservicios es Complex (no hay una respuesta correcta universal), mientras que elegir entre dos proveedores cloud con SLAs comparables es Complicated (se puede analizar y decidir). El modelo ayuda al arquitecto a elegir la estrategia de decisión: en Complex no buscás la respuesta óptima, buscás opciones seguras para fallar (safe-to-fail experiments). Esto extiende la noción de trade-offs de la clase con una dimensión de incertidumbre que los ADRs tradicionales no capturan.

---

### 8. [Cuestionar] ¿Es el rol del arquitecto de software obsoleto en equipos verdaderamente ágiles y autónomos? Contrastá la postura de Martin Fowler con la de Mary Poppendieck.

**Respuesta**: Martin Fowler defiende que el arquitecto evoluciona a un rol de "arquitecto guía" (no dictador) que establece constraints mínimos y deja que el diseño emerja. Mary Poppendieck, en *Lean Software Development*, va más lejos: argumenta que la arquitectura debe ser propiedad colectiva del equipo y que un rol formal de "arquitecto" crea cuellos de botella y desresponsabiliza al equipo. Sin embargo, Fowler responde en su bliki que "architecture is too important to be left to architects alone... but also too important to have no one thinking about it." La postura intermedia (el "arquitecto interno" de ThoughtWorks) es que el rol persiste como facilitador y guardián de fitness functions, pero no como tomador de decisiones en solitario.

**Por qué**: Este debate está vivo. En Spotify, el modelo de "arquitectura sin arquitectos" mediante Chapters y Guilds intenta distribuir la responsabilidad. En Amazon, el rol de "Principal Engineer" actúa como arquitecto distribuido. La evidencia de ThoughtWorks Tech Radar sugiere que el rol sobrevive pero muta: de "tomador de decisiones" a "diseñador de constraints y habilitador de equipos". La pregunta no es si el rol existe, sino si está concentrado o distribuido.

---

### 9. [Cuestionar] ¿El principio de la "Revisarltima Decisión Responsable" (Last Responsible Moment) es peligroso en sistemas críticos de seguridad (aviónica, dispositivos médicos)? Contrastá con la postura de Nancy Leveson.

**Respuesta**: Sí, es peligroso si se aplica indiscriminadamente. Nancy Leveson, en *Engineering a Safer World* (MIT Press, 2011), argumenta que en sistemas safety-critical, muchas decisiones arquitectónicas deben tomarse temprano porque son prerequisito de los análisis de seguridad (STPA/STAMP). Diferir la decisión de redundancia de hardware en un marcapasos hasta el "último momento responsable" puede significar que ya no hay tiempo para certificar el diseño con la FDA. El principio del Last Responsible Moment, originado en *Lean Software Development* de Poppendieck, asume que el costo de cambio es bajo —supuesto falso en sistemas con certificación regulatoria y hardware.

**Por qué**: El debate es contextual. Para un SaaS con deploy continuo, diferir es racional. Para un sistema con ISO 26262 (automotriz) o DO-178C (aviónica), diferir es negligencia. La clase no cubrió esta distinción de dominio, que es crítica: los arquitectos deben calibrar el principio según la criticidad del sistema. Capers Jones documentó que el costo de cambio crece exponencialmente en sistemas regulados, no linealmente como en software empresarial.

---

### 10. [Cuestionar] ¿Deberían los atributos de calidad ser definidos "top-down" por el arquitecto o emerger de los equipos? ¿Qué dice el manifiesto ágil y cómo lo rebate el SEI?

**Respuesta**: El Manifiesto Ágil valora "individuos e interacciones sobre procesos y herramientas" y "responder al cambio sobre seguir un plan", lo que sugiere que los QAs deberían emerger. El SEI (Software Engineering Institute), creador de ATAM, argumenta que los QAs críticos (seguridad, disponibilidad) no "emergen" —deben ser diseñados explícitamente porque no son visibles para el usuario hasta que fallan. La postura intermedia de Bass, Clements y Kazman en *Software Architecture in Practice* es: los QAs deben ser elicitados colaborativamente (arquitecto + stakeholders + equipo) pero verificados formalmente con escenarios de calidad y fitness functions.

**Por qué**: Este es un falso dilema. Los QAs no son "top-down" ni "bottom-up": son "outside-in". El usuario final define el QA (necesito que el sistema esté disponible 99.9%), el arquitecto traduce eso en tácticas (redundancia, circuit breaker) y el equipo implementa. El error es ambos extremos: arquitectos definiendo QAs sin consultar al negocio (sobre-ingeniería) o equipos ignorando QAs hasta que el sistema falla en producción (deuda técnica por omisión). La clase mencionó trade-offs pero no este debate sobre ownership de los QAs.

---

