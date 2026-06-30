---
sidebar_label: "Cuestionario"
---

# Cuestionario M17 — ConfigMaps, Secrets y Volumes en K8s

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es exactamente Sealed Secrets y cómo resuelve el problema de almacenar Secrets de K8s en repositorios Git? ¿Cómo funciona el proceso de cifrado/descifrado?

**Respuesta**: Sealed Secrets (Bitnami/VMware) es un controller de K8s que permite cifrar un Secret normal en un "SealedSecret" que es seguro para almacenar en Git. El flujo: 1) El admin instala el Sealed Secrets controller en el cluster (genera un par de claves pública/privada), 2) El desarrollador usa `kubeseal` CLI para cifrar el Secret con la clave pública del controller: `kubeseal --scope cluster-wide <secret.yaml > sealedsecret.yaml`, 3) El SealedSecret (que contiene los datos cifrados) se versiona en Git, 4) Cuando se aplica al cluster, el controller detecta el SealedSecret, lo descifra con su clave privada, y genera un Secret normal (decodificado). Solo el controller en ESE cluster específico puede descifrarlo (la clave privada nunca sale del cluster). Esto permite GitOps con Secrets porque los datos cifrados pueden estar en Git sin exponer los valores reales.

**Por qué**: Sealed Secrets fue creado por Bitnami (Angus Lees) para resolver el problema de "cómo versiono Secrets en Git cuando hago GitOps con Flux/ArgoCD". La alternativa es usar referencias externas (External Secrets Operator que sincroniza desde Vault/AWS Secrets Manager), pero Sealed Secrets es más simple: todo está en Git, no dependés de un servicio externo. La desventaja: rotar el secret requiere re-cifrar con `kubeseal` y commitear el nuevo SealedSecret. Para rotación automática, External Secrets Operator es superior.

---

### 2. [Investigar] ¿Qué es exactamente External Secrets Operator (ESO) y cómo sincroniza secretos desde AWS Secrets Manager, Vault, o GCP Secret Manager a Secrets de K8s?

**Respuesta**: ESO (GoDaddy, proyecto CNCF incubado) es un controller de K8s que sincroniza secretos desde providers externos a Secrets nativos de K8s. El flujo: 1) Definís un `SecretStore` (referencia al provider: Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, etc.) con credenciales de acceso, 2) Definís un `ExternalSecret` que referencia un secreto específico en el provider y cómo mapearlo a un Secret de K8s, 3) ESO polla periódicamente el provider externo, obtiene los valores actuales, y crea/actualiza el Secret de K8s correspondiente, 4) Si el valor cambia en el provider, ESO actualiza el Secret de K8s automáticamente (refresh interval configurable). Esto permite que la fuente de verdad de los secretos sea Vault/AWS, y K8s tenga una copia sincronizada.

**Por qué**: ESO resuelve el problema de "dual source of truth" donde los secretos existen en Vault (para compliance/auditoría) y en K8s (para consumo por Pods). ESO los sincroniza. Soportado por CNCF desde 2022. Alternativas: Vault Secrets Operator (HashiCorp oficial), Secrets Store CSI Driver. ESO es más genérico (soporta 20+ providers). Para rotación de secretos: si rotás la credencial en AWS Secrets Manager, ESO la detecta (via polling) y actualiza el Secret de K8s, triggerando un rolling update de los Pods que lo consumen (si usás reloader o stakater).

---

### 3. [Investigar] ¿Qué es exactamente el Container Storage Interface (CSI) en K8s y cómo funciona el provisionamiento dinámico de volúmenes usando StorageClass? ¿Qué papel juegan los CSI sidecars?

