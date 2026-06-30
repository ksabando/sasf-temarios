---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: OAuth2 PKCE Flow

**Solución esperada**:

**Diagrama de secuencia:**
```
1. Cliente genera code_verifier (random string) y code_challenge = SHA256(code_verifier)
2. Cliente → Auth Server: GET /authorize?response_type=code&client_id=taskflow&code_challenge=...&redirect_uri=...
3. Auth Server → Cliente: redirect_uri?code=auth_code_123
4. Cliente → Auth Server: POST /token?grant_type=authorization_code&code=auth_code_123&code_verifier=...&redirect_uri=...
5. Auth Server verifica code_verifier contra code_challenge
6. Auth Server → Cliente: { access_token, refresh_token, expires_in }
```

**Endpoints del servidor de autorización:**
- `GET /oauth2/authorize` — autorización (con PKCE)
- `POST /oauth2/token` — intercambiar código por token
- `POST /oauth2/refresh` — renovar access token
- `POST /oauth2/revoke` — revocar token

**Scopes para TaskFlow:**
```
read:tasks      — Leer tareas
write:tasks     — Crear/editar tareas
delete:tasks    — Eliminar tareas
read:users      — Leer perfiles de usuario
admin           — Administración completa
```

**Posibles mejoras**:
- Agregar el flujo `Client Credentials` para comunicación server-to-server (microservicios internos, jobs batch). Este flujo no involucra usuario: el cliente se autentica con `client_id` + `client_secret` y recibe un access token directamente. Es apropiado para el worker de notificaciones de TaskFlow que necesita leer tareas sin intervención de usuario.
- Especificar que los scopes deben ser lo más granulares posible siguiendo el principio de mínimo privilegio: `read:tasks` para una vista de dashboard, `write:tasks` para crear/editar, `delete:tasks` solo para admins. Esto permite que un token de integración third-party solo lea tareas sin poder modificarlas.
- Incluir `openid` como scope adicional si se usa OpenID Connect sobre OAuth2 para autenticación (obtener `id_token` con claims de identidad además del `access_token` para autorización).

---

## Ejercicio 4: CORS y Seguridad

**Solución esperada**:

**CORS Configuration:**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://app.taskflow.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowedHeaders("Authorization", "Content-Type", "X-Requested-With")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

**Security Headers Filter:**
```java
@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {
        HttpServletResponse res = (HttpServletResponse) response;
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        res.setHeader("Content-Security-Policy", "default-src 'self'");
        chain.doFilter(request, response);
    }
}
```

**Explicación de cada header:**
- **X-Content-Type-Options: nosniff** — Evita MIME sniffing. El navegador debe respetar el Content-Type declarado.
- **Strict-Transport-Security** — Obliga a usar HTTPS. El navegador recordará no usar HTTP por 1 año.
- **Content-Security-Policy** — Previene XSS y otros ataques de inyección. `default-src 'self'` solo permite cargar recursos del mismo origen.

**Posibles mejoras**:
- Agregar `Referrer-Policy: strict-origin-when-cross-origin` para controlar cuánta información de la URL se envía en el header `Referer` al navegar entre orígenes, previniendo leakage de tokens en URLs.
- Agregar `Permissions-Policy: geolocation=(), camera=(), microphone=()` para deshabilitar APIs del navegador que la API no necesita, reduciendo la superficie de ataque si la API se consume desde un frontend.
- Hacer la configuración de orígenes CORS dinámica desde `application.yml` en lugar de hardcodearla, permitiendo diferentes orígenes por ambiente (dev, staging, prod). Usar `@ConfigurationProperties` para cargar `cors.allowed-origins` y validar que en producción no contenga `*` o `localhost`.

