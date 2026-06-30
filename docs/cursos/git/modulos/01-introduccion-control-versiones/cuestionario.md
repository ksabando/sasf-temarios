---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario - Módulo 01

1. ¿Qué algoritmo de hash utiliza Git para identificar objetos?
   R: SHA-1, que genera un identificador de 40 caracteres hexadecimales.

2. ¿Cuáles son los tres estados de los archivos en Git?
   R: Modified (modificado), Staged (preparado) y Committed (confirmado).

3. ¿Qué diferencia a un DVCS de un CVCS?
   R: En DVCS cada clon tiene una copia completa del historial; en CVCS solo hay un servidor central con la historia.

4. ¿Qué representa un objeto tipo blob en Git?
   R: El contenido de un archivo. No almacena el nombre del archivo, solo su contenido.

5. ¿Qué representa un objeto tipo tree?
   R: Un directorio: contiene referencias a blobs (archivos) y a otros trees (subdirectorios).

6. ¿Qué tipo de objeto genera git commit?
   R: Un objeto commit, que apunta a un tree, contiene autor, mensaje y referencia(s) al commit(s) padre(s).

7. ¿Quién creó Git y en qué año?
   R: Linus Torvalds en 2005, inicialmente para el desarrollo del kernel Linux.

8. ¿Cuál es la diferencia entre git init y git clone?
   R: `git init` crea un repositorio vacío local; `git clone` copia un repositorio remoto existente.

9. ¿Por qué Git se considera un sistema distribuido?
   R: Porque cada repositorio local contiene el historial completo, permitiendo operaciones sin conexión de red.

10. ¿Cuál es el propósito del directorio .git?
    R: Almacena toda la base de datos de objetos, configuración, referencias y metadatos del repositorio.

