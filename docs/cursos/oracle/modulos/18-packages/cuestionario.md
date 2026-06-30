---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Módulo 13 — Packages y Organización del Modelo: Preguntas y Respuestas

## 1. ¿Qué es un Package y qué dos componentes lo forman?

Un Package es un contenedor que agrupa objetos PL/SQL relacionados (procedimientos, funciones, variables, cursores, tipos, excepciones). Tiene dos componentes: la **especificación** (spec/cabecera) que declara la interfaz pública, y el **cuerpo** (body) que contiene la implementación y los miembros privados no visibles desde fuera.

## 2. ¿Qué ventajas tiene usar Packages sobre procedimientos y funciones independientes?

Los packages permiten: encapsulamiento (miembros públicos vs privados), variables persistentes de sesión, sobrecarga natural de subprogramas, inicialización controlada (bloque BEGIN en el body), compilación separada de spec y body (cambiar implementación sin invalidar dependientes), y organización lógica de código relacionado en una sola unidad.

## 3. ¿Cómo funcionan las variables de package y cuál es su ciclo de vida?

Las variables declaradas en un package (específicamente en el body) persisten durante toda la sesión de base de datos. Cada sesión tiene su propia copia independiente. Se inicializan al primer acceso al package y mantienen su valor entre llamadas sucesivas. Son útiles para caché de sesión, contadores, y estado compartido entre subprogramas del mismo package.

## 4. ¿Cómo funciona el overloading dentro de un package?

Se pueden definir múltiples procedimientos o funciones con el mismo nombre en la especificación del package, siempre que difieran en número, tipo u orden de parámetros. Oracle selecciona automáticamente la versión correcta según los argumentos de la llamada. El overloading solo aplica a miembros del package, no a subprogramas independientes (standalone).

## 5. ¿Qué son los sinónimos para packages y qué problema resuelven?

Los sinónimos crean un alias (nombre alternativo) para un package, ocultando el esquema propietario. Resuelven: acoplamiento al nombre del esquema (si el package se mueve, solo cambia el sinónimo), seguridad (se otorga acceso al sinónimo sin revelar el esquema origen), y simplificación (el usuario no necesita prefijar con el nombre del dueño). Pueden ser privados o públicos.

## 6. ¿Qué packages built-in de Oracle son esenciales para el desarrollo PL/SQL?

DBMS_OUTPUT (mensajes en consola), DBMS_SQL (SQL dinámico avanzado), DBMS_LOB (manejo de CLOB/BLOB), DBMS_SCHEDULER (tareas programadas), UTL_FILE (lectura/escritura de archivos del servidor), UTL_HTTP (peticiones HTTP), UTL_SMTP (envío de correos), y DBMS_CRYPTO (funciones criptográficas). Cada uno requiere privilegios específicos de ejecución.

## 7. ¿Qué propósito tiene el bloque de inicialización en un Package Body?

El bloque BEGIN al final del Package Body se ejecuta una sola vez por sesión, la primera vez que se accede a cualquier miembro del package. Se usa para cargar configuración desde tablas, inicializar variables globales con valores por defecto, leer parámetros del entorno, o ejecutar cualquier lógica de setup que deba ocurrir antes de usar el package.

## 8. ¿Cómo se organiza un modelo de datos usando packages por entidad?

Cada entidad del modelo (PROYECTOS, TAREAS, EMPLEADOS) tiene su propio package que contiene todas las operaciones relacionadas: CRUD, validaciones, cursores predefinidos y constantes. Esto maximiza la cohesión (todo lo de una entidad en un solo lugar), facilita el mantenimiento (cambios aislados), y establece una API clara para cada entidad del sistema.

## 9. ¿Qué son los cursores de package y cómo se diferencian de los cursores declarados localmente?

Los cursores declarados en la especificación de un package se comportan como vistas predefinidas: están disponibles para cualquier consumidor que tenga acceso al package, pueden abrirse múltiples veces, y pueden ser paramétricos. A diferencia de los cursores locales (dentro de un bloque), los cursores de package son reutilizables entre distintos subprogramas y sesiones del llamador.

## 10. ¿Qué ventajas aporta la separación por capas (Presentación/Negocio/Persistencia) usando packages?

Permite modificar cada capa independientemente: cambiar la persistencia (tablas) sin afectar la lógica de negocio, modificar reglas de negocio sin tocar la interfaz de reportes, y probar cada capa de forma aislada. También facilita la seguridad granular: la capa de presentación solo accede a la de negocio, que a su vez accede a la de persistencia. Cada capa expone solo lo necesario a la capa superior.

