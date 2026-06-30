---
sidebar_label: "Cuestionario"
---

# Cuestionario M08 — Variables de Entorno y Configuración

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funcionan los BuildKit secrets (`--mount=type=secret`) y por qué son superiores a `ARG`/`ENV` para manejar secretos durante el build? ¿Qué limitaciones tienen?

**Respuesta**: BuildKit secrets montan un archivo temporal (tmpfs) en el build container durante la ejecución de un RUN específico, y el archivo NO persiste en ninguna capa de la imagen. Se declaran en el Dockerfile: `RUN --mount=type=secret,id=mysecret cat /run/secrets/mysecret` y se pasan en el build: `docker build --secret id=mysecret,src=token.txt`. Son superiores a ARG/ENV porque: 1) los valores de ARG quedan en el historial de capas (`docker history --no-trunc` los expone), 2) los ENV persisten en los metadatos de la imagen, 3) los secretos de BuildKit existen SOLO durante la ejecución del RUN que los declara y SOLO en ese build container. Limitaciones: 1) solo funcionan con BuildKit (no builder legacy), 2) requieren sintaxis específica en el Dockerfile (no todas las herramientas CI/CD lo soportan nativamente), 3) no sirven para secretos que necesitás en ENTRYPOINT/CMD (solo durante build).

**Por qué**: BuildKit fue diseñado por Tõnis Tiigi (Docker) con secretos como feature de primera clase, inspirado en el problema recurrente de secretos en imágenes públicas. La especificación de BuildKit secrets (github.com/moby/buildkit) documenta que el secret se monta en un tmpfs con permisos 0400, y se desmonta inmediatamente al terminar el RUN. La capa resultante no contiene el archivo. En CI/CD con GitHub Actions: `docker buildx build --secret id=npm_token,src=<(echo "$NPM_TOKEN")`. Para secretos en runtime (CMD/ENTRYPOINT), se usan Docker secrets (Swarm) o Kubernetes secrets.

---

### 2. [Investigar] ¿Qué es envsubst y cómo se usa para generar archivos de configuración dinámicos a partir de variables de entorno en el ENTRYPOINT? ¿Qué limitaciones y alternativas existen (confd, consul-template)?

**Respuesta**: `envsubst` (parte de gettext) reemplaza variables de entorno (`$VAR` o `${VAR}`) en un template de texto, generando un archivo de configuración final en el entrypoint del contenedor. Patrón típico en un docker-entrypoint.sh: `envsubst < /app/config.template.yml > /app/config.yml`. Las limitaciones: 1) solo sustitución simple (sin condicionales, loops, ni defaults), 2) si la variable no está definida, la reemplaza por string vacío (sin warning), 3) no soporta estructuras de datos complejas. Alternativas: **confd** (de Kelsey Hightower, usa templates Go con acceso a múltiples backends: env vars, etcd, Consul, Vault), **consul-template** (HashiCorp, similar pero integrado con Consul), y **gomplate** (templates Go con funciones ricas).

**Por qué**: `envsubst` es popular por ser mínimo (parte de gettext, incluido en Alpine) y cubrir el 80% de los casos (configuraciones simples como database URLs). confd fue el pionero (2014) y definió el patrón: template + backend + reload signal. consul-template es más específico de ecosistema HashiCorp. Para aplicaciones que necesitan configuración dinámica no solo al inicio sino en runtime (cambios en secrets, feature flags), consul-template escucha cambios en Consul/Vault y regenera/recarga automáticamente. En Kubernetes, los ConfigMaps montados como archivos se actualizan automáticamente sin necesidad de entrypoint scripting (aunque la app debe recargar la configuración).

---

### 3. [Investigar] ¿Cómo funciona HashiCorp Vault en el contexto de Docker y Kubernetes para la gestión de secretos dinámicos? ¿Qué diferencia hay entre secrets estáticos y dinámicos?

**Respuesta**: Vault (HashiCorp) es un gestor de secretos que puede inyectar credenciales en contenedores Docker/K8s sin que la aplicación conozca la fuente. Secrets estáticos: Vault almacena un valor fijo (API key, contraseña) y lo sirve. Secrets dinámicos: Vault genera credenciales temporales on-the-fly (ej. crea un usuario temporal en PostgreSQL con TTL de 1 hora) y las revoca al expirar. En Docker, Vault Agent (sidecar) autentica con el host/K8s, obtiene secrets, y los escribe en un volumen compartido que el contenedor principal lee. En K8s, Vault Secrets Operator o External Secrets Operator sincronizan secrets de Vault a Secrets de K8s automáticamente. La diferencia clave: con secrets estáticos, si la credencial se filtra, debés rotarla manualmente. Con dinámicos, cada instancia obtiene credenciales únicas con TTL corto, limitando el radio de explosión.

