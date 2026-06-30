---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Perfiles con múltiples configuraciones
Crear una aplicación con tres perfiles: `dev`, `test` y `prod`.
Cada perfil debe tener:
- Un `MessageService` diferente (implementación distinta por perfil)
- Diferente puerto del servidor (dev: 8080, test: 8081, prod: 80)
- Diferente nivel de logging (dev: DEBUG, test: INFO, prod: WARN)

**Requisitos**:
- Usar `application-dev.properties`, `application-test.properties`, `application-prod.properties`
- Endpoint `GET /api/perfil` que devuelva qué perfil está activo y el mensaje del servicio

---

## Ejercicio 4: Logging con SLF4J
Crear un servicio que realice operaciones aritméticas básicas (suma, resta, multiplicación, división) y registre logs en diferentes niveles:

```java
public class CalculadoraService {
    public int sumar(int a, int b)      // log.info
    public int restar(int a, int b)     // log.debug
    public int multiplicar(int a, int b) // log.trace
    public int dividir(int a, int b)    // log.warn si divisor es 0
}
```

**Requisitos**:
- Endpoint `GET /api/calcular?op=suma&a=10&b=5`
- Configurar logging.level.com.example=TRACE
- Ver todos los niveles en consola

---

## Ejercicio 5: logback-spring.xml con perfil
Crear un `logback-spring.xml` que:
- En perfil `dev`: log a consola con patrón coloreado, nivel DEBUG para la app
- En perfil `prod`: log a archivo rotativo, nivel INFO para la app, sin log en consola
- En perfil `test`: solo log en consola con nivel WARN

**Requisitos**:
- Rolling policy basada en tiempo (diario)
- Máximo 7 días de retención
- Logger específico para `com.example` con nivel por perfil
