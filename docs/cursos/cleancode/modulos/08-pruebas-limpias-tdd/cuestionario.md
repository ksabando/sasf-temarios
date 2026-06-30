---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué son las dos escuelas de TDD: "Classicist/Chicago School" (Kent Beck) vs. "Mockist/London School" (Steve Freeman, Nat Pryce)? ¿Qué diferencias fundamentales tienen sobre el uso de mocks y el estilo de diseño resultante?

**Respuesta**: La Classicist School (Kent Beck, TDD by Example, 2003) enfatiza: (a) usar objetos reales siempre que sea posible (no mocks), (b) solo mockear dependencias externas REALES (BD, red, sistema de archivos), (c) los tests verifican ESTADO final (assert sobre valores retornados), (d) el diseño emerge de la colaboración de objetos reales. La Mockist School (Steve Freeman, Nat Pryce, "Growing Object-Oriented Software Guided by Tests", 2009) enfatiza: (a) mockear TODAS las dependencias de la clase bajo prueba (aislamiento total), (b) los tests verifican COMPORTAMIENTO (qué mensajes envió el objeto a sus colaboradores, no solo qué retornó), (c) el diseño se guía por los ROLES que los objetos desempeñan (descubiertos al definir los mocks), (d) tiende a producir muchas interfaces pequeñas y clases altamente desacopladas. La Mockist School produce código más desacoplado pero con más indirección; la Classicist produce código más simple pero con tests potencialmente más lentos (si usan objetos reales pesados). La clase menciona mocks sin explicar que su uso define una ESCUELA de diseño, no solo una técnica de testing.

**Por qué**: La clase usa mocks como herramienta sin posicionarse en el debate. Freeman & Pryce es uno de los libros más influyentes en TDD moderno. El alumno debe saber que la decisión de "cuánto mockear" es una decisión de DISEÑO con implicancias profundas en la arquitectura del sistema.

---

### 3. [Investigar] ¿Qué es "Mutation Testing" (Pruebas de Mutación) implementado por la herramienta PIT (Pitest) en Java? ¿Qué problema fundamental de la cobertura de código tradicional resuelve y por qué se considera el estándar de oro para evaluar calidad de tests?

**Respuesta**: Mutation Testing (R.A. DeMillo et al., 1978, "Hints on Test Data Selection") crea "mutantes" del código fuente aplicando pequeñas modificaciones (cambiar `>` por `>=`, reemplazar `+` por `-`, invertir un `if`, eliminar una línea) y ejecuta los tests contra cada mutante. Si los tests PASAN para un mutante, el mutante "sobrevivió" —lo que significa que los tests NO detectaron ese cambio de comportamiento. La "mutation coverage" mide qué porcentaje de mutantes fueron "matados" por los tests. La cobertura tradicional (line coverage, branch coverage) solo verifica que el código fue EJECUTADO, no que fue CORRECTAMENTE VERIFICADO. Un test sin asserts da 100% de line coverage pero 0% de mutation coverage. PIT (Pitest.org) es la implementación para Java, ampliamente usada en la industria (Google, Netflix). La clase pide ">80% cobertura" —mutation testing eleva el estándar: ¿80% de cobertura de MUTACIÓN?

**Por qué**: La clase define cobertura como métrica de cantidad (lines/branches). Mutation testing redefine cobertura como métrica de CALIDAD. La cobertura tradicional es fácil de "gamiar" (tests sin asserts, ejecución sin verificación). Pitest es una herramienta que todo alumno avanzado de testing debe conocer porque revela la diferencia entre "tener tests" y "tener tests que prueban algo".

---

### 4. [Investigar] ¿Qué es "Property-Based Testing" (PBT) popularizado por QuickCheck (Koen Claessen, John Hughes) y cómo difiere fundamentalmente de los tests basados en ejemplos que la clase enseña? ¿Cómo se implementa en Java con jqwik?

