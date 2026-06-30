---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 18

1. ¿Qué hook del servidor se ejecuta antes de aceptar un push?
   R: `pre-receive`.

2. ¿Qué hook se ejecuta por cada rama actualizada en el push?
   R: `update`.

3. ¿Qué hook es ideal para disparar despliegues automáticos?
   R: `post-receive`.

4. ¿Qué archivo configura GitHub Actions?
   R: Archivos YAML dentro de `.github/workflows/`.

5. ¿Qué archivo configura GitLab CI?
   R: `.gitlab-ci.yml` en la raíz del proyecto.

6. ¿Cómo se fuerza un checkout en un hook post-receive?
   R: `git --work-tree=/ruta checkout -f`.

7. ¿Qué evento de GitHub Actions se usa para ejecutar en cada push?
   R: `on: [push]`.

8. ¿Cómo se definen stages en GitLab CI?
   R: Con la clave `stages:` en `.gitlab-ci.yml`.

9. ¿Qué comando se usa para reiniciar una aplicación PM2 en un hook?
   R: `pm2 restart app`.

10. ¿Cómo se rechaza un push desde un hook pre-receive?
    R: Salir con código de error `exit 1`.

