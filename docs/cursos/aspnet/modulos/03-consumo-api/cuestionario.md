---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 1. Por que usar `IHttpClientFactory`?

**Respuesta:** Para administrar correctamente instancias de `HttpClient`, configurar clientes y evitar agotamiento de sockets.

---

### 2. Donde deberia vivir la logica de consumo de API?

**Respuesta:** En un servicio o client dedicado, no en controllers ni vistas.
