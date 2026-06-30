---
sidebar_label: "Ejercicio"
---

# Ejercicio M01 — Análisis de Código Legacy

## Objetivo

Identificar code smells en un fragmento de código legacy real y proponer mejoras.

## Instrucciones

1. Lee el siguiente código atentamente
2. Identifica **15 code smells** diferentes
3. Anótalos indicando: línea, tipo de smell, por qué es un problema
4. Propón una mejora para cada uno

## Código Legacy

```java
package com.sasf.nomina;

import java.util.*;
import java.sql.*;

public class payroll {

    public static double c(HashMap m, String d) {
        double s = 0;
        int ct = 0;
        List ll = (List) m.get(d);
        if (ll != null) {
            for (int i = 0; i < ll.size(); i++) {
                // TODO: revisar esto
                Object o = ll.get(i);
                if (o != null) {
                    List ll2 = (List) o;
                    if (ll2 != null) {
                        for (int j = 0; j < ll2.size(); j++) {
                            Object o2 = ll2.get(j);
                            if (o2 != null) {
                                String x = o2.toString();
                                if (x != null && !x.equals("")) {
                                    try {
                                        double v = Double.parseDouble(x);
                                        s += v;
                                        ct++;
                                    } catch (Exception e) {
                                        // ignore
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (ct == 0) return 0;
        return s / ct;
    }

    // calcula el pago de horas extra
    public void proc(String id, int he, double th, Connection cn) throws Exception {
        String q = "SELECT * FROM empleados WHERE id = " + id;
        Statement st = cn.createStatement();
        ResultSet rs = st.executeQuery(q);
        if (rs.next()) {
            double sb = rs.getDouble("salario_base");
            // validar
            if (sb > 0) {
                double vhe = sb / 30 / 8 * 1.5;
                double tp = vhe * he;
                if (tp > 0) {
                    String q2 = "INSERT INTO pagos VALUES (" + id + "," + tp + ")";
                    st.executeUpdate(q2);
                    System.out.println("OK: " + tp);
                }
            }
        }
    }

    public static void main(String[] args) {
        // datos hardcodeados
        HashMap data = new HashMap();
        List l1 = new ArrayList();
        l1.add("100");
        l1.add("200");
        l1.add("300");
        data.put("ventas", l1);
        // ...
        double r = c(data, "ventas");
        System.out.println("Resultado: " + r);
    }
}
```

## Formato de Entrega

| # | Línea | Smell | Problema | Mejora |
|---|-------|-------|----------|--------|
| 1 | 3 | ... | ... | ... |
| 2 | ... | ... | ... | ... |

## Criterios

- **Mínimo 15 smells** identificados correctamente
- **Cada smell** debe estar bien clasificado (usar nomenclatura de Fowler)
- La mejora debe ser concreta y aplicable
