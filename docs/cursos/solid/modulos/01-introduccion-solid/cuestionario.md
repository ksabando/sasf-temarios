---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] Kevlin Henney ha criticado públicamente SOLID en varias conferencias. ¿Cuáles son sus tres críticas principales y qué evidencia presenta? Mencioná al menos una charla específica donde las expuso.

**Respuesta**: Las tres críticas principales de Kevlin Henney: (1) **SOLID es un acrónimo forzado**: Michael Feathers reorganizó principios preexistentes para que deletrearan "SOLID", pero no hay cohesión real entre ellos — OCP viene de Bertrand Meyer (1988), LSP de Barbara Liskov (1987), y los demás de Robert Martin en épocas distintas. (2) **Las definiciones son ambiguas y circulares**: SRP dice "una razón para cambiar" pero no define qué es una "razón"; OCP dice "abierto/cerrado" pero es una paradoja irresoluble en la práctica. (3) **SOLID promueve sobre-ingeniería**: la aplicación dogmática produce explosión de clases, indirección innecesaria y arquitecturas que resuelven problemas que nunca ocurrirán. Henney expuso estas críticas en su charla "SOLID Deconstruction" (ACCU 2016) y "The SOLID Design Principles Deconstructed" (NDC 2016).

**Por qué**: Kevlin Henney es un referente respetado en patrones de diseño y autor de multiples libros. Su crítica no es que los principios sean falsos, sino que se presentan como un paquete dogmático cuando son ideas de épocas, autores y contextos diferentes. Henney sugiere que es más útil estudiar cada principio en su contexto original (Meyer, Liskov) que como parte del acrónimo.

---

### 3. [Investigar] El Common Closure Principle (CCP) de Robert C. Martin se solapa con SRP. ¿En qué se diferencian y en qué contexto aplica cada uno? Citá la fuente original de CCP y explicá por qué Martin sintió necesario definirlo por separado.

**Respuesta**: El CCP fue definido por Robert C. Martin en "Agile Software Development: Principles, Patterns, and Practices" (2003) como parte de los principios de empaquetamiento: "Las clases que cambian por las mismas razones deben estar en el mismo paquete". La diferencia con SRP es de granularidad y dirección: **SRP** opera a nivel de clase individual y dice "separá responsabilidades" (fuerza centrífuga — separar). **CCP** opera a nivel de paquete/módulo y dice "agrupá clases que cambian juntas" (fuerza centrípeta — juntar). Son complementarios: SRP impide las God Classes, CCP evita que clases relacionadas queden dispersas. Martin necesitó CCP porque SRP solo dice qué separar pero no dice qué mantener junto. Un sistema que aplica SRP sin CCP termina con cientos de clases microscópicas donde un cambio de lógica de negocio requiere modificar 20 archivos.

**Por qué**: CCP viene de los principios de Granularidad de Paquetes que Martin publicó en 2003, basándose en el trabajo previo sobre métricas de acoplamiento. CCP es la versión de paquete del SRP: "las clases en un paquete deben ser cerradas contra los mismos tipos de cambios". Es un principio de cohesión a nivel de módulo, no de clase.

---

### 4. [Investigar] ¿Qué rol específico jugó Michael Feathers en la creación del acrónimo SOLID? ¿Cómo y cuándo ocurrió exactamente la "reorganización" de los principios? ¿Qué principio fue el último en agregarse y por qué?

**Respuesta**: Michael Feathers acuñó el acrónimo SOLID alrededor del año 2000 después de leer los artículos de Robert C. Martin sobre principios de diseño. En un intercambio de emails, Feathers notó que los primeros cinco principios que Martin había descrito formaban el acrónimo SOLID si se ordenaban como SRP, OCP, LSP, ISP, DIP. El "reordenamiento" fue crucial: ISP originalmente no estaba en la lista inicial de Martin como "principio de diseño de clases" sino como un principio sobre dependencias entre paquetes. Feathers lo movió a la posición "I" para completar el acrónimo. El último en agregarse fue DIP — Martin lo había formulado después de SRP y OCP, pero Feathers lo colocó al final del acrónimo porque completaba "SOLID" y además DIP es el que "cierra" la arquitectura (dependencias hacia abstracciones). La primera mención pública del acrónimo fue en el artículo "Design Principles and Design Patterns" de Martin (2000), donde ya aparece "SOLID" en la introducción, acreditando a Feathers.

**Por qué**: La historia del acrónimo importa porque revela que SOLID no fue concebido como un sistema integrado, sino como una colección de principios independientes reorganizados para formar una palabra memorable. Kevlin Henney y otros críticos señalan esto como evidencia de que la "coherencia" de SOLID es en parte artificial.

---

### 5. [Conectar] Relacioná el concepto de "deuda técnica" de Ward Cunningham con el "costo del cambio" que Robert Martin describe en SOLID. ¿Cómo se conectan estos conceptos con el libro "The Economics of Software Quality" de Capers Jones y Olivier Bonsignour?

