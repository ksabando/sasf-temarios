---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Mensajería con Kafka y RabbitMQ

1. **¿Qué tipo de exchange envía mensajes a todas las colas enlazadas sin importar el routing key?**
   - a) Direct
   - b) Topic
   - c) Fanout
   - d) Headers
   - **Respuesta: c**

2. **¿Qué anotación se usa para consumir mensajes de RabbitMQ?**
   - a) @JmsListener
   - b) @RabbitListener
   - c) @RabbitConsumer
   - d) @AmqpListener
   - **Respuesta: b**

3. **¿Qué objeto se usa para publicar mensajes en RabbitMQ?**
   - a) JmsTemplate
   - b) KafkaTemplate
   - c) RabbitTemplate
   - d) AmqpTemplate
   - **Respuesta: c**

4. **¿Qué simboliza # en un Topic Exchange?**
   - a) Una palabra cualquiera
   - b) Cero o más palabras
   - c) Exactamente una palabra
   - d) Cualquier carácter
   - **Respuesta: b**

5. **¿Qué concepto de Kafka permite paralelizar el consumo de mensajes?**
   - a) Topics
   - b) Partitions
   - c) Consumer Groups
   - d) Brokers
   - **Respuesta: b**

6. **¿Qué anotación se usa para consumir mensajes de Kafka?**
   - a) @KafkaConsumer
   - b) @KafkaListener
   - c) @Consumer
   - d) @MessageListener
   - **Respuesta: b**

7. **¿Qué propiedad del producer Kafka garantiza que no haya duplicados?**
   - a) acks=all
   - b) enable.idempotence=true
   - c) retries=10
   - d) max.in.flight=5
   - **Respuesta: b**

8. **¿Qué es un offset en Kafka?**
   - a) El tamaño del mensaje
   - b) La posición secuencial de un mensaje en una partición
   - c) El número de réplicas
   - d) El número de consumidores
   - **Respuesta: b**

9. **¿Para qué sirve una Dead Letter Queue (DLQ)?**
   - a) Almacenar mensajes procesados exitosamente
   - b) Almacenar mensajes que no pudieron ser procesados
   - c) Acelerar el procesamiento de mensajes
   - d) Balancear la carga entre consumidores
   - **Respuesta: b**

10. **¿Qué hace Spring Cloud Stream?**
    - a) Reemplaza completamente RabbitMQ y Kafka
    - b) Abstrael el broker de mensajes permitiendo cambiar de implementación
    - c) Solo funciona con Kafka
    - d) Es un cliente HTTP
    - **Respuesta: b**

11. **¿Qué método de Channel.confirma manualmente un mensaje en RabbitMQ?**
    - a) basicAck
    - b) basicConfirm
    - c) basicNack
    - d) basicReject
    - **Respuesta: a**

12. **¿Qué propiedad de consumer Kafka determina desde dónde leer cuando no hay offset?**
    - a) group-id
    - b) auto-offset-reset
    - c) enable-auto-commit
    - d) isolation-level
    - **Respuesta: b**

13. **¿Cuál NO es un tipo de exchange en RabbitMQ?**
    - a) Direct
    - b) Topic
    - c) Fanout
    - d) RoundRobin
    - **Respuesta: d**

14. **¿Qué nivel de aislamiento garantiza que un consumer no lea mensajes no commiteados?**
    - a) read_uncommitted
    - b) read_committed
    - c) repeatable_read
    - d) serializable
    - **Respuesta: b**

15. **¿Qué interfaz funcional se usa para producir mensajes en Spring Cloud Stream?**
    - a) Consumer
    - b) Function
    - c) Supplier
    - d) Producer
    - **Respuesta: c**

