---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Beans y Configuración

**1. ¿Cuál es la diferencia entre @Component, @Service, @Repository y @Controller?**
**R:** Todas son especializaciones de @Component. @Service indica lógica de negocio, @Repository indica capa de persistencia (y añade traducción automática de excepciones), @Controller indica un controlador MVC. @Component es la anotación genérica para cualquier bean gestionado.

**2. ¿Cuándo usar @Bean en lugar de @Component?**
**R:** @Bean se usa dentro de clases @Configuration para declarar beans de clases que no podemos modificar (librerías externas, clases de terceros) o cuando necesitamos control total sobre la creación y configuración de la instancia.

**3. ¿Qué es el scope singleton y cuál es el default en Spring?**
**R:** El scope singleton significa que el contenedor Spring crea una única instancia del bean y la comparte para todas las solicitudes. Es el scope por defecto en Spring.

**4. ¿Qué hace @PostConstruct y cuándo se ejecuta?**
**R:** @PostConstruct es una anotación que marca un método para ejecutarse después de que el bean ha sido construido y sus dependencias han sido inyectadas, pero antes de que el bean esté disponible para su uso.

**5. ¿Cómo se desambiguían múltiples beans del mismo tipo?**
**R:** Usando @Primary (para marcar un bean como preferido) o @Qualifier (para especificar explícitamente qué bean inyectar mediante un nombre o identificador).

**6. ¿Qué es @Lazy y para qué sirve?**
**R:** @Lazy retrasa la inicialización de un bean hasta que sea solicitado por primera vez, en lugar de crearlo durante el arranque del contexto. Revisartil para servicios pesados que no siempre se necesitan.

**7. ¿Qué hace la anotación @Import en una clase @Configuration?**
**R:** @Import permite combinar múltiples clases de configuración en una sola, importando sus definiciones de beans. Es útil para modularizar la configuración en archivos separados.

**8. ¿Cómo se usa @Profile y para qué sirve?**
**R:** @Profile permite activar o desactivar beans según el perfil activo (dev, prod, test, etc.). Se combina con la propiedad `spring.profiles.active` en application.properties para seleccionar el perfil.

**9. ¿Qué diferencia hay entre InitializingBean y @PostConstruct?**
**R:** InitializingBean es una interfaz con el método afterPropertiesSet() que se ejecuta después de inyectar dependencias. @PostConstruct es una anotación de Jakarta EE que hace lo mismo pero sin acoplar el código a Spring.

**10. ¿Qué es el proxyMode en los scopes request y session?**
**R:** El proxyMode (ScopedProxyMode.TARGET_CLASS o INTERFACES) crea un proxy que se inyecta en beans singleton. Cuando se llama a un método del proxy, este resuelve la instancia real del bean request/session en ese momento, permitiendo inyectar scopes de menor duración en beans de mayor duración.