**Respuesta**: CSI es un estándar que define una API gRPC entre K8s y plugins de almacenamiento. El provisionamiento dinámico: 1) Usuario crea un PVC con `storageClassName: ebs-gp3`, 2) K8s (via external-provisioner sidecar) llama al CSI driver EBS para crear el volumen, 3) El CSI driver llama a la API de AWS EC2 para crear un EBS volume, 4) K8s crea un PV automáticamente y lo bindea al PVC, 5) Cuando el Pod se assigna a un nodo, K8s (via external-attacher y node-driver-registrar sidecars) llama al CSI driver para montar el volumen en el nodo, 6) El CSI driver hace attach (a nivel de EC2) y mount (a nivel de sistema de archivos) del volumen. Los CSI sidecars son containers que corren junto al CSI driver y manejan provisionamiento, attach, snapshot, resize, y health monitoring. La arquitectura con sidecars evita que cada CSI driver implemente lógica de interacción con K8s API.

**Por qué**: CSI (K8s 1.9 alpha, 1.13 GA) reemplazó los in-tree volume plugins (que estaban compilados en el binario de K8s, haciendo los releases de K8s acoplados a updates de drivers). Los sidecars (external-provisioner, external-attacher, external-snapshotter, external-resizer, node-driver-registrar) son containers mantenidos por K8s SIG-Storage que proveen funcionalidad estándar, y los CSI drivers solo implementan la interfaz gRPC. Esto desacopla releases de K8s de releases de storage drivers.

---

### 4. [Investigar] ¿Qué son los "Generic Ephemeral Volumes" en K8s y cómo se diferencian de emptyDir? ¿Qué es exactamente `emptyDir.medium: Memory`?

**Respuesta**: Generic Ephemeral Volumes (K8s 1.21 alpha, 1.23 beta, 1.25 GA) permiten usar cualquier storage driver compatible con CSI como volumen efímero (ciclo de vida = Pod). A diferencia de emptyDir (que es un directorio vacío en el nodo o RAM), un Generic Ephemeral Volume puede provisionar un volumen de red (EBS, NFS) que persiste mientras el Pod existe, y que soporta snapshots y resizing. `emptyDir.medium: Memory` crea un tmpfs (en RAM) en lugar de un directorio en disco. Casos de uso: 1) Generic Ephemeral Volume: un Pod de procesamiento batch que necesita 500 GB de almacenamiento temporal de alto rendimiento, provisionado como EBS io2, se destruye al terminar el Pod, 2) `emptyDir.medium: Memory`: cache en RAM compartido entre contenedores del mismo Pod (rápido, sin I/O de disco).

**Por qué**: Generic Ephemeral Volumes resuelven el caso de "necesito almacenamiento temporal pero con las características de un CSI driver (cifrado, IOPS, snapshots)". Antes, solo podías usar emptyDir (disco del nodo, limitado), hostPath (riesgo de seguridad), o PVC (que persiste después del Pod). Generic Ephemeral cierra la brecha: volumen con features CSI pero ciclo de vida acotado al Pod.

---

### 5. [Conectar] La clase menciona ConfigMaps y Secrets. ¿Cómo funciona la actualización automática de ConfigMaps montados como volúmenes? ¿Qué delay tiene y cómo notificar a la aplicación?

**Respuesta**: Cuando un ConfigMap o Secret montado como volumen en un Pod es actualizado en la API de K8s, el kubelet periódicamente (cada ~60-90 segundos por defecto, configurable con `--sync-frequency`) sincroniza el contenido del volumen con la nueva versión. Los archivos en el mount point se actualizan. El contenido se monta como symlinks a archivos temporales (..data → ..data_tmp_<timestamp>) que el kubelet actualiza atómicamente (renombrando el symlink). La aplicación dentro del Pod debe detectar los cambios: 1) File watcher (inotify) que detecta cambios en archivos, 2) Recibir una señal SIGHUP desde un sidecar que detecte cambios, 3) Simplemente leer los archivos en cada request (sin cache). La actualización NO es instantánea (depende del sync period del kubelet + tiempo de propagación API→etcd→kubelet).

