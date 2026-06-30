---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Chain para Validación de Pedidos

Implementa una cadena de validación para un sistema de pedidos:

- Clase `Pedido` con campos: id, cliente, items (lista), total, direccionEnvio
- Validadores en cadena:
  1. **ClienteValidoValidator**: cliente no puede ser nulo
  2. **ItemsValidosValidator**: debe tener al menos 1 item
  3. **TotalValidoValidator**: total debe ser positivo
  4. **DireccionValidaValidator**: dirección no puede estar vacía

Cada validador retorna un resultado con `boolean valido` y `String mensajeError`. La cadena completa debe retornar todos los errores encontrados (no detenerse en el primero).

---

## Ejercicio 4: Command para Sistema de Archivos

Implementa un sistema de operaciones sobre archivos usando Command:

- Receiver: `SistemaArchivos` con métodos `crearArchivo(String nombre)`, `eliminarArchivo(String nombre)`, `renombrarArchivo(String old, String new)`
- Commands: `CrearArchivoCommand`, `EliminarArchivoCommand`, `RenombrarArchivoCommand`
- Invoker: `GestorArchivos` con historial de comandos ejecutados y capacidad de deshacer
- Al deshacer un `CrearArchivoCommand`, se debe eliminar el archivo; al deshacer `EliminarArchivoCommand`, se debe restaurar
