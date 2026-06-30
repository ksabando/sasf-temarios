---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Sistema de Alertas con Observer

Implementa un sistema de monitoreo de servidores con Observer:

- **Subject**: `ServidorMonitor` que:
  - Mantiene métricas: CPU, memoria, disco
  - Notifica cuando alguna métrica supera umbrales configurables
- **Observers**:
  - `EmailAlerta`: envía email cuando hay alerta
  - `SMSAlerta`: envía SMS para alertas críticas
  - `LoggerAlerta`: registra todas las alertas en archivo
  - `DashboardAlerta`: muestra alertas en consola con colores

El sistema debe permitir agregar/quitar observers en tiempo de ejecución.

---

## Ejercicio 4: Reproductor Multimedia con State Pattern

Implementa un reproductor multimedia con los siguientes estados:

1. **Detenido** — estado inicial, no reproduce nada
2. **Reproduciendo** — reproduciendo contenido
3. **Pausado** — pausado temporalmente
4. **Bloqueado** — pantalla bloqueada (solo permite desbloquear)

Comportamiento por estado:
- **play()**: Detenido→Reproduciendo, Pausado→Reproduciendo, Reproduciendo→no cambia, Bloqueado→no cambia
- **pause()**: Reproduciendo→Pausado, otros estados no cambian
- **stop()**: cualquier estado → Detenido
- **lock()**: cualquier estado → Bloqueado
- **unlock()**: Bloqueado → Detenido
