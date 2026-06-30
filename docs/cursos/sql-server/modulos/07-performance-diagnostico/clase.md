---
sidebar_label: "Clase"
---

## Performance y Diagnostico

Optimizar SQL requiere observar el plan de ejecucion y entender como la consulta usa indices, filtros y joins.

| Concepto | Impacto |
|----------|---------|
| Seek | Acceso eficiente por indice |
| Scan | Lectura amplia de datos |
| SARGable | Filtro que puede usar indice |
| Indice compuesto | Optimiza varias columnas relacionadas |

## Resumen

Primero medir, despues optimizar. No agregar indices sin consulta objetivo.
