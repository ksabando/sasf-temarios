---
sidebar_label: "Ejercicio"
---

# Ejercicio M10 — Proyecto Final: Sistema de Biblioteca

## Contexto

Recibes una aplicación Spring Boot legacy de gestión de biblioteca. El código anterior fue escrito sin aplicar Clean Code. Tu tarea es refactorizarlo completamente.

## Código Legacy

### 1. Entidad (anémica, nombres confusos, todo público)

```java
package com.sasf.biblioteca.legacy;

import javax.persistence.*;
import java.util.*;

@Entity
@Table(name = "libros")
public class Libro {

    @Id
    @GeneratedValue
    public int id;
    public String t;          // título
    public String a;          // autor
    public String is;         // ISBN
    public int an;            // año publicación
    public String cat;        // categoría
    public String est;        // estado (DISPONIBLE, PRESTADO, RESERVADO)
    public int ej;            // ejemplares totales
    public int ed;            // ejemplares disponibles
    @ElementCollection
    public List<String> tags; // etiquetas
    public Date fa;           // fecha alta
    public Date fu;           // fecha ultima modificacion
}
```

### 2. Repositorio (raw types, SQL injection)

```java
package com.sasf.biblioteca.legacy;

import java.sql.*;
import java.util.*;

public class BD {

    private Connection con;

    public BD() {
        try {
            con = DriverManager.getConnection("jdbc:h2:mem:test", "sa", "");
        } catch (Exception e) {
            System.out.println("Error de conexion");
        }
    }

    public List buscar(String sql) {
        List res = new ArrayList();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) {
                Map m = new HashMap();
                m.put("id", rs.getInt("id"));
                m.put("t", rs.getString("t"));
                m.put("a", rs.getString("a"));
                m.put("is", rs.getString("is"));
                m.put("est", rs.getString("est"));
                res.add(m);
            }
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
        return res;
    }

    public int ejecutar(String sql) {
        try {
            Statement st = con.createStatement();
            return st.executeUpdate(sql);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return -1;
        }
    }
}
```

### 3. Servicio (god class, nulls, códigos de error, train wrecks)

```java
package com.sasf.biblioteca.legacy;

import java.util.*;

public class Servicio {

    private BD bd;

    public Servicio() {
        bd = new BD();
    }

    public String agregarLibro(String t, String a, String is, int an, String cat, int ej) {
        if (t == null || t.isEmpty()) return "ERROR: titulo vacio";
        if (a == null || a.isEmpty()) return "ERROR: autor vacio";
        if (is == null || is.isEmpty()) return "ERROR: isbn vacio";
        if (ej <= 0) return "ERROR: ejemplares debe ser positivo";

        String sql = "INSERT INTO libros (t, a, is, an, cat, est, ej, ed) VALUES ('"
            + t + "', '" + a + "', '" + is + "', " + an + ", '" + cat + "', 'DISPONIBLE', " + ej + ", " + ej + ")";
        int r = bd.ejecutar(sql);
        if (r > 0) {
            return "OK";
        } else {
            return "ERROR: no se pudo insertar";
        }
    }

    public List<Map> buscarLibros(String q) {
        List res = bd.buscar("SELECT * FROM libros WHERE t LIKE '%" + q + "%' OR a LIKE '%" + q + "%'");
        return res;
    }

    public String prestarLibro(int idLibro, int idUsuario, String fechaPrestamo, String fechaVencimiento) {
        List libros = bd.buscar("SELECT * FROM libros WHERE id = " + idLibro);
        if (libros.isEmpty()) return "ERROR: libro no encontrado";

        Map libro = (Map) libros.get(0);
        int ed = (int) libro.get("ed");
        if (ed <= 0) return "ERROR: no hay ejemplares disponibles";

        String est = (String) libro.get("est");
        if (!est.equals("DISPONIBLE") && !est.equals("PRESTADO")) return "ERROR: libro no disponible";

        String sqlPrestamo = "INSERT INTO prestamos (id_libro, id_usuario, fecha_prestamo, fecha_vencimiento, estado) VALUES ("
            + idLibro + ", " + idUsuario + ", '" + fechaPrestamo + "', '" + fechaVencimiento + "', 'ACTIVO')";
        bd.ejecutar(sqlPrestamo);

        bd.ejecutar("UPDATE libros SET ed = " + (ed - 1) + " WHERE id = " + idLibro);

        return "OK";
    }

    public String devolverLibro(int idPrestamo) {
        List prestamos = bd.buscar("SELECT * FROM prestamos WHERE id = " + idPrestamo);
        if (prestamos.isEmpty()) return "ERROR: prestamo no encontrado";

        Map prestamo = (Map) prestamos.get(0);
        int idLibro = (int) prestamo.get("id_libro");

        bd.ejecutar("UPDATE prestamos SET estado = 'DEVUELTO', fecha_devolucion = CURRENT_DATE WHERE id = " + idPrestamo);
        bd.ejecutar("UPDATE libros SET ed = ed + 1 WHERE id = " + idLibro);

        // Calcular multa si está vencido
        String fechaVenc = (String) prestamo.get("fecha_vencimiento");
        // TODO: calcular multa

        return "OK";
    }

    // +30 métodos más: reservar, cancelar, multas, reportes, etc. (~800 líneas total)
}
```

## Requisitos del Proyecto

Debes refactorizar creando una arquitectura limpia con:

### Capas

1. **Domain**: entidades con comportamiento (no anémicas)
2. **Repository**: acceso a datos con Spring Data JPA
3. **Service**: lógica de negocio con SRP
4. **Controller**: endpoints REST
5. **DTO**: objetos de transferencia
6. **Exception**: excepciones de dominio
7. **Adapter**: integraciones externas (ej. notificaciones)

### Funcionalidades a implementar

1. CRUD de libros (con búsqueda por título, autor, ISBN, categoría)
2. Préstamo y devolución de libros
3. Cálculo de multas por devolución tardía
4. Reserva de libros
5. Reportes (libros más prestados, usuarios morosos)
6. Notificaciones (email al usuario cuando un libro reservado está disponible)

### Entregables

1. Código fuente completo refactorizado
2. Tests unitarios (cobertura > 80%)
3. Tests de integración para repositorios
4. Archivo de configuración Checkstyle sin errores
5. Archivo de configuración PMD sin violaciones mayores
6. README con instrucciones de ejecución
7. Breve documento de decisiones técnicas (trade-offs, justificaciones)
