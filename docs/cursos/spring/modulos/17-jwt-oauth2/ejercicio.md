---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: SecurityConfig con JWT

Modifica `SecurityConfig` para:
- Deshabilitar CSRF
- Usar sesiones STATELESS
- Permitir `/api/auth/**` sin autenticar
- Proteger `/api/tasks/**` y el resto
- Agregar `JwtAuthenticationFilter` antes de `UsernamePasswordAuthenticationFilter`
- Configurar CORS para localhost:5173

---

## Ejercicio 4: AuthController y AuthService

Implementa:
- `AuthController` con endpoints `POST /api/auth/login` y `POST /api/auth/register`
- `AuthService` con la lógica de autenticación y registro
- DTOs: `LoginRequest`, `RegisterRequest`, `AuthResponse`

El `AuthService` debe usar `AuthenticationManager` para login y `PasswordEncoder` para registrar.

---

## Ejercicio 5: Proteger Task endpoints

Muestra cómo React TaskFlow debe incluir el JWT en cada request. Explica:
- Cómo se obtiene el token del login
- Cómo se almacena en el frontend
- Cómo se envía en el header `Authorization`
- Qué ocurre si el token expira
