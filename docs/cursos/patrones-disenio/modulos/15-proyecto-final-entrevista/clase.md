---
sidebar_label: "Clase"
---

# Módulo 15 — Proyecto Final + Simulación de Entrevista

## Proyecto: Sistema de Notificaciones Multicanal

### Descripción

Sistema de notificaciones empresarial que soporta múltiples canales (email, SMS, push) con procesamiento flexible, logging, seguridad y persistencia.

### Arquitectura General

```
Cliente → [Chain of Responsibility] → [Strategy Router] → [Decorator Chain] → [Adapter Layer] → Canales
                    │                       │                     │                    │
                    │ Validación             │ Algoritmo de       │ Logging,           │ EmailSender
                    │ Transformación         │ selección de       │ Seguridad,         │ SMSSender
                    │ Enriquecimiento        │ canal              │ Compresión         │ PushSender
                    │                        │                     │                    │
                    ▼                        ▼                     ▼                    ▼
              [Repository Pattern] ←── Persistencia de notificaciones
              [Event Sourcing]     ←── Historial de eventos
              [Builder]            ←── Construcción de notificaciones
```

### Patrones Aplicados

| Patrón | Propósito |
|--------|-----------|
| **Builder** | Construir notificaciones complejas paso a paso |
| **Factory Method** | Crear canales de envío según configuración |
| **Abstract Factory** | Familias de canales (producción, testing, staging) |
| **Decorator** | Agregar logging, seguridad, compresión |
| **Adapter** | Adaptar APIs externas de envío |
| **Strategy** | Algoritmo de selección de canal según prioridad/costo |
| **Chain of Responsibility** | Pipeline de procesamiento de notificaciones |
| **Observer** | Eventos de notificación (enviada, fallida, re intentada) |
| **Repository** | Persistencia de notificaciones y eventos |
| **Template Method** | Esqueleto del procesamiento de notificación |
| **State** | Estados de la notificación (pendiente, enviada, fallida) |
| **Proxy** | Protección de canales sensibles |
| **Null Object** | Canal por defecto que no hace nada |
| **Builder** | Construcción de filtros de búsqueda |

### Estructura de Paquetes

```
com.notificaciones/
├── domain/
│   ├── model/
│   │   ├── Notificacion.java
│   │   ├── CanalEnvio.java (enum)
│   │   ├── EstadoNotificacion.java (enum)
│   │   └── Prioridad.java (enum)
│   ├── builder/
│   │   └── NotificacionBuilder.java
│   ├── strategy/
│   │   ├── EstrategiaSeleccionCanal.java
│   │   └── SeleccionPorPrioridad.java
│   ├── chain/
│   │   ├── ProcesadorNotificacion.java
│   │   ├── ValidadorNotificacion.java
│   │   ├── TransformadorMensaje.java
│   │   └── EnriquecedorNotificacion.java
│   ├── state/
│   │   ├── EstadoNotificacion.java (interface)
│   │   ├── Pendiente.java
│   │   ├── Enviada.java
│   │   └── Fallida.java
│   └── observer/
│       ├── NotificacionObservable.java
│       └── NotificacionObserver.java
├── infrastructure/
│   ├── adapter/
│   │   ├── CanalEnvioAdapter.java (interface)
│   │   ├── EmailAdapter.java
│   │   ├── SMSAdapter.java
│   │   └── PushAdapter.java
│   ├── decorator/
│   │   ├── CanalDecorator.java
│   │   ├── LoggingDecorator.java
│   │   ├── SeguridadDecorator.java
│   │   └── CompresionDecorator.java
│   ├── proxy/
│   │   └── CanalProxy.java
│   ├── repository/
│   │   ├── NotificacionRepository.java
│   │   └── NotificacionJpaRepository.java
│   └── factory/
│       ├── FabricaCanales.java
│       └── FabricaCanalesProduccion.java
└── application/
    ├── NotificacionService.java
    └── Procesador.Notificaciones.java
```

### Funcionamiento del Pipeline

```
1. Cliente construye Notificación con Builder
2. Chain of Responsibility procesa:
   a) Validador → verifica campos obligatorios
   b) Transformador → aplica formato (HTML plano/rico)
   c) Enriquecedor → añade metadata (timestamp, ID tracking)
3. Strategy selecciona canal (prioridad, costo, disponibilidad)
4. Decorator envuelve el canal:
   a) LoggingDecorator → registra envío
   b) SeguridadDecorator → cifra contenido sensible
5. Adapter envía al canal real
6. Observer notifica eventos (enviado/fallido)
7. Repository persiste la notificación
```

### Criterios de Evaluación del Proyecto Final

| Criterio | Peso |
|----------|------|
| Corrección de patrones implementados | 25% |
| Calidad del código (clean code + pruebas) | 20% |
| Diagrama UML de la solución | 15% |
| Presentación oral (20 min) | 20% |
| Defensa individual (preguntas del jurado) | 20% |

### Presentación Oral (20 min)

Estructura recomendada:
1. **Problema** (2 min): ¿Qué problema resuelve?
2. **Arquitectura** (5 min): Diagrama de componentes y patrones
3. **Demo** (5 min): Funcionamiento del sistema
4. **Trade-offs** (5 min): Decisiones de diseño, alternativas consideradas
5. **Lecciones aprendidas** (3 min): ¿Qué cambiarían?
