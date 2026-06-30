---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el anti-patrón "Not Invented Here" (NIH) y cómo lleva a reinventar patrones GoF sin saberlo? ¿Qué relación tiene con la falta de cultura de patrones?

**Por qué**: El término NIH se originó en Bell Labs (1960s-70s) y fue popularizado por la comunidad ágil. Robert Glass documenta en "Facts and Fallacies of Software Engineering" (2002) que "reinventing the wheel" es uno de los errores más costosos en software. La cultura de patrones GoF es el antídoto: cuando decís "necesitamos Strategy para esto", el equipo sabe buscar `java.util.Comparator` o `Spring Security AuthenticationProvider` en lugar de implementarlo desde cero.

---

### 3. [Investigar] ¿Qué es el anti-patrón "Leaky Abstraction" (Joel Spolsky) y cómo patrones como Facade y Adapter pueden crear leaks cuando no se manejan correctamente?

**Respuesta**: **Leaky Abstraction** (Joel Spolsky, 2002) ocurre cuando una abstracción no logra ocultar completamente la complejidad subyacente, y los detalles del nivel inferior "filtran" a la capa superior. Relación con patrones: (1) **Facade que no abstrae completamente**: `JdbcTemplate` oculta `Connection`, `Statement`, `ResultSet`... pero `DataAccessException` filtra detalles de JDBC (`SQLException.getErrorCode()`). Si el código cliente necesita hacer `catch (DataAccessException e) { if (e.getCause() instanceof SQLException) { switch (((SQLException) e.getCause()).getErrorCode()) } }`, la abstracción falló, (2) **Adapter que no traduce completamente**: un `PayPalAdapter` que implementa `ProcesadorPagos` pero obliga al cliente a conocer el formato de `transactionId` de PayPal, (3) **ORM como leaky abstraction**: Hibernate promete "tratá la BD como objetos" pero filtra SQL (N+1 queries, lazy loading exceptions, flush order). Spolsky argumentó que TODAS las abstracciones son leaky en cierto grado; la clave es minimizar el leak.

**Por qué**: Joel Spolsky (Stack Overflow, Trello) escribió "The Law of Leaky Abstractions" en 2002: "All non-trivial abstractions, to some degree, are leaky." Es una crítica a la creencia de que los patrones pueden encapsular COMPLETAMENTE la complejidad. GoF Facade (p. 185) asume que el subsistema es opaco al cliente; en la práctica, leaks como timeouts, latencia de red, y códigos de error específicos del subsistema siempre filtran. La respuesta madura: aceptá que la abstracción es leaky y proveé herramientas para manejar los leaks (retry policies, circuit breakers, logging estructurado).

---

### 4. [Investigar] ¿Qué son los "Code Smells" de Martin Fowler y Kent Beck, y cómo se relacionan con los anti-patrones de la clase? ¿Son los code smells anti-patrones de menor escala?

**Por qué**: Martin Fowler y Kent Beck definieron 22 code smells en "Refactoring: Improving the Design of Existing Code" (1ra ed. 1999, 2da ed. 2018 con ejemplos en JavaScript). La relación smells→patrones es explícita: "Replace Conditional with Polymorphism" (refactoring) introduce Strategy/State; "Introduce Parameter Object" introduce Builder; "Extract Class" previene God Class. SonarQube y herramientas de análisis estático detectan code smells automáticamente.

---

### 5. [Conectar] La clase presenta Golden Hammer como "usar el mismo patrón para todo". Conectá esto con el "Law of the Instrument" (Abraham Maslow): investigá el origen psicológico del Golden Hammer.

**Por qué**: Abraham Maslow (psicólogo, creador de la pirámide de necesidades) escribió "The Psychology of Science" (1966) donde acuñó la frase. En software, Andrew Hunt y David Thomas popularizaron la conexión en "The Pragmatic Programmer" (1999) bajo "Don't Be a Hammer." El antídoto: diversificar tu caja de herramientas (aprender múltiples paradigmas: OOP, FP, declarative, reactive) y evaluar herramientas por el problema, no al revés.

---

### 6. [Conectar] La clase lista Spaghetti Code como anti-patrón. Conectá esto con el concepto de "Cognitive Complexity" (SonarQube): ¿cómo se mide la complejidad cognitiva y cómo se relaciona con la aplicabilidad de patrones GoF?

**Por qué**: SonarQube (G. Ann Campbell, 2016) definió Cognitive Complexity como reemplazo de Cyclomatic Complexity (McCabe, 1976) para medir mantenibilidad. La métrica se integra en SonarQube, ESLint, y CodeClimate. Un método con cognitive complexity > 15 es "hard to understand" y candidato a refactoring con patrones.

---

### 7. [Conectar] La clase menciona Premature Abstraction. Conectá esto con la "Regla de Tres" (Rule of Three) de Martin Fowler y el principio YAGNI. ¿Cuándo es realmente el momento de abstraer?