**Respuesta**: Ward Cunningham acuñó "deuda técnica" en 1992 para describir el costo de no alinear el código con el entendimiento actual del dominio. Robert Martin extendió esto con el "costo del cambio": sin SOLID, el costo crece exponencialmente; con SOLID, crece linealmente. Capers Jones y Olivier Bonsignour en "The Economics of Software Quality" (2011) cuantifican esto: el costo de corregir un defecto en producción es 100 veces mayor que en diseño. La conexión es: (1) La deuda técnica (Cunningham) es la causa, (2) el costo del cambio exponencial (Martin) es el síntoma, (3) los datos empíricos de Jones/Bonsignour son la evidencia cuantitativa. Jones documenta que equipos con baja calidad de código (medida por defectos por KLOC) tienen un costo de mantenimiento 3-5x mayor que equipos con alta calidad, validando la hipótesis de Martin de que el diseño afecta directamente el costo económico.

**Por qué**: La tríada Cunningham-Martin-Jones forma un argumento completo: la deuda técnica no es solo una metáfora sino un fenómeno económicamente medible. SOLID es la estrategia de prevención; las métricas de Jones son la validación. Jones analizó más de 13,000 proyectos y encontró correlación directa entre mal diseño estructural y sobrecostos.

---

### 6. [Conectar] ¿Cómo se relacionan los code smells identificados en clase (God Class, Long Method, Shotgun Surgery) con el concepto de "Design Stamina Hypothesis" de Martin Fowler? ¿Qué evidencia respalda que el buen diseño paga la inversión?

**Respuesta**: La Design Stamina Hypothesis de Martin Fowler propone que existe un umbral de calidad de diseño por debajo del cual el proyecto colapsa, y que la inversión en diseño tiene retorno positivo (a diferencia de la creencia de que "el diseño no vale la pena porque el software siempre se reescribe"). Los code smells son los indicadores tempranos de que un proyecto se acerca al umbral: cada God Class, Long Method o Shotgun Surgery reduce la "stamina" del diseño. Fowler argumenta, basándose en su experiencia en ThoughtWorks, que el buen diseño es una ventaja competitiva, no un lujo. La evidencia: proyectos con baja "stamina" (muchos smells) colapsan cuando alcanzan cierta escala. Estudios como el de la Universidad de Delft (2012) mostraron correlación entre code smells y defectos: God Classes tenían 3.5x más bugs que clases con SRP.

**Por qué**: Fowler conecta los code smells con una teoría económica del diseño. Los principios SOLID son la respuesta práctica: cada principio ataca un smell específico (SRP → God Class, OCP → Switch Statements, LSP → Refused Bequest, ISP → Fat Interface, DIP → Tight Coupling). La "stamina" se mantiene aplicando SOLID incrementalmente.

---

### 7. [Conectar] La complejidad ciclomática de McCabe (1976) se menciona en clase. ¿Cómo se relaciona específicamente esta métrica con el principio OCP? Investigá y explicá por qué un método con alta complejidad ciclomática casi siempre viola OCP, usando el concepto de "puntos de variación" de la ingeniería de software.

**Respuesta**: La complejidad ciclomática cuenta puntos de decisión (if, switch, for, while). Cada punto de decisión representa un "punto de variación" — un lugar donde el comportamiento diverge según condiciones. OCP exige que los puntos de variación se implementen mediante polimorfismo (herencia/interfaces), no mediante condicionales. Un método con complejidad ciclomática 15 tiene 15 puntos de decisión que, en un diseño OCP, deberían ser 15 implementaciones de una interfaz común. La relación es inversa: a mayor complejidad ciclomática, más violaciones OCP concentradas. Investigaciones como las de Basili y Perricone (1984) mostraron que módulos con complejidad ciclomática >10 tenían 3x más defectos. La métrica de McCabe es efectivamente un "detector de violaciones OCP": si M > 10 en un método que procesa tipos de datos (tax types, payment methods, notification channels), refactorizá a Strategy.

**Por qué**: La complejidad ciclomática no mide OCP directamente pero es su mejor proxy cuantitativo. Un if/switch creciente viola OCP porque cada nuevo caso requiere modificar código existente. La métrica de McCabe detecta cuantitativamente lo que OCP prohíbe cualitativamente.

---

### 8. [Cuestionar] David Heinemeier Hansson (DHH, creador de Ruby on Rails) ha argumentado que SOLID promueve "over-engineering" y "anemic domain models". ¿Es válida esta crítica? Presentá argumentos a favor y en contra usando ejemplos concretos de Rails vs Spring.

