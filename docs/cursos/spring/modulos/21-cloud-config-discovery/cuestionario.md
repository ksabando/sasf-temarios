---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Cloud Config & Discovery

1. **¿Qué anotación se necesita en la clase principal de un Config Server?**
   - a) @EnableConfigClient
   - b) @EnableConfigServer
   - c) @EnableDiscoveryClient
   - d) @EnableConfig
   - **Respuesta: b**

2. **¿Cuál es el puerto por defecto de Eureka Server?**
   - a) 8080
   - b) 8888
   - c) 8761
   - d) 9090
   - **Respuesta: c**

3. **¿Qué archivo usa un Config Client para especificar la URL del Config Server?**
   - a) application.yml
   - b) config.yml
   - c) bootstrap.yml
   - d) eureka.yml
   - **Respuesta: c**

4. **¿Qué anotación permite recargar beans cuando cambia la configuración?**
   - a) @RefreshScope
   - b) @Configurable
   - c) @ConfigurationProperties
   - d) @ScopeRefresh
   - **Respuesta: a**

5. **¿Qué componente propaga eventos de refresco a todos los microservicios?**
   - a) Eureka
   - b) Spring Cloud Bus
   - c) Spring Cloud Config
   - d) RabbitMQ directo
   - **Respuesta: b**

6. **¿Qué endpoint se invoca para refrescar la configuración en todos los servicios vía Bus?**
   - a) POST /actuator/refresh
   - b) POST /actuator/bus-refresh
   - c) GET /actuator/bus-refresh
   - d) POST /actuator/config/refresh
   - **Respuesta: b**

7. **¿Qué hace @EnableDiscoveryClient?**
   - a) Habilita el servicio como Config Client
   - b) Habilita el registro en Eureka
   - c) Habilita el balanceo de carga
   - d) Habilita la configuración en Git
   - **Respuesta: b**

8. **¿Qué anotación permite inyectar un RestTemplate con balanceo de carga?**
   - a) @LoadBalancer
   - b) @LoadBalanced
   - c) @Balance
   - d) @RoundRobin
   - **Respuesta: b**

9. **¿Para qué sirve fail-fast: true en la configuración del Config Client?**
   - a) Acelera la conexión al Config Server
   - b) Falla rápido si no puede conectar con Config Server
   - c) Ignora errores de conexión
   - d) Evita reintentos
   - **Respuesta: b**

10. **¿Qué instancia de Eureka no se registra a sí misma?**
    - a) Eureka Client
    - b) Eureka Server
    - c) Config Server
    - d) Gateway
    - **Respuesta: b**

11. **¿Qué backend NO soporta Spring Cloud Config Server?**
    - a) Git
    - b) SVN
    - c) MySQL directo
    - d) Sistema de archivos
    - **Respuesta: c**

12. **¿Qué propiedad deshabilita la auto-preservación en Eureka Server?**
    - a) eureka.server.enable-self-preservation
    - b) eureka.client.self-preservation
    - c) eureka.server.self-preservation
    - d) eureka.instance.self-preservation
    - **Respuesta: a**

13. **¿Qué hace el método getForObject de RestTemplate?**
    - a) Obtiene un recurso y lo devuelve como String
    - b) Obtiene un recurso y lo convierte al tipo especificado
    - c) Obtiene múltiples recursos
    - d) Envía una petición POST
    - **Respuesta: b**

14. **¿Qué reemplazó Spring Cloud LoadBalancer en Spring Cloud?**
    - a) Eureka
    - b) Netflix Ribbon
    - c) Hystrix
    - d) Zuul
    - **Respuesta: b**

15. **¿Qué propiedad determina el nombre de la aplicación en Config Client?**
    - a) spring.application.name
    - b) server.name
    - c) app.name
    - d) config.name
    - **Respuesta: a**

