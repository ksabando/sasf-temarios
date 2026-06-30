---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 23

1. ¿Qué comando genera un par de claves GPG?
   R: `gpg --full-generate-key`.

2. ¿Cómo se configura la clave GPG en Git?
   R: `git config --global user.signingkey <KEY-ID>`.

3. ¿Qué bandera se usa para firmar un commit?
   R: `-S` (mayúscula), ej: `git commit -S -m "mensaje"`.

4. ¿Cómo se verifica la firma de un commit?
   R: Con `git log --show-signature` o `git verify-commit HEAD`.

5. ¿Qué diferencia hay entre GPG signing y SSH signing?
   R: SSH signing usa el par de llaves SSH existente; GPG requiere un par específico GPG.

6. ¿Cómo se firma un tag?
   R: `git tag -s v1.0.0 -m "mensaje"`.

7. ¿Qué muestra GitHub cuando un commit está firmado?
   R: Un badge "Verified" junto al commit.

8. ¿Qué es Dependabot?
   R: Herramienta de GitHub que monitorea dependencias con vulnerabilidades y crea PRs automáticos.

9. ¿Qué es CodeQL?
   R: Motor de análisis estático de código que detecta vulnerabilidades de seguridad.

10. ¿Qué hace GitHub Secret Scanning?
    R: Escanea repositorios en busca de tokens y credenciales, notificando al detectarlos.

