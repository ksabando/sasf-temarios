---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: LoadBalancer con Round-Robin personalizado

### Objetivo
Implementar un LoadBalancer personalizado con algoritmo Round-Robin y verificar el balanceo con múltiples instancias.

### Requisitos

1. **Eureka Server** (puerto 8761)
2. **Servicio A** (2 instancias: puertos 8081, 8082):
   - Endpoint `GET /api/service-a/info` que devuelve un identificador único de instancia
3. **Servicio B** (puerto 8090):
   - Usa `@LoadBalanced RestTemplate` para invocar a Servicio A
   - Endpoint `GET /api/service-b/call-service-a` que devuelve el identificador de la instancia que respondió
4. **Verificar** que las peticiones se distribuyen entre las instancias de Servicio A

### Entrega
- Código completo
- Logs mostrando el balanceo de carga

---

## Ejercicio 4: Servicio con WebClient LoadBalanced

### Objetivo
Reemplazar RestTemplate por WebClient reactivo con soporte LoadBalanced.

### Requisitos
- Servicio A: Expone `GET /api/users`
- Servicio B: Usa WebClient con `@LoadBalanced` para consumir Servicio A
- Implementar manejo de errores con `onErrorResume`
- Usar `Mono` y `Flux` correctamente

### Entrega
- Código completo con WebClient
- Pruebas de error handling

---

## Ejercicio 5: Multi-perfil con Config Server

### Objetivo
Configurar diferentes perfiles (dev, prod) en el Config Server.

### Requisitos
- Archivos: `product-service-dev.yml`, `product-service-prod.yml`
- Config Server sirve configuración según el perfil activo
- Cliente arranca con `spring.profiles.active=dev`
- Verificar que se carga la configuración correcta

### Entrega
- Archivos de configuración
- Logs de arranque mostrando el perfil activo
