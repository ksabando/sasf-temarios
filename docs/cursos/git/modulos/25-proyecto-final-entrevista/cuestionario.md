---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 25

## Fundamentos (1-10)

1. ¿Qué hace `git init`?
   R: Inicializa un nuevo repositorio Git en el directorio actual.

2. ¿Diferencia entre `working directory`, `staging area` y `repository`?
   R: Working directory = archivos editados; staging = área para preparar commit; repository = historial de commits.

3. ¿Qué hace `git add -p`?
   R: Permite añadir fragmentos específicos de un archivo al staging, no el archivo completo.

4. ¿Cómo ves el historial de commits con su gráfico de ramas?
   R: `git log --graph --oneline --all --decorate`.

5. ¿Qué muestra `git diff` vs `git diff --staged`?
   R: `git diff` = cambios sin stage; `git diff --staged` = cambios en staging.

6. ¿Qué es un commit en Git?
   R: Una instantánea del proyecto en un momento dado, con hash SHA-1 único.

7. ¿Cómo se revierte un archivo a su estado del último commit?
   R: `git checkout -- <archivo>`.

8. ¿Qué es el `.gitignore`?
   R: Archivo que lista patrones de archivos que Git debe ignorar.

9. ¿Cómo se ve el estado del repositorio?
   R: `git status`.

10. ¿Qué contiene un objeto commit?
    R: Tree hash, parent hash, autor, mensaje y fecha.

## Ramas (11-20)

11. ¿Cómo crear y cambiarse a una rama en un paso?
    R: `git checkout -b <nombre>` o `git switch -c <nombre>`.

12. ¿Diferencia entre `git merge` y `git rebase`?
    R: Merge crea un commit de fusión; rebase reescribe el historial aplicando commits sobre otra base.

13. ¿Qué hace `git branch -d <rama>` vs `-D`?
    R: `-d` elimina solo si está fusionada; `-D` fuerza eliminación.

14. ¿Cómo renombrar una rama?
    R: `git branch -m <viejo> <nuevo>`.

15. ¿Qué es una rama remote-tracking?
    R: Rama local que refleja el estado de una rama remota (ej: `origin/main`).

16. ¿Cómo listar ramas remotas?
    R: `git branch -r`.

17. ¿Qué hace `git stash`?
    R: Guarda cambios temporales sin commit y limpia el working directory.

18. ¿Cómo recuperar el último stash?
    R: `git stash pop`.

19. ¿Qué es un conflicto de merge?
    R: Cuando Git no puede fusionar automáticamente cambios en las mismas líneas.

20. ¿Cómo resolver un conflicto manualmente?
    R: Editar el archivo, eliminar marcadores, `git add` y `git commit`.

## Avanzado (21-30)

21. ¿Qué hace `git cherry-pick <hash>`?
    R: Aplica un commit específico de otra rama en la rama actual.

22. ¿Qué es `git bisect`?
    R: Búsqueda binaria para encontrar el commit que introdujo un bug.

23. ¿Qué es el reflog?
    R: Registro de todos los movimientos de HEAD, permite recuperar commits "perdidos".

24. ¿Cómo recuperar un commit después de un reset?
    R: `git reflog` para encontrar el hash, luego `git reset --hard <hash>`.

25. ¿Qué hace `git filter-repo`?
    R: Reescribe el historial completo eliminando archivos o cambiando autores.

26. ¿Qué es Git LFS?
    R: Large File Storage, reemplaza archivos grandes con punteros en el repo.

27. ¿Cómo funciona un submodule?
    R: Es un repositorio Git dentro de otro, apuntando a un commit específico.

28. ¿Qué es un worktree?
    R: Múltiples copias del repositorio en directorios distintos, cada una con una rama.

29. ¿Qué hace `git archive`?
    R: Exporta una snapshot del repositorio sin historial (ZIP o TAR).

30. ¿Diferencia entre `git reset --soft`, `--mixed` y `--hard`?
    R: `--soft` solo mueve HEAD; `--mixed` además limpia staging; `--hard` también borra cambios locales.

