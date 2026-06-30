---
sidebar_label: "Ejercicio"
---

# Ejercicio 08: Context API

## Objetivo
Implementar autenticación en TaskFlow usando Context API, con persistencia de token y protección de llamadas API.

## Pasos

1. **Crear `src/context/AuthContext.tsx`**
   - Definir interfaz `AuthState` con: `user`, `token`, `isAuthenticated`, `login`, `register`, `logout`
   - Crear `AuthContext` con `createContext`
   - Crear `AuthProvider` con estado de `user` y `token`
   - En `login`: llamar a la API, guardar token en localStorage, actualizar estado
   - En `register`: misma lógica
   - En `logout`: limpiar localStorage y estado

2. **Agregar interceptor axios** en `src/services/api.ts`
   - Leer token de `localStorage`
   - Agregar `Authorization: Bearer <token>` a toda request

3. **Envolver App** con `AuthProvider` en `main.tsx` (o index.tsx)

4. **Crear hook `useAuth`** (helper)
   ```tsx
   export const useAuth = () => {
     const context = useContext(AuthContext)
     if (!context) throw new Error('useAuth must be used within AuthProvider')
     return context
   }
   ```

5. **Mostrar login/registro** cuando `!isAuthenticated`
   - Formulario simple de email + password

## API endpoints (asumidos)
- `POST /auth/login` → `{ user, token }`
- `POST /auth/register` → `{ user, token }`
