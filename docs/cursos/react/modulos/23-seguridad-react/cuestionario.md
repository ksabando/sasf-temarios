---
sidebar_label: "Cuestionario"
---

# Cuestionario M23 — Seguridad en React

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es el patrón BFF (Backend For Frontend) y cómo mejora la seguridad de las SPAs React? ¿Por qué empresas como Auth0 y OWASP recomiendan BFF en lugar de tokens en localStorage?

**Respuesta**: BFF es un servidor ligero (usualmente Node.js) que actúa como intermediario entre la SPA React y los microservicios backend. En el contexto de seguridad: (1) el BFF almacena tokens en HttpOnly cookies (inaccesibles desde JS), eliminando el riesgo de robo de tokens por XSS, (2) el BFF maneja el refresh token flow sin exponer el refresh token al navegador, (3) el BFF puede validar CSRF tokens, (4) el BFF oculta la complejidad de los backends (React solo habla con el BFF). Auth0 y OWASP recomiendan BFF sobre tokens en localStorage porque localStorage es accesible desde cualquier script en la página (XSS).

**Por qué**: El flujo con BFF: React → BFF (cookie HttpOnly) → Spring Boot/API. React nunca ve el token — el BFF lo adjunta en las peticiones al backend. Si un atacante inyecta XSS, no puede leer la cookie (HttpOnly). El BFF también puede implementar rate limiting, validación de requests, y logging centralizado. Para TaskFlow, un BFF sería una capa adicional entre React y Spring Boot, incrementando la seguridad significativamente. Fuente: "The BFF Pattern" de Auth0, OWASP "SPA Security Cheat Sheet", y "Token Storage" en Auth0 docs.

---

### 2. [Investigar] ¿Qué es OAuth 2.0 + PKCE para SPAs y cómo reemplaza el "implicit flow" (deprecado)? ¿Por qué PKCE es necesario incluso si no tenés un client secret?

**Respuesta**: OAuth 2.0 + PKCE (Proof Key for Code Exchange) es el estándar moderno de autenticación para SPAs. Reemplaza el "implicit flow" (que exponía tokens en la URL) y el "authorization code flow sin secret" (vulnerable a interceptación del code). PKCE funciona así: (1) la SPA genera un `code_verifier` aleatorio y deriva un `code_challenge` (SHA-256), (2) redirige al usuario al Authorization Server con el `code_challenge`, (3) el usuario autentica y el server retorna un `authorization_code`, (4) la SPA intercambia el code + `code_verifier` por tokens. El atacante no puede intercambiar el code sin el `code_verifier` original.

**Por qué**: El implicit flow fue deprecado por el IETF (RFC 8252) porque los tokens en la URL son visibles en el historial del navegador y logs del servidor. PKCE resuelve esto sin requerir client secret (que las SPAs no pueden guardar seguramente). Hoy, cualquier SPA que use OAuth (Google, GitHub, Auth0) debe usar PKCE. Para TaskFlow, si integráramos login social, PKCE sería el flujo estándar. Fuente: "OAuth 2.0 for SPAs" best practices en IETF, docs de Auth0 sobre PKCE, y "Why PKCE is Important" en oauth.net.

---

### 3. [Investigar] ¿Qué es WebAuthn (Passkeys) y cómo podría reemplazar JWT/password authentication en una app React? Investigá cómo implementar login con Passkeys en una SPA.

**Respuesta**: WebAuthn es un estándar W3C que permite autenticación biométrica (huella digital, Face ID, Windows Hello) o con llave de seguridad física (YubiKey) usando criptografía de clave pública, sin contraseñas. El flujo: (1) el servidor genera un `challenge`, (2) el navegador (via `navigator.credentials.create()`) usa el autenticador del usuario para firmar el challenge con la clave privada del dispositivo, (3) el servidor verifica la firma con la clave pública almacenada. El resultado es un "Passkey" — una credencial phishing-resistant porque está vinculada al origen (origin) del sitio web.

**Por qué**: Passkeys eliminan la necesidad de contraseñas (y por lo tanto, el riesgo de phishing, credential stuffing, y password reutilization). Para React, la API es `navigator.credentials.get({ publicKey: options })`. La complejidad está en el backend (validar la respuesta criptográfica). Librerías como `@simplewebauthn` simplifican ambos lados. Para TaskFlow, Passkeys sería una feature avanzada (posiblemente en un módulo futuro), pero es el futuro de la autenticación web. Fuente: webauthn.guide, "Passkeys: A Developer's Guide" en web.dev, y la especificación WebAuthn en w3.org.

---

### 4. [Investigar] ¿Qué es la "Content Security Policy" a nivel profundo y cómo los "nonces" y "hashes" permiten CSP estricta incluso con CSS-in-JS? ¿Por qué `'unsafe-inline'` en `style-src` es inevitable para Framer Motion?

