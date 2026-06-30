---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el "Technology Radar" de ThoughtWorks en profundidad y cómo implementaron Neal Ford y Rebecca Parsons el concepto de "Blip" para evaluar tecnologías emergentes?

**Por qué**: La clase presentó Tech Radar como 4 categorías estáticas, pero su valor real es el tracking dinámico de tendencias. ThoughtWorks publica la metodología en thoughtworks.com/radar. Para E-Commerce Platform, un radar interno tracking el movimiento de tecnologías (Spring Boot → Adopt estable, WebFlux → Trial en ascenso) ayudaría a anticipar cuándo migrar.

---

### 3. [Investigar] ¿Qué es "Team Topologies" aplicado a gobierno de arquitectura y cómo Matthew Skelton propone la "Platform Team" como mecanismo de gobernanza sin burocracia?

**Respuesta**: Matthew Skelton y Manuel Pais, en *Team Topologies* (2019), proponen que la gobernanza arquitectónica no debe ser un comité (ARB) sino una **Platform Team** que construye y mantiene una Internal Developer Platform (IDP). La plataforma impone restricciones arquitectónicas de forma habilitante, no restrictiva: en lugar de que el ARB diga "no uses NoSQL", la plataforma provee PostgreSQL como servicio gestionado con APIs simples, y si un equipo quiere MongoDB, la plataforma evalúa si incorporarlo como opción soportada. La gobernanza se ejerce a través de "paved roads" (caminos pavimentados): la plataforma hace que la opción correcta sea la más fácil, y si un equipo elige desviarse, asume el costo operacional.

**Por qué**: Skelton y Pais revolucionaron el concepto de gobernanza al cambiar de "prohibir" a "habilitar." La clase presentó ARB como mecanismo de revisión, pero Team Topologies propone que la plataforma sea el mecanismo de gobernanza. Netflix y Spotify implementan esto: sus plataformas internas no prohíben, pero hacen que el "golden path" sea trivial, y salirse requiere justificación.

---

### 4. [Investigar] ¿Qué es el estándar ISO/IEC/IEEE 42010:2022 ("Architecture Description") y cómo formaliza conceptos que la clase trata informalmente?

**Respuesta**: ISO/IEC/IEEE 42010:2022 (reemplazando la versión 2011) es el estándar internacional para descripción de arquitectura. Formaliza conceptos que la clase usa informalmente: define "Architecture Viewpoint" (convenciones para construir una vista), "Architecture View" (vista de una arquitectura desde un viewpoint), "Architecture Model" (representación de aspectos de la arquitectura), "Stakeholder" (parte interesada con concerns), "Concern" (interés en el sistema), y "Architecture Rationale" (justificación de decisiones). La relación con el C4: C4 Nivel 1 es un viewpoint de Contexto; Nivel 2 es un viewpoint de Container; etc. ISO 42010 no prescribe qué viewpoints usar, pero requiere que se declaren explícitamente y se vinculen a stakeholders y concerns.

**Por qué**: La clase presentó conceptos como stakeholder, vista y diagrama sin citar el estándar internacional que los formaliza. En contextos de compliance (defensa, aeroespacial, gobierno), la conformidad con ISO 42010 puede ser un requisito contractual. Para el proyecto final, estructurar la documentación según ISO 42010 sería un diferenciador de calidad profesional.

---

### 5. [Conectar] La clase presenta TOGAF ADM como ciclo de arquitectura empresarial. ¿Cómo se relaciona TOGAF con el "Architecture Repository" y el "Enterprise Continuum" que son esenciales para reutilización?

**Respuesta**: TOGAF define el **Architecture Repository** como un repositorio centralizado de artefactos arquitectónicos reutilizables: Architecture Metamodel, Architecture Capability, Architecture Landscape, Standards Information Base (SIB), Reference Library, y Governance Log. El **Enterprise Continuum** es un modelo conceptual que va desde arquitecturas genéricas (Foundation Architectures) a específicas (Organization-Specific Architectures). La relación con la clase: cuando escribís un ADR sobre PostgreSQL, debería referenciar el SIB (Standards Information Base) que dice "PostgreSQL es la base de datos estándar aprobada." Cuando diseñás un bounded context, debería existir en el Architecture Landscape junto con los demás. Sin repositorio, cada proyecto reinventa decisiones.

**Por qué**: La clase presentó ADM como ciclo y Tech Radar como herramienta, pero no los conectó con repositorio y continuo. El valor real de TOGAF no es el ciclo ADM —es la infraestructura de reutilización (Repository + Continuum) que evita que cada equipo tome decisiones inconsistentes.

---

### 6. [Conectar] La clase cubre Tech Radar con 4 categorías. ¿Cómo se relaciona con el "Hype Cycle" de Gartner y por qué ThoughtWorks rechaza explícitamente el Hype Cycle como herramienta?

**Respuesta**: Gartner Hype Cycle mapea tecnologías según visibilidad mediática y expectativas en 5 fases: Innovation Trigger, Peak of Inflated Expectations, Trough of Disillusionment, Slope of Enlightenment, Plateau of Productivity. ThoughtWorks rechaza el Hype Cycle como herramienta de decisión arquitectónica porque: (1) está basado en percepción de mercado y hype, no en experiencia de uso real en proyectos, (2) no distingue entre tecnología prometedora y tecnología lista para producción, y (3) tiene un sesgo hacia tecnologías con marketing ruidoso sobre tecnologías sólidas pero menos visibles. El Tech Radar se basa en experiencia real de los consultores de ThoughtWorks en proyectos con clientes, no en percepción de mercado.

