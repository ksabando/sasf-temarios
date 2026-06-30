---
sidebar_label: "Soluciones"
---

# Soluciones M18 — Helm Charts

## Ejercicio 1: Crear un chart
**Solución esperada**:
```bash
helm create demo
# Crea la estructura completa del chart:
# demo/
#   Chart.yaml, values.yaml, templates/, charts/, .helmignore
```

**Posibles mejoras**:
- Personalizar `Chart.yaml` con metadatos correctos: `name`, `description`, `appVersion`, y `version` (versión del chart, no de la app). Seguir Semantic Versioning para la versión del chart.
- Agregar `dependencies` en Chart.yaml para charts externos (ej. postgresql de Bitnami) si tu aplicación los requiere, definiendo versión y repositorio.
- Incluir `templates/tests/` con tests de Helm para validar la instalación: `helm test demo` ejecuta pods de prueba que verifican que la aplicación responde.

---

## Ejercicio 2: Upgrade con valores personalizados
**Solución esperada**:
```bash
helm upgrade myrelease ./mychart -f values.yaml
# Actualiza el release con valores definidos en el archivo YAML
```

**Posibles mejoras**:
- Usar múltiples archivos de valores para separar entornos: `helm upgrade myrelease ./mychart -f values-base.yaml -f values-prod.yaml` donde el segundo sobrescribe al primero.
- Agregar `--wait --timeout 5m0s` para esperar a que todos los recursos estén listos antes de retornar, detectando fallas temprano en CI/CD.
- Usar `--dry-run` para validar los manifests sin aplicarlos: `helm upgrade --dry-run --debug myrelease ./mychart` muestra los templates renderizados y ayuda a detectar errores antes del deploy real.

---

## Ejercicio 3: Instalar con --set
**Solución esperada**:
```bash
helm install --set replicaCount=5 --set image.tag=alpine myrelease ./mychart
# Instala el chart sobrescribiendo valores específicos desde la línea de comandos
```

**Posibles mejoras**:
- Para valores complejos, usar `--set-json` en lugar de `--set`: `--set-json 'resources={"limits":{"cpu":"500m","memory":"256Mi"}}'` para pasar objetos JSON directamente sin la sintaxis de punto.
- Combinar `--set` para valores dinámicos (tag de build) con `-f` para valores estáticos (configuración de entorno): `helm install -f values-prod.yaml --set image.tag=$CI_COMMIT_SHA myrelease ./mychart`.
- Verificar los valores efectivos: `helm get values myrelease` muestra todos los valores usados en el release actual.

---

## Ejercicio 4: Buscar e instalar charts de repositorios
**Solución esperada**:
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo nginx
helm install nginx bitnami/nginx
```

**Posibles mejoras**:
- Inspeccionar los valores configurables antes de instalar: `helm show values bitnami/nginx` para ver todas las opciones de configuración con documentación.
- Usar `--version` para fijar una versión específica del chart: `helm install nginx bitnami/nginx --version 15.0.0` para despliegues reproducibles y evitar cambios inesperados.
- Agregar repositorios privados (Harbor, ChartMuseum, OCI): `helm repo add myrepo https://charts.internal.com --username user --password pass` o `helm push ./mychart oci://registry.internal.com/charts`.

---

## Ejercicio 5: Rollback
**Solución esperada**:
```bash
helm rollback myrelease 1
# Vuelve a la revisión 1 (primera instalación)
helm history myrelease
# Muestra el historial de revisiones con la nueva revisión creada por el rollback
```

**Posibles mejoras**:
- Antes del rollback, inspeccionar la revisión destino: `helm get values myrelease --revision=2` para ver qué valores se usaron en esa revisión.
- Automatizar rollback en CI/CD: ejecutar `helm test` después del upgrade; si falla, ejecutar `helm rollback myrelease` automáticamente.
- Configurar `--history-max` al instalar para limitar revisiones almacenadas: `helm install myrelease ./mychart --history-max 20` (default es 10).
