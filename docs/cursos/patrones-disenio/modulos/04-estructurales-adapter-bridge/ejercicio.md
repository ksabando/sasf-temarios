---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Adapter para Sistema Legacy de Facturación

Un sistema legacy emite facturas en XML. Tu nuevo sistema espera facturas en JSON.

```java
// Sistema legacy
public class FacturadorLegacy {
    public String emitirFacturaXML(String cliente, double monto, String fecha) {
        return "<factura><cliente>" + cliente + "</cliente><monto>" + monto + "</monto><fecha>" + fecha + "</fecha></factura>";
    }
}

// Interfaz moderna
public interface FacturadorModerno {
    FacturaJSON emitirFactura(String cliente, double monto, String fecha);
}
```

Implementa un Adapter que convierta la salida XML del sistema legacy a objetos JSON. La clase `FacturaJSON` debe tener campos `cliente`, `monto` y `fecha`.

---

## Ejercicio 4: Bridge para Dispositivos y Controles Remotos

Implementa el patrón Bridge para un sistema de controles remotos universales:

- **Implementaciones:** TV, Radio, Proyector
- **Abstracciones:** ControlRemotoBasico (encender, apagar, volumen), ControlRemotoAvanzado (incluye mute, cambio de canal numérico)

Cada implementación debe tener métodos: `encender()`, `apagar()`, `setVolumen(int)`, `getVolumen()`.
