---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Prototype para Templates de Notificaciones

Implementa un sistema de plantillas de notificaciones usando Prototype:

- `PlantillaNotificacion` con: asunto, cuerpo, remitente, destinatarios
- Método `clone()` que haga copia profunda (deep copy) de la lista de destinatarios
- Una fábrica de plantillas preconfiguradas: "Bienvenida", "Promoción", "Alerta"
- El usuario puede tomar una plantilla, clonarla y personalizarla

---

## Ejercicio 4: Builder Fluent para Consultas SQL

Implementa un Builder Fluent para construir consultas SQL de forma segura:

```java
// Ejemplo de uso esperado
Query query = new QueryBuilder()
    .select("id", "nombre", "email")
    .from("usuarios")
    .where("activo = true")
    .orderBy("nombre", "ASC")
    .limit(10)
    .build();

// Resultado: SELECT id, nombre, email FROM usuarios WHERE activo = true ORDER BY nombre ASC LIMIT 10
```

Requisitos:
- Prevenir inyección SQL escapando valores
- Soporte para JOINs
- Método `build()` que genere la cadena SQL final
