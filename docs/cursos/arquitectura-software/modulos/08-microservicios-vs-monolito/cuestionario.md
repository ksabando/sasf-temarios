---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el "Modular Monolith" con Spring Modulith y cómo esta herramienta formaliza la disciplina arquitectónica que previene el Big Ball of Mud?

**Respuesta**: Spring Modulith, liderado por Oliver Drotbohm (ex-Spring Data), es un proyecto oficial de Spring que permite definir módulos explícitos dentro de un monolito Spring Boot: cada módulo tiene su propio paquete raíz y expone una API pública a través de interfaces y eventos de aplicación. Spring Modulith valida en tiempo de build que: (1) no haya dependencias cíclicas entre módulos, (2) ningún módulo acceda a clases internas de otro módulo, y (3) los módulos puedan ser probados de forma aislada. Además, soporta documentación automática de módulos y testing de integración por módulo usando `@ApplicationModuleTest`. Esto lleva el Modular Monolith de "concepto" a "herramienta verificable."

**Por qué**: La clase mencionó Modular Monolith como concepto, pero no Spring Modulith como herramienta. Drotbohm presentó el proyecto en Spring I/O 2023 y es la implementación de referencia para el patrón. La novedad es el enforcement automatizado: no dependés de code reviews para mantener la disciplina, el build falla si alguien rompe la encapsulación de un módulo.

---

### 3. [Investigar] ¿Qué propone Sam Newman en la 2ª edición de *Building Microservices* sobre "Right-Sizing Microservices" y cómo sugiere usar la métrica de "Cognitive Load" de Team Topologies?

**Respuesta**: Sam Newman, en la 2ª edición (2021), abandona la búsqueda de un "tamaño ideal" de microservicio y adopta el concepto de "cognitive load" (carga cognitiva) de Matthew Skelton y Manuel Pais (Team Topologies). El criterio no es líneas de código ni número de endpoints, sino: ¿puede un equipo entender completamente el servicio —su dominio, su código, su infraestructura, sus dependencias, sus riesgos— sin sobrecarga cognitiva? Si un equipo tiene 5 personas y el servicio requiere entender 3 bounded contexts, 2 bases de datos y 4 integraciones externas, la carga cognitiva es excesiva. Newman sugiere que el servicio debe alinearse con un bounded context que un equipo de 3-8 personas pueda abarcar cognitivamente.

**Por qué**: La clase citó el criterio de "suficientemente pequeño para un equipo, suficientemente grande para tener sentido," pero Newman lo refinó en la 2ª edición usando ciencia cognitiva. La métrica de Team Topologies es más operacional: "¿el equipo puede explicar el comportamiento completo del servicio en 30 minutos?" Si no, el servicio es demasiado grande (o el equipo no tiene suficiente expertise).

---

### 4. [Investigar] ¿Qué es la "Dark Launching" y "Shadow Traffic" como estrategia de migración de monólogo a microservicios que extiende el Strangler Fig?

**Respuesta**: Dark Launching (o Shadow Deployment) es una técnica donde el nuevo microservicio se despliega en producción y recibe tráfico "sombra" (una copia del tráfico real) sin que sus respuestas lleguen al usuario. Esto permite validar performance, corrección y comportamiento bajo carga real sin riesgo. Una vez que el shadow traffic muestra que el nuevo servicio se comporta correctamente (respuestas coinciden con el monólogo en >99.9% de casos), se activa el tráfico real gradualmente. Esta estrategia extiende el Strangler Fig reduciendo el riesgo de la fase de redirección: no pasás del 0% al 1% sin saber si el servicio funciona; primero lo probás con tráfico sombra al 100%.

**Por qué**: Técnicas documentadas por organizaciones como Google (en su libro *Site Reliability Engineering*), Netflix y Amazon. La clase presentó Strangler Fig como redirección directa, pero Dark Launching es una mejora de seguridad para migraciones de alto riesgo. Requiere infraestructura (duplicación de tráfico en el proxy) y métricas de comparación, pero elimina el "big bang" incluso a nivel de feature individual.

---

### 5. [Conectar] La clase menciona el "Strangler Fig Pattern" para migración. ¿Cómo se relaciona esto con el patrón "Asset Capture" de Michael Feathers en *Working Effectively with Legacy Code*?

**Respuesta**: Michael Feathers describe "Asset Capture" como técnica para extraer una responsabilidad de un sistema legacy encapsulándola detrás de una interfaz antes de moverla a un nuevo sistema. Es el paso previo al Strangler Fig: antes de extraer el módulo de Pagos del monolito, "capturás" el asset (la lógica de pagos) detrás de una interfaz dentro del monolito, refactorizás el resto del monolito para usar esa interfaz en lugar de llamar directamente a la implementación, y recién entonces extraés la implementación a un microservicio. Feathers insiste en que separar la interfaz de la implementación es el 80% del trabajo de migración; el 20% restante es el deploy independiente.

---

### 6. [Conectar] La clase cubre la descomposición por capacidad de negocio y bounded context. ¿Cómo se relaciona esto con el "Business Capability Modeling" de TOGAF y qué agrega al enfoque de DDD?

**Respuesta**: TOGAF define "Business Capability Modeling" como técnica para identificar qué hace la organización (capacidades) independientemente de cómo lo hace (procesos, sistemas). Una capacidad de negocio es un concepto estable que cambia mucho menos que la tecnología o los procesos. La convergencia con DDD: un bounded context bien definido debería alinearse con una capacidad de negocio de TOGAF. La diferencia: DDD descubre bounded contexts desde el dominio y el lenguaje; TOGAF descubre capacidades desde la estrategia y la organización. Usar ambos produce una descomposición más robusta que usar solo uno.

