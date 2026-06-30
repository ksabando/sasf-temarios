---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Spring Framework e IoC

**1. ¿Qué es Inversión de Control (IoC)?**
**R:** Es un principio de diseño donde el control de creación y gestión de objetos se transfiere del código de la aplicación a un contenedor externo (el contenedor IoC), invirtiendo el flujo de control tradicional.

**2. ¿Cuál es la diferencia principal entre BeanFactory y ApplicationContext?**
**R:** ApplicationContext extiende BeanFactory añadiendo soporte para internacionalización (MessageSource), publicación de eventos, AOP automático y carga eager de singletons. BeanFactory carga los beans de forma lazy (bajo demanda) y es más liviano.

**3. ¿Cuál es el tipo de inyección de dependencias recomendado en Spring?**
**R:** La inyección por constructor, porque permite crear objetos inmutables (campos final), facilita el testing y hace explícitas todas las dependencias necesarias.

**4. ¿Qué hace la anotación @Configuration?**
**R:** Indica que una clase declara uno o más métodos @Bean y que será procesada por el contenedor Spring para generar definiciones de beans y solicitudes de servicio.

**5. ¿Qué scopes (ámbitos) soporta Spring?**
**R:** Singleton, prototype, request, session, application y websocket. Singleton es el default para aplicaciones sin web; request, session y application solo están disponibles en un ApplicationContext web.

**6. ¿Cuál es el scope por defecto de un bean en Spring?**
**R:** Singleton. Esto significa que el contenedor crea una única instancia del bean y la comparte para todas las solicitudes.

**7. ¿Cómo funciona @Qualifier?**
**R:** @Qualifier es una anotación que se usa junto con @Autowired para especificar exactamente qué bean debe inyectarse cuando hay múltiples candidatos del mismo tipo. Se puede aplicar tanto en la definición del bean como en el punto de inyección.

**8. ¿Para qué sirve @Primary?**
**R:** @Primary indica que un bean debe ser el preferido cuando hay múltiples candidatos del mismo tipo. Si no se especifica @Qualifier, Spring usará el bean marcado con @Primary.

**9. ¿Qué efecto tiene @Lazy en un bean?**
**R:** @Lazy retrasa la inicialización del bean hasta que sea solicitado por primera vez, en lugar de crearlo durante el arranque del contexto. Se puede aplicar a beans individuales o globalmente en @Configuration.

**10. ¿Cuál es el ciclo de vida de ApplicationContext?**
**R:** Las fases son: 1) Instanciación del contexto, 2) Carga y registro de BeanDefinitions, 3) Ejecución de BeanFactoryPostProcessors, 4) Instanciación de beans singleton, 5) Inyección de dependencias, 6) Inicialización (PostConstruct/InitializingBean), 7) Disponible para uso, 8) Destrucción al cerrar (PreDestroy/DisposableBean).

