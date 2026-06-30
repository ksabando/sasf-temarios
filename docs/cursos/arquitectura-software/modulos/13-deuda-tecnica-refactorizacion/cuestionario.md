---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el "Broken Window Theory" aplicado a deuda técnica por Andrew Hunt y David Thomas en *The Pragmatic Programmer*?

**Respuesta**: Andrew Hunt y David Thomas, en *The Pragmatic Programmer* (1999), aplicaron la "Broken Window Theory" (criminología) al software: si hay una "ventana rota" en el código (un hack, un nombre confuso, un test faltante) y no se arregla rápidamente, el equipo normaliza la baja calidad y aparecen más ventanas rotas. La teoría predice que la deuda técnica no crece linealmente —crece **exponencialmente** porque cada ventana rota reduce la barrera psicológica para crear más deuda. La implicación: no se puede postergar indefinidamente el pago de deuda "pequeña" porque la acumulación es exponencial, no lineal.

**Por qué**: La clase presentó la deuda con la metáfora financiera (interés), pero la "Broken Window Theory" agrega una dimensión psicológica y cultural que el modelo financiero no captura. Hunt y Thomas recomiendan: "Don't live with broken windows" —si ves una, arreglala inmediatamente. Para equipos arquitectónicos, esto implica que la Boy Scout Rule es una estrategia de prevención de crecimiento exponencial, no solo una buena práctica.

---

### 3. [Investigar] ¿Qué es el patrón "Branch by Abstraction" (Paul Hammant) como alternativa al Strangler Fig para refactorización arquitectónica sin feature flags?

**Respuesta**: Paul Hammant documentó "Branch by Abstraction" como técnica para hacer cambios arquitectónicos grandes en el trunk (sin branches de larga duración). El proceso: (1) introducir una abstracción (interfaz) que encapsula la funcionalidad a cambiar, (2) mover el código legacy detrás de la abstracción (sin cambiar comportamiento), (3) implementar la nueva solución detrás de la misma abstracción, (4) usar configuración (no feature flags) para elegir cuál implementación usar, y (5) una vez validada, eliminar la implementación legacy y la abstracción. A diferencia de Strangler Fig (que reemplaza sistemas completos), Branch by Abstraction es para refactorización interna de un servicio.

**Por qué**: Hammant popularizó el patrón en ThoughtWorks y Martin Fowler lo documentó en su bliki. La clase presentó Strangler Fig para migraciones arquitectónicas grandes, pero Branch by Abstraction es más apropiado para refactorizaciones dentro de un mismo servicio (cambiar ORM, cambiar librería de caching, migrar de SQL a NoSQL dentro del mismo bounded context). La ventaja: no necesitás infraestructura de redirección (API Gateway), solo una interfaz y configuración.

---

### 4. [Investigar] ¿Qué es "Technical Debt in Machine Learning Systems" según Sculley et al. (Google) y cómo difiere de la deuda técnica en software tradicional?

**Respuesta**: D. Sculley et al. de Google publicaron el paper *"Machine Learning: The High-Interest Credit Card of Technical Debt"* (2014, NIPS) identificando tipos de deuda técnica específicos de sistemas ML: **Entanglement** (cambios sutiles en features cambian todo el modelo —CACE principle: Change Anything Changes Everything), **Hidden Feedback Loops** (sistemas que se auto-alimentan creando ciclos de deuda invisibles), **Undeclared Consumers** (sistemas que consumen la salida del modelo sin declararlo), **Data Dependencies** (features que dependen de otros modelos o datos externos creando cascadas de fallos), y **Pipeline Jungles** (pipelines de datos que crecen orgánicamente sin diseño). Difieren de la deuda tradicional en que no son visibles en código —son acoplamientos de datos y modelos.

**Por qué**: La clase cubrió deuda técnica tradicional, pero sistemas como el motor de recomendaciones de E-Commerce Platform son ML systems con tipos de deuda únicos. El paper de Sculley es lectura obligatoria para arquitectos que trabajan con sistemas ML/AI. Para el proyecto final, si hay recomendaciones de productos, estos tipos de deuda son relevantes y requieren estrategias de mitigación diferentes a las de código tradicional.

