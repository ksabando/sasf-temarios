---
sidebar_label: "Clase"
---

# Módulo 07 — Chain of Responsibility y Command

## Chain of Responsibility

Permite pasar una petición a través de una cadena de handlers. Cada handler decide si procesa la petición o la pasa al siguiente.

### Estructura

```
┌──────────────────┐
│   <<abstract>>    │
│     Handler      │
├──────────────────┤
│ - next: Handler  │
│ + setNext(h)     │
│ + handle(req)    │◄── método abstracto
└──────────────────┘
         ▲
         │
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  HandlerConcreto1│  │  HandlerConcreto2│  │  HandlerConcreto3│
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ + handle(req)    │  │ + handle(req)    │  │ + handle(req)    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Ejemplo: Validación de Formularios

```java
public abstract class Validador {
    protected Validador siguiente;

    public Validador setSiguiente(Validador siguiente) {
        this.siguiente = siguiente;
        return siguiente;
    }

    public abstract void validar(Formulario formulario);

    protected void siguiente(Formulario f) {
        if (siguiente != null) {
            siguiente.validar(f);
        }
    }
}

public class Formulario {
    public String nombre;
    public String email;
    public int edad;
    public String telefono;
}

// Handlers concretos
public class ValidadorNoNulo extends Validador {
    public void validar(Formulario f) {
        if (f.nombre == null || f.nombre.isBlank()) {
            throw new IllegalArgumentException("Nombre es obligatorio");
        }
        if (f.email == null || f.email.isBlank()) {
            throw new IllegalArgumentException("Email es obligatorio");
        }
        siguiente(f);
    }
}

public class ValidadorEmail extends Validador {
    public void validar(Formulario f) {
        if (!f.email.contains("@")) {
            throw new IllegalArgumentException("Email inválido");
        }
        siguiente(f);
    }
}

public class ValidadorEdad extends Validador {
    public void validar(Formulario f) {
        if (f.edad < 18) {
            throw new IllegalArgumentException("Debe ser mayor de edad");
        }
        siguiente(f);
    }
}

// Uso
Validador cadena = new ValidadorNoNulo();
cadena.setSiguiente(new ValidadorEmail())
      .setSiguiente(new ValidadorEdad());

Formulario f = new Formulario();
f.nombre = "Juan";
f.email = "juan@email.com";
f.edad = 25;
cadena.validar(f); // pasa todas las validaciones
```

### Chain en Spring

```java
// SecurityFilterChain
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .requestMatchers("/public/**").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(new MiFiltro(), UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

### Chain vs Decorator

| Aspecto | Chain of Responsibility | Decorator |
|---------|------------------------|-----------|
| Flujo | Un handler procesa y pasa al siguiente | Cada capa envuelve y modifica |
| Terminación | Puede terminar en cualquier punto | Siempre pasa por todas las capas |
| Propósito | Desacoplar emisor de receptor | Agregar responsabilidades |
| Control | El handler decide si continuar | La envoltura siempre continúa |

## Command

Encapsula una solicitud como un objeto, permitiendo parametrizar clientes, hacer colas, logging y deshacer operaciones.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐
│   <<interface>>   │       │    Invoker       │
│     Command      │       ├──────────────────┤
├──────────────────┤       │ - command        │
│ + execute()      │       │ + setCommand()   │
└──────────────────┘       │ + executeCmd()   │
         ▲                 └──────────────────┘
         │
┌──────────────────┐       ┌──────────────────┐
│  CommandConcreto │──────▷│    Receiver      │
├──────────────────┤       ├──────────────────┤
│ - receiver       │       │ + accion()       │
│ + execute()      │       └──────────────────┘
└──────────────────┘
```

### Ejemplo: Operaciones Bancarias

```java
// Receiver
public class CuentaBancaria {
    private double saldo;

    public CuentaBancaria(double saldoInicial) {
        this.saldo = saldoInicial;
    }

    public void depositar(double monto) {
        saldo += monto;
        System.out.println("Depósito: +$" + monto + " (saldo: $" + saldo + ")");
    }

    public void retirar(double monto) {
        if (monto > saldo) throw new RuntimeException("Saldo insuficiente");
        saldo -= monto;
        System.out.println("Retiro: -$" + monto + " (saldo: $" + saldo + ")");
    }

    public double getSaldo() { return saldo; }
}

// Command interface
public interface Comando {
    void ejecutar();
    void deshacer();
}

// Commands concretos
public class DepositarComando implements Comando {
    private CuentaBancaria cuenta;
    private double monto;

    public DepositarComando(CuentaBancaria cuenta, double monto) {
        this.cuenta = cuenta;
        this.monto = monto;
    }

    public void ejecutar() { cuenta.depositar(monto); }
    public void deshacer() { cuenta.retirar(monto); }
}

public class RetirarComando implements Comando {
    private CuentaBancaria cuenta;
    private double monto;

    public RetirarComando(CuentaBancaria cuenta, double monto) {
        this.cuenta = cuenta;
        this.monto = monto;
    }

    public void ejecutar() { cuenta.retirar(monto); }
    public void deshacer() { cuenta.depositar(monto); }
}

// Invoker
public class GestorTransacciones {
    private List<Comando> historial = new ArrayList<>();

    public void ejecutarComando(Comando comando) {
        comando.ejecutar();
        historial.add(comando);
    }

    public void deshacerUltimo() {
        if (!historial.isEmpty()) {
            Comando ultimo = historial.remove(historial.size() - 1);
            ultimo.deshacer();
        }
    }
}

// Uso
CuentaBancaria cuenta = new CuentaBancaria(1000);
GestorTransacciones gestor = new GestorTransacciones();

gestor.ejecutarComando(new DepositarComando(cuenta, 500));
gestor.ejecutarComando(new RetirarComando(cuenta, 200));
gestor.deshacerUltimo(); // deshace el retiro
System.out.println("Saldo final: $" + cuenta.getSaldo());
```

### Command en JDK

```java
// Runnable es un Command
Runnable tarea = () -> System.out.println("Ejecutando tarea");
new Thread(tarea).start();

// ActionListener en Swing
Action comando = new AbstractAction() {
    public void actionPerformed(ActionEvent e) {
        System.out.println("Comando ejecutado");
    }
};
```

### Command en Spring

```java
@Async // ejecuta el comando de forma asíncrona
public void procesarPago(Pago pago) {
    // lógica de pago
}
```

### Command + Memento = Undo/Redo

La combinación de Command (para encapsular operaciones) y Memento (para capturar estado) permite implementar sistemas completos de deshacer/rehacer.