## Hooks y CI/CD (31-40)

31. ¿Qué es un hook de Git?
    R: Script que se ejecuta automáticamente en eventos del ciclo de vida de Git.

32. ¿Dónde se almacenan los hooks locales?
    R: En `.git/hooks/`.

33. ¿Qué hook se ejecuta antes de un commit?
    R: `pre-commit`.

34. ¿Qué hook se ejecuta después de un merge?
    R: `post-merge`.

35. ¿Cómo compartir hooks con el equipo?
    R: Guardarlos en `.githooks/` y configurar `core.hooksPath`.

36. ¿Qué evento de GitHub Actions se usa para CI en cada push?
    R: `on: push`.

37. ¿Qué hace `actions/checkout@v4`?
    R: Clona el repositorio en el runner de GitHub Actions.

38. ¿Cómo se definen stages en GitLab CI?
    R: Con `stages:` en `.gitlab-ci.yml` enumerando las etapas.

39. ¿Qué son los artifacts en GitLab CI?
    R: Archivos generados por un job que se pasan a jobs subsiguientes.

40. ¿Qué es semantic-release?
    R: Herramienta que automatiza versionado y publish basado en commits convencionales.

## Seguridad (41-50)

41. ¿Qué comando genera un par de claves GPG?
    R: `gpg --full-generate-key`.

42. ¿Cómo se firma un commit con GPG?
    R: `git commit -S -m "mensaje"`.

43. ¿Cómo se verifica la firma de un commit?
    R: `git log --show-signature` o `git verify-commit HEAD`.

44. ¿Cómo firmar un tag?
    R: `git tag -s v1.0.0 -m "mensaje"`.

45. ¿Qué es SSH signing en Git?
    R: Firmar commits con un par de llaves SSH en lugar de GPG.

46. ¿Cómo se configura SSH signing?
    R: `git config --global gpg.format ssh` y `user.signingkey ~/.ssh/id_ed25519.pub`.

47. ¿Qué indica el badge "Verified" en GitHub?
    R: Que el commit fue firmado con una clave verificada por GitHub.

48. ¿Qué es GitHub Secret Scanning?
    R: Escaneo automático del repositorio en busca de tokens y credenciales.

49. ¿Qué es Dependabot?
    R: Bot que monitorea dependencias con vulnerabilidades y crea PRs para actualizarlas.

50. ¿Qué es CodeQL?
    R: Motor de análisis estático de seguridad que escanea el código en busca de vulnerabilidades.

## Buenas Prácticas (51-60)

51. ¿Qué formato siguen los Conventional Commits?
    R: `tipo(alcance): descripción`, con tipos feat, fix, chore, docs, refactor, etc.

52. ¿Qué hace commitlint?
    R: Valida que los mensajes de commit cumplan el formato Conventional Commits.

53. ¿Cómo se integra commitlint con husky?
    R: Husky ejecuta commitlint en el hook commit-msg.

54. ¿Para qué sirve `.gitattributes`?
    R: Define el tratamiento de archivos (EOL, binario, filtros) según su patrón.

55. ¿Qué diferencia hay entre `text` y `binary` en .gitattributes?
    R: `text` permite normalización de EOL; `binary` desactiva toda transformación.

56. ¿Qué hace `git maintenance start`?
    R: Activa tareas automáticas de optimización del repositorio en segundo plano.

57. ¿Cuándo usar `git gc --aggressive`?
    R: Después de operaciones masivas (filter-repo, rebase extensivo) para optimizar.

58. ¿Qué es Git Flow?
    R: Estrategia de ramificación con main, develop, feature, release y hotfix branches.

59. ¿Qué es trunk-based development?
    R: Estrategia donde todos trabajan en una rama principal con integración continua.

60. ¿Cómo se elimina un archivo sensible del historial?
    R: Con `git filter-repo --path <archivo> --invert-paths`.

