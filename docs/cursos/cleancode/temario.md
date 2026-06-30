---
sidebar_position: 2
sidebar_label: "Temario"
---

## Configuración Técnica

| Herramienta | Versión | Propósito |
|---|---|---|
| Java | 17+ (LTS) | Lenguaje principal del curso |
| Maven | 3.9+ | Gestión de dependencias |
| IntelliJ IDEA | 2024+ | IDE oficial |
| Git | 2.40+ | Control de versiones |
| JUnit 5 | 5.10+ | Pruebas unitarias |
| Mockito | 5.4+ | Mocking |
| SonarLint | Plugin | Análisis estático |
| Checkstyle | 10.12+ | Estilo de código |
| PMD | 7.0+ | Análisis de código |

---

## Estructura de cada Módulo

Cada módulo contiene 4 archivos dentro de su carpeta numerada:

| Archivo | Propósito |
|---|---|
| `clase.md` | Contenido teórico-práctico impartido en clase |
| `ejercicio.md` | Enunciado del ejercicio práctico |
| `respuesta.md` | Solución comentada del ejercicio |
| `cuestionario.md` | 5-10 preguntas de verificación |

---

## Módulo 01 — Introducción a Clean Code

**📁 `01-Introduccion-Clean-Code/`**

### Contenido

- ¿Qué es Clean Code? Historia y contexto (Robert C. Martin, 2008)
- El costo del código limpio vs el costo del desorden
- Deuda técnica: interés compuesto del mal código
- Lectura vs Escritura: se lee 10x más de lo que se escribe
- El boy scout rule: "Deja el campamento más limpio de como lo encontraste"
- Code smells básicos: métodos largos, nombres confusos, comentarios innecesarios
- Principio de las 4 reglas simples de Kent Beck
- Ejercicio inicial: leer código legacy de 500 líneas sin documentación y tratar de entenderlo
- Discusión: ¿qué hace que el código sea "limpio" para ti?
- Introducción a herramientas de análisis de código

### Archivos
- `clase.md`: Filosofía, principios, ejemplos de código sucio vs limpio
- `ejercicio.md`: Análisis de código legacy, listar 15 code smells encontrados
- `respuesta.md`: Lista comentada de smells y sugerencias de mejora
- `cuestionario.md`: 8 preguntas sobre conceptos fundamentales

---

## Módulo 02 — Nombres Significativos

**📁 `02-Nombres-Significativos/`**

### Contenido

- Los nombres revelan intención: `int d` vs `int elapsedTimeInDays`
- Evitar desinformación: `accountList` cuando no es un `List`
- Distinciones significativas: `ProductInfo` vs `ProductData` vs `Product`
- Nombres pronunciables: `genymdhms` vs `generationTimestamp`
- Nombres buscables: `int SUMPLE_TAX_RATE = 0.16` vs `const double e = 2.718;`
- Una palabra por concepto: no mezclar `fetch`, `retrieve`, `get`, `obtain`
- Nombres de clases: sustantivos (`Customer`, `AccountParser`)
- Nombres de métodos: verbos (`calculateTotal`, `sendEmail`)
- Evitar prefijos húngaros: `m_`, `_`, `I` (interfaces)
- Refactorizar nombres en el proyecto de nóminas

### Archivos
- `clase.md`: Reglas de naming con ejemplos buenos y malos
- `ejercicio.md`: Renombrar 50+ identificadores en el proyecto legacy
- `respuesta.md`: Código con nombres refactorizados
- `cuestionario.md`: 8 preguntas sobre naming

---

## Módulo 03 — Funciones

**📁 `03-Funciones/`**

### Contenido