**Respuesta**: CSP con nonces: el servidor genera un valor aleatorio único por request (`nonce-abc123...`), lo incluye en el header CSP y en cada tag `<style>`/`<script>` (`<style nonce="abc123">`). El navegador solo ejecuta/aplica tags con el nonce correcto. Para CSS-in-JS (emotion, styled-components, Framer Motion style prop), las librerías inyectan `<style>` tags dinámicamente en runtime. Para que CSP funcione sin `'unsafe-inline'`, estas librerías necesitan soporte para nonces (leer un nonce del DOM y aplicarlo a sus style tags). Framer Motion actualmente no soporta nonces bien, por lo que `style-src 'unsafe-inline'` suele ser inevitable.

**Por qué**: CSP estricta con `script-src 'self'` es fácil (React/Vite no generan scripts inline). Pero `style-src` es más complejo porque CSS-in-JS y Framer Motion inyectan estilos inline en runtime. La solución ideal: migrar a CSS Modules o Tailwind (que no generan inline styles, solo clases). Para Framer Motion, podés limitar el daño usando `style-src 'unsafe-inline'` en lugar de `script-src 'unsafe-inline'` (XSS via CSS es menos peligroso que XSS via scripts). Fuente: CSP docs en MDN, "CSP and CSS-in-JS" en el blog de emotion, y "Content Security Policy for React Apps" por Scott Helme.

---

### 5. [Conectar] La clase almacena JWT en localStorage. Conectá esto con el riesgo de XSS y las mitigaciones modernas (CSP, Trusted Types, Subresource Integrity). ¿Qué defensas en profundidad deberías implementar si usás localStorage para tokens?

**Respuesta**: Si usás localStorage, implementá defensas en profundidad: (1) CSP estricta sin `'unsafe-inline'` en `script-src` (previene ejecución de scripts inyectados), (2) Trusted Types (previene que innerHTML/DOM XSS se conviertan en ejecución de código), (3) DOMPurify para sanitizar cualquier HTML (de API, user input), (4) Subresource Integrity (SRI) en scripts cargados de CDN (previene que un CDN comprometido inyecte código), (5) access tokens de vida corta (15 min) + refresh token rotation (refresh token se invalida después de usarse), (6) detección de anomalías (monitorear si el token se usa desde IPs/locations inusuales).

**Por qué**: Cada capa mitiga un vector diferente. CSP mitiga XSS reflejado/almacenado. Trusted Types mitiga DOM-based XSS. DOMPurify mitiga HTML injection. Token de vida corta limita el daño si es robado. Refresh token rotation limita el daño de refresh token robado. Ninguna capa es suficiente sola. La combinación reduce el riesgo a un nivel aceptable para muchas aplicaciones. Fuente: OWASP "Defense in Depth", Trusted Types en web.dev, y "Securing SPAs with CSP" por Scott Helme.

---

### 6. [Conectar] La clase menciona CSRF. Conectá esto con SameSite cookies y el patrón "Double Submit Cookie". ¿Cómo protegerías una API Spring Boot de CSRF cuando el frontend React usa JWT?

**Respuesta**: Con JWT enviado en header `Authorization: Bearer <token>`, la app es inherentemente inmune a CSRF tradicional porque CSRF explota cookies que el navegador envía automáticamente. Un atacante no puede hacer que el navegador envíe un header `Authorization` custom (solo puede hacer que envíe cookies). Pero si usás cookies para almacenar el token (incluso no-HttpOnly), necesitás protección CSRF. Estrategias: (1) SameSite=Strict/Lax en la cookie (el navegador no envía la cookie en requests cross-origin), (2) Double Submit Cookie: el servidor setea un CSRF token en una cookie y el frontend lo envía en un header; el servidor compara ambos, (3) Custom header requirement: exigir un header custom (como `X-Requested-With`) en requests que modifican estado.

**Por qué**: Spring Boot con JWT (stateless) típicamente no necesita CSRF porque no hay sesión basada en cookies. Si Spring Boot está configurado con `.csrf().disable()` y usás JWT en Authorization header, estás protegido. El riesgo de CSRF solo aplica si usás cookies para autenticación. Fuente: "CSRF and JWT" en Spring Security docs, OWASP "CSRF Prevention Cheat Sheet", y "Should you use CSRF with JWT?" en el blog de Okta.

---

### 7. [Conectar] La clase implementa RBAC básico (admin/user). Conectá esto con el patrón "Attribute-Based Access Control" (ABAC) y "Policy-Based Access Control". ¿Cómo escalaría la autorización en TaskFlow con permisos granulares?

**Respuesta**: RBAC (roles) escala mal cuando necesitás permisos granulares (admin puede editar tareas, manager puede editar solo tareas de su equipo, user solo puede editar sus propias tareas). ABAC usa atributos (user.team, task.department, timeOfDay) y policies (reglas declarativas). Librerías como Casbin o OPA (Open Policy Agent) evalúan policies: `allow if user.role == 'manager' AND task.team == user.team`. Esto es más flexible que RBAC porque las combinaciones de atributos no requieren nuevos roles.

