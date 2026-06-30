---
sidebar_label: "Ejercicio"
---

# Ejercicio 07: Efectos y Peticiones HTTP

## Objetivo
Conectar TaskFlow a una API real usando axios y useEffect, reemplazando el estado local.

## Pasos

1. **Instalar axios**
   ```bash
   cd taskflow
   npm install axios
   ```

2. **Crear `src/services/api.ts`**
   - Instancia de axios con `baseURL`
   - Opción A (Spring Task API): `http://localhost:8080/api` (backend del curso Spring M06-M08)
   - Opción B (json-server mock): `http://localhost:3001/api`
   - Configurar `Content-Type: application/json`
   - Agregar interceptor de respuesta para extraer `data`

3. **Crear `src/services/taskService.ts`**
   - `getAll()` → GET /tasks
   - `create(data)` → POST /tasks
   - `update(id, data)` → PUT /tasks/:id
   - `remove(id)` → DELETE /tasks/:id

4. **Actualizar `App.tsx`**
   - Usar `useEffect` con `[]` para cargar tareas al montar
   - Reemplazar `setTasks` local por llamadas a `taskService`
   - Agregar estado `loading` y mostrar spinner
   - Agregar estado `error` y mostrar mensaje

5. **Loading spinner**
   ```tsx
   {loading && <div className="text-center py-8"><div className="spinner" /> Cargando...</div>}
   {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}
   ```

6. **Manejo de errores**
   - try/catch en cada operación
   - Mostrar mensaje de error al usuario

## Mock API (opcional)
Si no hay backend, usar `json-server`:
```bash
npx json-server --watch db.json --port 3001
```