**Respuesta**: Property-Based Testing (Haskell QuickCheck, 1999) en lugar de escribir ejemplos concretos (`assertThat(calculator.add(2, 3)).isEqualTo(5)`), escribís PROPIEDADES que deben cumplirse para TODOS los valores de entrada generados aleatoriamente. Ejemplo: `forAll(Integer a, Integer b) -> calculator.add(a, b) == calculator.add(b, a)` (conmutatividad de la suma). El framework genera cientos o miles de valores aleatorios (incluyendo valores borde: negativos, cero, máximo entero) y verifica que la propiedad se cumple para todos. Si encuentra un contraejemplo, lo "shrinkea" (reduce al mínimo caso que falla). Diferencia con tests de ejemplo: (a) los tests de ejemplo prueban CASOS ESPECÍFICOS que el programador imagina, (b) PBT prueba INVARIANTES UNIVERSALES sobre un espacio de entrada masivo, (c) PBT encuentra bugs en casos borde que ningún programador pensó testear. En Java, jqwik implementa PBT. La clase enseña Given-When-Then con ejemplos concretos; PBT es el paradigma complementario que ataca el problema de "qué casos debería testear".

**Por qué**: La clase presenta tests basados en ejemplos como EL estándar. PBT representa un salto cualitativo en testing: en lugar de pensar en casos, pensás en PROPIEDADES del sistema. jqwik es usado en producción por equipos Java avanzados y complementa —no reemplaza— los tests de ejemplo. El alumno debe conocer este paradigma para no limitarse a testear solo los casos felices y los errores obvios.

---

### 5. [Conectar] La clase describe el ciclo Red-Green-Refactor de TDD. ¿Qué añade la práctica "TCR" (Test && Commit || Revert) popularizada por Kent Beck en 2018? ¿Qué problema de disciplina resuelve TCR que el ciclo Red-Green-Refactor no aborda?

**Respuesta**: TCR (Test && Commit || Revert) es una disciplina extrema de TDD propuesta por Kent Beck (2018, artículo "Test && Commit || Revert" y charlas posteriores). La mecánica: escribís test y código; ejecutás tests. Si pasan → commit automático. Si fallan → revert automático de TODOS los cambios (vuelve al último commit). Resuelve el problema de disciplina: en TDD clásico, podés estar 30 minutos en "refactor" con tests en rojo, acumulando cambios no commiteados —si algo sale mal, perdés trabajo o el diff es gigante. TCR fuerza a trabajar en INCREMENTOS DE MINUTOS: cada paso que pasó los tests queda commiteado; cada paso que falló se descarta completamente. Esto obliga a que cada paso sea MINÚSCULO (no podés perder 30 min de trabajo). Efectos: (a) eliminás la tentación de "acumular cambios", (b) el revert te fuerza a pensar en pasos más pequeños, (c) el historial de git se vuelve una secuencia granular de micro-pasos documentados. La clase no menciona TCR porque es posterior a Clean Code, pero Beck —creador de TDD— lo propuso como evolución de la práctica.

**Por qué**: La clase enseña el ciclo Red-Green-Refactor de 2003. TCR es la iteración 2018 del mismo Kent Beck que resuelve problemas de disciplina que Beck mismo observó en equipos reales. El alumno que conoce TCR entiende que TDD no es estático —sus propios creadores siguen refinando la práctica.

---

### 6. [Conectar] La clase recomienda FIRST (Fast, Independent, Repeatable, Self-Validating, Timely). ¿Qué añade el concepto de "Test Smells" de Gerard Meszaros en "xUnit Test Patterns"? ¿Qué test smells son los más comunes y cómo se relacionan con las violaciones de FIRST?

