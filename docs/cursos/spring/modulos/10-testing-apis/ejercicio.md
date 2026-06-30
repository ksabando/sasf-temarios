---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Test de validación

Escribe tests que verifiquen que `POST /api/tasks` devuelve 400 cuando:
- El título está vacío
- El título tiene menos de 3 caracteres
- La descripción excede 500 caracteres

Usa `@ParameterizedTest` para parametrizar los casos.

---

## Ejercicio 4: Test de integración con base de datos H2

Configura un perfil de test con H2 en memoria y escribe un test de integración con `@SpringBootTest` que:
1. Cree una tarea vía `TaskRepository`
2. Verifique que se guarda correctamente
3. La recupere por ID y verifique los campos

---

## Ejercicio 5: Reporte JaCoCo con umbral

Agrega JaCoCo al `pom.xml` con:
- Umbral mínimo de cobertura de instrucciones del 80%
- Generación de reporte en la fase `verify`
- Exclusión de DTOs y configuraciones del reporte

Luego ejecuta `mvn verify` y verifica el reporte.
