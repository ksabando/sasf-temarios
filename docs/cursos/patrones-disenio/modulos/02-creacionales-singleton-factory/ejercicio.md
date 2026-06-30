---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Conexión a Base de Datos Singleton

Implementa un pool de conexiones a base de datos usando Singleton con **enum**. El pool debe:

- Mantener máximo 5 conexiones simultáneas
- Método `getConexion()` que devuelva una conexión disponible
- Método `liberarConexion(Conexion c)` que devuelva la conexión al pool
- Ser thread-safe

---

## Ejercicio 4: Conversor de Monedas con Factory Method

Implementa un conversor de monedas donde cada tipo de conversión (USD→EUR, USD→GBP, EUR→USD) se maneje mediante Factory Method.

Requisitos:
- Interface `Conversor` con método `convertir(double monto)`
- Clase abstracta `FabricaConversores` con Factory Method `crearConversor()`
- La fábrica debe leer el tipo de conversión de una propiedad del sistema o archivo de configuración
- Usar el patrón Singleton para la fábrica
