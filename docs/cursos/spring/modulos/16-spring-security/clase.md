---
sidebar_label: "Clase"
---

## 2. SecurityConfig.java

```java
package com.sasf.taskapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/tasks/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults())
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## 3. In-Memory User para pruebas

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

---

## 4. CustomUserDetailsService.java

```java
package com.sasf.taskapi.service;

import com.sasf.taskapi.model.User;
import com.sasf.taskapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException(
                "User not found: " + username));

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
}
```

### Agregar campo role en User

```java
private String role = "USER"; // por defecto
// getters y setters
```

---

## 5. Roles ADMIN/USER

```java
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Task createTask(@RequestBody Task task) {
        return taskService.save(task);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteById(id);
    }
}
```

---

## 6. CORS explicado

```java
configuration.setAllowedOrigins(List.of("http://localhost:5173")); // React frontend
configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
configuration.setAllowedHeaders(List.of("*"));
configuration.setAllowCredentials(true); // permite cookies/Authorization headers
```

---

## 7. CSRF deshabilitado

CSRF se deshabilita porque la API REST usa autenticación basada en tokens (Basic Auth o JWT), no cookies de sesión. Las APIs REST son stateless.

---

## 8. Protección por método

```java
@PreAuthorize("hasRole('ADMIN')")    // solo ADMIN
@PreAuthorize("hasRole('USER')")     // solo USER
@PreAuthorize("isAuthenticated()")   // cualquier usuario autenticado
@PreAuthorize("permitAll()")         // público
```

---

## 9. Endpoints de la API

| Método | Endpoint | Acceso |
|--------|----------|--------|
| GET | `/api/tasks` | Autenticado |
| POST | `/api/tasks` | ADMIN |
| PUT | `/api/tasks/{id}` | ADMIN |
| DELETE | `/api/tasks/{id}` | ADMIN |
| GET | `/api/users` | ADMIN |
| GET | `/api/tasks/search` | Autenticado |
| - | `/h2-console` | Público (dev) |

---

## 10. Resumen

- `SecurityFilterChain` define las reglas de seguridad
- `PasswordEncoder` (BCrypt) codifica contraseñas
- `CustomUserDetailsService` carga usuarios desde BD
- CORS permite peticiones desde React (`localhost:5173`)
- CSRF deshabilitado para APIs REST stateless
- `@PreAuthorize` protege métodos por rol
