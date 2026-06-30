---
sidebar_label: "Clase"
---

## Historia: Robert C. Martin y el Origen de SOLID

Robert C. Martin comenzó a formular estos principios en los años 90 mientras trabajaba como
consultor en proyectos de software que fracasaban por mala arquitectura. En 2000, presentó
los primeros cinco principios en su artículo "Design Principles and Design Patterns".
Posteriormente, Michael Feathers acuñó el acrónimo SOLID.

Martin observó que los equipos de desarrollo caían repetidamente en los mismos anti-patrones:
clases que hacían demasiado, código duplicado, acoplamiento extremo y sistemas que eran
imposibles de probar.

---

## El Problema: Código Espagueti (Spaghetti Code)

El código espagueti es un estilo de programación caracterizado por una estructura de control
enmarañada, con saltos entre diferentes partes del código, responsabilidades mezcladas y
lógica difícil de seguir. Es el resultado de aplicar parches sobre parches sin una arquitectura clara.

### Señales de Alarma (Code Smells)

Antes de aprender SOLID, debes aprender a identificar cuándo el código huele mal:

1. **God Classes (Clases Dios):** Una clase que lo hace todo.
2. **Long Method (Métodos Largos):** Métodos que abarcan cientos de líneas.
3. **Tight Coupling (Acoplamiento Excesivo):** Clases que dependen de muchas otras.
4. **Fat Interfaces (Interfaces Infladas):** Interfaces con métodos que no se implementan.
5. **Shotgun Surgery:** Un cambio en una clase obliga a cambiar muchas otras.
6. **Feature Envy:** Un método de una clase usa excesivamente datos de otra.
7. **Duplicated Code:** El mismo código aparece en múltiples lugares.
8. **Switch Statements:** Switches gigantes que violan OCP.

---

## Proyecto Base: Sistema de Nóminas Legacy

Vamos a trabajar con un sistema de nóminas legacy. Es un ejemplo clásico de código espagueti.
Observa el siguiente fragmento:

```java
public class NominasManager {

    private Connection connection;

    public NominasManager() {
        try {
            this.connection = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/nominas", "root", "1234");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void procesarNomina(String tipoEmpleado, double salarioBase,
                               double horasExtras, double deducciones,
                               String departamento) {
        // Validaciones
        if (salarioBase <= 0) {
            System.out.println("Error: Salario inválido");
            return;
        }
        if (tipoEmpleado == null || tipoEmpleado.isEmpty()) {
            System.out.println("Error: Tipo de empleado requerido");
            return;
        }

        // Cálculo de salario
        double salarioNeto = 0;
        if (tipoEmpleado.equals("PERMANENTE")) {
            double bonoAntiguedad = salarioBase * 0.05;
            double bonoTransporte = 50000;
            salarioNeto = salarioBase + bonoAntiguedad + bonoTransporte
                          + horasExtras * 1.5 - deducciones;
        } else if (tipoEmpleado.equals("TEMPORAL")) {
            salarioNeto = salarioBase + horasExtras * 1.2 - deducciones;
        } else if (tipoEmpleado.equals("CONTRATISTA")) {
            double iva = salarioBase * 0.19;
            salarioNeto = salarioBase - iva - deducciones;
        } else if (tipoEmpleado.equals("PRACTICANTE")) {
            double subsidio = 20000;
            salarioNeto = salarioBase + subsidio - deducciones;
        } else {
            System.out.println("Tipo de empleado no soportado");
            return;
        }

        // Persistencia en BD
        String sql = "INSERT INTO nominas (empleado, salario, fecha) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, tipoEmpleado);
            ps.setDouble(2, salarioNeto);
            ps.setDate(3, new java.sql.Date(System.currentTimeMillis()));
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // Envío de notificación
        if (salarioNeto > 1000000) {
            System.out.println("Enviando notificación a gerencia...");
            // Aquí iría lógica de envío de email
        }
        System.out.println("Nómina procesada para: " + tipoEmpleado);
        System.out.println("Salario neto: $" + salarioNeto);
    }

    public void generarReporte(String mes, String año) {
        String sql = "SELECT * FROM nominas WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, mes);
            ps.setString(2, año);
            ResultSet rs = ps.executeQuery();
            System.out.println("=== REPORTE DE NÓMINAS ===");
            double total = 0;
            while (rs.next()) {
                String emp = rs.getString("empleado");
                double sal = rs.getDouble("salario");
                System.out.println(emp + ": $" + sal);
                total += sal;
            }
            System.out.println("TOTAL: $" + total);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void enviarPagos() {
        String sql = "SELECT * FROM nominas WHERE pagado = false";
        try (Statement st = connection.createStatement()) {
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) {
                int id = rs.getInt("id");
                double salario = rs.getDouble("salario");
                String banco = rs.getString("banco");
                String cuenta = rs.getString("cuenta");
                System.out.println("Enviando pago de $" + salario
                    + " a cuenta " + cuenta + " en " + banco);
                // Llamada a API bancaria simulada
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

### Violaciones Identificables

- **SRP:** La clase maneja validación, cálculo, persistencia, notificación y reportes.
- **OCP:** Para agregar un nuevo tipo de empleado, debemos modificar el `if` gigante.
- **DIP:** Depende directamente de `DriverManager` y la conexión MySQL.
- **Acoplamiento:** Conexión a BD instanciada directamente en el constructor.
- **Sin manejo de errores:** Solo imprime stack traces.
- **System.out.println** como única estrategia de logging.

---

## Métricas de Calidad

### Acoplamiento (Coupling)

El acoplamiento mide cuánto depende una clase de otras. Bajo acoplamiento es deseable.

**Alto acoplamiento:**
```java
public class Procesador {
    private MySQLDatabase db = new MySQLDatabase();
    private EmailService email = new EmailService();
    private PDFGenerator pdf = new PDFGenerator();
    private ExcelExporter excel = new ExcelExporter();
    private Logger logger = new FileLogger();
}
```

**Bajo acoplamiento:**
```java
public class Procesador {
    private final Database db;
    private final Notifier notifier;

