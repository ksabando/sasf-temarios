---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Capas Docker con spring-boot-maven-plugin
Configurar un proyecto Spring Boot para generar capas Docker optimizadas usando el plugin de Spring Boot.

**Requisitos**:
- Habilitar `<layers>` en `spring-boot-maven-plugin`
- Crear un `Dockerfile` multi-stage que use las capas extraídas
- El Dockerfile debe copiar las capas en orden: dependencias, spring-boot-loader, snapshot-dependencies, application
- Exponer puerto 8080
- Escribir el comando para construir la imagen

---

## Ejercicio 4: Buildpacks para generar imagen Docker
Usar Buildpacks para generar una imagen Docker de la aplicación sin escribir un Dockerfile.

**Requisitos**:
- Configurar `spring-boot-maven-plugin` con `build-image`
- Nombrar la imagen como `mi-app-buildpack:1.0.0`
- Ejecutar el comando `mvn spring-boot:build-image`
- Verificar que la imagen se creó con `docker images`
- Ejecutar el contenedor localmente

---

## Ejercicio 5: Script de ejecución con argumentos
Crear un script (batch/PowerShell para Windows) que ejecute la aplicación con configuraciones específicas para producción.

**Requisitos**:
- Script `ejecutar-app.ps1` que:
  - Establezca la variable de entorno `SPRING_PROFILES_ACTIVE=prod`
  - Configure la memoria heap mínima 256m y máxima 1024m
  - Especifique la zona horaria Argentina
  - Pase el archivo de propiedades externo `./config/application.properties`
  - Redirija logs a `app.log`
- Script `ejecutar-app.bat` equivalente en batch de Windows
