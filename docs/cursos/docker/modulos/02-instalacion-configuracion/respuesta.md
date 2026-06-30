---
sidebar_label: "Soluciones"
---

# Soluciones M02 — Instalación y Configuración

## Ejercicio 1: Instalación de Docker Desktop
**Solución esperada**:
```bash
docker --version
# Docker version 26.x.x, build ...
```
Docker Desktop instalado correctamente. Verificar que aparece en la bandeja del sistema (Windows/macOS) o usando el CLI.

**Posibles mejoras**:
- Configurar límites de recursos para Docker Desktop (Settings > Resources) asignando un valor fijo de CPUs y memoria en lugar del default dinámico, para evitar que consuma todos los recursos del host en desarrollo.
- Habilitar Kubernetes integrado desde Docker Desktop (Settings > Kubernetes > Enable Kubernetes) para tener un cluster local de desarrollo sin instalar Minikube o kind adicionalmente.
- Configurar proxies corporativos en Docker Desktop (Settings > Resources > Proxies) si la red empresarial requiere autenticación para pulls de imágenes.

---

## Ejercicio 2: Agregar usuario al grupo docker
**Solución esperada**:
```bash
sudo usermod -aG docker $USER
newgrp docker           # Refresca los grupos sin cerrar sesión
# O cerrar sesión y volver a entrar
docker run hello-world  # Ahora funciona sin sudo
```

**Posibles mejoras**:
- Verificar los grupos del usuario con `groups $USER` para confirmar que `docker` aparece en la lista antes de ejecutar comandos.
- Considerar Docker rootless mode (`dockerd-rootless-setuptool.sh install`) en entornos donde agregar usuarios al grupo docker no es aceptable por políticas de seguridad (el acceso al socket Docker equivale a root).
- Usar `docker context` con autenticación TLS y certificados para acceso remoto en lugar de depender del socket local, eliminando la necesidad de pertenecer al grupo docker.

---

## Ejercicio 3: Configuración del daemon
**Solución esperada**:
```bash
# Crear /etc/docker/daemon.json con:
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF
sudo systemctl restart docker
```

Crear `/etc/docker/daemon.json` con el contenido especificado y reiniciar el daemon.

**Posibles mejoras**:
- Validar que el JSON sea sintácticamente correcto antes de reiniciar con `python3 -m json.tool /etc/docker/daemon.json` o `jq . /etc/docker/daemon.json`, ya que un JSON inválido impide que el daemon arranque.
- Agregar configuración de `"icc": false` y `"userland-proxy": false` para mejorar seguridad y rendimiento de red respectivamente.
- Configurar `"registry-mirrors"` apuntando a un cache local si hay un registry proxy disponible, para acelerar pulls y evitar rate limits de Docker Hub.

---

## Ejercicio 4: Contextos para entorno remoto
**Solución esperada**:
```bash
docker context create dev --docker host=tcp://192.168.1.100:2375
docker context use dev
docker info     # Ahora muestra información del daemon remoto
docker context use default   # Volver al contexto local
```

**Posibles mejoras**:
- Usar TLS en lugar de TCP sin cifrar: `docker context create dev --docker "host=tcp://192.168.1.100:2376,ca=ca.pem,cert=cert.pem,key=key.pem"`. El puerto 2376 es el estándar con TLS, mientras que 2375 es sin cifrar y no debe usarse en producción.
- Listar todos los contextos con `docker context ls` y verificar cuál está activo (el marcado con `*`) antes de ejecutar comandos críticos, para evitar ejecutar en el entorno equivocado.
- Crear contextos para proveedores cloud (ECS, ACI) usando los plugins de Docker para administrar contenedores en la nube desde el mismo CLI.

---

## Ejercicio 5: Docker Desktop con WSL 2
**Solución esperada**:
WSL 2 con Ubuntu instalado y configurado como backend de Docker Desktop. Verificar con:
```bash
wsl --list --verbose
# Ubuntu (activo) con WSL 2
```
En Docker Desktop: Settings > General > "Use WSL 2 based engine" habilitado.

**Posibles mejoras**:
- Configurar qué distribuciones de WSL 2 pueden acceder a Docker desde Settings > Resources > WSL Integration, habilitando la integración solo para las distribuciones necesarias.
- Usar el sistema de archivos de WSL 2 (`\\wsl$\Ubuntu\`) para almacenar proyectos y bind mounts, que es significativamente más rápido que montar desde el sistema de archivos de Windows (`C:\`).
- Crear un archivo `.wslconfig` en `%USERPROFILE%` con límites de memoria para WSL 2 (`memory=8GB`, `processors=4`) para evitar que consuma todos los recursos del sistema durante builds pesados.