**Por qué**: Armon Dadgar (co-founder HashiCorp) y el equipo de Vault diseñaron los secrets dinámicos como la killer feature de Vault. Un secreto dinámico para PostgreSQL: Vault crea un usuario temporal con `CREATE ROLE "vault-token-xyz" WITH LOGIN PASSWORD '...' VALID UNTIL '...'`, entrega las credenciales, y cuando el TTL expira, las revoca automáticamente. Esto resuelve el problema de "secret sprawl" (credenciales copiadas en múltiples lugares) y rotación automática. En K8s, herramientas como External Secrets Operator (GoDaddy/ comunidad) sincronizan Vault (y AWS Secrets Manager, GCP Secret Manager, Azure Key Vault) a Secrets de K8s con refresh automático.

---

### 4. [Investigar] ¿Cómo funciona la interpolación de variables en Docker Compose cuando combinás múltiples archivos `.env` y variables de shell? ¿Qué es `env_file` en el contexto de interpolación vs runtime environment?

**Respuesta**: En Compose, hay dos mecanismos distintos: 1) **Interpolación**: resuelve `${VAR}` en el YAML usando variables del archivo `.env` (por defecto) + variables de shell del proceso `docker compose`. El archivo `.env` se busca automáticamente en el directorio del proyecto. La precedencia: shell env > `.env` file > default `${VAR:-default}`. 2) **env_file** (en el servicio): carga variables de entorno DENTRO del contenedor en runtime, no afecta la interpolación del YAML. Si querés que una variable del `.env` llegue al contenedor, debés referenciarla explícitamente con `environment: - VAR=${VAR}`. Si no, la variable solo se usa para interpolar el YAML y no llega al runtime.

**Por qué**: La documentación de Compose (docs.docker.com/compose/environment-variables) es explícita sobre esta distinción, pero es una fuente común de confusión. El `.env` es para parametrizar el despliegue (qué versión de imagen, qué puerto). `env_file` y `environment` son para configurar el runtime del contenedor. Para debugging: `docker compose config` muestra el YAML resultante con todas las interpolaciones resueltas, y `docker compose run <service> env` muestra qué variables ve el contenedor. Si una variable del `.env` no aparece en el YAML interpolado NI en el runtime, no fue referenciada explícitamente.

---

### 5. [Conectar] La clase menciona el orden de precedencia de variables. ¿Cómo se relaciona esto con el principio III de 12 Factor App ("Store config in the environment")? ¿Cuál es la forma correcta de externalizar configuración en 2025?

**Respuesta**: El principio III de 12 Factor App dice que la configuración que varía entre deploys (URLs de BD, credenciales, flags) debe estar en variables de entorno, NO en código ni archivos de configuración por entorno embebidos en la imagen. La clase muestra el orden de precedencia de estas variables en Docker. En 2025, la forma correcta de externalizar ha evolucionado más allá de variables de entorno planas: 1) Variables de entorno para configuraciones simples (URLs, flags), 2) Archivos de configuración montados desde Secrets/ConfigMaps para configuraciones complejas (YAML, JSON, TOML), 3) Gestores de secretos externos (Vault, AWS Secrets Manager) para credenciales dinámicas con rotación, 4) Feature flags (LaunchDarkly, Unleash) para configuración de negocio que cambia sin redeploy, 5) Configuración runtime via API (Spring Cloud Config, Consul KV). Las variables de entorno siguen siendo la base, pero no son suficientes para configuraciones complejas y secretos.

**Por qué**: Adam Wiggins (co-autor de 12 Factor App) actualizó su postura en 2020: "Environment variables are still the right starting point, but they have limitations (unstructured, all strings, visible in /proc). For complex configs, use mounted files." El problema de visibilidad es crítico: las variables de entorno son leíbles en `/proc/<pid>/environ`, logs de crash, y tools de monitoreo. Para secretos, montar archivos desde un tmpfs (Docker secrets, K8s secrets montados como volumen) es más seguro. La tendencia es: variables de entorno para no-secretos, archivos montados para secretos y configuraciones complejas, y API de configuración para hot-reload sin reinicio.

