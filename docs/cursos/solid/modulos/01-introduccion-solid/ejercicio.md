---
sidebar_label: "Ejercicio"
---

## Ejercicio 1: Calculadora Universal

```java
public class Calculadora {

    public void procesar(String operacion, String formato) {
        Scanner sc = new Scanner(System.in);

        if (operacion.equals("SUMA")) {
            System.out.println("Ingrese primer número:");
            double a = sc.nextDouble();
            System.out.println("Ingrese segundo número:");
            double b = sc.nextDouble();
            double r = a + b;
            if (formato.equals("CONSOLA")) {
                System.out.println("Resultado: " + r);
            } else if (formato.equals("ARCHIVO")) {
                try (FileWriter fw = new FileWriter("resultado.txt")) {
                    fw.write("Resultado: " + r);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            } else if (formato.equals("JSON")) {
                System.out.println("{\"resultado\": " + r + "}");
            }
        } else if (operacion.equals("RESTA")) {
            // Similar...
        } else if (operacion.equals("MULTIPLICACION")) {
            // Similar...
        } else if (operacion.equals("DIVISION")) {
            // Similar...
        }
        sc.close();
    }

    public static void main(String[] args) {
        Calculadora calc = new Calculadora();
        calc.procesar("SUMA", "CONSOLA");
    }
}
```

**Preguntas:**
1. ¿Cuántas responsabilidades tiene este método?
2. Si quieres agregar la operación POTENCIA, ¿qué debes modificar?
3. Si quieres agregar salida a XML, ¿qué debes modificar?
4. ¿Cómo probarías este código unitariamente?

---

## Ejercicio 2: Reporteador Monolítico

```java
public class Reporteador {

    private String titulo;
    private List<String> datos;
    private Connection conn;

    public Reporteador(String titulo, List<String> datos) {
        this.titulo = titulo;
        this.datos = datos;
        try {
            this.conn = DriverManager.getConnection(
                "jdbc:oracle:thin:@localhost:1521:XE", "user", "pass");
        } catch (SQLException e) {
            throw new RuntimeException("No se pudo conectar");
        }
    }

    public void generarReportePDF() {
        try {
            Document document = new Document();
            PdfWriter.getInstance(document,
                new FileOutputStream(titulo + ".pdf"));
            document.open();
            document.add(new Paragraph(titulo));
            for (String d : datos) {
                document.add(new Paragraph(d));
            }
            document.close();
            guardarEnBD();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void guardarEnBD() {
        String sql = "INSERT INTO reportes (titulo, fecha) VALUES (?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, titulo);
            ps.setDate(2, new java.sql.Date(System.currentTimeMillis()));
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void enviarPorEmail(String destinatario) {
        String sql = "SELECT * FROM reportes WHERE titulo = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, titulo);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                System.out.println("Enviando reporte " + titulo
                    + " a " + destinatario);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

**Preguntas:**
1. ¿Qué principios SOLID se violan aquí?
2. Si cambiamos de Oracle a PostgreSQL, ¿cuántas líneas cambian?
3. ¿Qué pasaría si queremos generar reportes en Excel además de PDF?
4. ¿Cómo aplicaría SRP para separar responsabilidades?

---

## Ejercicio 3: Servicio de Usuarios Todo-en-Uno

```java
public class UserService {

    private Map<String, User> users = new HashMap<>();

    public void register(String email, String password, String name) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Email inválido");
        }
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Contraseña debe tener 8+ caracteres");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Nombre requerido");
        }
        if (users.containsKey(email)) {
            throw new IllegalStateException("Usuario ya existe");
        }

        User user = new User(email, password, name);
        users.put(email, user);

        // Enviar email de bienvenida
        String asunto = "Bienvenido " + name;
        String cuerpo = "Gracias por registrarte. Tu contraseña es: " + password;
        EnviarEmail(email, asunto, cuerpo);

        // Registrar en log
        try (FileWriter fw = new FileWriter("auditoria.log", true)) {
            fw.write("Usuario registrado: " + email + " a las " + new Date() + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Enviar notificación SMS si aplica
        if (name.startsWith("VIP")) {
            EnviarSMS("+1234567890", "Usuario VIP registrado: " + name);
        }
    }

    private void EnviarEmail(String to, String subject, String body) {
        // Simulación de envío de email
        System.out.println("Email enviado a " + to + ": " + subject);
    }

    private void EnviarSMS(String number, String message) {
        // Simulación de envío de SMS
        System.out.println("SMS enviado a " + number + ": " + message);
    }

    public User findUser(String email) {
        return users.get(email);
    }

    public void deleteUser(String email) {
        users.remove(email);
        try (FileWriter fw = new FileWriter("auditoria.log", true)) {
            fw.write("Usuario eliminado: " + email + " a las " + new Date() + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

**Preguntas:**
1. Enumera todas las responsabilidades de `UserService`.
2. Si queremos cambiar el método de envío de email (de simulación a AWS SES), ¿qué afecta?
3. Si queremos cambiar el logging de archivo a Log4j, ¿qué afecta?
4. ¿Cómo refactorizarías aplicando SRP?

---

## Ejercicio 4: Analiza tu Propio Código

Revisa un proyecto personal o laboral que hayas escrito recientemente y busca:

1. **Una clase que tenga más de 300 líneas.** ¿Qué responsabilidades tiene?
2. **Un método con más de 30 líneas.** ¿Cuántas cosas hace? ¿Cuál es su complejidad ciclomática?
3. **Una clase que instancie directamente dependencias** (new X()) en lugar de recibirlas.
4. **Un switch/if-else con más de 3 ramas.** ¿Qué pasa si agregas un caso nuevo?

Responde en una tabla como esta:

| Clase | Líneas | Responsabilidades | Violación | Prioridad |
|-------|--------|-------------------|-----------|-----------|
| MiClase.java | 450 | Validación, persistencia, notificación | SRP, DIP | ALTA |
| ... | ... | ... | ... | ... |

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| Identificar correctamente las violaciones (al menos 3 por ejercicio) | 4 pts |
| Clasificar prioridades adecuadamente | 2 pts |
| Proponer mejoras viables | 2 pts |
| Análisis de código propio (Ejercicio 4) | 2 pts |
| **Total** | **10 pts** |

---

## Entrega

Sube tus respuestas a la rama `modulo-01` del repositorio del curso.
Archivo: `01-Introduccion-SOLID/ejercicio-resuelto.md`