---

### 5. [Conectar] La clase presenta la Boy Scout Rule de Uncle Bob. ¿Cómo se relaciona esto con el concepto de "Refactoring as a Daily Habit" de Martin Fowler y la diferencia entre refactoring reactivo y proactivo?

**Respuesta**: Martin Fowler, en *Refactoring* (2ª ed., 2018), distingue dos enfoques: **refactoring reactivo** ("toco este código para un feature y lo limpio") y **refactoring proactivo** ("dedico tiempo exclusivo a mejorar código sin un feature asociado"). La Boy Scout Rule de Uncle Bob es refactoring reactivo: siempre asociado a un cambio funcional, limitado en scope (el archivo que estás tocando). Fowler argumenta que el refactoring reactivo es necesario pero insuficiente: ciertos cambios arquitectónicos (extraer servicio, migrar base de datos) no pueden hacerse "de paso" en un feature. Requieren refactoring proactivo planificado, con su propio espacio en el roadmap.

**Por qué**: La clase presentó la Boy Scout Rule como estrategia suficiente, pero Fowler y la comunidad de refactoring (Michael Feathers, Joshua Kerievsky) advierten que la regla solo cubre deuda de código local. La deuda arquitectónica (dependencias incorrectas, elección de BD inadecuada) requiere refactoring proactivo planificado. Para E-Commerce Platform, limpiar nombres con Boy Scout Rule es reactivo; migrar de SQL a MongoDB para el catálogo es proactivo.

---

### 6. [Conectar] La clase cubre SonarQube como métrica de deuda técnica. ¿Qué limitaciones tienen las métricas de calidad estática y cómo las complementa el "CRAP Score" y el análisis de "Hotspots" según Adam Tornhill?

**Respuesta**: Adam Tornhill, en *Your Code as a Crime Scene* (2015) y *Software Design X-Rays* (2018), argumenta que métricas como cobertura y complejidad ciclomática (SonarQube) miden calidad estática pero no correlacionan con dónde ocurren los bugs. Tornhill propone: (1) **Hotspots**: analizar el historial de Git para identificar archivos que cambian frecuentemente Y tienen alta complejidad —los que más bugs concentran, (2) **Temporal Coupling**: archivos que siempre cambian juntos (acoplamiento de cambio, no de código), y (3) **Author Churn**: archivos con muchos autores diferentes (falta de ownership). Su herramienta CodeScene implementa este análisis. El **CRAP Score** (Change Risk Analysis and Predictions) combina complejidad ciclomática + coverage de tests para estimar riesgo de cambio.

**Por qué**: La clase presentó SonarQube como herramienta canónica, pero Tornhill demuestra que la correlación entre métricas estáticas y bugs reales es débil. Los hotspots predicen bugs mejor que la complejidad sola. Para priorizar refactoring en E-Commerce Platform, no basta con "alta complejidad": necesitás archivos con alta complejidad Y alto churn (se tocan mucho y son difíciles de entender).

---

### 7. [Conectar] La clase menciona los tipos de deuda de Fowler (prudente/imprudente, deliberada/inadvertida). ¿Cómo se relaciona esto con el concepto de "Architectural Technical Debt" específicamente, según el paper de Nord et al. del SEI?

**Respuesta**: Nord, Ozkaya, Kruchten y otros del SEI publicaron *"In Search of a Metric for Managing Architectural Technical Debt"* (2012) donde distinguen deuda técnica de código (local, barata de pagar) de deuda técnica arquitectónica (sistémica, cara de pagar). La deuda arquitectónica incluye: violaciones de principios de diseño, dependencias cíclicas entre módulos, decisiones tecnológicas obsoletas, y patrones incorrectos. Proponen métricas específicas: "Architectural Debt Index" basado en dependencias estructurales, "Propagation Cost" (si cambio A, ¿cuántos otros componentes debo cambiar?), y "Visibility" (¿los stakeholders conocen la deuda?). La clase trató deuda técnica genérica, pero la deuda **arquitectónica** tiene características únicas: su interés es más alto, su pago es más disruptivo, y requiere estrategias diferentes.

