---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución 3: Ciclo de vida

```java
// CacheManager.java
package com.example.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class CacheManager {
    private Map<String, Object> cache;

    @PostConstruct
    public void init() {
        cache = new HashMap<>();
        System.out.println("=== Cache inicializado ===");
    }

    public void put(String key, Object value) {
        cache.put(key, value);
        System.out.println("Cache: agregado " + key);
    }

    public Object get(String key) {
        return cache.get(key);
    }

    @PreDestroy
    public void cleanup() {
        cache.clear();
        System.out.println("=== Cache destruido ===");
    }
}
```

```java
// CacheController.java
package com.example.controller;

import com.example.service.CacheManager;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CacheController {
    private final CacheManager cacheManager;

    public CacheController(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @PostMapping("/cache/{key}")
    public String guardar(@PathVariable String key, @RequestBody String value) {
        cacheManager.put(key, value);
        return "OK";
    }

    @GetMapping("/cache/{key}")
    public Object obtener(@PathVariable String key) {
        return cacheManager.get(key);
    }
}
```

---

## Solución 4: Scopes singleton y prototype

```java
// VisitasContador.java
package com.example.service;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class VisitasContador {
    private final AtomicInteger contador = new AtomicInteger(0);

    public int incrementar() {
        return contador.incrementAndGet();
    }
}
```

```java
// TransaccionIdGenerator.java
package com.example.service;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import java.util.UUID;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class TransaccionIdGenerator {
    private final String id = UUID.randomUUID().toString();

    public String getId() {
        return id;
    }
}
```

```java
// DemoScopeController.java
package com.example.controller;

import com.example.service.TransaccionIdGenerator;
import com.example.service.VisitasContador;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DemoScopeController {
    private final VisitasContador visitasContador;
    private final TransaccionIdGenerator transaccionIdGenerator;

    public DemoScopeController(VisitasContador visitasContador, TransaccionIdGenerator transaccionIdGenerator) {
        this.visitasContador = visitasContador;
        this.transaccionIdGenerator = transaccionIdGenerator;
    }

    @GetMapping("/demo")
    public Map<String, Object> demoScoopes() {
        return Map.of(
            "visitas", visitasContador.incrementar(),
            "transaccionId", transaccionIdGenerator.getId(),
            "mensaje", "Refresca la página para ver cómo cambia el ID (prototype) pero el contador sigue (singleton)"
        );
    }
}
```

---

## Solución 5: @Profile para entornos

```java
// NotificadorService.java
package com.example.service;

public interface NotificadorService {
    void notificar(String mensaje);
}
```

```java
// ConsolaNotificador.java
package com.example.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class ConsolaNotificador implements NotificadorService {
    @Override
    public void notificar(String mensaje) {
        System.out.println("[DEV] Notificación: " + mensaje);
    }
}
```

```java
// ArchivoNotificador.java
package com.example.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;

@Component
@Profile("prod")
public class ArchivoNotificador implements NotificadorService {
    @Override
    public void notificar(String mensaje) {
        try (FileWriter writer = new FileWriter("notificaciones.log", true)) {
            writer.write(LocalDateTime.now() + " - " + mensaje + System.lineSeparator());
        } catch (IOException e) {
            System.err.println("Error escribiendo notificación: " + e.getMessage());
        }
    }
}
```

```java
// NotificadorController.java
package com.example.controller;

import com.example.service.NotificadorService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class NotificadorController {
    private final NotificadorService notificadorService;

    public NotificadorController(NotificadorService notificadorService) {
        this.notificadorService = notificadorService;
    }

    @GetMapping("/notificar")
    public String notificar() {
        notificadorService.notificar("Prueba de notificación");
        return "Notificación enviada";
    }
}
```

```properties
# application.properties
spring.profiles.active=dev
# Para producción cambiar a: spring.profiles.active=prod
```

