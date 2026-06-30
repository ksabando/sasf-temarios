---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Conway's Law y Organización de Equipos

Actualmente la organización tiene 3 equipos:
- **Frontend Team**: React developers (3 personas)
- **Backend Team**: Spring Boot developers (5 personas)
- **DB Team**: DBA + data engineers (2 personas)

El equipo quiere migrar a microservicios.

**a)** ¿Qué problema ves con la estructura actual según Conway's Law?

**b)** Propón una reestructuración de equipos para lograr microservicios efectivos.

**c)** ¿Qué pasa si no se puede reestructurar la organización? ¿Qué patrones usarías para mitigar?

**d)** Diseña el RACI de decisiones arquitectónicas para la nueva estructura.

---

## Ejercicio 4: Modular Monolith como Paso Intermedio

El equipo actual de E-Commerce Platform (10 desarrolladores) quiere prepararse para una futura migración a microservicios, pero necesita lanzar features cada 2 semanas.

Diseña una arquitectura de **Modular Monolith** que:

**a)** Defina módulos con interfaces bien delimitadas (cada módulo es un bounded context)

**b)** Use módulos Java (paquetes) con dependencias controladas

**c)** Incluya reglas de arquitectura (ArchUnit) para evitar dependencias incorrectas

**d)** Prepare el terreno para extraer servicios después:
   - Eventos entre módulos (no llamadas directas entre módulos)
   - APIs internas como si fueran externas
   - Schemas de base de datos separados pero en el mismo servidor

Escribe el código de ejemplo de:
- Una interfaz de módulo (API pública)
- La implementación del módulo
- Una regla ArchUnit que prohíba dependencias incorrectas
