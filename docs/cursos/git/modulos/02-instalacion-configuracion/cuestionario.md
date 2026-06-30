---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 02

1. ¿Cuáles son los tres niveles de configuración de Git?
   R: System (todos los usuarios), Global (usuario actual), Local (repositorio actual).

2. ¿Qué nivel de configuración tiene mayor prioridad?
   R: Local, luego Global, luego System.

3. ¿Qué hace `core.autocrlf true` en Windows?
   R: Convierte CRLF a LF al hacer commit y LF a CRLF al hacer checkout, normalizando saltos de línea.

4. ¿Cuál es la diferencia entre SSH y HTTPS para Git?
   R: SSH requiere claves públicas/privadas y no pide credenciales tras configurarlo; HTTPS requiere usuario/contraseña o token cada vez (o credential helper).

5. ¿Para qué sirven los alias en Git?
   R: Crear atajos personalizados para comandos frecuentes, ahorrando escritura y memorización.

6. ¿Qué comando muestra todas las variables de configuración actuales?
   R: `git config --list`.

7. ¿Qué flag permite ver de qué archivo proviene cada configuración?
   R: `--show-origin`.

8. ¿Qué archivo contiene la configuración global de Git?
   R: `~/.gitconfig` o `$HOME/.gitconfig`.

9. ¿Qué tipo de clave SSH recomienda Git actualmente?
   R: Ed25519, por su seguridad y rendimiento superior a RSA.

10. ¿Qué comando verifica la conexión SSH con GitHub?
    R: `ssh -T git@github.com`.