**Respuesta**: Meszaros (2007) cataloga "Test Smells" —patrones problemáticos en tests más allá de los principios FIRST. Principales: (a) "Obscure Test" (test difícil de entender): relacionado con violar Self-Validating —no es obvio qué verifica, (b) "Erratic Test" (test errático): a veces pasa, a veces falla —violación directa de Repeatable, (c) "Fragile Test" (test frágil): falla cuando cambiás código NO relacionado —violación de Independence (el test depende de demasiadas cosas), (d) "Assertion Roulette" (ruleta de aserciones): múltiples asserts sin mensajes explicativos —violación de Self-Validating cuando falla porque no sabés cuál assert falló, (e) "Slow Tests" (tests lentos): conversión directa de violar Fast, (f) "Test Code Duplication" (duplicación en tests): misma lógica de setup copiada en 50 tests —no viola FIRST directamente pero hace los tests difíciles de mantener. El catálogo de Meszaros da NOMBRE a los problemas, lo cual permite discutirlos en code review con vocabulario preciso.

**Por qué**: La clase da FIRST como principios abstractos. Meszaros provee el catálogo concreto de PATOLOGÍAS con nombres estándar. "Fragile Test" es un diagnóstico más preciso que "viola Independence". Conocer los smells permite al alumno diagnosticar por qué un test es malo, no solo decir que es malo.

---

### 7. [Conectar] La clase usa Given-When-Then (GWT) como estructura de tests. ¿Qué es BDD (Behavior-Driven Development) de Dan North y cómo GWT se inserta en un marco más amplio que incluye comunicación con stakeholders no técnicos mediante Gherkin/Cucumber?

**Respuesta**: Dan North creó BDD en 2003 (artículo "Introducing BDD") como evolución de TDD que resuelve el problema de "qué test escribo ahora". BDD reemplaza el lenguaje de "test" por "comportamiento" y usa un lenguaje ubicuo (Ubiquitous Language) compartido con el negocio. Gherkin es el DSL de BDD con sintaxis Given-When-Then: `Given a customer with VIP status`, `When they place an order of $1000`, `Then they receive a 20% discount`. Cucumber ejecuta archivos `.feature` como tests automatizados. La diferencia fundamental con TDD de la clase: (a) TDD es para desarrolladores (tests unitarios), (b) BDD es un puente entre negocio, QA y desarrollo —los escenarios GWT son escritos/entendibles por stakeholders, (c) los escenarios BDD son documentación ejecutable de REQUISITOS, no solo de diseño. La clase usa GWT como formato de test unitario; Dan North lo diseñó como lenguaje de especificación de comportamiento de negocio.

**Por qué**: La clase presenta GWT como convención de formato. BDD es una metodología completa que extiende TDD al ámbito de la especificación. El alumno debe entender que GWT no es solo "ordená tu test en tres secciones" —es la manifestación en código de una conversación con el negocio.

---

### 8. [Cuestionar] La clase dice que los tests deben ser "Fast" y recomienda no usar base de datos real. Sin embargo, la Testing Trophy (Kent C. Dodds, en lugar de la Testing Pyramid tradicional) argumenta que los tests de integración con dependencias reales tienen MAYOR retorno de inversión que los tests unitarios puros. ¿Cómo reconciliás estas posiciones?

**Respuesta**: La Testing Pyramid (Mike Cohn, "Succeeding with Agile", 2009) recomienda: muchos tests unitarios (rápidos, baratos), menos de integración, pocos end-to-end. La Testing Trophy (Kent C. Dodds, 2018, blog "Write tests. Not too many. Mostly integration.") invierte la recomendación: enfatiza tests de INTEGRACIÓN (con dependencias reales o fakes realistas) como la base, argumentando que: (a) los tests unitarios que mockean todo encuentran pocos bugs reales porque los bugs ocurren en las INTERACCIONES entre componentes, (b) los tests de integración con BD en memoria (H2, Testcontainers) son suficientemente rápidos en hardware moderno, (c) el costo de mantenimiento de mocks excesivos supera el beneficio. La reconciliación práctica: (1) tests unitarios para lógica de negocio pura (algoritmos, reglas, cálculos) sin dependencias, (2) tests de integración con fakes rápidos (H2, WireMock) para flujos que cruzan capas, (3) pocos tests end-to-end para smoke tests de despliegue. La clave es: "fast enough" —un test de integración de 200ms es aceptable si corre en CI paralelo; 200 tests de 200ms corren en <1 minuto con paralelización.

