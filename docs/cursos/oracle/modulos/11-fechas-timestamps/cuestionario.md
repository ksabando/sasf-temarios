---
sidebar_label: "Cuestionario"
---
# Preguntas y Respuestas - Fechas, Timestamps e Intervalos

## 1. Cuales son las diferencias entre DATE, TIMESTAMP y TIMESTAMP WITH TIME ZONE?
DATE almacena siglo, ano, mes, dia, hora, minuto y segundo (precision de 1 segundo). TIMESTAMP agrega fracciones de segundo (hasta 9 decimales de precision). TIMESTAMP WITH TIME ZONE incluye ademas la zona horaria (ej: '-03:00'). TIMESTAMP WITH LOCAL TIME ZONE normaliza a la zona horaria de la sesion al consultar.

## 2. Que diferencia hay entre SYSDATE y SYSTIMESTAMP?
SYSDATE retorna la fecha y hora actual del servidor de base de datos como tipo DATE. SYSTIMESTAMP retorna lo mismo pero como TIMESTAMP WITH TIME ZONE, incluyendo fracciones de segundo y la zona horaria del servidor. Ambos se evaluan una vez por sentencia SQL, no por fila, por lo que mantienen el mismo valor durante toda la ejecucion.

## 3. Como funciona ADD_MONTHS y que comportamiento especial tiene con fin de mes?
`ADD_MONTHS(fecha, n)` suma n meses a la fecha. Si la fecha original es el ultimo dia del mes, el resultado tambien sera el ultimo dia del mes destino. Ej: `ADD_MONTHS(DATE '2024-01-31', 1)` => 29-FEB-2024 (ultimo de febrero en bisiesto). Si el dia no existe en el mes destino (ej: 31 de enero + 1 = 31 de feb), se ajusta al ultimo dia valido.

## 4. Para que sirve MONTHS_BETWEEN y que tipo de dato retorna?
`MONTHS_BETWEEN(fecha1, fecha2)` calcula la diferencia en meses entre dos fechas como NUMBER. Retorna un valor decimal: la parte entera representa los meses completos y la fraccion representa los dias sobrantes divididos por 31. Ej: `MONTHS_BETWEEN('15-MAR-2024', '01-ENE-2024')` => aproximadamente 2.4516.

## 5. Explica la importancia de usar mascaras explicitas en TO_CHAR y TO_DATE.
Confiar en el formato por defecto NLS_DATE_FORMAT puede causar errores entre sesiones con configuraciones diferentes. `TO_DATE('01/02/2024', 'DD/MM/YYYY')` es explicito y portable. Sin mascara, Oracle usa el formato de sesion que puede variar, causando errores ORA-01843 o interpretaciones incorrectas (confundir mes con dia). Siempre especificar formato.

## 6. Que son los tipos INTERVAL y que operaciones permiten?
INTERVAL YEAR TO MONTH almacena diferencias en anos y meses. INTERVAL DAY TO SECOND almacena diferencias en dias, horas, minutos y segundos (con fracciones). Permiten aritmetica directa con fechas: `SYSDATE + INTERVAL '3' MONTH`, `SYSDATE + INTERVAL '2 3:45:30' DAY TO SECOND`. Son mas semanticos que sumar numeros puros (que suman dias).

## 7. Explica el modelado SCD Type 2 (Slowly Changing Dimension) y como implementarlo.
SCD Type 2 mantiene el historico completo creando una nueva fila cada vez que cambia un atributo. Se implementa con columnas: `fecha_desde`, `fecha_hasta`, y `activo_flag`. Cuando un atributo cambia, se cierra la fila activa (fecha_hasta = SYSDATE, activo_flag = 'N') y se inserta una nueva con los valores actualizados. La consulta actual es `WHERE activo_flag = 'Y'`.

## 8. Como se manejan zonas horarias en Oracle? Que funcion convierte entre zonas?
Oracle almacena zonas horarias con TIMESTAMP WITH TIME ZONE. `DBTIMEZONE` muestra la zona de la BD, `SESSIONTIMEZONE` la de la sesion. `FROM_TZ(timestamp, zona)` agrega zona a un timestamp. `AT TIME ZONE zona` convierte entre zonas. Ej: `SYSTIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires'` convierte a hora argentina.

## 9. Que columnas de auditoria se recomienda incluir en toda tabla transaccional?
Se recomiendan al menos cuatro columnas: `creado_por` (usuario que inserto), `creado_fecha` (fecha/hora de creacion, default SYSDATE), `modificado_por` (ultimo usuario que modifico), `modificado_fecha` (fecha/hora de ultima modificacion). Estas se pueden gestionar con triggers BEFORE INSERT y BEFORE UPDATE que asignen USER y SYSDATE.

## 10. Que funcion usas para extraer el ano, mes o dia de una fecha?
La funcion estandar es EXTRACT: `EXTRACT(YEAR FROM fecha)`, `EXTRACT(MONTH FROM fecha)`, `EXTRACT(DAY FROM fecha)`, `EXTRACT(HOUR FROM timestamp)`, `EXTRACT(MINUTE FROM timestamp)`. Alternativamente se puede usar TO_CHAR: `TO_CHAR(fecha, 'YYYY')`, pero EXTRACT retorna NUMBER y es mas semantico para operaciones aritmeticas.

