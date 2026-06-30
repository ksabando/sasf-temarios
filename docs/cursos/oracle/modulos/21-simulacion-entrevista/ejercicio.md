---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Sistema de Reservas de Hotel ⭐⭐⭐ Avanzado

**Enunciado:** Un hotel necesita un sistema de reservas. Tiene habitaciones de diferentes tipos (SINGLE, DOBLE, SUITE) con precios por noche variables según temporada (ALTA, MEDIA, BAJA). Los clientes pueden reservar múltiples habitaciones. Si un cliente cancela con menos de 48 horas, se cobra el 50%. Si no se presenta (no-show), se cobra el 100%. Las reservas de más de 7 noches tienen 10% de descuento.

INFORMACIÓN REQUERIDA:
- Habitaciones: número, tipo, estado, características
- Clientes: datos personales, histórico de reservas
- Reservas: fechas, habitaciones, estado, costo
- Temporadas: fechas de inicio/fin con precio por tipo de habitación

TAREAS:
a) Diseñar modelo relacional completo
b) DDL con constraints
c) Función `calcular_costo_reserva` que reciba check-in, check-out, tipo_habitacion y devuelva costo total con descuentos
d) Procedimiento `cancelar_reserva` que aplique penalización según regla
e) Trigger que evite overbooking (no permitir reservar habitación ya ocupada en esas fechas)

---

## Ejercicio 3: Sistema de Nómina ⭐⭐⭐ Avanzado

**Enunciado:** Empresa con empleados que tienen diferentes tipos de contrato (PLANTA, TEMPORAL, HONORARIOS). Los de planta reciben bono de antigüedad (2% por año, máx 30%), los temporales reciben bono fijo por proyecto. Honorarios emiten factura y se les retiene 10% de impuesto. Todos tienen descuento de salud (4%) y pensión (porcentaje variable según parámetro del sistema). Horas extra: +50% día hábil, +100% fin de semana.

INFORMACIÓN REQUERIDA:
- Empleados: datos personales, tipo contrato, fecha ingreso, sueldo base
- Horas extra: empleado, fecha, horas, tipo día (hábil/fin de semana)
- Parámetros: porcentaje pensión, tope bono antigüedad, valores hora extra

TAREAS:
a) Modelo relacional
b) DDL
c) Función `calcular_liquido` que reciba empleado_id y mes, devuelva sueldo líquido
d) Procedimiento `generar_nomina_mensual` que inserte en tabla NOMINA para todos los empleados
e) Reporte PL/SQL: resumen por tipo de contrato con totales

---

## Ejercicio 4: Sistema de Inventario y Reabastecimiento ⭐⭐ Intermedio

**Enunciado:** Tienda con múltiples bodegas. Cada producto tiene stock mínimo y stock máximo por bodega. Cuando el stock de un producto en una bodega baja del mínimo, se genera automáticamente una alerta de reabastecimiento. Los productos tienen categoría y proveedor. Un mismo producto puede venir de distintos proveedores con distintos precios.

INFORMACIÓN REQUERIDA:
- Bodegas: identificador, nombre, ubicación
- Productos: código, nombre, categoría, stock mínimo/máximo por bodega
- Proveedores: datos, productos que suministran, precios
- Alertas de reabastecimiento: producto, bodega, fecha, estado

TAREAS:
a) Modelo relacional
b) DDL
c) Trigger que detecte stock bajo mínimo y registre alerta en tabla REABASTECER
d) Procedimiento `generar_orden_compra` que consolide todas las alertas por proveedor
e) Función `valor_inventario_total` que calcule el valor del inventario (stock * precio_unitario)

---

## Ejercicio 5: Sistema de Suscripciones SaaS ⭐⭐ Intermedio

**Enunciado:** Plataforma SaaS con planes mensuales (BASIC, PRO, ENTERPRISE). Los clientes se suscriben a un plan. La facturación es mensual automática. Si el pago falla, se retiene el servicio y se notifica. Después de 3 intentos fallidos consecutivos, se cancela la suscripción. Upgrade inmediato: cobro proporcional. Downgrade: aplica al siguiente ciclo.

INFORMACIÓN REQUERIDA:
- Planes: nombre, precio mensual, características
- Clientes: datos, plan actual, fecha suscripción, estado
- Facturación: historial de cobros, intentos fallidos
- Notificaciones: eventos enviados al cliente

TAREAS:
a) Modelo relacional
b) DDL
c) Procedimiento `renovar_suscripciones` que procese todas las renovaciones del día
d) Procedimiento `cambiar_plan` que maneje upgrade/downgrade con cobro proporcional si aplica
e) Función `clientes_activos` que retorne SYS_REFCURSOR con clientes al día

---

## Ejercicio 6: Sistema de Delivery/Rappi ⭐⭐⭐ Avanzado

**Enunciado:** Plataforma de delivery. Restaurantes ofrecen menú. Clientes piden. Repartidores aceptan y entregan. Cada pedido pasa por estados: PENDIENTE → CONFIRMADO → EN_PREPARACION → EN_CAMINO → ENTREGADO. Tarifa de envío basada en distancia (zonas). Comisión de plataforma: 15% del pedido. Repartidor gana tarifa base + bono por distancia > 5km.