**Respuesta**: La **Rule of Three** (Fowler/Beck) dice: "La primera vez que escribís algo, simplemente hacelo. La segunda vez que necesitás lo mismo, considera si es duplicación. La TERCERA vez, refactorizá para abstraer." Esto se conecta con YAGNI (Kent Beck): no construyas abstracciones para casos de uso que NO EXISTEN. El momento de abstraer es cuando: (1) la misma lógica aparece en 3+ lugares con la MISMA intención de negocio (no solo código similar por coincidencia), (2) anticipás que en los próximos 2-3 sprints aparecerá un CUARTO caso, (3) el código duplicado ya está causando problemas (bug corregido en un lugar pero no en la copia). NO abstraigas cuando: (a) solo hay 2 instancias — la duplicación es más barata que una mala abstracción, (b) no entendés completamente el dominio — abstracciones prematuras basadas en suposiciones incorrectas son peores que código duplicado, (c) la abstracción requeriría modificar código que "funciona y no se toca". Sandi Metz: "Prefer duplication over the wrong abstraction."

**Por qué**: Martin Fowler discute la Rule of Three en "Refactoring" (2018). Kent Beck acuñó YAGNI en Extreme Programming (1999). Sandi Metz escribió "The Wrong Abstraction" (2016) argumentando que una mala abstracción es más costosa que código duplicado. La regla moderna: "Make it work, then make it right, then make it generic." La genericidad es el RevisarLTIMO paso, no el primero.

---

### 8. [Cuestionar] ¿Es el anti-patrón "Singleton Mal Usado" el más dañino en la historia del software Java? Evaluá su impacto en testing, concurrencia y arquitectura.

**Por qué**: Miško Hevery (Google, Angular) llama a Singleton "the most overused and abused pattern in Java." Martin Fowler dice que Singleton es "a pattern with a very dark side." La transición de "Singleton manual" a "DI con scope singleton" es una de las mayores mejoras de calidad en la historia de Java enterprise.

---

### 9. [Cuestionar] ¿Es el "Clean Code" (Robert Martin) un conjunto de principios o un nuevo dogma que genera su propio anti-patrón de "Code Puritanism"?

**Respuesta**: Clean Code es un **conjunto de heurísticas valiosas que se convierte en dogma cuando se aplica sin contexto**. El anti-patrón **Code Puritanism** ocurre cuando: (1) se fuerza que cada método tenga < 5 líneas (creando "ravioli code" — miles de micro-métodos inentendibles), (2) se extraen clases para cada `if` simple porque "SRP dice que cada clase debe tener una razón para cambiar" (resultado: 300 clases para una app de 2000 líneas), (3) se evita cualquier comentario porque "el código debe auto-documentarse" — dejando algoritmos complejos sin explicación, (4) se rechaza `switch` incluso cuando modela 3 estados fijos (forzando Strategy donde es overkill). Robert Martin mismo ha dicho: "These are rules, not laws. There are exceptions." El Clean Code original (2008) enfatiza el juicio profesional; la comunidad a veces lo convierte en checklist dogmático. La regla: aplicá Clean Code como principios, no como métricas de calidad absolutas.

**Por qué**: Robert Martin escribió "Clean Code" (2008) con heurísticas como "keep functions small" y "don't repeat yourself." John Ousterhout ("A Philosophy of Software Design", 2018) critica el dogma de "small methods" argumentando que las abstracciones profundas importan más que los métodos cortos. Casey Muratori ("Clean Code, Horrible Performance", 2023) criticó el impacto de performance de Clean Code mal aplicado.

---

### 10. [Cuestionar] ¿Es posible eliminar completamente los anti-patrones de un proyecto, o son inevitables? ¿Cuál es el rol de la deuda técnica en esta discusión?

**Respuesta**: Los anti-patrones son **inevitables pero gestionables**. Argumentos: (1) **Evolución del dominio**: cuando empezaste, `UsuarioService` con 5 métodos era SRP; dos años después, el dominio creció y `UsuarioService` tiene 30 métodos (God Class) — no fue un error inicial, fue evolución. (2) **Presión de negocio**: el deadline forzó un `switch` gigante en lugar de Strategy para los descuentos, con la intención de refactorizar después (deuda técnica consciente). (3) **Aprendizaje del equipo**: un junior implementó Singleton porque era el único patrón que conocía (Golden Hammer). La cuestión no es ELIMINAR anti-patrones, sino: (a) identificarlos temprano (code reviews, análisis estático), (b) gestionar la deuda técnica (backlog de refactors, "boy scout rule" — dejar el código mejor que lo encontraste), (c) refactorizar ANTES de que la deuda técnica se vuelva impagable. La deuda técnica es como la deuda financiera: un poco es necesario para avanzar rápido; demasiada te lleva a la bancarrota. El objetivo no es "cero anti-patrones" sino "deuda técnica bajo control con plan de pago."

**Por qué**: Ward Cunningham acuñó "technical debt" (1992) precisamente para describir que escribir código sin entender completamente el dominio genera deuda que debe pagarse. Martin Fowler en "Technical Debt Quadrant" (2009) distingue entre deuda prudente (consciente, con plan) y deuda imprudente (inconsciente). Los anti-patrones son deuda imprudente no gestionada. La meta es mover los anti-patrones al cuadrante de "deuda consciente con plan de pago."