**Respuesta**: **A favor de DHH**: Rails promueve "fat models" donde la lógica de negocio vive en el modelo ActiveRecord, que es una clase rica (no anémica). Aplicar SRP estrictamente en Rails produciría cientos de service objects que fragmentan la lógica. Ejemplo: un modelo `Order` en Rails tiene validaciones, cálculos, callbacks y asociaciones — SRP diría que tiene "múltiples razones para cambiar", pero en Rails esto es idiomático y productivo. DHH sostiene que la cohesión del dominio es más valiosa que la pureza de SRP. **En contra de DHH**: El mismo Martin Fowler acuñó "anemic domain model" como anti-patrón, y SRP bien aplicado NO produce modelos anémicos. SRP separa responsabilidades transversales (persistencia, notificación, validación) PERO mantiene la lógica de dominio junta en el aggregate root (DDD). Spring no exige modelos anémicos; permite modelos ricos con lógica de dominio. La crítica de DHH es válida contra la aplicación dogmática de SOLID, pero no contra los principios en sí.

**Por qué**: DHH y Martin representan dos filosofías: "Convention over Configuration" (Rails) vs "Explicit design" (SOLID). La crítica de DHH (expuesta en "The Rails Doctrine" y múltiples tweets) apunta a que SOLID industrializa el diseño creando fábricas de código donde la lógica de negocio se diluye en servicios. La defensa de SOLID es que sin estos principios, Rails produce sistemas que colapsan a escala (Shopify y GitHub han tenido que introducir service layers sobre Rails).

---

### 9. [Cuestionar] ¿Es realmente el SRP el principio "más fundamental" de SOLID, o es una exageración de Robert Martin? Investigá el trabajo de Yegor Bugayenko (autor de "Elegant Objects") quien argumenta que SOLID está fundamentalmente equivocado en su enfoque. ¿Qué propone Bugayenko en su lugar?

**Respuesta**: Yegor Bugayenko, en su libro "Elegant Objects" (2016) y múltiples artículos, argumenta que SOLID está equivocado porque: (1) SRP destruye la cohesión al atomizar objetos que deberían ser ricos. Bugayenko defiende objetos que encapsulan estado y comportamiento juntos — lo opuesto a separar validación, cálculo y persistencia. (2) DIP es innecesario si los objetos son verdaderamente encapsulados — un objeto no debería necesitar que le inyecten dependencias; debería ser autosuficiente a través de composición. (3) Propone principios alternativos: "no hay clases abstractas" (todo debe ser concreto y componible), "no hay getters/setters" (los objetos no exponen estado), "los constructores sin parámetros son malvados". Bugayenko afirma que SOLID es una solución a problemas que no existirían si se usaran objetos reales (con encapsulamiento estricto, inmutabilidad y composición) en lugar del estilo procedural que domina Java enterprise.

**Por qué**: Bugayenko es una voz disidente importante porque argumenta desde dentro del ecosistema OOP, no desde fuera. Su crítica no es "OOP está mal" sino "SOLID es un parche sobre mal OOP". Para Bugayenko, un sistema bien diseñado con objetos verdaderamente encapsulados no necesita SRP porque cada objeto naturalmente tiene una responsabilidad al estar bien definido.

---

### 10. [Cuestionar] Si SOLID fue formulado para Java/C++ en los años 90-2000, ¿es aplicable a lenguajes funcionales como Haskell, Clojure o Elixir? ¿Cuáles principios se traducen naturalmente y cuáles pierden sentido? Investigá la postura de Mark Seemann (autor de "Dependency Injection in .NET") sobre este tema.

**Respuesta**: Según Mark Seemann y otros autores: **SRP** se traduce como "una función debe hacer una sola cosa" — es universal y se alinea con el principio de "funciones pequeñas y puras" del FP. **OCP** se traduce como "higher-order functions" — en lugar de Strategy Pattern, se pasa una función como parámetro (OCP sin jerarquía de clases). **LSP** es irrelevante en FP puro porque no hay herencia de tipos; se reemplaza por el sistema de tipos algebraico (type classes en Haskell, protocols en Elixir). **ISP** se traduce como "funciones que aceptan exactamente los datos que necesitan" (record types en lugar de objetos inflados). **DIP** se traduce como "depender de funciones, no de módulos concretos" — en FP se logra naturalmente con higher-order functions y type classes. Seemann argumenta que SOLID fue una solución específica para las limitaciones de OOP (herencia rígida, acoplamiento implícito, estado mutable) y que en FP muchos de estos principios son redundantes porque el paradigma ya los incorpora (funciones puras = SRP, HOF = OCP, type classes = ISP).

**Por qué**: Mark Seemann exploró esto en su blog y en charlas sobre FP vs OOP. La conclusión no es que SOLID sea incorrecto sino que fue formulado para resolver problemas específicos de un paradigma. En FP, las mismas propiedades deseables (bajo acoplamiento, alta cohesión, testabilidad) se logran con mecanismos diferentes.