INFORMACIÓN REQUERIDA:
- Restaurantes, clientes, repartidores: datos, ubicación (zona)
- Menú: items con precio por restaurante
- Pedidos: items, cantidades, estado, fechas de cada transición
- Zonas: tarifas de envío por zona

TAREAS:
a) Modelo relacional (con tabla de estados y transiciones)
b) DDL
c) Trigger que valide transición de estados (no se puede saltar de PENDIENTE a ENTREGADO)
d) Función `calcular_ganancia_repartidor` que sume tarifas del día
e) Procedimiento `asignar_repartidor` que busque el más cercano disponible

---

## Ejercicio 7: Sistema de Calificaciones Académicas ⭐⭐ Intermedio

**Enunciado:** Universidad con estudiantes, cursos, profesores. Un estudiante se inscribe en cursos. Cada curso tiene evaluaciones (Parcial 1, Parcial 2, Examen Final, Trabajos) con distintos porcentajes. La nota final se calcula ponderando. Si el estudiante saca menos de 3.0, reprueba. Si saca entre 3.0 y 3.9, puede dar examen de recuperación que reemplaza la nota más baja. Promedio acumulado (GPA) se actualiza cada semestre.

INFORMACIÓN REQUERIDA:
- Estudiantes, cursos, profesores: datos básicos
- Inscripciones: estudiante, curso, semestre, estado
- Evaluaciones: tipo, porcentaje, nota
- GPA histórico por estudiante

TAREAS:
a) Modelo relacional
b) DDL
c) Función `calcular_nota_final` que reciba curso_id y estudiante_id
d) Trigger que actualice GPA cuando se cierra un semestre
e) Reporte: top 10 estudiantes por GPA con su historial

---

## Ejercicio 8: Sistema de Helpdesk/Tickets ⭐⭐⭐ Avanzado

**Enunciado:** Mesa de ayuda TI. Usuarios crean tickets con prioridad (BAJA, MEDIA, ALTA, CRITICA) y categoría. Los tickets se asignan a agentes automáticamente por round-robin dentro de la misma categoría. SLA: tickets críticos deben responderse en < 1 hora, alta < 4 horas, media < 24 horas, baja < 72 horas. Si se viola el SLA, el ticket se escala al supervisor. Los tickets pueden reasignarse.

INFORMACIÓN REQUERIDA:
- Usuarios, agentes, supervisores: datos, categoría, carga actual
- Tickets: descripción, prioridad, categoría, estado, fechas
- SLA: tiempos máximos por prioridad
- Historial de asignaciones y escalaciones

TAREAS:
a) Modelo relacional
b) DDL
c) Procedimiento `asignar_ticket` que implemente round-robin por categoría
d) Función `tickets_vencidos_sla` que retorne los tickets fuera de SLA
e) Trigger que detecte violación de SLA y escale automáticamente

---

## Ejercicio 9: Sistema de Facturación de Clínica ⭐⭐⭐ Avanzado

**Enunciado:** Clínica con pacientes, médicos, servicios (CONSULTA, PROCEDIMIENTO, EXAMEN). Cada servicio tiene un costo base. Los pacientes pueden tener seguro (ISAPRE con distintos porcentajes de cobertura). La clínica factura: el seguro paga su porcentaje, el paciente paga el copago. Si el paciente no tiene seguro, paga el 100%. Algunos servicios requieren autorización previa del seguro.

INFORMACIÓN REQUERIDA:
- Pacientes, médicos: datos personales, especialidad
- Servicios: tipo, costo base, requiere_autorizacion
- Seguros: planes, coberturas por servicio (porcentaje)
- Facturas: desglose seguro vs copago, estado

TAREAS:
a) Modelo relacional (con coberturas por servicio y por plan)
b) DDL
c) Función `calcular_copago` que determine cuánto paga el paciente vs seguro
d) Procedimiento `generar_factura` que cree la factura desglosada
e) Trigger que valide autorización previa para servicios que lo requieran

---

## Ejercicio 10: Sistema de Subastas Online ⭐⭐⭐ Avanzado

**Enunciado:** Plataforma de subastas. Vendedores publican items con precio base, fecha inicio, fecha fin. Compradores pujan. La puja debe ser mayor que la puja actual en al menos el incremento mínimo (5% del precio base). Si una puja llega en los últimos 5 minutos, la subasta se extiende 5 minutos más. Al finalizar, el ganador es el de mayor puja. Si el ganador no paga en 48 horas, se cancela y gana el segundo.

INFORMACIÓN REQUERIDA:
- Vendedores, compradores: datos, reputación
- Items: descripción, precio base, fechas de subasta, estado
- Pujas: comprador, monto, fecha/hora
- Pagos: estado, fecha, confirmación

TAREAS:
a) Modelo relacional
b) DDL
c) Trigger que extienda subasta si puja en últimos 5 minutos
d) Procedimiento `finalizar_subasta` que determine ganador y notifique
e) Función `estado_pago_ganador` que maneje el no-pago y reasigne al segundo