**Por qué**: Neal Ford y Rebecca Parsons han explicado esta diferencia en charlas y en la metodología del Radar. La clase no mencionó el Hype Cycle, pero es importante entender por qué el Tech Radar es superior para decisiones arquitectónicas: evalúa tecnologías en contexto de uso real, no en abstracto.

---

### 7. [Conectar] La clase describe roles de arquitecto (Solución, Enterprise, Técnico, Dominio). ¿Cómo se alinea esto con el "Architect Skills Framework" de Gregor Hohpe y el perfil "T-shaped" que propone?

**Respuesta**: Gregor Hohpe, en *The Software Architect Elevator* y en charlas, propone que el arquitecto moderno debe ser **T-shaped**: profundidad en una o dos áreas técnicas (la barra vertical de la T) y amplitud en múltiples disciplinas —negocio, operaciones, seguridad, datos, comunicación— (la barra horizontal). Hohpe critica la especialización extrema (arquitecto que solo hace TOGAF, o solo hace DDD, o solo hace infraestructura) porque la arquitectura real requiere conectar todas las capas. El framework de habilidades de Hohpe incluye: Technology, Business Strategy, Communication, Organizational Dynamics, y Systems Thinking. Los roles de la clase (Solución, Enterprise) son "especializaciones" que Hohpe considera insuficientes sin la visión sistémica.

**Por qué**: Hohpe enfatiza que el mayor riesgo en arquitectura no es técnico —es la desconexión entre negocio y tecnología. El arquitecto que solo sabe de microservicios pero no entiende el P&L de la empresa, toma decisiones que no sobreviven el primer trimestre. La clase presentó roles especializados, pero Hohpe argumenta que el "arquitecto de solución" moderno debe tener la amplitud del "arquitecto de negocio."

---

### 8. [Cuestionar] ¿Es TOGAF irrelevante en la era de DevOps y microservicios? La crítica de que TOGAF es "waterfall architecture" en un mundo ágil.

**Por qué**: La clase presentó TOGAF como framework de referencia sin discutir su relevancia actual. La realidad: TOGAF sigue siendo relevante en gobierno, defensa y banca tradicional; es irrelevante en startups y empresas nativas digitales. Muchos arquitectos obtienen certificación TOGAF por su valor curricular pero no lo aplican en su trabajo diario.

---

### 9. [Cuestionar] ¿Debe el Architecture Review Board (ARB) tener autoridad de veto o solo poder consultivo? El debate entre gobernanza fuerte y autonomía de equipos.

**Respuesta**: En gobernanza fuerte (modelo tradicional, banca, gobierno), el ARB tiene poder de veto: nadie deploya a producción sin aprobación del ARB. Esto garantiza consistencia pero crea cuellos de botella y desalienta innovación. En gobernanza consultiva (modelo ágil, Spotify, Netflix), el ARB (o Guild) recomienda y documenta, pero los equipos toman la decisión final —si un equipo decide desviarse, lo documenta en un ADR justificando el trade-off. La evidencia de ThoughtWorks y DevOps Research (DORA, State of DevOps) muestra que los equipos con más autonomía tienen mejor desempeño. Pero en sistemas críticos (PCI-DSS, HIPAA), la gobernanza fuerte puede ser un requisito regulatorio.

**Por qué**: La clase presentó ARB como comité que "revisa y aprueba," sin discutir el espectro de autoridad. La decisión correcta depende del contexto: en una fintech, el ARB probablemente necesita poder de veto para decisiones de seguridad; en una startup de e-commerce, el ARB debería ser consultivo.

---

### 10. [Cuestionar] ¿La estandarización tecnológica (un solo lenguaje, un solo framework) es disciplina o rigidez que frena la innovación? El debate heterogeneidad controlada.

**Respuesta**: La estandarización estricta (solo Java + Spring Boot) reduce complejidad operacional, facilita el movimiento de desarrolladores entre equipos y simplifica el tooling. La heterogeneidad controlada (el equipo elige dentro de un conjunto aprobado) permite innovación y adecuación al problema. El debate: Netflix (que estandariza fuertemente) vs Amazon (que permite heterogeneidad). La evidencia de DORA (Accelerate State of DevOps, 2023) muestra que no hay correlación directa entre estandarización y desempeño; lo que importa es que el equipo tenga autonomía sobre sus herramientas dentro de constraints claros. La postura pragmática: estandarizar lo que no aporta diferenciación (CI/CD, logging, seguridad) y permitir elección en lo que sí (lenguaje de dominio específico, base de datos).

**Por qué**: La clase presentó estandarización como buena práctica, pero la investigación moderna (Nicole Forsgren, Jez Humble, Gene Kim en *Accelerate*) muestra que la autonomía de herramientas es un predictor de desempeño. La clave es el balance: constraints en cross-cutting concerns; libertad en el dominio.

---

