---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: DevTools y Empaquetado

**1. ¿Qué es Spring Boot DevTools y para qué sirve?**
**R:** Es un conjunto de herramientas de desarrollo que proporciona auto-restart (reinicio automático al detectar cambios), LiveReload (recarga automática del navegador), propiedades optimizadas para desarrollo y soporte para depuración remota.

**2. ¿Cómo funciona el auto-restart de DevTools?**
**R:** Usa dos classloaders: el base classloader carga librerías de terceros (estáticas), y el restart classloader carga las clases de la aplicación. Cuando se detectan cambios en archivos del classpath, solo se reinicia el restart classloader, lo que es mucho más rápido que un cold start completo.

**3. ¿Qué es LiveReload y cómo se usa?**
**R:** LiveReload es un servidor embebido que notifica al navegador cuando hay cambios, provocando una recarga automática. Requiere la extensión LiveReload en el navegador y se configura con `spring.devtools.livereload.enabled=true`.

**4. ¿Qué propiedades cambia DevTools automáticamente en desarrollo?**
**R:** Deshabilita el cache de templates (Thymeleaf, Freemarker, Groovy) y recursos estáticos, estableciendo `spring.thymeleaf.cache=false`, `spring.freemarker.cache=false`, `spring.web.resources.cache.period=0`.

**5. ¿Qué es un fat JAR y cómo lo genera Spring Boot?**
**R:** Es un JAR ejecutable que contiene la aplicación junto con todas sus dependencias empaquetadas en BOOT-INF/lib. Lo genera el `spring-boot-maven-plugin` con el goal `package`. Incluye un loader especial (`JarLauncher`) que arranca la aplicación.

**6. ¿Cómo se ejecuta un JAR de Spring Boot con argumentos personalizados?**
**R:** Con `java -jar app.jar --server.port=9090 --spring.profiles.active=prod`. También se pueden usar argumentos de VM con `-Dpropiedad=valor` antes de `-jar`.

**7. ¿Qué son las capas (layers) en el contexto del plugin de Spring Boot?**
**R:** Son particiones del JAR en dependencias, spring-boot-loader, snapshot-dependencies y application. Permiten construir imágenes Docker eficientes cacheando las capas que menos cambian, acelerando builds posteriores.

**8. ¿Qué ventajas tienen los Buildpacks sobre un Dockerfile tradicional?**
**R:** No requieren escribir un Dockerfile, detectan automáticamente el runtime (Java 17), aplican parches de seguridad, producen imágenes optimizadas y se integran con registries de contenedores.

**9. ¿Cómo se genera una imagen Docker con Buildpacks usando Maven?**
**R:** Configurando `spring-boot-maven-plugin` con la sección `<image>` y ejecutando `mvn spring-boot:build-image`. El plugin detecta automáticamente que es una aplicación Java y usa el builder adecuado.

**10. ¿Cuál es la diferencia entre Maven package y spring-boot:build-image?**
**R:** `mvn package` genera un JAR ejecutable tradicional. `spring-boot:build-image` usa Buildpacks para crear directamente una imagen Docker sin necesidad de Dockerfile, produciendo un contenedor listo para ejecutar.