**Por qué**: La implementación usa symlinks atómicos para evitar que la aplicación lea un archivo parcialmente escrito. El delay es significativo para aplicaciones que esperan cambios inmediatos. Para acelerar: usar `Reloader` (stakater, herramienta open-source) que detecta cambios en ConfigMaps/Secrets y ejecuta un rolling update del Deployment, forzando que los Pods se reinicien con la nueva configuración. Para hot-reload real, la aplicación debe soportarlo (file watcher, inotify, o re-lectura periódica).

---

### 6. [Conectar] ¿Qué diferencia práctica hay entre usar Secrets como variables de entorno vs como volúmenes montados? ¿Cuál es más seguro y por qué?

**Respuesta**: Variables de entorno: fáciles de consumir (`os.getenv("DB_PASS")`), pero inseguras (visibles en `/proc/<pid>/environ`, en crash dumps, en `kubectl describe pod`, y heredadas por procesos hijos). Volúmenes montados: la aplicación debe leer el archivo (`open("/etc/secrets/db_pass").read()`), pero más seguras (archivos con permisos Unix, solo existen mientras el Pod corre en tmpfs, no aparecen en process environment, no son heredadas automáticamente). Para producción con requisitos de seguridad: volúmenes son preferibles. Para desarrollo o cuando la app legacy solo soporta env vars: variables de entorno. La mejor práctica: usar volúmenes para secretos sensibles (contraseñas, claves), y variables de entorno para configuraciones no sensibles.

**Por qué**: El CIS K8s Benchmark (5.2.1) recomienda "Prefer using secrets as files mounted in volumes rather than as environment variables". La razón técnica: las variables de entorno se almacenan en el espacio de memoria del proceso y son accesibles por cualquier proceso con acceso a `/proc`. Los volúmenes están en tmpfs con permisos de archivo estándar. En K8s, ambos métodos usan tmpfs para Secrets (incluso como env vars, el valor se almacena en memoria, no en disco del nodo).

---

### 7. [Conectar] ¿Qué es un `subPath` en un volume mount y cuándo su uso es necesario? ¿Qué limitación importante tiene con respecto a actualizaciones?

**Respuesta**: `subPath` monta un subdirectorio o archivo específico del volumen (no el volumen completo). Casos: 1) Montar un solo archivo de un ConfigMap sin sobrescribir el directorio destino: `subPath: config.yaml` → `/etc/app/config.yaml`, 2) Compartir un PVC entre múltiples contenedores con subdirectorios separados: `subPath: container1-data` y `subPath: container2-data`. Limitación crítica: los archivos montados con `subPath` NO se actualizan automáticamente cuando el ConfigMap/Secret cambia. Solo los volúmenes montados completos (sin subPath) reciben actualizaciones automáticas. Esto es porque subPath crea un bind mount del archivo específico, y ese bind mount no se renueva cuando el contenido subyacente cambia.

**Por qué**: Esta limitación está documentada en la doc de K8s (Volumes → subPath). Es una fuente común de bugs: "cambié el ConfigMap pero mi Pod no ve el cambio". La solución: si necesitás hot-reload de configuración, no uses subPath; montá el volumen completo y ajustá tu aplicación para leer del directorio montado. Si usás subPath y necesitás que el cambio se aplique, necesitás reiniciar el Pod (ej. con Reloader que hace rolling update al detectar cambio en ConfigMap).

---

### 8. [Cuestionar] ¿Son los Secrets de K8s suficientemente seguros con solo base64? ¿Por qué K8s no habilitó cifrado por defecto y qué deberías hacer como administrador?

**Respuesta**: Por defecto, los Secrets en K8s solo están codificados en base64 (NO cifrados) en etcd. Esto no es seguridad — es un encoding para transportar datos binarios en JSON. Cualquiera con acceso a etcd (o al API server con permisos `get secrets`) puede leerlos. K8s no habilitó cifrado por defecto por simplicidad y compatibilidad. Como administrador DEBÉS: 1) Configurar Encryption at Rest (`EncryptionConfiguration` con `aescbc`, `secretbox`, o KMS plugin) para cifrar Secrets en etcd, 2) Implementar RBAC restrictivo (solo los Pods que necesitan un Secret deben tener acceso a él), 3) Usar herramientas como External Secrets Operator con un vault externo (donde los valores reales nunca están en K8s), 4) Rotar secrets periódicamente, 5) Auditar acceso a Secrets con audit logging. Sin Encryption at Rest, un backup de etcd o un snapshot contiene todos los Secrets en texto plano.

