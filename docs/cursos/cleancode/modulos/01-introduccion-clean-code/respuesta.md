---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M01 — Code Smells Identificados

## Ejercicio: Identificación de Code Smells en Código Legacy

**Solución esperada**:

Lista completa de 18 code smells identificados en el código `payroll`:

| # | Línea | Smell | Problema | Mejora |
|---|-------|-------|----------|--------|
| 1 | 7 | **Nombre de clase con minúscula** | `payroll` viola convención Java | Renombrar a `PayrollCalculator` |
| 2 | 9 | **Nombre de método críptico** | `c` no revela intención | Renombrar a `calculateAverage` |
| 3 | 9 | **Parámetro tipo raw** | `HashMap m` sin genéricos | Usar `Map<String, List<List<String>>>` |
| 4 | 9 | **Nombre de parámetro corto** | `m`, `d` no significan nada | Renombrar a `data`, `department` |
| 5 | 12-38 | **Método largo** | 26 líneas para promediar números | Extraer a métodos más pequeños |
| 6 | 12-38 | **Anidación profunda** | 5 niveles de if/for/if/for/if | Extraer validaciones, usar early return |
| 7 | 14 | **Comentario TODO vago** | `// TODO: revisar esto` sin contexto | Eliminar o agregar fecha/responsable |
| 8 | 14-38 | **Múltiples null checks** | Verificar null en cada nivel | Usar Optional, evitar estructuras anidadas |
| 9 | 32 | **catch vacío** | `// ignore` traga excepciones | Al menos loggear, o manejar específicamente |
| 10 | 42 | **Comentario en español** | Mezcla de idiomas inconsistente | Usar inglés o español consistente |
| 11 | 42 | **Inyección SQL** | Concatenar `id` directamente | Usar PreparedStatement |
| 12 | 42 | **Manejo de recursos manual** | Statement/Connection no se cierran | Usar try-with-resources |
| 13 | 47-52 | **Números mágicos** | `30`, `8`, `1.5` sin constante | `DAYS_PER_MONTH = 30`, `HOURS_PER_DAY = 8` |
| 14 | 54-55 | **System.out.println en producción** | Acopla lógica a consola | Usar logger o retornar valor |
| 15 | 60 | **Datos hardcodeados** | Datos de prueba en el código | Mover a tests unitarios |
| 16 | 3 | **Import no usado** | `java.util.*` importa todo | Importar solo lo necesario |
| 17 | 61 | **Variable nombre genérico** | `l1`, `r` no descriptivos | `ventasList`, `averageResult` |
| 18 | 30 | **Catch genérico Exception** | Atrapa cualquier excepción | Capturar específica: `NumberFormatException` |

## Código Refactorizado (Ejemplo Parcial)

```java
package com.sasf.nomina;

import java.util.List;
import java.util.Map;

public class PayrollCalculator {

    private static final int DAYS_PER_MONTH = 30;
    private static final int HOURS_PER_DAY = 8;
    private static final double OVERTIME_MULTIPLIER = 1.5;

    public double calculateAverage(Map<String, List<List<String>>> data, String department) {
        List<List<String>> records = data.get(department);
        if (records == null || records.isEmpty()) {
            return 0;
        }
        SumCount sumCount = sumAllValues(records);
        if (sumCount.count == 0) {
            return 0;
        }
        return sumCount.sum / sumCount.count;
    }

    private SumCount sumAllValues(List<List<String>> records) {
        double sum = 0;
        int count = 0;
        for (List<String> values : records) {
            for (String value : values) {
                Optional<Double> parsed = tryParseDouble(value);
                if (parsed.isPresent()) {
                    sum += parsed.get();
                    count++;
                }
            }
        }
        return new SumCount(sum, count);
    }

    private Optional<Double> tryParseDouble(String value) {
        try {
            return Optional.of(Double.parseDouble(value));
        } catch (NumberFormatException e) {
            log.warn("Valor no numérico encontrado: {}", value);
            return Optional.empty();
        }
    }

    private static class SumCount {
        final double sum;
        final int count;
        SumCount(double sum, int count) {
            this.sum = sum;
            this.count = count;
        }
    }
}
```

**Posibles mejoras**:

- Reemplazar `Map<String, List<List<String>>>` por un DTO tipado como `DepartmentData` que encapsule la estructura anidada y evite casts manuales. Esto eliminaría la necesidad de navegar listas de listas de strings, que es frágil y propensa a errores de índice.

- Inyectar un `Logger` (SLF4J) en lugar de asumir que existe un `log` estático global. El logger debería ser un campo de instancia configurable, no una variable implícita que puede estar o no definida.

- Extraer la lógica de `sumAllValues` y `tryParseDouble` a una clase separada `NumberSummaryCalculator` para respetar SRP. `PayrollCalculator` actualmente mezcla parsing de datos con cálculo de nómina. La clase `SumCount` también merece su propio archivo si crece.

## Principios Aplicados

- **Nombres revelan intención**: cada nombre dice exactamente qué hace
- **Funciones pequeñas**: máximo 10 líneas
- **Un nivel de abstracción**: no mezclar parseo, suma y logging
- **Early return**: evitar anidación profunda
- **Optional**: eliminar nulls
- **Constantes**: eliminar números mágicos
- **Excepciones específicas**: no tragar errores

