---
sidebar_label: "Clase"
---

## DI, Validacion y Errores

La inyeccion de dependencias permite desacoplar controllers de servicios concretos. La validacion protege la API de datos invalidos. El manejo centralizado de errores evita respuestas inconsistentes.

### Capas simples

| Capa | Responsabilidad |
|------|-----------------|
| Controller | HTTP y contratos |
| Service | Caso de uso |
| DbContext | Persistencia |

## Respuestas consistentes

Usar errores con formato comun facilita el consumo desde frontend y reduce ambiguedad.
