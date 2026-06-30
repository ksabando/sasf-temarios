---
sidebar_label: "Cuestionario"
---

# Cuestionario M07 — Docker Compose

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente la Compose Specification y cómo se diferencia de las versiones legacy v1, v2, v3 de Compose? ¿Por qué se creó una especificación separada del proyecto Docker?

**Respuesta**: La Compose Specification (compose-spec.io) es un estándar abierto y agnóstico de plataforma para definir aplicaciones multi-contenedor. Fue creada en 2020 por Docker en colaboración con AWS (ECS) y Microsoft (ACI) para que un mismo archivo compose se pueda desplegar en Docker Engine, ECS, ACI, y Kubernetes sin modificaciones. Las versiones legacy (v1: `docker-compose` Python, v2: format con `version: '2'`, v3: format con `version: '3'` para Swarm) estaban acopladas a la implementación de Docker. La Compose Specification elimina el campo `version:` (opcional, recomendado omitir) y define la semántica de forma declarativa sin referencias a la implementación subyacente. Los atributos específicos de plataforma (como `deploy:` para Swarm) se mantienen como extensiones.

**Por qué**: La especificación fue anunciada por Docker en abril 2020 (blog.docker.com) como parte de la estrategia de hacer Compose "cloud-agnostic". AWS y Microsoft participaron: AWS creó el docker/ecs-plugin que traduce un compose file a una task definition de ECS; Microsoft creó docker/aci-plugin para Azure Container Instances. La especificación separa "lo que el desarrollador quiere" (servicios, puertos, volúmenes) de "cómo se implementa" (Swarm constraints, ECS launch types). La versión actual de la especificación (v2.x, 2023+) agrega `profiles`, `watch`, `include`, y `develop` como features estándar.

---

### 2. [Investigar] ¿Cómo funciona `docker compose watch` (introducido en v2.22) y cómo se diferencia de los bind mounts con file watchers como nodemon? ¿Qué ventajas ofrece?

**Respuesta**: `docker compose watch` (v2.22+) es un modo de desarrollo que monitorea cambios en archivos locales y aplica acciones declarativas definidas en el compose file: `sync` (copia archivo cambiado al contenedor sin recrearlo), `rebuild` (reconstruye la imagen y recrea el contenedor), y `restart` (reinicia el contenedor). A diferencia de bind mounts + nodemon (donde el file watcher corre DENTRO del contenedor y el sistema de archivos está compartido): 1) `watch` copia archivos al contenedor en lugar de montar el filesystem del host (mejor rendimiento), 2) no requiere que la imagen tenga herramientas de desarrollo (watchers), 3) la lógica de qué acción tomar según qué archivo cambió está declarada en el compose file, no en código de la app, 4) funciona consistentemente en todos los OS (sin problemas de 9p en WSL 2). Ejemplo: si cambiás `package.json` → rebuild, si cambiás `src/app.js` → sync.

**Por qué**: `docker compose watch` fue presentado en DockerCon 2023 como una mejora del "inner loop" de desarrollo. La sintaxis:
```yaml
services:
  app:
    develop:
      watch:
        - path: package.json
          action: rebuild
        - path: src/
          action: sync
          target: /app/src/
```
Internamente, sync usa `docker cp` (o una API más eficiente) para copiar solo los archivos cambiados, y rebuild usa `docker compose build` del servicio. Es más rápido que bind mounts en macOS/Windows porque evita el overhead de filesystem compartido (9p, osxfs). Es la dirección futura del desarrollo local con Docker.

---

### 3. [Investigar] ¿Qué es `docker compose include` (introducido en Compose Spec v2.20+) y cómo permite modularizar archivos compose grandes? ¿Cómo se compara con el enfoque de múltiples archivos `-f`?