---

### 6. [Conectar] ¿Qué son Docker Configs y en qué se diferencian de Secrets? ¿Por qué existen como entidades separadas si técnicamente se implementan de forma similar?

**Respuesta**: Docker Configs (`docker config create`) y Secrets (`docker secret create`) se implementan de forma casi idéntica: ambos se almacenan en el Raft log del manager, se transmiten con TLS mutuo a los workers, y se montan como archivos en el contenedor. La diferencia es semántica y de seguridad: 1) Secrets se almacenan CIFRADOS en disco (en el Raft log del manager y en tránsito), mientras Configs se almacenan en texto plano en el Raft log (solo se cifran en tránsito), 2) Secrets se montan en `/run/secrets/` (tmpfs, en memoria, no persisten en disco del worker), Configs se montan en `/` por defecto (pueden estar en disco), 3) Secrets tienen restricciones de tamaño (500 KB por defecto, configurable) porque deben almacenarse en RAM, Configs no. Existen separados para compliance y auditoría: un auditor puede verificar que los secretos están cifrados en reposo, mientras los configs no requieren ese tratamiento.

**Por qué**: La documentación de Docker (docs.docker.com/engine/swarm) explica que la separación permite políticas de acceso diferenciadas y claridad semántica. En la práctica, para una `nginx.conf`, creás un Config (no necesitás cifrado). Para una clave de API, creás un Secret. Ambos se rotan igual: `docker secret rm old && docker service update --secret-rm old --secret-add new`. La implementación subyacente usa el mismo mecanismo de distribución, pero los metadatos (cifrado en reposo sí/no) y el mount point por defecto difieren. En Kubernetes, ConfigMaps y Secrets también son similares (ambos pueden montarse como archivos o usarse como env vars), y la diferencia principal es que Secrets pueden configurarse con Encryption at Rest.

---

### 7. [Conectar] ¿Qué diferencias hay entre ENTRYPOINT con exec form y shell form en relación a variables de entorno y señales? ¿Por qué el shell form es problemático?

**Respuesta**: **Exec form**: `ENTRYPOINT ["python", "app.py"]` — ejecuta `python` directamente como PID 1. Las variables de entorno definidas con ENV en el Dockerfile o `-e` en `docker run` están disponibles normalmente. Las señales (SIGTERM) se entregan directamente al proceso Python. **Shell form**: `ENTRYPOINT python app.py` — ejecuta `/bin/sh -c "python app.py"`. El shell es PID 1, no Python. Problemas: 1) el shell ignora SIGTERM (PID 1 especial en Linux: ignora señales sin handler), así que `docker stop` no llega a Python — Docker espera 10 segundos y envía SIGKILL (sin graceful shutdown), 2) las variables de entorno funcionan igual (el shell las hereda y las pasa a Python), pero no podés pasar argumentos adicionales desde `docker run` porque el shell no los forwardea a ENTRYPOINT.

**Por qué**: La diferencia exec form vs shell form es una de las causas más comunes de "mi contenedor no responde a docker stop". En exec form, el binario es PID 1 directamente y recibe señales. En shell form, el shell es PID 1 y: 1) no forwardea señales a procesos hijos (a menos que uses `exec` en el comando), 2) el shell no sale hasta que el hijo termina (bueno para graceful shutdown) pero si el hijo ignora la señal porque el shell no se la envió, hay problema. Solución: siempre usar exec form (`["python", "app.py"]`) o si necesitás shell, usar `exec` dentro: `ENTRYPOINT ["/bin/sh", "-c", "exec python app.py"]` para que el proceso hijo reemplace al shell (y se convierta en PID 1).

---

### 8. [Cuestionar] "Nunca hardcodees configuraciones en la imagen". ¿Es este un absoluto o hay configuraciones que SÍ deberían estar en el Dockerfile? ¿Dónde está el límite?

**Respuesta**: El principio es correcto para configuraciones que varían entre entornos (URLs de BD, credenciales, endpoints). Pero hay configuraciones que SÍ deben estar en el Dockerfile porque son parte de la imagen: 1) Versiones de paquetes del SO (RUN apt-get install curl=7.88.1-1) — para builds reproducibles, 2) Configuraciones de seguridad del runtime que no varían (USER, permisos de archivos, HEALTHCHECK), 3) Paths internos del contenedor (WORKDIR, COPY paths). El límite: cualquier cosa que necesite cambiar entre dev/staging/prod debe ser externa. Cualquier cosa que sea intrínseca a la aplicación y no cambie entre entornos puede estar en la imagen. Las ENV con defaults (ENV NODE_ENV=production) están en la imagen pero pueden sobrescribirse.

