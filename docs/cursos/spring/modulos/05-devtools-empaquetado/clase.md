---
sidebar_label: "Clase"
---

## 3. Ejecución: java -jar

### Comandos básicos:
```bash
# Ejecutar JAR
java -jar target/mi-app-0.0.1-SNAPSHOT.jar

# Con argumentos de VM
java -Xms512m -Xmx1024m -jar target/mi-app-0.0.1-SNAPSHOT.jar

# Con propiedades externas
java -jar target/mi-app-0.0.1-SNAPSHOT.jar --server.port=9090 --spring.profiles.active=prod

# Con archivo de propiedades externo
java -jar target/mi-app-0.0.1-SNAPSHOT.jar --spring.config.location=file:./config/application.properties

# Variables de entorno
set APP_OPTS=--server.port=9090
java -jar %APP_OPTS% target/mi-app-0.0.1-SNAPSHOT.jar
```

### Argumentos de VM útiles:
```bash
java -Djava.security.egd=file:/dev/./urandom ^
     -Duser.timezone=America/Argentina/Buenos_Aires ^
     -Xmx512m ^
     -jar app.jar
```

---

## 4. Docker multi-stage con spring-boot-maven-plugin

El plugin de Spring Boot puede extraer capas para construir imágenes Docker eficientes:

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <layers>
            <enabled>true</enabled>
        </layers>
    </configuration>
</plugin>
```

### Dockerfile multi-stage:
```dockerfile
# Stage 1: Extraer capas
FROM eclipse-temurin:17-jre AS builder
WORKDIR /app
COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 2: Imagen final
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copiar capas en orden (la que menos cambia primero)
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

### Build y ejecución:
```bash
mvn package
docker build -t mi-app:1.0.0 .
docker run -p 8080:8080 mi-app:1.0.0
```

---

## 5. Buildpacks

Spring Boot soporta Buildpacks para crear imágenes Docker sin Dockerfile:

```bash
mvn spring-boot:build-image
```

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <image>
            <name>registry.example.com/mi-app:${project.version}</name>
            <builder>paketobuildpacks/builder-jammy-base:latest</builder>
        </image>
    </configuration>
</plugin>
```

### Ventajas de Buildpacks:
- No requiere Dockerfile
- Detecta automáticamente el runtime (Java 17)
- Aplica parches de seguridad automáticamente
- Produce imágenes optimizadas
- Integración con registries de contenedores

### Comandos adicionales:
```bash
# Ver el nombre de la imagen generada
mvn spring-boot:build-image -Dspring-boot.build-image.imageName=mi-app:v1

# Push a registry
docker push registry.example.com/mi-app:v1
```
