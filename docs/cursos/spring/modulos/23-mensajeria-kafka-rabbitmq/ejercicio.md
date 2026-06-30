---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Sistema de eventos con Kafka

### Objetivo
Implementar procesamiento de eventos de pedidos usando Kafka con múltiples consumidores en grupo.

### Requisitos
1. **order-service** (producer):
   - Crea pedidos y los publica en topic `order.events` con 3 particiones
   - Usa `KafkaTemplate` con envío asíncrono
   - Implementa callback para manejar éxito/fallo

2. **Consumidores** (3 instancias del mismo group.id):
   - Cada consumidor procesa un subconjunto de particiones
   - Simulan latencia de 1-3 segundos
   - Muestran qué partición están procesando

3. **Exactly-once**:
   - Configurar producer con `enable.idempotence: true` y `acks: all`

### Verificación
- Enviar 10 pedidos → los 3 consumidores se distribuyen las particiones equitativamente
- Verificar qué consumidor procesa cada partición

---

## Ejercicio 4: Consumidor idempotente con Kafka

### Objetivo
Implementar un consumidor que garantice idempotencia usando Redis o base de datos.

### Requisitos
1. **Producer** envía eventos con ID único (UUID)
2. **Consumer** verifica si el evento ya fue procesado antes de ejecutar la lógica
3. Usar un `ConcurrentHashMap` o Redis para almacenar eventos procesados
4. Simular un reinicio del consumidor y verificar que no duplica procesamiento
5. Configurar `isolation-level: read_committed`

### Verificación
- El mismo mensaje puede entregarse dos veces pero solo se procesa una
- Después de reiniciar el consumidor, los offsets se recuperan correctamente

---

## Ejercicio 5: Spring Cloud Stream con binding RabbitMQ y Kafka

### Objetivo
Usar Spring Cloud Stream para abstraer el broker de mensajes e implementar un pipeline de procesamiento.

### Requisitos
1. Definir interfaces funcionales (Supplier, Function, Consumer)
2. Configurar bindings en application.yml
3. Pipeline:
   - `orderSupplier` genera pedidos automáticamente
   - `processOrder` transforma y enriquece el pedido
   - `orderConsumer` guarda en base de datos
4. Probar primero con RabbitMQ, cambiar a Kafka solo cambiando la dependencia y configuración

### Verificación
- Pipeline completo funcionando con RabbitMQ
- Cambiar binder a Kafka sin modificar código Java
- Verificar que el pipeline funciona con ambos brokers