**Respuesta**: `include` permite que un compose file incluya otros compose files (locales o remotos) como subproyectos, fusionando sus recursos. Ejemplo:
```yaml
include:
  - path: ./database/compose.yaml
  - path: ./cache/compose.yaml
```
Cada archivo incluido se trata como un proyecto Compose independiente con su propio namespace (los recursos se prefijan con el nombre del proyecto incluido). A diferencia del enfoque `-f` (mergear múltiples archivos con `-f a.yml -f b.yml`): 1) `include` mantiene namespaces separados (los servicios del include no colisionan con los del archivo principal), 2) cada include puede tener su propia red y volúmenes aislados, 3) los includes pueden ser remotos (URL) o locales. El enfoque `-f` mergea los archivos en un solo namespace (útil para override por entorno).

**Por qué**: `include` fue creado inspirado en proyectos como Docksal y DDEV (entornos de desarrollo PHP) que necesitan componer entornos complejos a partir de bloques reutilizables. La especificación incluye `project_directory` para controlar el path base de cada include, y `env_file` para inyectar variables. Para modularización de microservicios: cada microservicio define su propio compose file con sus dependencias (BD, cache), y un compose file raíz los incluye a todos. Esto reemplaza el patrón de "mega compose file" difícil de mantener. La limitación: actualmente solo soportado por `docker compose` (implementación de Docker), no por herramientas third-party.

---

### 4. [Investigar] ¿Cómo funciona internamente el merge de múltiples archivos compose con `-f`? ¿Qué reglas sigue para listas, mappings, y escalares? ¿Cómo se comporta con servicios que aparecen en múltiples archivos?

**Respuesta**: Cuando usás `docker compose -f base.yml -f override.yml up`, Docker mergea los archivos en orden (izquierda a derecha). Las reglas: 1) **Mappings** (diccionarios como `environment`, `labels`, `deploy`): se mergean recursivamente — keys nuevas se agregan, keys existentes se sobrescriben con el valor del último archivo. 2) **Listas** (arrays como `ports`, `volumes`, `dns`): se REEMPLAZAN completamente (no se concatenan). Si `base.yml` define `ports: ["80:80"]` y `override.yml` define `ports: ["8080:80"]`, el resultado es solo `["8080:80"]`. 3) **Escalares** (strings, números): se sobrescriben. 4) **Servicios**: si un servicio aparece en ambos archivos, las configuraciones se mergean recursivamente. Si un servicio solo aparece en override, se agrega. Si un servicio solo aparece en base, se mantiene.

**Por qué**: La documentación oficial de Compose (docs.docker.com/compose/multiple-compose-files) explica estas reglas. El comportamiento de reemplazo de listas (en lugar de concatenación) es una decisión de diseño: si `ports` concatenara, al hacer override desde un archivo sería imposible REMOVER un puerto, solo agregar. Para agregar puertos manteniendo los existentes, debés repetir todos los puertos en el override. Alternativa: usar YAML anchors (`&ports`) para definir listas comunes y extenderlas con `<<:` (merge key) donde sea posible (pero `<<:` no funciona para listas en YAML estándar). Este comportamiento es la fuente más común de bugs en overrides de Compose.

---

### 5. [Conectar] La clase menciona `depends_on` con `condition: service_healthy`. ¿Qué limitaciones tiene este mecanismo y qué alternativas existen para garantizar readiness en entornos de producción reales (Kubernetes)?

**Respuesta**: `depends_on` con `condition: service_healthy` solo funciona en Compose (single-host). Sus limitaciones: 1) No existe en Swarm mode (ignorado en `docker stack deploy`), 2) No cubre el caso de que un servicio healthy deje de estarlo después del arranque (no reinicia automáticamente los dependientes), 3) Solo controla startup ordering, no runtime dependency checking. En Kubernetes, readiness se maneja con: 1) Readiness probes (si un Pod no está ready, no recibe tráfico del Service), 2) Init containers (ejecutan tareas hasta que el servicio dependencia está listo antes de arrancar el contenedor principal), 3) Retry logic en la aplicación (circuit breaker, exponential backoff) que es la capa más robusta.

**Por qué**: La distinción entre startup dependency y runtime dependency es clave. En producción, incluso si PostgreSQL estaba healthy al inicio, puede fallar después. La aplicación debe manejar esto con retry logic y circuit breakers. Kubernetes readiness probes son la evolución: si PostgreSQL falla, la app lo detecta (ya sea por readiness probe o por error en conexión). Init containers en K8s pueden ejecutar `pg_isready` o `wait-for-it.sh` antes de que el contenedor principal arranque, pero igual que `depends_on`, solo cubren startup. Herramientas como Linkerd/ Istio agregan circuit breaking que detecta fallas de dependencias en runtime sin modificar la aplicación.

