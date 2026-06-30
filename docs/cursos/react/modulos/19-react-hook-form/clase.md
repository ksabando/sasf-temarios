---
sidebar_label: "Clase"
---

## Buenas prácticas

| Práctica | Detalle |
|----------|---------|
| **FormProvider** | Usar cuando hay componentes anidados que necesitan acceso al formulario |
| **zodResolver** | Validación con esquemas tipados y mensajes personalizados |
| **useWatch** | Para reaccionar a cambios de campos sin rerenderizar todo el form |
| **Debounced save** | Persistir draft con debounce (1s) para no escribir en cada tecla |
| **Modo onSubmit** | `mode: 'onSubmit'` (default) valida al enviar; `onChange` para validación en tiempo real |
