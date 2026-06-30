---
sidebar_label: "Clase"
---

﻿# Clase 24 -” Buenas Practicas y Patrones Docker

## 1. Patron Sidecar
Contenedor auxiliar junto al principal (logging, proxy, sync).

## 2. Patron Ambassador
Proxy que media entre el contenedor y el mundo exterior.

## 3. Patron Adapter
Normaliza interfaces entre contenedores.

## 4. 12 Factor App
1. Codigo base (un repo por app)
2. Dependencias (declaradas, aisladas)
3. Configuracion (variables de entorno)
4. Backing services (recursos desacoplados)
5. Build, release, run (separados)
6. Procesos (stateless)
7. Port binding (autocontenido)
8. Concurrency (escalar con procesos)
9. Disposability (inicio y shutdown rapido)
10. Dev/prod parity (entornos similares)
11. Logs (streams de eventos)
12. Admin processes (tareas de gestion)

## 5. Docker Bench Security
Audita configuraciones de seguridad.
