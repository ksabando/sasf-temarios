---
sidebar_label: "Clase"
---

# Clase 01 — Introducción a Contenedores y Docker

## 1. ¿Qué son los contenedores?

Los contenedores son unidades ligeras y portátiles que empaquetan una aplicación y sus dependencias para ejecutarse de forma aislada en cualquier sistema.

### Contenedores vs Máquinas Virtuales

| Característica | Contenedor | VM |
|---|---|---|
| Sistema operativo | Comparte el kernel del host | SO invitado completo |
| Tiempo de arranque | Milisegundos | Minutos |
| Tamaño | MB | GB |
| Aislamiento | Namespaces + cgroups | Hypervisor |
| Rendimiento | Nativo | Overhead del hypervisor |

## 2. Historia

- 2008: LXC (Linux Containers)
- 2013: Docker (inicialmente construido sobre LXC)
- 2015: OCI (Open Container Initiative) — estandarización
- 2017: containerd se separa de Docker
- 2024+: Docker como estándar de facto

## 3. Arquitectura de Docker

`
                                          —, runc         —,
                                          —, (OCI runtime)—,
`

## 4. Imagen vs Contenedor

- **Imagen:** Plantilla de solo lectura con el sistema de archivos y configuración
- **Contenedor:** Instancia ejecutable de una imagen (capa de lectura/escritura)

## 5. Namespaces

Tipos de aislamiento que Docker utiliza:
- **pid:** Procesos
- **net:** Red (interfaces, rutas)
- **mnt:** Sistema de archivos montado
- **uts:** Hostname y dominio
- **ipc:** Comunicación entre procesos
- **user:** Usuarios y UIDs

## 6. cgroups

Controlan los recursos que puede usar un contenedor:
- CPU
- Memoria
- I/O de disco
- Red

## 7. Resumen

Docker simplifica la creación, distribución y ejecución de aplicaciones en contenedores, proporcionando un ecosistema completo de herramientas.
