---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Properties, Profiles y Logging

**1. ¿Cuál es la diferencia entre application.properties y application.yml?**
**R:** application.properties usa formato clave=valor plano, mientras que application.yml usa YAML con estructura jerárquica y sangría. YAML es más legible para configuraciones complejas y soporta multi-documento (varios perfiles en un mismo archivo).

**2. ¿Qué orden de prioridad tienen las fuentes de propiedades en Spring Boot?**
**R:** De menor a mayor prioridad: 1) properties empaquetados, 2) application-{profile}.properties, 3) properties externas en config/, 4) variables de entorno, 5) argumentos de línea de comandos (--server.port=9090).

**3. ¿Cómo se usa @Value para leer propiedades con valor por defecto?**
**R:** Usando la sintaxis `${propiedad:valorPorDefecto}`. Por ejemplo: `@Value("${app.name:MiApp}")` usará "MiApp" si no se encuentra la propiedad app.name.

**4. ¿Qué ventaja ofrece @ConfigurationProperties sobre @Value?**
**R:** @ConfigurationProperties agrupa propiedades relacionadas en objetos tipados, soporta validación con @Validated, permite estructuras anidadas y genera metadata para autocompletado en IDE. Es más adecuado para grupos grandes de propiedades.

**5. ¿Qué son los perfiles (profiles) en Spring?**
**R:** Los perfiles permiten definir configuraciones específicas para diferentes entornos (dev, test, prod). Se activan con la propiedad `spring.profiles.active` y permiten tener diferentes beans, propiedades y configuraciones según el perfil activo.

**6. ¿Cómo se configuran múltiples perfiles en un solo archivo YAML?**
**R:** Usando el separador `---` y la propiedad `spring.config.activate.on-profile` para cada sección. Cada sección define la configuración específica para un perfil después de las propiedades comunes.

**7. ¿Qué es SLF4J y cuál es su implementación por defecto en Spring Boot?**
**R:** SLF4J (Simple Logging Facade for Java) es una fachada de logging que abstrae la implementación subyacente. Spring Boot usa Logback como implementación por defecto.

**8. ¿Cuáles son los niveles de logging en orden de prioridad?**
**R:** TRACE < DEBUG < INFO < WARN < ERROR. Spring Boot usa INFO como nivel por defecto para root.

**9. ¿Cómo se configura un logger específico para un paquete en application.properties?**
**R:** Usando `logging.level.com.example=DEBUG` donde `com.example` es el paquete y `DEBUG` es el nivel deseado.

**10. ¿Qué ventaja tiene logback-spring.xml sobre application.properties para configurar logging?**
**R:** logback-spring.xml permite configuraciones más avanzadas como appenders personalizados (archivo rotativo, consola coloreada), políticas de retención, y lo más importante: soporta `<springProfile>` para tener configuraciones de logging diferentes por perfil.

