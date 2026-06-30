---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Spring Boot y Auto-Configuración

**1. ¿Qué problema principal resuelve Spring Boot?**
**R:** Simplificar la configuración de aplicaciones Spring tradicionales mediante opinionated defaults, starters, auto-configuración y servidores embebidos, reduciendo el boilerplate y la configuración manual.

**2. ¿Qué es un Starter en Spring Boot?**
**R:** Es un conjunto de dependencias agrupadas en un mismo artefacto Maven/Gradle que facilitan la inclusión de funcionalidades completas. Por ejemplo, `spring-boot-starter-web` incluye Spring MVC, Tomcat embebido y Jackson.

**3. ¿Qué tres anotaciones combina @SpringBootApplication?**
**R:** @Configuration (permite definir beans), @EnableAutoConfiguration (activa la auto-configuración) y @ComponentScan (escanea componentes en el paquete base).

**4. ¿Cómo funciona internamente @EnableAutoConfiguration?**
**R:** Spring Boot lee el archivo `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` y evalúa cada clase de auto-configuración. Cada una usa condiciones como @ConditionalOnClass, @ConditionalOnMissingBean para decidir si debe aplicarse.

**5. ¿Qué es el servidor embebido por defecto en Spring Boot Web?**
**R:** Apache Tomcat. Viene incluido en `spring-boot-starter-web` y se puede reemplazar por Jetty o Undertow excluyendo Tomcat e incluyendo el starter correspondiente.

**6. ¿Cuál es la diferencia entre Maven y Gradle en el contexto de Spring Boot?**
**R:** Ambos son herramientas de build. Maven usa XML (pom.xml) y tiene un ciclo de vida predefinido. Gradle usa Groovy/Kotlin DSL, es más flexible y generalmente más rápido. Spring Boot soporta ambos oficialmente.

**7. ¿Qué hace el goal spring-boot:run de Maven?**
**R:** Ejecuta la aplicación Spring Boot directamente desde la línea de comandos sin necesidad de empaquetar, compilando y arrancando la aplicación en un solo paso.

**8. ¿Cómo se cambia el puerto del servidor embebido?**
**R:** Mediante la propiedad `server.port` en `application.properties` o `application.yml`. Por ejemplo: `server.port=9090`.

**9. ¿Qué es el archivo AutoConfiguration.imports?**
**R:** Es el archivo ubicado en `META-INF/spring/` que reemplazó al antiguo `spring.factories` en Spring Boot 3.0. Lista las clases de auto-configuración que Spring Boot debe evaluar al arrancar.

**10. ¿Cómo se empaqueta una aplicación Spring Boot como JAR ejecutable?**
**R:** Usando `mvn package`. Spring Boot empaqueta la aplicación junto con todas sus dependencias en un fat JAR. Se ejecuta con `java -jar target/archivo.jar`. El JAR contiene un loader especial que arranca el servidor embebido.

