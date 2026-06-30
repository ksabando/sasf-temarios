---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Visitor para Exportar Documentos

Implementa un sistema de documentos y visitantes para exportación:

- Elementos: `DocumentoPDF`, `DocumentoWord`, `DocumentoExcel`, `DocumentoHTML`
- Cada documento tiene contenido textual y metadatos (autor, fecha, tamaño)
- Visitantes:
  - `ExportadorTXT`: exporta solo texto plano
  - `ExportadorHTML`: envuelve en etiquetas HTML
  - `ExportadorJSON`: convierte a formato JSON con metadatos
  - `ContadorPalabras`: cuenta palabras de cada documento (no exporta, analiza)

Debe ser fácil agregar nuevos formatos de exportación sin modificar las clases de documentos.

---

## Ejercicio 4: Sistema de Notificaciones con Strategy + Template Method

Combina Strategy y Template Method para un sistema de notificaciones:

- **Template Method**: `NotificadorBase` define el esqueleto:
  1. Formatear mensaje
  2. Enviar (abstracto)
  3. Registrar en historial
  4. Notificar resultado

- **Strategy**: el formateo de mensajes usa Strategy:
  - `FormatoSimple`: "[TIPO] mensaje"
  - `FormatoHTML`: "<html><body>mensaje</body></html>"
  - `FormatoJSON`: {"type":"TIPO","message":"mensaje"}

- Implementaciones concretas del Template Method:
  - `NotificadorEmail`, `NotificadorSMS`, `NotificadorPush`
