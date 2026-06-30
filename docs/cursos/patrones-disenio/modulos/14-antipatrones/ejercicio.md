---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Eliminar Singleton Mal Usado

El siguiente código usa Singleton para un servicio de pagos. Refactoriza para usar Dependency Injection:

```java
public class PagoService {
    private static final PagoService INSTANCIA = new PagoService();
    private PagoService() { }
    public static PagoService getInstancia() { return INSTANCIA; }
    public void procesarPago(Pedido p, double monto) { /* ... */ }
}

public class PedidoController {
    public void crearPedido(Pedido p) {
        PagoService ps = PagoService.getInstancia();
        ps.procesarPago(p, p.getTotal());
    }
}
```

Refactoriza para que `PagoService` sea inyectado (simulando Spring o DI manual).

---

## Ejercicio 4: Eliminar Duplicación (DRY) con Template Method

El siguiente código tiene duplicación en tres procesos similares. Aplica Template Method para eliminar la duplicación:

```java
public class ProcesarPedidoNormal {
    public void ejecutar(Pedido p) {
        System.out.println("Validando pedido...");
        System.out.println("Calculando impuestos normales...");
        System.out.println("Procesando pago...");
        System.out.println("Enviando confirmación...");
    }
}

public class ProcesarPedidoExpress {
    public void ejecutar(Pedido p) {
        System.out.println("Validando pedido express...");
        System.out.println("Calculando impuestos express...");
        System.out.println("Procesando pago express...");
        System.out.println("Enviando confirmación express...");
        System.out.println("Notificando prioridad...");
    }
}

public class ProcesarPedidoInternacional {
    public void ejecutar(Pedido p) {
        System.out.println("Validando pedido internacional...");
        System.out.println("Calculando impuestos aduana...");
        System.out.println("Procesando pago internacional...");
        System.out.println("Enviando confirmación...");
        System.out.println("Generando documentación aduana...");
    }
}
```

---

## Ejercicio 5: Code Review — Detectar y Corregir Anti-patrones

Realiza un code review del siguiente código. Identifica al menos 5 anti-patrones y propón correcciones:

```java
public class TodoEnUno {
    private static TodoEnUno instancia;
    private List<String> datos = new ArrayList<>();

    private TodoEnUno() { }

    public static TodoEnUno get() {
        if (instancia == null) instancia = new TodoEnUno();
        return instancia;
    }

    public void ejecutarTodo() {
        Scanner sc = new Scanner(System.in);
        System.out.println("Ingrese opción: 1-crear 2-leer 3-actualizar 4-eliminar 5-salir");
        int op = sc.nextInt();
        if (op == 1) {
            System.out.println("Ingrese dato:");
            String d = sc.next();
            datos.add(d);
            try {
                Connection c = DriverManager.getConnection("jdbc:h2:mem:test");
                c.createStatement().execute("INSERT INTO datos VALUES('" + d + "')");
                c.close();
            } catch (Exception e) { System.out.println("Error BD"); }
            System.out.println("Dato creado. Enviando email...");
            System.out.println("Email enviado a admin@empresa.com");
        } else if (op == 2) { /* similar */ }
        // ... más opciones
    }
}
```
