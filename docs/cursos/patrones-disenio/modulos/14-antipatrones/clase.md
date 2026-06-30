---
sidebar_label: "Clase"
---

# Módulo 14 — Anti-patrones

## Introducción

Un **anti-patrón** es una solución común a un problema recurrente que parece correcta pero tiene consecuencias negativas. Conocer anti-patrones ayuda a **evitar malas prácticas** y a **detectarlas en code reviews**.

## 1. God Class (Clase Diosa)

Una clase que concentra demasiada responsabilidad, con cientos de métodos y miles de líneas.

### Síntomas
- Métodos no relacionados entre sí en la misma clase
- Más de 500 líneas
- Dependencias de太多 subsystems
- Dificultad para testear

### Ejemplo

```java
// ❌ God Class
public class SistemaService {
    public void procesarPedido(Pedido p) { /* lógica */ }
    public void enviarEmail(String to, String msg) { /* lógica */ }
    public void generarFactura(Pedido p) { /* lógica */ }
    public void conectarBaseDatos() { /* lógica */ }
    public void renderizarUI() { /* lógica */ }
    public void validarUsuario(User u) { /* lógica */ }
    public void calcularImpuestos(double m) { /* lógica */ }
    // 50+ métodos más...
}
```

### Solución
Aplicar **Single Responsibility** y dividir en clases especializadas:
- `PedidoService`
- `EmailService`
- `FacturaService`
- `DatabaseConfig`
- etc.

## 2. Spaghetti Code

Código sin estructura clara, con flujo de control difícil de seguir.

### Síntomas
- Gotos o lógica de control compleja y anidada
- Mezcla de concerns (lógica de negocio + UI + persistencia)
- Métodos extremadamente largos
- Dificultad para seguir el flujo

### Solución
Refactorizar aplicando patrones como **Strategy**, **Template Method**, **Command**.

## 3. Golden Hammer (Martillo de Oro)

Usar la misma solución para todos los problemas.

### Síntomas
- "Todo es un Singleton"
- "Todo es un Factory"
- Siempre usar la misma tecnología para cualquier problema
- Forzar patrones donde no se necesitan

### Ejemplo

```java
// ❌ Golden Hammer: Todo es Singleton
public class Calculadora {
    private static final Calculadora INSTANCIA = new Calculadora();
    private Calculadora() { }
    public static Calculadora getInstancia() { return INSTANCIA; }
    public int sumar(int a, int b) { return a + b; }
}
```

### Solución
Elegir el patrón según el problema, no aplicar el mismo siempre. Aplicar YAGNI y KISS.

## 4. Singleton Mal Usado

Usar Singleton cuando realmente se necesita otra cosa.

### Problemas
- Estado global oculto
- Dificultad para testing (difícil de mockear)
- Acoplamiento oculto entre componentes
- Dificultad para concurrencia

### Cuándo NO usar Singleton
- Para servicios que cambian de implementación
- Cuando necesitas diferentes instancias en tests
- Cuando el objeto tiene estado mutable compartido

### Alternativa
Usar **Dependency Injection**: el contenedor decide si es singleton o no.

```java
// ❌ Singleton mal usado
public class EmailService {
    private static final EmailService INST = new EmailService();
    private EmailService() { }
    public static EmailService getInst() { return INST; }
    public void enviar(String msg) { }
}

// ✅ Con DI
public class EmailService {
    public void enviar(String msg) { }
}

// El contenedor IoC decide el ciclo de vida
@Bean
@Scope("singleton") // o prototype según necesidad
public EmailService emailService() { return new EmailService(); }
```

## 5. Premature Abstraction

Crear interfaces y abstracciones antes de tener implementaciones múltiples.

### Síntomas
- Interfaces con una sola implementación
- Jerarquías de clases innecesarias
- "Por si acaso en el futuro..."
- Complejidad accidental

### Ejemplo

```java
// ❌ Premature Abstraction
public interface ICalculadora { int sumar(int a, int b); }
public class CalculadoraImpl implements ICalculadora {
    public int sumar(int a, int b) { return a + b; }
}
// Solo hay una implementación y nunca habrá otra
```

### Solución
Aplicar **YAGNI** (You Ain't Gonna Need It). Crear interfaces solo cuando tengas al menos 2 implementaciones concretas o cuando la interfaz sea parte de un contrato público.

## 6. Copy & Paste Programming (DRY Violation)

Duplicar código en lugar de abstraerlo.

### Síntomas
- Bloques de código idénticos en múltiples lugares
- Cambios requieren modificar N lugares
- Bugs corregidos en un lugar pero no en los duplicados

### Solución
Aplicar DRY (Don't Repeat Yourself). Extraer a métodos, clases o patrones como **Template Method**.

## 7. Poltergeist

Objetos temporales sin propósito real que solo aparecen y desaparecen.

### Síntomas
- Clases con un solo método que delega a otra clase
- Objetos creados solo para pasar parámetros
- "Clase mensajero" que solo transporta datos entre otras clases

### Solución
Eliminar la clase intermedia o fusionarla con la clase que realmente hace el trabajo.

## 8. Lava Flow

Código muerto o no utilizado que permanece en la base de código.

### Síntomas
- Código comentado
- Métodos no llamados
- Clases no utilizadas
- Parámetros obsoletos
- Código "por si acaso"

### Solución
Eliminar código muerto. Usar herramientas de cobertura y análisis estático.

## 9. Boat Anchor (Ancla de Barco)

Mantener dependencias y frameworks que no se usan.

### Síntomas
- Librerías en pom.xml que no se importan
- Configuración de frameworks no utilizados
- Código de infraestructura para funcionalidades no implementadas

### Solución
Auditar y eliminar dependencias no utilizadas.

## Checklist para Code Review

- [ ] ¿La clase tiene más de 300 líneas? → Posible God Class
- [ ] ¿El método tiene más de 30 líneas? → Refactorizar
- [ ] ¿Hay interfaces con una sola implementación? → Premature Abstraction
- [ ] ¿Hay singletons con estado mutable? → Singleton mal usado
- [ ] ¿Hay bloques de código duplicados? → Violación DRY
- [ ] ¿Hay código comentado? → Lava Flow
- [ ] ¿Hay dependencias no utilizadas? → Boat Anchor
- [ ] ¿Todos los patrones están justificados? → Golden Hammer