---

### 6. [Conectar] La clase muestra `docker compose up -d`. ¿Cómo funciona exactamente `docker compose up --wait` (introducido en v2.1) y qué diferencia tiene con `condition: service_healthy`?

**Respuesta**: `--wait` hace que `docker compose up` espere hasta que TODOS los servicios alcancen el estado `healthy` (según su HEALTHCHECK) antes de retornar el control al terminal. Se diferencia de `condition: service_healthy` en que: 1) `--wait` es un comportamiento del COMANDO (espera antes de salir), no del orden de inicio entre servicios, 2) se aplica a todos los servicios, no por dependencia, 3) si un servicio no tiene HEALTHCHECK, `--wait` espera que el contenedor esté `running` (pero no puede verificar readiness real). `condition: service_healthy` controla el ORDEN (app no arranca hasta que db esté healthy). `--wait` controla la SINCRONIZACIÓN (el script de CI no continúa hasta que todos estén healthy). Se complementan.

**Por qué**: `--wait` fue agregado en Compose v2.1.0 (2022) específicamente para CI/CD. Antes, los pipelines necesitaban `sleep 30` después de `docker compose up -d` porque los servicios aún estaban inicializando. `--wait` elimina esto: espera hasta el timeout configurable (`--wait-timeout`). Internamente, consulta los healthchecks y estados de los contenedores en loop. Si un servicio falla el healthcheck, `--wait` detecta el estado `unhealthy` y sale con código de error, fallando el pipeline. Para servicios sin healthcheck (como un worker que no expone HTTP), `--wait` solo verifica que el contenedor esté running.

---

### 7. [Conectar] ¿Qué son los `profiles` en Docker Compose y cómo se relacionan con el patrón de "compose files modulares"? ¿Qué ventaja tienen sobre simplemente comentar/descomentar servicios?

**Respuesta**: `profiles` permite etiquetar servicios con uno o más perfiles (`profiles: [debug, tools]`) que NO se inician por defecto. Solo se inician si se especifica el perfil con `--profile debug`. Esto permite definir servicios opcionales (herramientas de debugging, servicios de monitoreo, workers específicos) en el mismo compose file sin ejecutarlos siempre. Ventaja sobre comentar/descomentar: 1) los servicios están definidos declarativamente en el archivo (versionado), 2) diferentes miembros del equipo pueden activar perfiles según necesidad sin modificar el archivo, 3) en CI, podés activar perfiles específicos para tests de integración.

**Por qué**: Profiles fue introducido en Compose v2 (Compose Specification). Un servicio puede pertenecer a múltiples profiles y un profile puede incluir múltiples servicios. `docker compose up` (sin `--profile`) solo inicia servicios sin `profiles:` o con `profiles: []`. `docker compose --profile debug up` inicia servicios del perfil debug más los servicios sin perfil. Esto es similar a Maven profiles o Spring profiles. Caso típico: `profiles: [monitoring]` para Prometheus/Grafana que solo necesitás en desarrollo y staging, no en CI.

---

### 8. [Cuestionar] ¿Es `docker compose` suficiente para producción o deberías siempre migrar a Kubernetes/Swarm para entornos productivos?

**Respuesta**: `docker compose` es suficiente para producción en casos específicos: aplicaciones single-host con tráfico moderado, herramientas internas, staging environments, y aplicaciones donde la alta disponibilidad no es crítica. Con `docker compose up -d` + restart policies (`unless-stopped`) + healthchecks + volúmenes persistentes + reverse proxy (Traefik/nginx), podés tener un entorno productivo confiable en un solo servidor. Para aplicaciones que requieren: escalado horizontal, zero-downtime deployments, distribución multi-nodo, auto-scaling, o que manejan tráfico de millones de usuarios — necesitás Kubernetes o al menos Swarm. La complejidad operativa de K8s no se justifica para todos los casos.

