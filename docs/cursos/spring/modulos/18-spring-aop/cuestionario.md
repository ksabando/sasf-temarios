---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Spring AOP

**Pregunta 1:** ¿Qué es un Aspect en AOP?
**Respuesta:** Un módulo que encapsula un comportamiento transversal (cross-cutting concern), como logging, seguridad o transacciones.

**Pregunta 2:** ¿Cuál es la diferencia entre Join Point y Pointcut?
**Respuesta:** Join Point es un punto específico de ejecución (ej: un método). Pointcut es una expresión que selecciona uno o más Join Points.

**Pregunta 3:** ¿Qué anotación habilita el soporte de AOP en Spring?
**Respuesta:** `@EnableAspectJAutoProxy` en una clase de configuración.

**Pregunta 4:** ¿Cuál es la diferencia entre @Before y @Around?
**Respuesta:** `@Before` se ejecuta antes del método pero no puede controlar su ejecución. `@Around` envuelve completamente el método, puede modificar argumentos, cambiar el retorno o evitar la ejecución.

**Pregunta 5:** ¿Cómo se define un pointcut reutilizable?
**Respuesta:** Con `@Pointcut("execution(...)")` en un método sin implementación, y luego se referencia como `"nombreDelMetodo()"`.

**Pregunta 6:** ¿Qué diferencia hay entre @After y @AfterReturning?
**Respuesta:** `@After` se ejecuta siempre (como finally), incluso si hay excepción. `@AfterReturning` solo se ejecuta si el método retorna exitosamente.

**Pregunta 7:** ¿Qué interfaz se usa para acceder a los argumentos y firma del método desde un advice?
**Respuesta:** `JoinPoint` (o `ProceedingJoinPoint` para @Around, que extiende JoinPoint y agrega `proceed()`).

**Pregunta 8:** ¿Para qué sirve @Order en aspectos?
**Respuesta:** Para definir el orden de ejecución cuando múltiples aspectos aplican al mismo Join Point. Menor número = mayor prioridad.

**Pregunta 9:** ¿Cuándo usa Spring CGLIB en lugar de JDK Dynamic Proxy?
**Respuesta:** Cuando la clase target no implementa ninguna interfaz, o cuando se configura `proxyTargetClass = true`. En Spring Boot 3.x, CGLIB es el predeterminado.

**Pregunta 10:** ¿Qué hace pjp.proceed() en un @Around?
**Respuesta:** Ejecuta el método original (target). Si no se llama, el método nunca se ejecuta. Devuelve el resultado del método.

