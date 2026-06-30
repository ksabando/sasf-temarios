---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: @AfterThrowing

```java
@Aspect
@Component
public class ErrorAspect {

    private static final Logger log =
        LoggerFactory.getLogger(ErrorAspect.class);

    private final Map<Class<?>, Integer> contadorExcepciones = new ConcurrentHashMap<>();

    @AfterThrowing(
        pointcut = "execution(* com.sasf.servicio.*.*(..))",
        throwing = "ex")
    public void capturarError(JoinPoint jp, Exception ex) {
        String metodo = jp.getSignature().toShortString();
        log.error("[ERROR] Excepción en {}: {}", metodo, ex.getMessage(), ex);

        contadorExcepciones.merge(ex.getClass(), 1, Integer::sum);
        log.info("Total {}: {} ocurrencias",
            ex.getClass().getSimpleName(),
            contadorExcepciones.get(ex.getClass()));
    }
}
```

---

## Ejercicio 4: Pointcuts combinados y @Order

```java
@Aspect
@Component
public class PointcutComun {
    @Pointcut("execution(* com.sasf.servicio.*.*(..))")
    public void enServicio() {}
}

@Aspect
@Component
@Order(1)
public class SeguridadAspect {

    @Autowired
    private PointcutComun pc;

    @Before("pc.enServicio()")
    public void verificarPermisos(JoinPoint jp) {
        System.out.println("[SEGURIDAD] Verificando permisos para "
            + jp.getSignature().toShortString());
    }
}

@Aspect
@Component
@Order(2)
public class LoggingAspect {

    @Autowired
    private PointcutComun pc;

    @Before("pc.enServicio()")
    public void logAntes(JoinPoint jp) {
        System.out.println("[LOG] Ejecutando "
            + jp.getSignature().toShortString());
    }

    @After("pc.enServicio()")
    public void logDespues(JoinPoint jp) {
        System.out.println("[LOG] Finalizado "
            + jp.getSignature().toShortString());
    }
}
```

---

## Ejercicio 5: @ValidarParametros con @Around

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidarParametros {}

@Aspect
@Component
public class ParametroAspect {

    @Around("@annotation(ValidarParametros)")
    public Object validarParametros(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        for (Object arg : args) {
            if (arg instanceof String str) {
                if (str == null || str.isBlank()) {
                    throw new IllegalArgumentException(
                        "El parámetro String '" + arg
                        + "' en " + pjp.getSignature().toShortString()
                        + " no puede ser nulo o vacío");
                }
            }
        }
        return pjp.proceed();
    }
}

// Uso:
@Service
public class UsuarioServicio {

    @ValidarParametros
    public void crearUsuario(String nombre, String email, int edad) {
        System.out.println("Usuario creado: " + nombre);
    }
}
```

