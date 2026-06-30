---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es "arc42" y cómo complementa al C4 Model para documentación arquitectónica completa según Gernot Starke?

**Respuesta**: arc42, creado por Gernot Starke y Peter Hruschka, es una plantilla de documentación arquitectónica open source que structure la documentación en 12 secciones estandarizadas: (1) Introduction and Goals, (2) Constraints, (3) Context and Scope, (4) Solution Strategy, (5) Building Block View, (6) Runtime View, (7) Deployment View, (8) Cross-cutting Concepts, (9) Architectural Decisions, (10) Quality Requirements, (11) Risks and Technical Debt, y (12) Glossary. A diferencia del C4 Model (que es solo diagramas), arc42 es una plantilla completa de documento que incluye diagramas C4 como parte de sus secciones pero agrega lo que los diagramas no capturan: restricciones, riesgos, calidad, deuda técnica y glosario.

**Por qué**: Starke y Hruschka publicaron arc42 como alternativa a documentación ad-hoc. La clase presentó el C4 Model y ADRs como herramientas separadas, pero arc42 las integra en un framework coherente. arc42 + C4 + ADRs es la combinación que usan arquitectos en Alemania y Europa (donde arc42 es muy popular). Para el proyecto final de E-Commerce Platform, arc42 sería la plantilla ideal para el documento maestro.

---

### 3. [Investigar] ¿Qué son las "Architecture Katas" (Ted Neward) y cómo se usan para practicar documentación arquitectónica con C4 y ADRs?

**Respuesta**: Ted Neward creó las "Architecture Katas" como ejercicios de práctica deliberada para arquitectos, inspirado en los coding katas. Un Architecture Kata consiste en: (1) se presenta un problema de arquitectura con requisitos funcionales y QAs, (2) equipos de 3-5 personas diseñan la arquitectura en 45-90 minutos, (3) dibujan diagramas (usualmente C4) y escriben ADRs, y (4) presentan y reciben feedback. Neal Ford popularizó el formato en sus talleres y en *Fundamentals of Software Architecture*. La práctica con katas entrena la habilidad de producir documentación arquitectónica bajo presión (como en una entrevista técnica real).

**Por qué**: La clase enseña a documentar, pero no cómo practicar documentación. Las katas son la metodología estándar de la industria para entrenar arquitectos. Neward mantiene un repositorio de katas en architecturalkatas.com y Neal Ford las usa en O'Reilly Architecture Kata events. Para prepararse para la entrevista del Módulo 15, practicar katas con C4 + ADRs en 45 minutos es más efectivo que leer pasivamente.

---

### 4. [Investigar] ¿Qué es "Docs as Code" más allá de markdown en Git? Las prácticas de Write the Docs y cómo Anne Gentle propone documentación arquitectónica viva.

**Respuesta**: Anne Gentle, en *Docs Like Code* (2017), propone que la documentación debe tratarse con las mismas prácticas que el código: versionado en Git, code review de cambios de documentación, CI/CD que valide links y formato, tests de documentación (ej: snippets de código que se ejecutan para verificar que funcionan), y publicación automática. Para arquitectura, esto significa: (1) diagramas C4 generados desde DSL (structurizr DSL) que se validan en CI, (2) ADRs en markdown que se renderizan a un sitio estático con Hugo/MkDocs, (3) "living documentation" que se actualiza en cada PR (si cambiás un puerto en el código, el diagrama se regenera), y (4) métricas de documentación (docs coverage, docs freshness).

**Por qué**: La clase presentó documentación viva como concepto, pero no las prácticas concretas. La comunidad Write the Docs (writethedocs.org) tiene guías extensas. La diferencia práctica: en un proyecto con Docs as Code, si un ADR no se actualiza en 6 meses, el CI genera una alerta; si un diagrama C4 referencia una clase que ya no existe, el build falla. Esto cierra la brecha entre "documentar" y "mantener documentación."

---

