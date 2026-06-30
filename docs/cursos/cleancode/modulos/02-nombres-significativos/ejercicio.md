---
sidebar_label: "Ejercicio"
---

# Ejercicio M02 — Renombrar Identificadores

## Objetivo

Identificar y renombrar **50+ identificadores** en el proyecto legacy de nóminas.

## Instrucciones

1. Revisa el código legacy de la clase `PayrollService`
2. Identifica todos los identificadores que violan las reglas de nombres significativos
3. Propón un nombre mejor para cada uno
4. Clasifícalos según la regla violada

## Código Legacy

```java
package com.sasf.nomina.legacy;

import java.util.*;

public class PayrollService {

    private List emps;

    public PayrollService() {
        this.emps = new ArrayList();
    }

    public void addEmp(Employee e) {
        emps.add(e);
    }

    public double chte(int id, int h) {
        Employee e = fId(id);
        if (e != null) {
            double r = e.getS() / 30 / 8;
            double t = r * 1.5 * h;
            if (e.getDpt().equals("IT")) {
                t = t * 1.1;
            }
            return t;
        }
        return 0.0;
    }

    private Employee fId(int id) {
        for (Object o : emps) {
            Employee e = (Employee) o;
            if (e.getId() == id) {
                return e;
            }
        }
        return null;
    }

    public void gen() {
        double tt = 0;
        for (Object o : emps) {
            Employee e = (Employee) o;
            double s = e.getS();
            double an = s * 12;
            double bn = 0;
            if (an < 50000) {
                bn = an * 0.05;
            } else if (an < 100000) {
                bn = an * 0.1;
            } else {
                bn = an * 0.15;
            }
            double p = s + bn;
            tt += p;
            System.out.println(e.getN() + ": " + p);
        }
        System.out.println("Total: " + tt);
    }
}
```

## Categorías de Violaciones (debes encontrar al menos 5 por categoría)

1. **Nombres que no revelan intención**: `em`, `r`, `t`, `e`, `o`
2. **Nombres desinformativos**: nombres que sugieren algo incorrecto
3. **Nombres no pronunciables**: `chte`, `fId`, `dpt`
4. **Nombres no buscables**: `s`, `e`, `an`, `bn`
5. **Abreviaturas**: `emp`, `gen`, `calc`, `proc`
6. **Nombres de métodos inadecuados**: `chte` (debería ser verbo)
7. **Inconsistencia de conceptos**: mezclar términos inconsistentes
8. **Números mágicos**: valores literales sin nombre

## Formato de Entrega

| # | Línea | Identificador Actual | Regla Violada | Nombre Propuesto |
|---|-------|---------------------|---------------|------------------|
| 1 | 7 | `emps` | No revela intención | `employees` |
| 2 | ... | ... | ... | ... |

## Criterios

- Mínimo **50 identificadores** renombrados
- Al menos **5 por categoría**
- Los nombres propuestos deben seguir las reglas de Clean Code
