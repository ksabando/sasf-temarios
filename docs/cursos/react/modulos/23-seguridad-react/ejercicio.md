---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Roles — admin vs user

Implementar control de acceso basado en roles:

1. Agregar campo `role: 'admin' | 'user'` al modelo de usuario
2. Crear componente `<AdminRoute>` que redirija a `/` si el usuario no es admin
3. En el Dashboard:
   - **Admin**: ve todas las tareas de todos los usuarios
   - **User**: solo ve sus propias tareas (filtradas por `assignedTo`)
4. Mostrar/ocultar elementos de UI según rol (ej: botón "Administrar usuarios" solo para admin)

---

## Ejercicio 3: XSS — sanitizar inputs

1. Instalar `DOMPurify`: `npm install dompurify && npm install -D @types/dompurify`
2. Crear función `sanitizeInput` que limpie texto de etiquetas HTML
3. Aplicar sanitización en:
   - Input de título de tarea (antes de guardar en store)
   - Input de descripción de tarea
4. Si hay algún componente que use `dangerouslySetInnerHTML`, sanitizar con DOMPurify antes

**Archivo:** `src/utils/sanitize.ts`

---

## Ejercicio 4: Content Security Policy

Configurar CSP de dos formas:

**A) En nginx.conf** (para Docker/producción):
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.taskflow.com;";
```

**B) En index.html** (para desarrollo):
```html
<meta http-equiv="Content-Security-Policy" content="...">
```

Verificar que la app funcione correctamente con la política aplicada.

---

## Ejercicio 5: Rate limiting

Implementar dos medidas de rate limiting:

**A) Debounce en búsqueda:**
- Crear hook `useDebounce` si no existe
- Aplicar al input de búsqueda del Dashboard con 300ms de delay
- Verificar que la llamada a API no se dispare en cada tecla

**B) Limitar intentos de login:**
- Crear hook `useLoginRateLimit`
- Máximo 5 intentos antes de bloquear por 60 segundos
- Mostrar contador de intentos restantes en el formulario de login
- Deshabilitar el botón de submit durante el bloqueo