### 5. [Conectar] La clase presenta C4 Model con 4 niveles. ¿Cómo se relaciona esto con UML y cuándo Simon Brown recomienda usar UML en lugar de C4?

**Respuesta**: Simon Brown es explícito: C4 no reemplaza UML —C4 es para **comunicar arquitectura**, UML es para **especificar diseño**. Brown recomienda usar C4 para los niveles 1-3 (Context, Container, Component) porque son comprensibles para audiencias mixtas. UML (diagramas de clases, secuencia) debe reservarse para el Nivel 4 (Code) y solo cuando sea necesario, no por defecto. La razón: un diagrama de clases UML con 50 clases es ilegible para un stakeholder de negocio; un diagrama C4 de containers es comprensible para todos. El error común es usar UML cuando C4 es más apropiado, o viceversa.

**Por qué**: Brown discute esto en su libro y en charlas. La clase presentó C4 y UML como herramientas separadas sin reglas de cuándo usar cada una. La regla de Brown: C4 para "qué" y "por qué" (comunicación); UML para "cómo" (implementación). Para el proyecto final, C4 niveles 1-3 son obligatorios; UML de clases solo para el aggregate de Pedidos si es necesario detallar la estructura interna del dominio.

---

### 6. [Conectar] La clase presenta Structurizr DSL como herramienta C4 as Code. ¿Cómo se compara con "LikeC4" y "C4-PlantUML" y cuál es la recomendación actual de la comunidad?

**Respuesta**: **Structurizr DSL** (Simon Brown): DSL propietario con sintaxis específica para C4, renderizado profesional, soporte para múltiples vistas, pero requiere licencia para features avanzadas. **C4-PlantUML** (Ricardo Niepel): extensión de PlantUML con macros para C4, open source, integrable en markdown, pero con renderizado menos pulido que Structurizr. **LikeC4** (Denis Sinyukov): DSL open source inspirado en Structurizr pero con sintaxis más simple, validación estática, y generación de diagramas interactivos. La comunidad favorece C4-PlantUML para documentación en repositorio (porque PlantUML ya es ubicuo) y Structurizr para documentación oficial o stakeholder-facing. LikeC4 está ganando tracción como alternativa open source a Structurizr.

**Por qué**: La clase presentó solo Structurizr, pero en la práctica muchos equipos usan C4-PlantUML por ser gratuito y ya conocido. La decisión: si tu organización ya usa PlantUML, C4-PlantUML es la opción más simple; si necesitás vistas interactivas para stakeholders no técnicos, Structurizr o LikeC4 son mejores.

---

### 7. [Conectar] La clase aborda ADRs de Michael Nygard. ¿Cómo ha evolucionado el formato ADR con las extensiones de Joel Parker Henderson ("ADR Tools") y el concepto de "Decision Log"?

**Respuesta**: Joel Parker Henderson creó "ADR Tools" (adr-tools en GitHub), una suite de línea de comandos para gestionar ADRs: `adr new "Usar PostgreSQL"`, `adr link 3 5` (relaciona ADRs), `adr supersede 2 4` (marca ADR-2 como reemplazado por ADR-4), `adr generate toc` (tabla de contenido automática). Además, Henderson introdujo el "Decision Log" como una vista cronológica de todas las decisiones (no solo las vigentes), incluyendo las deprecadas. Las extensiones pragmáticas incluyen campos adicionales: "Drivers" (fuerzas que motivaron la decisión), "Assumptions" (supuestos en los que se basó), y "Related Decisions" (ADR-003 se relaciona con ADR-001).

**Por qué**: La clase presentó ADRs con formato Nygard estático. Henderson y la comunidad "adr" en GitHub (github.com/joelparkerhenderson) evolucionaron el formato para la práctica diaria. La herramienta `adr-tools` convierte ADRs de documentos aislados a un grafo navegable de decisiones, lo que responde preguntas como "¿por qué estamos usando MongoDB si antes usábamos PostgreSQL?" (siguiendo la cadena de ADRs superseded).