**Por qué**: El paper del SEI es la referencia canónica sobre deuda específicamente arquitectónica. La distinción es crítica para el arquitecto: cierta deuda de código puede tolerarse; la deuda arquitectónica no porque afecta la capacidad del sistema de cumplir sus QAs y evolucionar.

---

### 8. [Cuestionar] ¿Es siempre la deuda técnica "mala" o puede ser una decisión estratégica equivalente a "leverage financiero"? La controversia entre Ward Cunningham y los críticos.

**Respuesta**: Ward Cunningham, creador del concepto, aclaró en 2009 que la deuda técnica no es inherentemente mala: "Shipping first-time code is like going into debt. A little debt speeds development so long as it is paid back promptly." La deuda como leverage estratégico: tomar deuda hoy para capturar mercado más rápido (MVP), pagarla después con revenue. Los críticos (Uncle Bob, Michael Feathers) argumentan que en software, a diferencia de finanzas, el "interés" de la deuda no es predecible ni lineal: la deuda que parecía pequeña puede tener un interés oculto altísimo cuando el sistema escala. El concepto de Cunningham asume que el equipo pagará la deuda; en la práctica, rara vez ocurre sin un mecanismo de enforcement.

**Por qué**: Cunningham mismo ha lamentado que su metáfora financiera se haya malinterpretado como "la deuda es buena." La clave es el "promptly paid back" —si no hay plan de pago, no es leverage, es default. La clase presentó deuda consciente como herramienta, pero la evidencia de la industria sugiere que la mayoría de deuda "consciente" nunca se paga porque las prioridades de negocio siempre empujan features sobre refactoring.

---

### 9. [Cuestionar] ¿Son los "Refactoring Sprints" una buena práctica o un síntoma de fracaso en la gestión continua de calidad? El debate ágil.

**Respuesta**: La práctica de dedicar sprints completos a refactoring es polémica en la comunidad ágil. Los críticos (Martin Fowler, Uncle Bob) argumentan que es un síntoma de que el equipo no está refactorizando continuamente (Boy Scout Rule). Si necesitás un sprint de refactoring, es porque acumulaste deuda que debió pagarse incrementalmente. Además, los stakeholders de negocio rara vez aprueban sprints de refactoring cuando ven "cero features entregadas." Los defensores pragmáticos (equipos reales) responden que ciertos refactorings (migración de BD, cambio de framework) no pueden hacerse "de a poco" y requieren inversión concentrada. La solución intermedia: "refactoring budget" (20% de cada sprint, no sprints dedicados) para deuda de código; sprints dedicados solo para deuda arquitectónica grande que no puede descomponerse.

**Por qué**: Esta controversia refleja la tensión entre principios ágiles (refactoring continuo) y realidad empresarial (features primero). La clase mencionó el "20% rule" y "refactoring sprints" como opciones equivalentes, pero la comunidad ágil favorece claramente el presupuesto continuo sobre sprints dedicados.

---

### 10. [Cuestionar] ¿El concepto de "Deuda Técnica" es una metáfora útil o una simplificación peligrosa? La crítica de la comunidad software desde la perspectiva de calidad.

**Respuesta**: Críticos como Laurent Bossavit y otros argumentan que la metáfora de "deuda" es peligrosa porque: (1) sugiere que es cuantificable financieramente cuando no lo es (no podés calcular realmente el "interés"), (2) la usan equipos para justificar decisiones apresuradas con falsa confianza de "ya pagaremos," (3) ignora que parte de la "deuda" es simplemente ignorancia (inadvertida + imprudente), y (4) la metáfora financiera no captura que en software, la deuda puede hacer el sistema **inmantenible** (bancarrota), no solo más lento de featurear. Alternativas propuestas: "Quality Debt", "Design Erosion" o "Architectural Drift" que capturan mejor el fenómeno sin la falsa analogía financiera.

**Por qué**: Bossavit en *The Leprechauns of Software Engineering* (2012) cuestiona la base empírica de muchas "leyes" del software. La clase adopta la metáfora financiera acríticamente, pero hay un debate real sobre si la metáfora ayuda (hace tangible el problema para stakeholders de negocio) o perjudica (da falsa precisión y falsa sensación de control).

---