**Por qué**: La confusión viene de aplicar el principio de 12 Factor App de forma dogmática. Incluso los autores de 12 Factor App reconocen que hay "build-time configuration" (qué versiones de paquetes instalar) y "runtime configuration" (a qué BD conectarse). El Dockerfile captura build-time decisions. Para runtime, variables de entorno con defaults razonables (ENV PORT=3000) son aceptables si el 90% de los deploys usan ese valor y solo se sobrescribe en casos especiales. El antipatrón real es: `COPY config/production.json /app/config.json` en lugar de montar config desde fuera.

---

### 9. [Cuestionar] ¿Son las variables de entorno un mecanismo seguro para secretos? Compará con Docker secrets y Kubernetes secrets con Encryption at Rest.

**Respuesta**: Las variables de entorno NO son seguras para secretos porque: 1) visible en `docker inspect` (cualquiera con acceso al socket puede leerlas), 2) visible en `/proc/<pid>/environ` (cualquier proceso en el contenedor puede leerlas), 3) los procesos hijos las heredan, 4) aparecen en crash dumps y logs de herramientas de monitoreo, 5) se transmiten en texto plano en la API de Docker. Docker secrets (Swarm) son superiores: se montan como archivos en tmpfs (`/run/secrets/`), no son visibles en inspect, y se transmiten cifrados (TLS). Kubernetes secrets: por defecto solo están en base64 (equivalente a env vars en seguridad), pero con Encryption at Rest (EncryptionConfiguration con KMS) se cifran en etcd. La forma más segura en K8s: montar secrets como volúmenes (archivos en tmpfs) + cifrado en reposo + RBAC restrictivo + External Secrets Operator con Vault para secrets dinámicos.

**Por qué**: El CIS Kubernetes Benchmark (v1.7) recomienda explícitamente no usar secrets como variables de entorno ("Prefer using secrets as files mounted in volumes rather than as environment variables"). La razón es técnica: el kernel expone `/proc/<pid>/environ` a cualquier proceso con el mismo UID o root. Los archivos montados en tmpfs tienen permisos estándar Unix y no son automáticamente heredados. Docker secrets implementan esto: el archivo `/run/secrets/db_password` tiene permisos 0444 y solo existe mientras el contenedor corre. Para máxima seguridad: Vault con secrets dinámicos (credenciales temporales con TTL corto) + inyección via sidecar que escribe el archivo en un volumen compartido.

---

### 10. [Cuestionar] ¿Deberían los `.env` files versionarse en git? ¿Cómo manejás la configuración por entorno sin exponer secretos en el repositorio?

**Respuesta**: NO, los `.env` files con secretos NO deben versionarse (agregarlos a `.gitignore`). La práctica recomendada: 1) `.env.example` versionado: contiene todas las claves necesarias con valores de ejemplo o vacíos, documentando qué variables necesita la aplicación, 2) `.env` en `.gitignore`: cada desarrollador copia `.env.example` y completa con valores reales (locales), 3) Secretos de producción en un vault (Vault, AWS Secrets Manager, GitHub Secrets) inyectados en CI/CD, nunca en el repo. Para configuraciones no-secretas que varían por entorno (dev, staging, prod), se usan archivos de override de Compose (`docker-compose.prod.yml`) que referencian `${VAR}` sin contener los valores reales. Herramientas como `sops` (Mozilla) o `git-crypt` permiten versionar secretos cifrados si realmente necesitás que estén en el repo.

**Por qué**: GitGuardian (2023 State of Secrets Sprawl) reportó más de 10 millones de secretos expuestos en repositorios públicos en GitHub en 2022. La causa principal: `.env` files versionados accidentalmente. Una vez que un secreto está en git, está para siempre (incluso si lo eliminás en un commit posterior, sigue en el historial). La rotación de secretos expuestos es dolorosa. La solución robusta: 1) pre-commit hooks (detect-secrets, git-secrets) que bloquean commits con patrones de secretos, 2) `.gitignore` con `.env`, 3) usar `docker compose --env-file .env.production` con el archivo fuera del repo, 4) en CI/CD, inyectar variables desde el gestor de secretos del CI (GitHub Secrets, GitLab CI Variables, CircleCI Contexts).
