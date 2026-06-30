---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Flyweight para Árboles en un Bosque

Implementa un renderizador de bosque usando Flyweight para compartir datos comunes de árboles:

- **Estado intrínseco** (compartido): tipo de árbol (Roble, Pino, Sauce), textura, color
- **Estado extrínseco** (no compartido): coordenadas (x, y), altura

Crea un bosque con 1000 árboles aleatorios. Muestra cuántos objetos únicos se crearon.

---

## Ejercicio 4: Proxy de Protección para Documentos

Implementa un sistema de gestión de documentos con control de acceso:

- Interfaz `Documento` con métodos: `leer()`, `escribir(String contenido)`
- `DocumentoReal`: implementa la lógica real
- `ProxyDocumento`: verifica permisos según el rol del usuario (ADMIN, EDITOR, LECTOR)
  - ADMIN: puede leer y escribir
  - EDITOR: puede leer y escribir
  - LECTOR: solo puede leer

Crea un manejador de sesión que asigne roles a usuarios y demuestra el control de acceso.
