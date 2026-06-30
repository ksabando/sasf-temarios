---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución 3: Capas Docker con spring-boot-maven-plugin

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <layers>
                    <enabled>true</enabled>
                </layers>
            </configuration>
        </plugin>
    </plugins>
</build>
```

```dockerfile
# Dockerfile (multi-stage)
FROM eclipse-temurin:17-jre AS builder
WORKDIR /app
COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

```bash
# Construir y ejecutar
mvn clean package
docker build -t devtools-demo:1.0.0 .
docker run -p 8080:8080 devtools-demo:1.0.0
```

---

## Solución 4: Buildpacks

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <image>
                    <name>mi-app-buildpack:1.0.0</name>
                </image>
            </configuration>
        </plugin>
    </plugins>
</build>
```

```bash
# Generar imagen con Buildpacks
mvn spring-boot:build-image

# Verificar que la imagen se creó
docker images

# Ejecutar el contenedor
docker run -p 8080:8080 mi-app-buildpack:1.0.0
```

**Salida esperada:**
```
REPOSITORY           TAG       IMAGE ID       CREATED         SIZE
mi-app-buildpack     1.0.0     abc123def456   2 minutes ago   280MB
```

---

## Solución 5: Script de ejecución

```powershell
# ejecutar-app.ps1
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:TZ = "America/Argentina/Buenos_Aires"

$jarPath = "target/devtools-demo-0.0.1-SNAPSHOT.jar"
$configPath = ".\config\application.properties"
$logFile = "app.log"

$javaArgs = @(
    "-Xms256m",
    "-Xmx1024m",
    "-Duser.timezone=America/Argentina/Buenos_Aires",
    "-jar", $jarPath,
    "--spring.config.location=file:$configPath"
)

Write-Host "Iniciando aplicación en modo PRODUCCI—N..."
Write-Host "Perfil: $env:SPRING_PROFILES_ACTIVE"
Write-Host "Log: $logFile"
Write-Host "Config: $configPath"

Start-Process -FilePath "java" -ArgumentList $javaArgs -NoNewWindow -RedirectStandardOutput $logFile
```

```batch
@REM ejecutar-app.bat
@echo off
set SPRING_PROFILES_ACTIVE=prod
set TZ=America/Argentina/Buenos_Aires

set JAR_PATH=target\devtools-demo-0.0.1-SNAPSHOT.jar
set CONFIG_PATH=.\config\application.properties
set LOG_FILE=app.log

echo Iniciando aplicacion en modo PRODUCCION...
echo Perfil: %SPRING_PROFILES_ACTIVE%
echo Log: %LOG_FILE%
echo Config: %CONFIG_PATH%

java -Xms256m -Xmx1024m ^
     -Duser.timezone=America/Argentina/Buenos_Aires ^
     -jar %JAR_PATH% ^
     --spring.config.location=file:%CONFIG_PATH% ^
     > %LOG_FILE% 2>&1
```

