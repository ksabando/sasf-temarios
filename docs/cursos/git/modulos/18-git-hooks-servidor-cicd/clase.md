---
sidebar_label: "Clase"
---

# Hooks del Lado del Servidor y CI/CD

## Hooks del Lado del Servidor

Se ejecutan en el repositorio remoto (servidor) durante la recepción de pushes.

### pre-receive
Se ejecuta antes de aceptar el push. Si falla, se rechazan todos los cambios.

```bash
#!/bin/sh
# Validar que el push no contenga archivos binarios grandes
```

### update
Similar a pre-receive pero se ejecuta por cada rama actualizada. Recibe: nombre de la referencia, SHA antiguo y SHA nuevo.

### post-receive
Se ejecuta después de aceptar el push. Es ideal para:
- Disparar despliegues automáticos.
- Enviar notificaciones.
- Integrar con CI/CD.

```bash
#!/bin/sh
# Ejemplo: hacer checkout y reiniciar servicio
git --work-tree=/app checkout -f
systemctl restart mi-app
```

### post-update
Versión simplificada de post-receive (obsoleta en favor de post-receive).

## CI/CD con Hooks

### GitHub Actions
Se configura con archivos YAML en `.github/workflows/`.

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

### GitLab CI
Archivo `.gitlab-ci.yml` en la raíz del proyecto.

```yaml
stages:
  - test
  - deploy
test:
  script: npm test
deploy:
  script: npm run deploy
```

## Auto Deploy con post-receive + Webhook

Un script post-receive puede enviar un webhook a un servicio externo (ej: Jenkins, Slack) para iniciar un deploy o notificar al equipo.

```bash
#!/bin/sh
curl -X POST https://api.ci.com/deploy -H "Token: $TOKEN"
```

## Buenas Prácticas

- Hooks ligeros y rápidos para no retrasar el push.
- Registrar logs de ejecución para depuración.
- Implementar rollback ante fallos en deploy.
- Usar CI/CD declarativo (GitHub Actions, GitLab CI) en lugar de hooks complejos.