---

### 8. [Cuestionar] ¿Vale la pena documentar la arquitectura si el código es la fuente de verdad? El debate entre "self-documenting code" y documentación arquitectónica explícita.

**Respuesta**: La escuela de "self-documenting code" (Robert C. Martin en *Clean Code*, Ward Cunningham) argumenta que el código bien escrito con nombres significativos y tests es la mejor documentación porque es la única que no se desincroniza. La escuela de documentación explícita (Simon Brown, Gernot Starke) responde que el código no responde preguntas arquitectónicas como "¿por qué elegimos Kafka?", "¿cómo se comunican los bounded contexts?", "¿cuál es el plan de migración de la deuda técnica?" El código muestra el "cómo" (implementación), la documentación arquitectónica captura el "qué" (estructura) y el "por qué" (decisiones). Ambas posturas son complementarias: el código documenta la implementación, los diagramas y ADRs documentan las decisiones y la estructura.

**Por qué**: Esta controversia aparece en cada discusión sobre documentación. El mismo Uncle Bob que defiende clean code defiende Screaming Architecture (la estructura del código debe comunicar el dominio). Simon Brown responde que incluso el código más limpio no revela los trade-offs que llevaron a esa estructura. La postura sensata: documentar decisiones (ADRs) y estructura (diagramas C4), no implementación (eso es el código).

---

### 9. [Cuestionar] ¿Deberían los diagramas C4 ser generados automáticamente desde el código o dibujados manualmente? La brecha entre "runtime reality" y "design intent."

**Respuesta**: Los diagramas generados automáticamente (ej: desde código con herramientas como ArchiMate o análisis estático) reflejan la "runtime reality" —lo que el sistema realmente es. Los diagramas dibujados manualmente (Structurizr, PlantUML) reflejan "design intent" —lo que el arquitecto pretende que el sistema sea. Simon Brown argumenta que ambos son necesarios: los automáticos para auditing y detección de drift arquitectónico; los manuales para comunicación y diseño. La brecha entre ambos es deuda de documentación. Si el diagrama manual muestra 3 servicios pero el automático detecta 7, hay un problema de diseño (no se siguió la arquitectura) o de documentación (la arquitectura cambió y el diagrama no se actualizó).

**Por qué**: Brown y la comunidad de "architecture as code" debaten esto. Herramientas como ArchiUnit verifican que el código cumpla el diseño, cerrando la brecha. La tendencia es: diagramas manuales como documentación de diseño; herramientas automáticas como verificación de cumplimiento. La clase no abordó cómo verificar que lo documentado coincida con lo implementado.

---

### 10. [Cuestionar] ¿Son los ADRs una carga burocrática que frena la velocidad en startups? La tensión entre "move fast" y "document decisions."

**Respuesta**: En startups con 5 desarrolladores, escribir un ADR por cada decisión técnica puede sentirse como burocracia que frena la velocidad. La defensa de Michael Nygard y la comunidad ADR: los ADRs no son para el presente —son para el futuro. Cuando la startup crece a 50 desarrolladores en 18 meses, los ADRs permiten que los nuevos entiendan por qué las cosas son como son sin molestar a los fundadores. La propuesta pragmática: ADR "ultra-light" en startups (título + decisión en 1 párrafo, sin contexto ni consecuencias) que se expande cuando el equipo crece. Lo crítico es capturar el "por qué" antes de que el contexto se pierda.

**Por qué**: Phil Calçado y otros arquitectos en startups han escrito sobre esto. La experiencia muestra que las startups que no documentan decisiones repiten los mismos errores cuando el equipo crece. La recomendación de ThoughtWorks Tech Radar: ADRs son "Adopt" para todo proyecto con expectativa de vida >1 año, independientemente del tamaño. El formato puede ser más liviano, pero el hábito de documentar decisiones debe estar desde el día 1.

---

