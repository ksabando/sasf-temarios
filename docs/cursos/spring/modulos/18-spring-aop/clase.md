---
sidebar_label: "Clase"
---

## 3. Definiendo un Aspecto

```java
@Aspect
@Component
public class LoggingAspect {

    @Before("execution(* com.sasf.servicio.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("Ejecutando: " + joinPoint.getSignature());
    }
}
```

`@Aspect` + `@Component` hacen que Spring reconozca la clase como un aspecto.

---

## 4. Tipos de Advice

### @Before — Se ejecuta antes del método

```java
@Before("execution(* com.sasf.servicio.Tienda.comprar(..))")
public void antesDeComprar() {
    System.out.println("Verificando stock...");
}
```

### @After — Se ejecuta después (finally)

```java
@After("execution(* com.sasf.servicio.Tienda.comprar(..))")
public void despuesDeComprar() {
    System.out.println("Compra finalizada (con éxito o error)");
}
```

### @AfterReturning — Se ejecuta si el método retorna sin error

```java
@AfterReturning(pointcut = "execution(* com.sasf.servicio.Tienda.comprar(..))",
                returning = "resultado")
public void alRetornar(Object resultado) {
    System.out.println("Compra exitosa: " + resultado);
}
```

### @AfterThrowing — Se ejecuta si el método lanza excepción

```java
@AfterThrowing(pointcut = "execution(* com.sasf.servicio.Tienda.comprar(..))",
               throwing = "ex")
public void alFallar(Exception ex) {
    System.err.println("Error en compra: " + ex.getMessage());
}
```

### @Around — Envuelve la ejecución completa

```java
@Around("execution(* com.sasf.servicio.Tienda.comprar(..))")
public Object medirTiempo(ProceedingJoinPoint pjp) throws Throwable {
    long inicio = System.currentTimeMillis();
    Object resultado = pjp.proceed();
    long duracion = System.currentTimeMillis() - inicio;
    System.out.println(pjp.getSignature() + " tardó " + duracion + " ms");
    return resultado;
}
```

---

## 5. Pointcut Expressions

| Expresión | Descripción |
|-----------|-------------|
| `execution(* com.sasf.servicio.*.*(..))` | Todos los métodos en `servicio` |
| `within(com.sasf.servicio..*)` | Todos los métodos en `servicio` y subpaquetes |
| `@annotation(org.springframework.transaction.annotation.Transactional)` | Métodos anotados con `@Transactional` |
| `args(String, Long)` | Métodos que reciben `String` y `Long` |
| `bean(miServicio)` | Métodos del bean con nombre `miServicio` |

### Pointcuts reutilizables

```java
@Pointcut("execution(* com.sasf.servicio.*.*(..))")
public void puntoCorteServicio() {}

@Before("puntoCorteServicio()")
public void advice1() {}

@After("puntoCorteServicio()")
public void advice2() {}
```

### Combinar pointcuts

```java
@Pointcut("execution(public * *(..))")
public void metodosPublicos() {}

@Pointcut("within(com.sasf.servicio..*)")
public void enServicio() {}

@Before("metodosPublicos() && enServicio()")
public void logPublicoServicio() {}
```

---

## 6. JoinPoint API

```java
@Before("execution(* com.sasf..*(..))")
public void info(JoinPoint jp) {
    jp.getSignature().getName();        // nombre del método
    jp.getSignature().getDeclaringType(); // clase
    jp.getArgs();                        // argumentos
    jp.getTarget();                      // objeto destino
    jp.getThis();                        // proxy
}
```

---

## 7. @Order para ordenar aspectos

```java
@Aspect
@Component
@Order(1)
public class LoggingAspect { ... }

@Aspect
@Component
@Order(2)
public class MetricAspect { ... }
```

Menor número = mayor prioridad (se ejecuta primero en `@Before`, último en `@After`).

---

## 8. CGLIB vs JDK Dynamic Proxy

| Proxy | Cuándo se usa |
|-------|---------------|
| **JDK Dynamic Proxy** | Por defecto. Solo funciona si el target implementa una interfaz |
| **CGLIB** | Si no hay interfaz, o si se configura `proxyTargetClass = true` |

```java
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AopConfig {}
```

Con Spring Boot 3.x, CGLIB es el proxy por defecto.

---

## Resumen

AOP permite separar preocupaciones transversales mediante aspectos. Los pointcuts definen dónde se aplican los advices (`@Before`, `@After`, `@Around`, etc.). Spring usa proxys (CGLIB o JDK) para tejer los aspectos en tiempo de ejecución.