**Por qué**: La documentación de K8s (Encrypting Secret Data at Rest) recomienda explícitamente Encryption at Rest. La razón de no ser default: overhead de cifrado/descifrado en cada acceso, complejidad de key management (el KMS plugin requiere configuración externa). La comunidad debatió esto extensamente (KEP 2833). Para clusters managed (EKS, AKS, GKE), el provider puede habilitar Encryption at Rest automáticamente (EKS lo hace con KMS, GKE con Cloud KMS). Para clusters on-prem (kubeadm), el admin debe configurarlo explícitamente.

---

### 9. [Cuestionar] ¿Es seguro almacenar ConfigMaps y Secrets en Git (GitOps) o deberían estar fuera del repositorio?

**Respuesta**: ConfigMaps (no sensibles): sí, almacenarlos en Git es deseable para GitOps (versionado, audit trail, revisión de cambios). Secrets: NO almacenar en texto plano en Git. Opciones para Secrets en GitOps: 1) Sealed Secrets (cifrados, seguros en Git), 2) External Secrets Operator (referencia a un vault externo, en Git solo la referencia), 3) SOPS (Mozilla, cifra YAML/JSON con KMS/PGP, se puede versionar el archivo cifrado), 4) Git crypt (transparente, cifra archivos específicos). El principio: lo que está en Git debe ser seguro incluso si el repositorio se hace público (accidentalmente o no). Datos sensibles en texto plano en Git son un incidente de seguridad.

**Por qué**: El 2023 State of Secrets Sprawl (GitGuardian) reportó 10M+ secretos en GitHub públicos. Las empresas que practican GitOps (Flux, ArgoCD) necesitan que TODO esté en Git (incluyendo secrets). La solución es cifrado client-side (Sealed Secrets, SOPS) o referencias externas (ESO). Para equipos que no practican GitOps para secrets, un pipeline CI/CD que inyecta secrets desde un vault en el momento del deploy (sin pasar por Git) es la alternativa.

---

### 10. [Cuestionar] ¿Deben las aplicaciones usar `emptyDir` para datos temporales o siempre es mejor usar PVC incluso para datos efímeros?

**Respuesta**: `emptyDir` es adecuado para: 1) Scratch space temporal que no necesita persistir después del Pod, 2) Comunicación entre contenedores del mismo Pod (compartir datos via archivos), 3) Caches de aplicación que pueden reconstruirse (no son source of truth). PVC es necesario cuando: 1) Los datos deben persistir después de que el Pod muera/sea reubicado, 2) Los datos exceden la capacidad de disco del nodo, 3) Necesitás características de storage avanzadas (snapshots, replicación, cifrado con claves gestionadas). `emptyDir` usa el disco del nodo (que es finito y puede llenarse afectando otros Pods) o RAM (con `medium: Memory`, limitado y costoso). Para datos que son source of truth (aunque sean "temporales" a nivel de aplicación): PVC. Para caches y scratch: `emptyDir` está bien.

**Por qué**: La documentación de K8s advierte que `emptyDir` usa el storage del nodo, y si el nodo se queda sin disco, el kubelet evicta Pods. Con PVC + StorageClass, el storage es gestionado por el CSI driver (que puede ser almacenamiento de red con capacidad elástica). Para `emptyDir.medium: Memory`, tenés el límite de RAM del nodo y el Pod puede ser OOM killed si el emptyDir crece mucho. La elección depende de los requisitos de disponibilidad y durabilidad de los datos.