**Por qué**: La clase usó DDD para justificar la descomposición, pero no mencionó TOGAF. En organizaciones grandes con prácticas de arquitectura empresarial, las capacidades de negocio ya están modeladas por EA, y los bounded contexts de DDD deberían mapearse a ellas para alinear la arquitectura técnica con la empresarial. Esta conexión falta en el material de clase.

---

### 7. [Conectar] La clase presenta Conway's Law y el Inverse Conway Maneuver. ¿Cómo se relaciona esto con el concepto de "Fracture Planes" de Randy Shoup (ex-eBay, ex-Google) para migraciones de monólogo?

**Respuesta**: Randy Shoup introdujo el concepto de "Fracture Planes" en su charla *"Scaling Organizations and Systems"*: son los puntos naturales de división en un monolito donde la comunicación entre equipos es mínima. Identificar fracture planes implica analizar el grafo de dependencias del código y sobreponerlo con el grafo de comunicación organizacional: donde ambos tienen baja densidad, hay un fracture plane natural para extraer un microservicio. Shoup argumenta que forzar un bounded context donde la organización tiene alta comunicación es luchar contra Conway's Law; en cambio, identificar fracture planes es trabajar con Conway's Law.

**Por qué**: Shoup aplicó esto en eBay durante su migración de monólogo a microservicios. La clase presentó Conway's Law como teoría, pero Shoup la operacionaliza con una técnica concreta. Para E-Commerce Platform, analizar qué módulos tienen mínima comunicación entre equipos (fracture planes) produce candidatos a microservicios con mayor probabilidad de éxito que elegir bounded contexts solo por el modelo de dominio.

---

### 8. [Cuestionar] ¿"Microservicios son un antipatrón en equipos pequeños" es un dogma o hay evidencia? Contrastá la opinión de Sam Newman con la de quienes defienden "microservicios desde el día 1."

**Respuesta**: Sam Newman es tajante: "You almost certainly don't need microservices at the start." Su argumento es empírico: el overhead operacional supera los beneficios hasta que tenés 3+ equipos. Sin embargo, voces como Fred George (quien implementó microservicios con Amazon en los 2000s) y Chad Fowler argumentan que con herramientas modernas (serverless, managed services), el overhead de microservicios bajó drásticamente: si cada servicio es una Lambda + DynamoDB, la complejidad operacional es baja incluso para equipos pequeños. El contraargumento de Newman: el problema no es la infraestructura, es la complejidad cognitiva de razonar sobre 15 servicios distribuidos para una persona sola.

**Por qué**: La evidencia es mixta. Para una startup con AWS Lambda y DynamoDB, "microservicios" (funciones serverless) pueden ser más simples que un monolito con Spring Boot, Docker y CI/CD. Pero para un equipo que ya maneja Spring Boot, migrar a microservicios con Kubernetes es un salto de complejidad. La regla "equipo < 10 = monolito" es una heurística, no una ley, y depende de la madurez de la plataforma.

---

### 9. [Cuestionar] ¿La base de datos compartida en microservicios es siempre un antipatrón? ¿Qué dice Chris Richardson sobre el "Database per Service" como ideal asintótico?

**Respuesta**: Chris Richardson, en *Microservices Patterns*, defiende "Database per Service" como el estado ideal, pero reconoce que en la práctica, la migración desde una base de datos compartida es uno de los desafíos más difíciles. Richardson y otros arquitectos pragmáticos (como Sam Newman) aceptan que la base de datos compartida puede ser un paso intermedio temporal siempre que: (1) solo un servicio sea el "owner" de cada tabla (escribe), (2) otros servicios solo lean a través de APIs o eventos, no con SQL directo, y (3) haya un plan explícito y una fecha target para separar las bases de datos. La base compartida es un antipatrón como estado final, no como paso de migración.

**Por qué**: La clase presentó "base de datos por servicio" como principio, pero la realidad de las migraciones es más matizada. Martin Fowler también reconoce que "shared database integration is the simplest form of integration but comes with tight coupling." La clave es la direccionalidad: moverse hacia DB per Service; no quedarse en shared DB indefinidamente.

---

### 10. [Cuestionar] ¿Los microservicios están siendo reemplazados por monolitos modulares + serverless? La tesis de Kelsey Hightower sobre el "retorno al monolito."

**Respuesta**: Kelsey Hightower (Google Cloud) ha argumentado en conferencias que "the monolith is the perfect architecture for serverless —write it as one codebase, deploy it as a single function, let the platform handle scaling." La tesis es que los microservicios surgieron como solución a problemas de infraestructura (escalado, deploy) que las plataformas serverless resuelven mejor. Si Cloud Run escala tu contenedor a 1000 instancias sin que toques Kubernetes, ¿por qué partirlo en 20 servicios? La contra de Sam Newman: el problema de los microservicios no es (solo) infraestructura —es acoplamiento organizacional. Aunque uses serverless, si 10 equipos trabajan en el mismo código, tenés los mismos problemas de coordinación.

**Por qué**: Hightower toca un punto real: parte del overhead de microservicios es operacional, y serverless lo reduce. Pero el argumento organizacional de Newman sigue siendo válido. La tendencia emergente (2024-2026) parece ser "middle ground": 3-5 servicios serverless para bounded contexts claros, sin la granularidad extrema de los microservicios estilo Netflix 2010.

---

