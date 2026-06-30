---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Cambiar a Undertow
Modificar el proyecto del ejercicio 2 para reemplazar Tomcat por Undertow como servidor embebido.

**Requisitos**:
- Excluir `spring-boot-starter-tomcat`
- Agregar `spring-boot-starter-undertow`
- Configurar el puerto en `application.properties` a `9090`
- Verificar que la aplicación sigue funcionando

---

## Ejercicio 4: Explorar auto-configuración con --debug
Usar el flag `--debug` de Spring Boot para ver qué auto-configuraciones se aplican y cuáles se excluyen.

**Requisitos**:
- Ejecutar la aplicación con `--debug`
- Capturar el reporte de auto-configuración
- Identificar al menos 3 auto-configuraciones positivas (matched) y 3 negativas (rejected)
- Explicar por qué Spring decidió aplicar o no cada una

---

## Ejercicio 5: Crear un starter personalizado
Crear un starter mínimo `saludar-spring-boot-starter` que:
- Auto-configure un bean `SaludarService` con mensaje configurable via `application.properties`
- Tenga una propiedad `saludar.mensaje` con valor por defecto "Hola Mundo"
- Use `@ConditionalOnProperty` para habilitar/deshabilitar

**Requisitos**:
- Proyecto Maven separado para el starter
- Clase de auto-configuración
- Archivo `spring.factories` o `AutoConfiguration.imports`
- Proyecto de ejemplo que consuma el starter
