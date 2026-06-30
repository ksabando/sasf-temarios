---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 3: Protección por roles

```java
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Task> getAllTasks() { ... }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Task createTask(@RequestBody Task task) { ... }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTask(@PathVariable Long id) { ... }
}
```

---

## Respuesta 4: CORS

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

Se permiten los métodos HTTP estándar y headers como `Authorization` (para JWT) y `Content-Type`. `OPTIONS` es necesario para las preflight requests del navegador.

---

## Respuesta 5: In-Memory users

```java
@Bean
public UserDetailsService testUsers() {
    UserDetails admin = User.builder()
        .username("admin")
        .password(passwordEncoder().encode("admin123"))
        .roles("ADMIN")
        .build();

    UserDetails user = User.builder()
        .username("user")
        .password(passwordEncoder().encode("user123"))
        .roles("USER")
        .build();

    return new InMemoryUserDetailsManager(admin, user);
}
```