**Por qué**: La clase adopta la pirámide tradicional sin discutir alternativas. Dodds es una voz influyente en testing moderno (React Testing Library, EpicReact) y su crítica a la pirámide tiene mérito empírico. El alumno debe ser capaz de evaluar qué mezcla de tests es óptima para el contexto, no aplicar una pirámide universal.

---

### 9. [Cuestionar] La clase recomienda "una aserción por test". ¿Es esta regla realista o produce explosión de tests con nombres casi idénticos? ¿Qué posición pragmática defiende Martin Fowler sobre múltiples asserts que verifican el MISMO concepto?

**Respuesta**: Martin Fowler, en su artículo "Assertion" (2006, actualizado 2021, martinfowler.com), argumenta que la regla "un assert por test" es un malentendido de la regla real: "un CONCEPTO por test". Fowler defiende que múltiples asserts sobre el mismo concepto son correctos. Ejemplo: `assertThat(result.getName()).isEqualTo("Juan"); assertThat(result.getAge()).isEqualTo(30);` verifican que el objeto fue creado correctamente —ambos asserts prueban el MISMO concepto ("el constructor asignó los campos correctamente"). Separarlos en `shouldCreateEmployeeWithCorrectName` y `shouldCreateEmployeeWithCorrectAge` genera: (a) duplicación masiva de setup, (b) tests con nombres que son paráfrasis de la línea de assert, (c) una falsa granularidad que no aporta diagnóstico adicional (si falla `getName`, ya sabés que el constructor no asignó nombre —no necesitás un test separado). La versión refinada de la regla: un test debe fallar por UNA sola razón de negocio. Si dos asserts fallan por la misma razón, está bien que estén juntos. Si fallan por razones distintas, separalos.

**Por qué**: La clase presenta la regla en su forma más extrema: "preferiblemente una aserción por test". Fowler, que es citado extensivamente en el libro, MATIZA esta regla. El alumno debe aprender la versión pragmática que usan los equipos reales, no la versión dogmática que genera 500 tests con 4 líneas cada uno.

---

### 10. [Cuestionar] La clase presenta TDD como "escribe el test antes del código". Sin embargo, hay escenarios donde TDD es difícil o contraproducente incluso para el propio Robert C. Martin: UIs, código multi-thread, o exploraciones de diseño. ¿Qué dice Martin sobre "TDD is not a religion" y cuál es su recomendación para estos contextos?

**Respuesta**: Robert C. Martin ha dicho repetidamente en conferencias (ej. "The Scribe's Oath", 2016) "TDD is not a religion; it's a discipline. If you can't do it, don't." Martin reconoce tres grandes excepciones donde TDD clásico no aplica bien: (1) GUIs: testear gráficos, layouts y animaciones con TDD es impracticable —se usan tests de screenshot/snapshot y testing manual exploratorio, (2) Código multi-thread concurrente: el no-determinismo hace que los tests no sean Repeatable (R de FIRST), se usan herramientas específicas (JCStress, stress testing probabilístico), (3) Exploración de diseño: cuando no sabés qué forma debe tener el código, TDD te encierra en decisiones prematuras —escribí código exploratorio, aprendé, luego testealo (o tiralo). La recomendación de Martin es: usá TDD para LA LÓGICA DE NEGOCIO (la mayoría del código), y aceptá que en los bordes del sistema (UI, concurrencia, protocolos) otras técnicas son más apropiadas. El alumno debe entender que TDD no es una solución universal y saber identificar estos bordes es señal de madurez.

**Por qué**: La clase presenta TDD como la metodología para todo el desarrollo. Los propios creadores de TDD reconocen sus límites. El alumno que ignora estos límites aplicará TDD dogmáticamente y se frustrará (o abandonará la práctica) cuando enfrente una UI o código concurrente.