**Por qué**: En TaskFlow, ABAC permitiría reglas como: "un user puede completar SOLO sus propias tareas", "un manager puede archivar tareas de su equipo mayores a 30 días", etc. Casbin implementa esto con un modelo PERM (Policy, Effect, Request, Matchers). OPA usa Rego, un lenguaje declarativo de policies. Ambos pueden correr en el backend (Spring Boot) o en el BFF. El frontend React seguiría necesitando ocultar/mostrar UI según permisos, pero la autorización real SIEMPRE se valida en el backend. Fuente: casbin.org, openpolicyagent.org, y "RBAC vs ABAC" en el blog de Auth0.

---

### 8. [Cuestionar] ¿localStorage vs HttpOnly cookies para JWT en 2026? La clase dice que localStorage es aceptable con mitigaciones. ¿Es realmente aceptable o deberíamos siempre preferir HttpOnly cookies?

**Respuesta**: En 2026, HttpOnly cookies son la recomendación principal de OWASP, Auth0, y el equipo de React para aplicaciones que manejan datos sensibles. localStorage es "aceptable con mitigaciones" para aplicaciones de baja criticidad (prototipos, herramientas internas). La diferencia práctica: con HttpOnly cookies, incluso si tenés una vulnerabilidad XSS, el token no puede ser robado. Con localStorage + mitigaciones, reducís la probabilidad de XSS pero el token sigue siendo accesible SI ocurre XSS. La tendencia de la industria es migrar hacia BFF + HttpOnly cookies como estándar.

**Por qué**: El costo de implementar BFF + cookies es significativo (necesitás un servidor backend, manejar CSRF, configurar dominios). Para TaskFlow (educativo), localStorage + CSP es suficiente y más simple de enseñar. Para una app de producción con datos sensibles (financiera, salud), BFF + HttpOnly cookies es el estándar. Fuente: OWASP "Session Management Cheat Sheet" 2025 update, Auth0 "Token Storage" recommendations, y "Why HttpOnly cookies are better" en el blog de Scott Helme.

---

### 9. [Cuestionar] ¿CSP con `'unsafe-inline'` en style-src — es realmente necesario para Framer Motion y CSS-in-JS? ¿O deberíamos cambiar nuestras herramientas para poder usar CSP estricta?

**Respuesta**: Con Tailwind CSS (que genera solo clases, no inline styles), podés tener CSP estricta (`style-src 'self'`) eliminando `'unsafe-inline'`. Framer Motion inyecta estilos inline en runtime (via el style prop transformado), por lo que si usás Framer Motion, necesitás `'unsafe-inline'` en `style-src` o configurar Framer Motion para usar nonces. La decisión: ¿vale la pena debilitar CSP por Framer Motion? Para TaskFlow, si podemos animar con CSS transitions + clases Tailwind en lugar de Framer Motion para algunos casos, podemos endurecer CSP. Para animaciones complejas que requieren Framer Motion, aceptamos `'unsafe-inline'` en style-src (menos riesgo que script-src).

**Por qué**: XSS via CSS es posible pero mucho más limitado que XSS via scripts. Un atacante con `style-src 'unsafe-inline'` podría: (1) hacer phishing visual (cambiar estilos para engañar al usuario), (2) exfiltrar datos via CSS attribute selectors + background-image URL (técnica avanzada). Pero no puede ejecutar JavaScript ni robar tokens directamente. Por eso `style-src 'unsafe-inline'` es menos riesgoso que `script-src 'unsafe-inline'`. Fuente: "CSS Injection Attacks" en el blog de Cure53, CSP docs sobre style-src, y "Framer Motion + CSP" en el repo de Framer Motion.

---

### 10. [Cuestionar] ¿JWT vs session cookies en 2026? Con el resurgimiento de BFF y Server Components, las sesiones tradicionales están volviendo. ¿Es JWT aún relevante para SPAs?

**Respuesta**: JWT sigue siendo relevante para: (1) APIs stateless que necesitan escalar horizontalmente sin compartir estado de sesión, (2) microservicios donde el token viaja entre servicios, (3) autenticación cross-domain (múltiples APIs en diferentes dominios). Las sesiones tradicionales (cookie con session ID, estado en servidor) están volviendo con BFF porque: (1) son más simples (no necesitás manejar refresh tokens, expiración, rotación en el frontend), (2) son más seguras (el frontend nunca ve el token), (3) con Server Components, el servidor maneja la auth y el frontend solo recibe datos. Para TaskFlow con Spring Boot (stateless JWT por diseño), JWT es la elección natural. Para un proyecto nuevo con Next.js/Remix, sesiones podrían ser más simples.

**Por qué**: El péndulo de la industria oscila entre stateless (JWT) y stateful (sesiones). JWT fue sobre-usado en 2018-2022 (se usaba incluso cuando una sesión era más apropiada). La tendencia 2025-2026 es: JWT para APIs y microservicios, sesiones con cookies HttpOnly para SPAs con BFF. No hay una solución universal — depende de la arquitectura del backend. Fuente: "JWT vs Sessions" en el blog de Redis, "Stop using JWT for sessions" (artículo controversial), y la postura de Dan Abramov sobre auth en React.