- La primera regla: las funciones deben ser pequeñas
- La segunda regla: deben ser aún más pequeñas
- Una función debe hacer una sola cosa
- Niveles de abstracción: no mezclar conceptos de alto y bajo nivel
- Parámetros: 0 ideal, 1 bueno, 2 aceptable, 3+ evitar
- Sin efectos secundarios: `checkPassword` no debe inicializar sesión
- Sin switch/if anidados: polimorfismo en lugar de condicionales
- Separación comando/consulta (Command Query Separation)
- Preferir excepciones a códigos de error
- DRY (Don't Repeat Yourself) aplicado a funciones
- Refactorizar método de 200 líneas a funciones pequeñas

### Archivos
- `clase.md`: Reglas para escribir funciones limpias
- `ejercicio.md`: Refactorizar método `processOrder` (150 líneas, 3 niveles de anidación)
- `respuesta.md`: Funciones pequeñas, sin efectos secundarios, con nombres descriptivos
- `cuestionario.md`: 10 preguntas sobre funciones

---

## Módulo 04 — Comentarios y Formato

**📁 `04-Comentarios-Formato/`**

### Contenido

#### Comentarios
- Los comentarios no compensan el mal código
- Comentarios necesarios:
  - Documentación legal (licencias)
  - ADVERTENCIAS (ej: `// hilo inseguro`)
  - TODO comentados (con fecha y responsable)
  - Comentarios de amplificación
- Comentarios innecesarios:
  - Ruido (`// constructor`, `// getter`)
  - Comentarios redundantes (explican lo obvio)
  - Código comentado (eliminarlo)
  - Bitácoras (`// 2024-01-01: Juan cambió X`)
- Comentarios como muletilla de código no expresivo

#### Formato
- Formato vertical: densidad, distancia, ordenamiento
  - Variables de clase arriba
  - Constructores
  - Métodos públicos
  - Métodos privados (auxiliares cerca de quienes los llaman)
- Formato horizontal: indentación, ancho máximo (80-120 caracteres)
- Consistencia de equipo: formateador automático (Prettier, Spotless)
- Reglas de Checkstyle/PMD configurables

### Archivos
- `clase.md`: Buenas y malas prácticas de comentarios y formato
- `ejercicio.md`: Limpiar comentarios y reformatear código legacy
- `respuesta.md`: Código sin comentarios ruido, formateado consistentemente
- `cuestionario.md`: 8 preguntas sobre comentarios y formato

---

## Módulo 05 — Objetos y Estructuras de Datos

**📁 `05-Objetos-Estructuras/`**

### Contenido

- Abstracción de datos: exponer comportamiento, no datos
- Ley de Demeter: "habla solo con tus amigos inmediatos"
  - No encadenar: `getA().getB().getC().doSomething()`
- DTOs vs Objetos de Dominio:
  - DTO: estructura de datos pública (sin comportamiento)
  - Objeto de dominio: oculta datos, expone comportamiento
- Getters/Setters: ¿son realmente encapsulación?
  - `getSalary()` no encapsula si devuelve el campo directo
  - `payAmount()` encapsula la lógica de cálculo
- Objetos vs Estructuras: el dilema híbrido
  - Objeto: oculta datos, expone funciones
  - Estructura: expone datos, no tiene funciones significativas
- The Law of Demeter en Spring: `service.getRepository().findAll()` es violación

### Archivos
- `clase.md`: Abstracción, Ley de Demeter, DTOs vs dominio
- `ejercicio.md`: Refactorizar violaciones de Ley de Demeter y abstracción
- `respuesta.md`: Objetos con encapsulación real, DTOs limpios
- `cuestionario.md`: 8 preguntas sobre objetos y estructuras

---

## Módulo 06 — Manejo de Errores

**📁 `06-Manejo-Errores/`**

### Contenido

- Excepciones vs Códigos de error
  - Códigos de error: rompen el flujo, obligan al caller a revisar
  - Excepciones: separan la lógica normal del manejo de errores
- Proveer contexto en las excepciones
  - Mensajes descriptivos
  - Información adicional (IDs, valores, causa raíz)
  - Excepciones personalizadas de dominio
- No retornar `null`: el error de los mil millones
  - `Optional<T>` como alternativa
  - Null Object Pattern
  - Lanzar excepción en lugar de retornar null
- No pasar `null`: exigir parámetros no nulos
  - `Objects.requireNonNull()`
  - `@NonNull` y `@Nullable` anotaciones
  - Validación temprana (fail fast)
- Clasificación de excepciones:
  - Checked vs Unchecked: cuándo usar cada una
  - Excepciones de dominio (BusinessException)
  - Excepciones técnicas (TechnicalException)
- Manejo de errores en Spring: `@ControllerAdvice`, `@ExceptionHandler`
- Manejo de errores en React: Error Boundaries, try/catch en hooks

### Archivos
- `clase.md`: Excepciones, null handling, Optional, patrones de error
- `ejercicio.md`: Refactorizar código que retorna null y usa códigos de error
- `respuesta.md`: Manejo de errores con excepciones y Optional
- `cuestionario.md`: 8 preguntas sobre manejo de errores

---

## Módulo 07 — Límites e Integración

**📁 `07-Limites-Integracion/`**

### Contenido

- Código de terceros: cómo integrarlo limpiamente
  - No acoplarse directamente a APIs externas
  - Crear adapters/wrappers
  - Cambiar de librería solo cambia el adapter
- Learning Tests: probar librerías de terceros antes de integrarlas
  - Tests que verifican el comportamiento esperado
  - Documentación viva de cómo funciona la API
  - Si la librería cambia, el test falla (lo sabes de inmediato)
- Boundaries (límites del sistema):
  - Puntos de integración con sistemas externos
  - Interfaces definidas por el negocio
  - Implementaciones detrás de interfaces
- Adapters Pattern:
  - Puerto (interface) vs Adapter (implementación)
  - Puerto: define la interacción ideal desde el dominio
  - Adapter: traduce el puerto a la API externa
- Ejemplo: integración con API de pagos (PayPal, Stripe, MercadoPago)
  - Interface `PaymentGateway`
  - Implementaciones `PayPalAdapter`, `StripeAdapter`, `MercadoPagoAdapter`
  - Agregar un nuevo proveedor = nuevo adapter, no modificar código existente
- Código legacy sin tests: la boundary más peligrosa
  - Caracterización de código legacy (tests de caracterización)

### Archivos
- `clase.md`: Learning tests, adapters, límites del sistema
- `ejercicio.md`: Crear adapter para API de pagos, escribir learning tests
- `respuesta.md`: Adapter implementado + learning tests
- `cuestionario.md`: 8 preguntas sobre límites e integración

---

## Módulo 08 — Pruebas Limpias (TDD)

**📁 `08-Pruebas-Limpias-TDD/`**

### Contenido

- Tests como documentación ejecutable
- Una aserción por test (preferiblemente)
  - Si falla, sabes exactamente qué falló
  - Un concepto por test
- F.I.R.S.T. Principles:
  - **F**ast: los tests deben ser rápidos
  - **I**ndependent: no deben depender entre sí
  - **R**epeatable: deben funcionar en cualquier entorno
  - **S**elf-validating: resultado booleano (pass/fail)
  - **T**imely: escritos justo antes del código de producción
- TDD: ciclo Red-Green-Refactor
  - **Red**: escribe un test que falla
  - **Green**: escribe el código mínimo para que pase
  - **Refactor**: mejora el código manteniendo los tests verdes
- Estructura de un test limpio: Given-When-Then
  - Given (contexto)
  - When (acción)
  - Then (verificación)
- Tests de unidad vs integración vs aceptación
- Mocks: cuándo usarlos, cuándo evitarlos
- Cobertura de código: mito y realidad
  - 100% de cobertura no significa 100% de calidad
  - Cobertura de condiciones y rutas
- Naming de tests: `shouldReturnTotalWhenAddingItems`
- Refactorizar tests legacy: convertir tests acoplados en tests limpios

### Archivos
- `clase.md`: TDD, FIRST, Given-When-Then, estructura de tests
- `ejercicio.md`: Aplicar TDD para desarrollar calculadora de descuentos
- `respuesta.md`: Tests TDD + código de producción refactorizado
- `cuestionario.md`: 10 preguntas sobre pruebas limpias y TDD

---

## Módulo 09 — Clases

**📁 `09-Clases/`**

### Contenido

- Clases pequeñas: la primera regla de las clases
  - Si no puedes describirla en 25 palabras sin usar "y" o "o", es muy grande
- SRP (Single Responsibility Principle) aplicado a clases
  - Una clase, una responsabilidad
  - Pregunta clave: "¿cuál es la razón para cambiar?"
  - Si hay más de una razón, divídela
- Cohesión: todas las variables deben ser usadas por todos los métodos
  - Cohesión alta = buena
  - Cohesión baja = dividir
  - Métodos que solo usan una variable deberían estar en otra clase
- Organización de la clase:
  - Variables estáticas
  - Variables de instancia
  - Constructores
  - Métodos públicos (API)
  - Métodos privados (implementación)
  - Privados cerca de donde se usan
- Organización en Spring:
  - `@Service`: lógica de negocio
  - `@Repository`: acceso a datos
  - `@Controller`: endpoints
  - `@Component`: utilidades
- Clases de dominio anémicas: DTOs sin comportamiento
  - Anémica: solo getters/setters
  - Rica: comportamiento + datos
- Refactorizar clase Dios de 1000+ líneas en 10 clases cohesivas

### Archivos
- `clase.md`: Clases pequeñas, SRP, cohesión, organización
- `ejercicio.md`: Refactorizar clase `ReportGenerator` (1200 líneas) en clases cohesivas
- `respuesta.md`: 10-12 clases pequeñas, cohesivas, con responsabilidades únicas
- `cuestionario.md`: 8 preguntas sobre clases

---

## Módulo 10 — Proyecto Final + Simulación de Entrevista

**📁 `10-Proyecto-Final-Entrevista/`**

### Contenido

#### Proyecto Final (70% nota)
- Aplicación legacy de gestión de biblioteca (Spring Boot + JPA)
- Refactorizar aplicando todos los principios de Clean Code:
  - Nombres significativos
  - Funciones pequeñas (máximo 20 líneas)
  - Sin efectos secundarios
  - Comentarios necesarios (solo)
  - Formato consistente
  - Manejo de errores con excepciones
  - Sin nulls
  - Tests limpios (FIRST + Given-When-Then)
  - Clases pequeñas y cohesivas
  - Adapters para integraciones externas
- Requisitos:
  - Cobertura de pruebas > 80%
  - Checkstyle sin errores
  - PMD sin violaciones mayores
  - Código revisado por pares (code review en vivo)

#### Simulación de Entrevista Técnica (30% nota)
- 10 ejercicios de entrevista técnica sobre Clean Code:
  1. ¿Qué es código limpio para ti? Da ejemplos
  2. ¿Por qué los nombres son importantes? Refactoriza estos nombres
  3. Escribe una función limpia para validar una dirección
  4. ¿Cuándo está justificado un comentario? ¿Cuándo no?
  5. Explica la Ley de Demeter con un ejemplo
  6. ¿Por qué no debes retornar null? Alternativas
  7. ¿Cómo integrarías una API externa limpiamente?
  8. Escribe un test limpio siguiendo FIRST
  9. ¿Cómo decidirías si una clase debe dividirse?
  10. ¿Qué trade-offs hay al aplicar Clean Code en proyectos legacy?
- 50 preguntas tipo (5 categorías: Nombres, Funciones, Comentarios, Errores, Clases)
- Escenarios:
  - Junior: reglas básicas, ejemplos simples
  - Semi-senior: refactorización y diseño
  - Senior: patrones, trade-offs, arquitectura
  - Tech Lead: estándares de equipo, reviews, métricas

### Archivos
- `clase.md`: Presentación proyecto final, rúbrica, guía de entrevista
- `ejercicio.md`: Proyecto final (Biblioteca Legacy)
- `respuesta.md`: Proyecto completo refactorizado
- `cuestionario.md`: 50 preguntas de entrevista técnica

---

## Resumen del Calendario

| Semana | Día | Módulo | Tema |
|---|---|---|---|
| 1 | Lun | M01 | Introducción a Clean Code |
| 1 | Mar | M02 | Nombres Significativos |
| 1 | Mié | M03 | Funciones |
| 1 | Jue | M04 | Comentarios y Formato |
| 1 | Vie | M05 | Objetos y Estructuras de Datos |
| 2 | Lun | M06 | Manejo de Errores |
| 2 | Mar | M07 | Límites e Integración |
| 2 | Mié | M08 | Pruebas Limpias (TDD) |
| 2 | Jue | M09 | Clases |
| 2 | Vie | M10 | Proyecto Final + Simulación de Entrevista |

---

## Criterios de Evaluación

| Aspecto | Peso | Descripción |
|---|---|---|
| Ejercicios de módulo | 30% | 9 ejercicios entregados (uno por módulo 01-09) |
| Participación en clase | 10% | Code reviews, discusiones, refactorizaciones grupales |
| Proyecto Final | 40% | Refactorización de aplicación legacy |
| Simulación Entrevista | 20% | Ejercicios y preguntas de entrevista técnica |

### Condiciones de aprobación
- Nota final ≥ 70/100
- Proyecto final entregado y funcional
- Asistencia ≥ 80%

---

## Rúbrica del Proyecto Final

| Criterio | Excelente (100%) | Bueno (75%) | Suficiente (50%) | Insuficiente (0%) |
|---|---|---|---|---|
| Nombres | Nombres revelan intención, consistentes | 1-2 nombres mejorables | Varios nombres confusos | Nombres sin significado |
| Funciones | < 20 líneas, 1 responsabilidad, sin efectos secundarios | < 30 líneas, 1 responsabilidad | > 40 líneas o efectos secundarios | Funciones largas, múltiples responsabilidades |
| Comentarios | Solo comentarios necesarios | 1-2 comentarios ruido | Varios comentarios innecesarios | Código comentado, ruido excesivo |
| Formato | Consistente, formateador automático | Pequeñas inconsistencias | Inconsistencias notables | Sin formato, mezcla de estilos |
| Errores | Excepciones, sin nulls, Optional | Mayoría manejo correcto | Algunos nulls o códigos de error | Códigos de error, nulls generalizados |
| Tests | FIRST, Given-When-Then, cobertura > 80% | FIRST parcial, cobertura > 60% | Tests frágiles, cobertura > 40% | Sin tests o cobertura < 40% |
| Clases | Pequeñas, cohesivas, SRP | Clases mayormente cohesivas | 1-2 clases grandes | Clases Dios, sin cohesión |

---

## Recursos

### Libros
- **Clean Code: A Handbook of Agile Software Craftsmanship** — Robert C. Martin (2008)
- **The Clean Coder: A Code of Conduct for Professional Programmers** — Robert C. Martin (2011)
- **Clean Architecture: A Craftsman's Guide to Software Structure and Design** — Robert C. Martin (2017)
- **Refactoring: Improving the Design of Existing Code** — Martin Fowler (2da edición, 2018)
- **Working Effectively with Legacy Code** — Michael Feathers (2004)

### Artículos y Referencias
- [Clean Code Summary (Robert C. Martin)](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf20d2)
- [Code Smells (Martin Fowler)](https://martinfowler.com/bliki/CodeSmell.html)
- [Boy Scout Rule (Uncle Bob)](https://www.oreilly.com/library/view/97-things-every/9780596809515/ch08.html)

### Herramientas
- SonarLint — análisis estático en IDE
- Checkstyle — estilo de código
- PMD — análisis de código
- JUnit 5 + Mockito — pruebas unitarias
- Spotless / Prettier — formateo automático
- IntelliJ IDEA — refactorizaciones automáticas

### Videos Recomendados
- **"Clean Code: Fundamentals"** — Robert C. Martin (Clean Coders)
- **"Clean Code: Functions"** — Robert C. Martin (Clean Coders)
- **"TDD, Where Did It All Go Wrong"** — Ian Cooper (YouTube)

---

## Disclaimer

Este temario está diseñado para ser intensivo y práctico. Los alumnos deben tener conocimientos previos de Java y POO. Se espera que los alumnos tengan al menos 1 año de experiencia en desarrollo de software. Si no cumples con estos requisitos, contacta al instructor para material de nivelación antes del inicio del curso.

---

*Documento generado por SASF — Junio 2026*