**Por qué**: La comunidad debate esto constantemente en /r/docker y HackerNews. La postura de empresas como 37signals (Basecamp, Hey) es que K8s es overkill para la mayoría: ellos usan bare-metal + Docker + kamal (anteriormente MRSK). Kelsey Hightower (creador del término "Kubernetes is the new J2EE") argumenta que la complejidad de K8s puede ser contraproducente. Sin embargo, para startups que esperan crecer rápido, empezar con K8s puede evitar un doloroso migration más adelante. La respuesta pragmática: Compose para MVPs y apps de baja escala, Swarm para multi-node simple, K8s cuando necesitás el ecosistema (operators, service mesh, GitOps).

---

### 9. [Cuestionar] "Kubernetes es el nuevo J2EE" — ¿es esta una crítica válida? ¿Está la industria sobre-ingenierizando soluciones con K8s cuando Docker Compose o Swarm serían suficientes?

**Respuesta**: La frase de Kelsey Hightower (KubeCon 2017) captura un fenómeno real: la complejidad de K8s ha llevado a abstracciones sobre abstracciones (Helm, Kustomize, Operators, Service Mesh, GitOps, CRDs), similar a cómo J2EE añadió capas de complejidad (EJBs, Application Servers, XML configurations) que luego fueron reemplazadas por soluciones más simples (Spring Boot). La crítica es válida para equipos que adoptan K8s "porque está de moda" sin necesitar sus capacidades. Para startups con 3 microservicios y 50 usuarios, K8s es sobre-ingeniería: Docker Compose + un VPS es suficiente. Para equipos con 50 microservicios, múltiples equipos, compliance, y escala horizontal, K8s es la herramienta correcta.

**Por qué**: Este debate fue central en KubeCon 2022-2024. Hightower mismo matizó su frase posteriormente: "K8s es una plataforma para construir plataformas, no una herramienta para desarrolladores". La tendencia actual es "Platform Engineering": un equipo construye una plataforma interna basada en K8s (con herramientas como Backstage, Crossplane, ArgoCD) y los desarrolladores interactúan con una interfaz simplificada (PaaS interno). Esto oculta la complejidad de K8s detrás de una capa de abstracción, similar a cómo Heroku ocultaba la complejidad de AWS. La lección de J2EE es: las abstracciones son buenas, pero demasiadas capas que el desarrollador debe entender son malas.

---

### 10. [Cuestionar] ¿Son los YAML anchors y extension fields (`x-`) buena práctica para reutilizar configuración en Compose o son un hack que debería reemplazarse con herramientas como Jsonnet/CUE/Helm?

**Respuesta**: YAML anchors (`&` y `*`) son un mecanismo nativo de YAML para reutilizar bloques, y `x-` extension fields son soportados por la Compose Specification para bloques reutilizables. Son una buena práctica para configuraciones compartidas simples dentro de un compose file (environment común, healthcheck estándar). Sus limitaciones: 1) anchors no funcionan entre archivos diferentes (solo dentro del mismo YAML), 2) el merge de anchors (`<<:`) no funciona para listas (solo mappings), 3) a medida que crece la complejidad (múltiples entornos, combinaciones de configuraciones), los anchors se vuelven difíciles de mantener. Jsonnet (Google), CUE (Google), y Helm (templates Go) son superiores cuando necesitás: condicionales reales (if/else), bucles, composición entre archivos, y validaciones de esquema.

**Por qué**: La comunidad de Compose reconoce las limitaciones de YAML para casos complejos. Jsonnet fue creado en Google para configurar Kubernetes (kube-prometheus, Grafana Tanka). CUE es un lenguaje de configuración y validación (unificado con la lógica de validación). Para Compose, si tu configuración es simple (2-3 servicios), YAML anchors son suficientes y no agregan dependencias extra. Si necesitás generar compose files para 20 microservicios con variaciones por entorno, Jsonnet/CUE o incluso una plantilla simple (jinja2, gomplate) es más mantenible. La Compose Specification recomienda extension fields como mecanismo estándar para reutilización dentro del ecosistema Compose.