    public Procesador(Database db, Notifier notifier) {
        this.db = db;
        this.notifier = notifier;
    }
}
```

### Cohesión (Cohesion)

La cohesión mide qué tan relacionadas están las responsabilidades dentro de una clase.
Alta cohesión es deseable. Una clase con alta cohesión tiene métodos que trabajan
juntos para un propósito específico.

**Baja cohesión:**
```java
public class Utilidades {
    public double calcularIVA(double monto) { ... }
    public void enviarEmail(String to, String msg) { ... }
    public String generarPDF(String html) { ... }
    public void conectarBD() { ... }
    public void dibujarGrafico(int[] datos) { ... }
}
```

**Alta cohesión:**
```java
public class CalculadorImpuestos {
    public double calcularIVA(double monto) { ... }
    public double calcularISR(double salario) { ... }
    public double calcularIEPS(double monto) { ... }
}
```

### Complejidad Ciclomática (Cyclomatic Complexity)

Mide la cantidad de caminos independientes en el código. Creada por Thomas J. McCabe en 1976.
Se calcula contando puntos de decisión: `if`, `for`, `while`, `case`, `catch`, `&&`, `||`.

**Fórmula:** M = E - N + 2P (donde E = aristas, N = nodos, P = componentes conectados)

Regla práctica: por cada `if/else`, `switch case`, `for`, `while`, suma 1.

- **1-10:** Baja complejidad (bien)
- **11-20:** Complejidad moderada (revisar)
- **21-50:** Alta complejidad (refactorizar urgente)
- **50+:** Inmantenible (reescribir)

El método `procesarNomina` del ejemplo tiene una complejidad ciclomática de 7 solo por los
condicionales, más 1 base = 8. Aunque no es crítica, combinada con el resto de la clase
(que viola SRP) es insostenible.

---

## Herramientas de Análisis

### SonarLint
Plugin disponible para IntelliJ IDEA, VS Code y Eclipse. Analiza tu código en tiempo real
y te advierte sobre code smells, violaciones de principios y vulnerabilidades.

### IntelliJ Inspections
IntelliJ IDEA tiene inspecciones integradas que detectan:
- Clases demasiado grandes
- Métodos demasiado complejos
- Parámetros excesivos
- Código duplicado
- Dependencias circulares

### Ejercicio con SonarLint
1. Instala SonarLint en tu IDE.
2. Abre el proyecto de nóminas legacy.
3. Observa las advertencias: cada línea amarilla es una posible violación SOLID.
4. Categoriza cada advertencia según el principio que viola.

---

## Deuda Técnica (Technical Debt)

La deuda técnica es el costo implícito de tomar atajos en el desarrollo. Como la deuda
financiera, genera intereses: cada vez que necesitas modificar código mal escrito, pagas
más tiempo del necesario.

### Ciclo de la Deuda Técnica

1. **Tomas un atajo** ("lo arreglamos después")
2. **El código se vuelve complejo** (dificultad de entender)
3. **Los cambios son lentos** (cada modificación requiere descifrar el espagueti)
4. **Aparecen bugs** (efectos colaterales por no entender el código)
5. **Se acumula más deuda** (parches urgentes sobre código frágil)
6. **El equipo se bloquea** (el sistema no se puede modificar sin romperlo)

SOLID es la principal estrategia para evitar y pagar la deuda técnica.

### Costo del Cambio

```
Costo de cambiar algo
^
|                    Sin SOLID
|                   /
|                  /
|                 /
|                /
|               /   Con SOLID
|              /
|             /
|            /
|           /
|__________/__________________> Tiempo
```

Los sistemas que siguen SOLID tienen un costo de cambio que crece linealmente.
Los que no lo siguen tienen un costo de cambio que crece exponencialmente.

---

## Discusión Grupal: Identificando Violaciones

En equipo, revisen el código legacy de nóminas y respondan:

1. ¿Cuántas responsabilidades tiene `NominasManager`?
2. ¿Qué pasa si queremos agregar un tipo de empleado "EXTERNO"?
3. ¿Qué pasa si cambiamos de MySQL a PostgreSQL?
4. ¿Qué pasa si queremos cambiar el formato del reporte a PDF?
5. ¿Cómo probarías `procesarNomina` sin una BD real?
6. ¿Cuál es la complejidad ciclomática de `procesarNomina`?
7. ¿Qué principios SOLID se violan más evidentemente?
8. ¿Cómo medirías la cohesión de esta clase?
9. ¿Qué code smells identificas además de los mencionados?
10. ¿Qué pasaría si 3 desarrolladores trabajan simultáneamente en esta clase?

---

## Resumen del Módulo

| Concepto | Aprendizaje |
|----------|-------------|
| SOLID | Acrónimo de 5 principios de diseño |
| Spaghetti Code | Código sin estructura, difícil de mantener |
| Code Smells | Señales de alerta en el código |
| God Class | Clase que concentra demasiadas responsabilidades |
| Acoplamiento | Dependencia entre módulos (bajo = bueno) |
| Cohesión | Enfoque interno de una clase (alto = bueno) |
| Complejidad Ciclomática | Caminos independientes en el código |
| Deuda Técnica | Costo futuro de atajos presentes |
| Proyecto Base | Sistema de nóminas legacy para refactorizar |

**Preparación para Módulo 02:** Identifica al menos 3 responsabilidades que deberían
separarse de `NominasManager`. El próximo módulo es SRP: exactamente de eso trata.
