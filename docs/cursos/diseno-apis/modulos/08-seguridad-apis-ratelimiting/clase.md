---
sidebar_label: "Clase"
---

# Módulo 08 — Seguridad y Rate Limiting en APIs

## 1. Autenticación vs Autorización

| Concepto | Pregunta | Mecanismo |
|----------|----------|-----------|
| **Autenticación** | ¿Quién eres? | JWT, OAuth2, API Keys |
| **Autorización** | ¿Qué puedes hacer? | Roles, Permisos, Scopes |

## 2. API Keys

Identificación simple, sin expiración inherente.

```
GET /api/v1/tasks?api_key=abc123def456
GET /api/v1/tasks
X-API-Key: abc123def456
```

**Ventajas:** Simple de implementar y usar
**Desventajas:** Poca seguridad, no expiran, difíciles de rotar

## 3. JWT — JSON Web Token

**Estructura:** `header.payload.signature`

```json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload (claims)
{
  "sub": "user123",
  "iss": "https://auth.taskflow.com",
  "exp": 1712345678,
  "iat": 1712259278,
  "roles": ["USER"],
  "permissions": ["read:tasks", "write:tasks"]
}

// Signature: HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

### Implementación JWT en Spring Boot

```java
// Dependencias
implementation 'io.jsonwebtoken:jjwt-api:0.12.5'
implementation 'io.jsonwebtoken:jjwt-impl:0.12.5'
implementation 'io.jsonwebtoken:jjwt-jackson:0.12.5'
```

```java
@Component
public class JwtUtil {
    private final String secret = "mi-secreto-super-seguro-de-al-menos-256-bits";

    public String generateToken(String userId, String role) {
        return Jwts.builder()
            .subject(userId)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hora
            .signWith(getSigningKey())
            .compact();
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}
```

### Security Filter

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Claims claims = jwtUtil.validateToken(authHeader.substring(7));
                request.setAttribute("userId", claims.getSubject());
                request.setAttribute("role", claims.get("role"));
            } catch (Exception e) {
                response.setStatus(401);
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
```

## 4. OAuth2 Flows

| Flow | Uso |
|------|-----|
| **Authorization Code** | Frontend + Backend. El más seguro con PKCE |
| **Client Credentials** | Machine-to-machine, sin usuario |
| **PKCE** | SPAs y mobile apps |
| **Refresh Token** | Renovar access token sin re-autenticar |

## 5. Rate Limiting

### Algoritmos

| Algoritmo | Descripción | Ventajas | Desventajas |
|-----------|-------------|----------|-------------|
| **Fixed Window** | Cuenta requests por ventana fija (ej: 100 req/min) | Simple | Picos al final de la ventana |
| **Sliding Window** | Ventana deslizante, más preciso | Preciso | Más complejo |
| **Token Bucket** | Tokens se regeneran con el tiempo. Permite bursts | Flexible, bursts | Configuración |
| **Leaky Bucket** | Cola FIFO, procesa a velocidad constante | Rate constante | No permite bursts |

### Headers de Rate Limiting (IETF)

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1712345678
Retry-After: 45
```

### Implementación con Bucket4j

```xml
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>
```

```java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String clientId = getClientIdentifier(request);
        Bucket bucket = buckets.computeIfAbsent(clientId, this::createBucket);

        if (bucket.tryConsume(1)) {
            response.setHeader("X-RateLimit-Remaining",
                String.valueOf(bucket.getAvailableTokens()));
            chain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\": \"Too many requests\"}");
        }
    }

    private Bucket createBucket(String key) {
        return Bucket.builder()
            .addLimit(Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1))))
            .build();
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return userId != null ? userId : request.getRemoteAddr();
    }
}
```

## 6. CORS — Cross-Origin Resource Sharing

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://app.taskflow.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

## 7. Input Validation y Sanitización

```java
public class CreateTaskRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 100, message = "Title must be 1-100 chars")
    private String title;

    @Size(max = 1000)
    private String description;

    @Pattern(regexp = "^(LOW|MEDIUM|HIGH|CRITICAL)$")
    private String priority;
}
```

## 8. Headers de Seguridad

```java
@Configuration
public class SecurityHeadersConfig {

    @Bean
    public Filter securityHeadersFilter() {
        return (request, response, chain) -> {
            HttpServletResponse res = (HttpServletResponse) response;
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "DENY");
            res.setHeader("X-XSS-Protection", "0");
            res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            res.setHeader("Content-Security-Policy", "default-src 'self'");
            chain.doFilter(request, response);
        };
    }
}
```

## 9. Protección contra Injection

- **SQL Injection:** Usar JPA/Spring Data (parameterized queries), nunca concatenar SQL
- **NoSQL Injection:** Validar inputs, escapar caracteres especiales
- **Command Injection:** Nunca ejecutar comandos del sistema con input del usuario
