---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

**3. ¿Qué anotación de Mockito (Spring Boot 3.4+) crea un mock e inyecta en el contexto?**

a) @Mock
b) @InjectMocks
c) @MockitoBean
d) @SpyBean

<details>
<summary>Ver respuesta</summary>
**c) @MockitoBean**
</details>

---

**4. ¿Qué librería permite hacer assertions sobre el JSON de respuesta?**

a) Gson
b) Jackson
c) JsonPath
d) Jsoup

<details>
<summary>Ver respuesta</summary>
**c) JsonPath**
</details>

---

**5. ¿Qué método de MockMvc verifica el código de estado HTTP de la respuesta?**

a) .andExpect(status().isOk())
b) .andReturn().getStatus()
c) .assertStatus(200)
d) .expect(HttpStatus.OK)

<details>
<summary>Ver respuesta</summary>
**a) .andExpect(status().isOk())**
</details>

---

**6. ¿Qué plugin de Maven genera reportes de cobertura de tests?**

a) maven-surefire-plugin
b) maven-failsafe-plugin
c) jacoco-maven-plugin
d) maven-coverage-plugin

<details>
<summary>Ver respuesta</summary>
**c) jacoco-maven-plugin**
</details>

---

**7. ¿Qué elemento de configuración de JaCoCo define el umbral mínimo de cobertura?**

a) <minimum>
b) <limit>
c) <threshold>
d) <minCoverage>

<details>
<summary>Ver respuesta</summary>
**a) <minimum>**
</details>

---

**8. ¿Qué fase de Maven ejecuta los tests y genera el reporte JaCoCo?**

a) compile
b) test
c) verify
d) package

<details>
<summary>Ver respuesta</summary>
**c) verify**
</details>

---

**9. ¿Qué tipo de contador mide el porcentaje de líneas de código ejecutadas?**

a) LINE
b) BRANCH
c) INSTRUCTION
d) METHOD

<details>
<summary>Ver respuesta</summary>
**c) INSTRUCTION**
</details>

---

**10. ¿Qué assertion de JsonPath verifica que un campo existe en la respuesta?**

a) .exists()
b) .isNotEmpty()
c) .isNotNull()
d) .hasField()

<details>
<summary>Ver respuesta</summary>
**a) .exists()** (usando `jsonPath("$.campo").exists()`)
</details>

