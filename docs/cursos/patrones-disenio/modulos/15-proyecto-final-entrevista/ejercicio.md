---
sidebar_label: "Ejercicio"
---

### Ejercicio 3: Chain of Responsibility para Pipeline

Implementa una cadena de procesamiento con:
- `ValidadorNotificacion`: verifica email válido, mensaje no vacío
- `TransformadorMensaje`: convierte a HTML si es texto plano
- `EnriquecedorNotificacion`: añade tracking ID y timestamp
- `FiltroContenido`: bloquea palabras prohibidas

La cadena debe ejecutarse en orden y detenerse si algún paso falla.

---

### Ejercicio 4: Decorator para Canales

Implementa decoradores para canales de envío:
- `LoggingDecorator`: registra antes/después del envío
- `SeguridadDecorator`: cifra el mensaje antes de enviar (simulado)
- `CompresionDecorator`: comprime mensajes largos (>1000 chars)
- `ReintentoDecorator`: reintenta 3 veces si falla

---

### Ejercicio 5: Strategy para Selección de Canal

Implementa estrategias para seleccionar el canal óptimo:
- `SeleccionPorPrioridad`: ALTA → push, MEDIA → SMS, BAJA → email
- `SeleccionPorCosto`: elige el canal más barato disponible
- `SeleccionPorDisponibilidad`: elige el primer canal disponible
- `SeleccionMixta`: combina criterios con peso configurable

---

### Ejercicio 6: Adapter para APIs Externas

Implementa adapters para diferentes proveedores:
- `SendGridAdapter` (email)
- `TwilioAdapter` (SMS)
- `FirebaseAdapter` (push)
- `LogAdapter` (solo registra, no envía realmente)

---

### Ejercicio 7: Observer para Eventos

Implementa observadores que reaccionen a eventos de notificación:
- Eventos: `ENVIADA`, `FALLIDA`, `REINTENTANDO`, `ENTREGADA`
- Observadores:
  - `AuditoriaObserver`: registra en base de datos
  - `EstadisticasObserver`: actualiza métricas en memoria
  - `AlertaObserver`: si hay 3 fallos seguidos, envía alerta al admin

---

### Ejercicio 8: State para Estados de Notificación

Implementa la máquina de estados de una notificación:
- Estados: `BORRADOR`, `PENDIENTE`, `ENVIANDO`, `ENVIADA`, `FALLIDA`, `REINTENTANDO`, `ENTREGADA`
- Transiciones válidas:
  - BORRADOR → PENDIENTE (al programar)
  - PENDIENTE → ENVIANDO (al procesar)
  - ENVIANDO → ENVIADA (éxito)
  - ENVIANDO → FALLIDA (error)
  - FALLIDA → REINTENTANDO (reintento automático)
  - REINTENTANDO → ENVIADA (éxito en reintento)
  - REINTENTANDO → FALLIDA (agotar reintentos)
  - ENVIADA → ENTREGADA (confirmación de lectura)

---

### Ejercicio 9: Template Method + Repository

Implementa:
- Template Method `ProcesadorNotificacion` con esqueleto:
  1. Validar notificación
  2. Seleccionar canal
  3. Enviar
  4. Registrar resultado
  5. Notificar observadores
- Repository `NotificacionRepository` con métodos CRUD
- Implementación JPA y en memoria

---

### Ejercicio 10: Integración Completa

Integra todos los patrones en un `NotificacionService` que:

1. Recibe una solicitud de notificación
2. Construye la notificación con Builder
3. La pasa por el pipeline (Chain)
4. Selecciona canal con Strategy
5. Decora el canal elegido
6. Envía mediante Adapter
7. Persiste con Repository
8. Notifica eventos con Observer
9. Maneja estados con State

Implementa un `main()` que demuestre el flujo completo con ejemplos concretos.

---

## Parte 2: Ejercicios de Entrevista Técnica

### E11: Singleton Thread-Safe
Implementa un singleton thread-safe usando enum en Java. Explica por qué es la mejor opción.

### E12: Factory Method en Framework
Diseña un framework de procesamiento de archivos donde cada tipo (PDF, CSV, JSON) tenga su propio procesador creado por Factory Method.

### E13: Observer para UI
Diseña un botón que notifique a múltiples listeners cuando es clickeado. Implementa en Java con interfaz funcional.

### E14: Strategy para Validación
Implementa un validador de formularios donde cada campo tiene su propia estrategia de validación (email, teléfono, RUT, código postal).

### E15: Decorator para API Rate Limiting
Diseña un decorator que limite la tasa de llamadas a una API (máximo N llamadas por minuto).

### E16: Chain para Middleware
Diseña una cadena de middlewares para una aplicación web (autenticación, logging, compresión, caché).

### E17: Proxy para Lazy Loading
Implementa un proxy que cargue perezosamente un objeto pesado (ej: configuración desde base de datos).

### E18: Adapter para SDK
Adapta una SDK de pagos externa (con interfaz incompatible) a la interfaz esperada por tu aplicación.

### E19: Command + Memento
Implementa un sistema de undo/redo para un editor de texto usando Command + Memento.

### E20: Patrones en Spring Explica
Explica cómo Spring implementa: Singleton, Proxy, Template Method, Factory, Observer, Chain, Adapter, Decorator.
