# Academia Mágica — Currículo Maestro

**Estado:** documento de planificación de producto y pedagogía. Aprobado por el propietario antes de escribir una sola línea de código.
**Audiencia:** el propietario del producto (revisión) y el equipo de ingeniería (implementación).
**Alcance:** define el currículo de 0 a A1 inicial y el mapa de fases para implementarlo. No modifica código.

---

## 1. Visión

Academia Mágica deja de ser un catálogo de vocabulario y se convierte en un curso de inglés infantil desde cero hasta A1 inicial. La identidad del producto no cambia: es una plataforma con currículo propio, fuerte en gamificación y con un tutor de inteligencia artificial opcional que ya existe (Groq, `llama-3.1-8b-instant`). Lo que cambia es el eje: el niño deja de acumular palabras aisladas y avanza por una progresión lingüística con etapas, estructuras y comprensión lectora. Todo lo construido hasta hoy — 14 temas, 158 palabras curadas a mano, audio por síntesis de voz, selección adaptativa 60/30/10, cuatro tipos de ejercicio, cinco niveles por tema, rachas, monedas, nueve logros y tablero de competencias — se reutiliza. No se reconstruye nada: se le da un orden, un significado pedagógico y una capa de gramática que hoy falta.

### 1.1 Punto de partida verificado

Estos son los hechos del código que sostienen el plan. No son suposiciones.

| Hecho verificado | Dónde | Consecuencia curricular |
| --- | --- | --- |
| 14 temas, 158 palabras en total | `src/data/vocabulary.ts` | El catálogo es la materia prima, no el curso. |
| La dificultad de palabra solo usa valores 1, 2 y 3. Ninguna palabra es 4 ni 5 | `src/data/vocabulary.ts` | El filtro `difficulty <= nivel` se satura en el nivel 3. Los niveles 4 y 5 hoy no distinguen nada. |
| El nivel sube con 80 % de aciertos en la sesión; el nivel 5 es terminal | `src/app/clases/[slug]/page.tsx` | El mecanismo de ascenso ya es correcto; lo que falta es qué significa cada nivel. |
| Los 5 niveles usan los mismos 4 tipos de ejercicio con las mismas plantillas | `src/lib/exercises.ts` | Hoy el nivel no cambia la tarea, solo el filtro de palabras. |
| `sentence_builder` tiene **una sola** plantilla fija: «I see a \_\_\_» | `src/lib/exercises.ts` | El constructor de oraciones no existe todavía. Es el corazón de la Etapa 2. |
| `getExercises()` siempre usa plantillas; `generateAIExercise()` no se llama | `src/lib/exercises.ts` | Toda la Etapa 2 es trabajo de plantillas, no de IA. |
| El catálogo **no contiene ningún pronombre ni palabra función**: ni `I`, ni `my`, ni `you`, ni `he`, ni `the`, ni `is`, ni `not` | `src/data/vocabulary.ts` | Es el vacío estructural más importante. Ver sección 7.1. |
| `TOPICS` se dibuja en orden de arreglo; `getTopicByOrder()` existe pero no se usa | `src/app/clases/page.tsx`, `src/app/dashboard/page.tsx` | Reordenar temas es un cambio de una línea. `order` ya es un campo válido. |
| La clave de progreso es el *slug* del tema | `src/types/progress.ts` | Cambiar el orden no invalida el progreso ya guardado. Migración cero. |
| Las 8 lecturas ya existen escritas, con su flujo de lectura y su recompensa | `src/data/readings.ts` (sin commitear) | La Etapa 3 está Advance. Fase C es integración y pulido, no redacción. |
| `bestStreak` es la racha de **respuestas correctas**, no de días | `src/types/progress.ts` | La racha de 7 días de Magic Wardrobe necesita un concepto nuevo. |
| El proyecto no tiene ningún test | raíz del repositorio | Cualquier cambio en la corrección de respuestas necesita un arnés de pruebas primero. |

---

## 2. Principios pedagógicos

**Diseño basado en can-do, no en listas de palabras.** Cada etapa se define por lo que el alumno **puede hacer** al terminarla, con verbos de acción observables. «Reconocer 12 colores» no es un objetivo; «decir *It is red* señalando algo» sí lo es. El vocabulario es el insumo, no el logro.

**Textos auténticos y cortos.** Cada tema de lectura es un texto real de la vida diaria —un cartel, un menú, una nota, una invitación, un diálogo— siguiendo el patrón de British Council LearnEnglish Kids: preparación del vocabulario, lectura, y dos preguntas de comprensión. Tres a seis oraciones, uno a tres párrafos, vocabulario del tema más palabras de alta frecuencia.

**El aprendizaje no castiga pedir ayuda.** La traducción al español es un recurso educativo libre, no una pista de pago. El niño que necesita la lengua puente para decodificar una palabra no debe pagar por ella. Ver sección 8.

**Ciclo por tema: estudiar → practicar → comprender.** Las palabras se vuelven frases, las frases se vuelven lectura. Ningún tema termina en la palabra suelta: cada uno termina con el niño capaz de usar su vocabulario en una oración y, en la Etapa 3, de comprenderlo en un texto.

**Gamificación como refuerzo positivo.** La racha, las monedas y los logros motivan a continuar. Nunca se usan para castigar, para bloquear contenido ni para crear presión de pago. Los cosméticos viven únicamente dentro de la economía del juego: sin dinero real, sin compra-ganar.

---

## 3. Las 5 etapas

| Etapa | Nombre | Objetivo central | Punto de control |
| --- | --- | --- | --- |
| 0 | First Magic | poder presentarse y ser amable | Diálogo de saludos de 4 turnos |
| 1 | Magic Words | reconocer y pronunciar 158 palabras | Dominio del 80 % en un tema |
| 2 | First Sentences | construir oraciones propias | 11 estructuras de la biblioteca |
| 3 | Magic Reading | comprender sin traducir palabra por palabra | 2 aciertos de comprensión |
| 4 | A1 Adventure | sostener mini-diálogos sobre sí mismo | Presentación personal completa |

### Etapa 0 — First Magic

**Objetivo.** Antes de aprender una sola palabra de contenido, el niño abre la clase con un saludo, dice su nombre, pide por favor y se despide correctamente. Es la puerta de entrada emocional al curso: la primera interacción con la aplicación debe ser un logro, no un ejercicio.

**Can-do.** Al terminar la etapa, el alumno puede:

- saludar a otra persona (*Hello! / Hi!*)
- despedirse (*Goodbye! / Bye!*)
- decir su nombre (*My name is Luna.*)
- preguntar el nombre de otra persona (*What's your name?*)
- pedir algo con cortesía (*Can I have water, please?*)
- agradecer (*Thank you!*)
- disculparse (*Sorry!*)

**Contenido.** El tema `saludos` (6 palabras: *hello, goodbye, bye, sorry, please, thank you*) más dos palabras nuevas y cuatro estructuras.

| Elemento | Estado actual | Necesario |
| --- | --- | --- |
| Palabras | 6, todas de dificultad 1 | Agregar **hi** y **name** (no existen en el catálogo) |
| Estructuras | Ninguna | `My name is…`, `What's your name?`, `How are you?`, `Can I have…?` |
| Tipo de ejercicio | Solo palabra suelta | `sentence_builder` en nivel 3 con marcos fijos |

**Cómo mapea a la aplicación existente.** Reutiliza el tema `saludos` tal cual (mismas palabras, mismo `id`), el audio de `speak()`, y el flujo de estudio/práctica/resultado. La diferencia es que el ejercicio deja de ser «¿cómo se dice *please* en español?» y pasa a ser completar y usar la frase completa. El texto de lectura de esta etapa es **«Hello, Little Wizard»**, que ya existe y sirve de cierre.

### Etapa 1 — Magic Words

**Objetivo.** Construir la base léxica completa del curso: 158 palabras de 14 campos semánticos, con reconocimiento, pronunciación y asociación palabra ↔ imagen mental ↔ sonido.

**Can-do.** Al terminar la etapa, el alumno puede:

- reconocer una palabra en inglés al oírla
- leer una palabra en inglés y decirla en español
- pronunciar correctamente palabras del nivel 1 y 2 de dificultad
- decir qué imagen mental corresponde a cada palabra
- agrupar palabras por campo semántico (colores con colores, animales con animales)

**Contenido.** Los 14 temas, sin modificación del vocabulario. Reparto: 6 palabras en `saludos`, 9 en `familia`, 10 en `ropa` y `clima`, 11 en `cuerpo`, `casa`, `escuela`, `emociones`, 12 en `colores`, `numeros`, `acciones`, `juguetes`, 14 en `comida`, 15 en `animales`. Total: 158.

**Cómo mapea a la aplicación existente.** Es exactamente lo que la aplicación ya hace hoy. Las tarjetas de estudio (`WordCard`), el audio con `SpeechSynthesis`, los cuatro tipos de ejercicio de palabra y la selección adaptativa 60/30/10 se conservan sin cambios. Lo único que se agrega es una capa de palabras función para que las palabras puedan entrar en oraciones (sección 7.1).

### Etapa 2 — First Sentences

**Objetivo.** Convertir el vocabulario de la Etapa 1 en oraciones propias. Es la bisagra del curso: sin ella, la aplicación sigue siendo un catálogo.

**Can-do.** Al terminar la etapa, el alumno puede:

- presentarse (*I am a student. / My name is Luna.*)
- decir qué tiene (*I have a cat. / I have three books.*)
- describir un objeto simple (*This is my mom. / This is a red ball.*)
- decir cómo es algo (*It is red. / It is a cat.*)
- expresar qué le gusta y qué no (*I like apples. / I don't like soup.*)
- decir qué sabe hacer (*I can run. / I can't swim.*)
- hacer y responder una pregunta simple (*What is it? / How are you?*)
- contestar un diálogo de 4 turnos con un maestro o con otra persona

**Contenido.** Las 8 estructuras centrales de la sección 6, más 3 estructuras de apoyo. Todas se construyen con vocabulario ya existente de la Etapa 1; no se introduce vocabulario de contenido nuevo.

**Cómo mapea a la aplicación existente.** Reutiliza `sentence_builder` y `multiple_choice`, y el motor adaptativo. Lo que cambia es que el nivel deja de filtrar únicamente palabras y pasa a determinar **qué tarea** se hace (sección 5). Requiere un campo `example` por palabra para la pista 3, un normalizador de respuestas y una interfaz de fichas de palabras para que el niño de 6 a 10 años no escriba oraciones a mano.

### Etapa 3 — Magic Reading

**Objetivo.** Pasar de producir oraciones sueltas a comprender un texto. Es donde el niño descubre que puede entender inglés sin traducir palabra por palabra.

**Can-do.** Al terminar la etapa, el alumno puede:

- leer un texto de 3 a 6 oraciones en voz alta o seguirlo con el dedo
- entender el tema general de un cartel, un menú, una nota o un diálogo
- responder una pregunta de recuerdo sobre un dato explícito del texto
- responder una pregunta de inferencia sobre la intención de un personaje
- usar el contexto para deducir una palabra que no conoce

**Contenido.** Las 8 Lecturas Mágicas de la sección 7, una por cada tema con lectura. Cada una con exactamente 2 preguntas: una de recuerdo y una de inferencia.

**Cómo mapea a la aplicación existente.** **La mayor parte ya está construida.** `src/data/readings.ts` contiene los 8 textos con sus 2 preguntas y explicaciones; `ReadingFlow` implementa el flujo elegir → leer → responder → resultado; `recordReadingResult` paga +1 moneda por respuesta correcta y +2 de bono la primera vez; `GameState.completedReadings` registra lo terminado y el tablero ya muestra el contador de historias leídas. Lo que falta es la capa de palabras función que los textos usan, unificar el mapa de lectura con el orden de los temas y revisar el registro de español de las preguntas.

### Etapa 4 — A1 Adventure

**Objetivo.** Combinar todo en situaciones cotidianas. El niño deja de responder ejercicios y sostiene una conversación breve sobre sí mismo.

**Can-do.** Al terminar la etapa, el alumno puede:

- presentarse ante alguien desconocido de principio a fin (*Hello. My name is Max. I am seven.*)
- hablar de su familia (*I have a mom, a dad and a baby sister.*)
- hablar de sus mascotas y juguetes (*I have a dog and a red ball. I play with my robot.*)
- decir qué le gusta comer (*I like bread and cheese. I don't like soup.*)
- decir qué sabe hacer y qué no (*I can sing. I can't dance.*)
- entender una invitación o un cartel breve y decir si puede ir

**Contenido.** Combinación de los 14 temas con las 8 estructuras, en 6 situaciones de culminación: presentación personal, mi familia, mis mascotas, mis juguetes, mis comidas favoritas, mis habilidades. Cada situación es un mini-diálogo de 6 a 8 turnos, en el mismo formato de la Lectura Mágica pero con más turnos y sin leer el texto completo de entrada.

**Cómo mapea a la aplicación existente.** Es una composición de lo existente: el motor adaptativo elige las palabras, las estructuras de la Etapa 2 arman las oraciones, y el flujo de lectura aporta el contenedor de texto y la recompensa. La dificultad real de esta etapa está en el volumen de combinaciones posibles, que es donde el tutor de IA puede tener un papel opcional más adelante (Fase E).

---

## 4. Secuencia de temas (orden actualizado)

El orden actual sigue el orden de incorporación de los temas, no un criterio pedagógico: *animales* abre el curso y *saludos* aparece undécimo. Eso está exactamente al revés. Un niño no aprende «dog» antes de aprender a decir «hello».

**Los identificadores no cambian.** Solo se modifica el campo `order`. Como el progreso se guarda por *slug* del tema (`magic_progress` en `localStorage`), reordenar no invalida nada del progreso ya acumulado.

### Nuevo orden

| # | Tema | `id` | Palabras | Por qué en esta posición |
| --- | --- | --- | --- | --- |
| 1 | Saludos 👋 | `saludos` | 6 | Abre el curso: es lo primero que se dice en cualquier clase. Sin esto no hay conversación. |
| 2 | Colores 🎨 | `colores` | 12 | Habilita el nivel 2 de inmediato: *It is red.* Ocho adjetivos de dificultad 1 son el mejor primer grupo de adjetivos. |
| 3 | Números 🔢 | `numeros` | 13 | Alimenta la construcción de oraciones con cantidad: *I have three books.* Diez de trece son dificultad 1. |
| 4 | Familia 👨‍👩‍👧‍👦 | `familia` | 9 | Primer contenido en primera persona: *This is my mom* introduce el posesivo y el demostrativo. |
| 5 | Animales 🐾 | `animales` | 15 | Vocabulario de alta frecuencia y alta motivación, y sustantivo singular limpio para *I have a cat.* |
| 6 | Comida 🍎 | `comida` | 14 | Habilita *I like…* e *I don't like…*, las dos estructuras de gusto, y da vocabulario a la lectura de menú. |
| 7 | Cuerpo 🧍 | `cuerpo` | 12 | Con *acciones* forma *I can jump* y *I can't swim*: el cuerpo y el verbo van juntos. |
| 8 | Ropa 👕 | `ropa` | 10 | Después de *familia* y *cuerpo*, el niño ya puede describirse entero: *I have a red shirt and a blue hat.* |
| 9 | Clima 🌤️ | `clima` | 10 | *hot* y *cold* completan la gama de adjetivos para *It is…* y para describir el día. |
| 10 | Casa 🏠 | `casa` | 11 | Introduce la ubicación y da soporte a la lectura de cuarto y de instrucciones. |
| 11 | Escuela 🏫 | `escuela` | 11 | Requiere posesivos y plurales ya establecidos: *Put your book on the desk.* Da soporte a la lectura de nota. |
| 12 | Emociones 😊 | `emociones` | 11 | Depende de que *I am* ya esté sólido (Etapa 0 y nivel 3). Sin eso, *I am happy* no se sostiene. |
| 13 | Juguetes 🧸 | `juguetes` | 12 | Posesiones + *play*: *I have a ball. I play with my robot.* Puente directo hacia la lectura de *Luna's Toys.* |
| 14 | Acciones 🏃 | `acciones` | 12 | Al final a propósito: es el puente más ancho hacia la lectura y el relato, y exige todo lo anterior para construir frases largas. |

**Total verificado: 158 palabras.** Los cuatro bloques que forman el orden son: **fundación** (1-3: saludos, colores, números) → **el yo y lo que tiene** (4-6: familia, animales, comida) → **describirse y su lugar** (7-10: cuerpo, ropa, clima, casa) → **escuela, estados y acción** (11-14: escuela, emociones, juguetes, acciones).

---

## 5. Niveles 1-5 = progreso lingüístico

Esta es la sección central del documento. El cambio de fondo es este: **los niveles dejan de ser «más dificultad para ganar más monedas» y pasan a ser progresión lingüística real.** El mecanismo ya existe y funciona (80 % de aciertos para subir, nivel 5 terminal); lo que se redefine es qué se está midiendo.

### Qué significa hoy cada nivel (verificado)

Hoy el nivel cumple dos funciones y solo dos:

1. **Filtra el grupo de palabras** mediante `getWordsByDifficulty(topic, level)`, que devuelve las palabras con `difficulty <= nivel`. Como **ninguna palabra tiene dificultad 4 o 5**, los niveles 4 y 5 reciben el tema completo, igual que el nivel 3.
2. **Paga un bono de +3 monedas** al subir y alimenta los umbrales de los logros.

Además, cuando la aplicación envía palabras ya elegidas por el motor adaptativo, **el nivel deja de filtrar por completo**. Y los cinco niveles ejecutan exactamente los mismos cuatro tipos de ejercicio con las mismas plantillas. En la práctica, subir de nivel 2 a nivel 5 no le da al niño ninguna tarea nueva.

### Qué significará cada nivel

| Nivel | Nombre | Qué hace el alumno | Ejemplos (solo vocabulario real del catálogo) | Tipos de ejercicio | Capa de apoyo |
| --- | --- | --- | --- | --- | --- |
| **1** | Words | Reconoce, nombra y pronuncia | *cat · dog · red · three · bread* | `multiple_choice`, `translation`, `listening` | ninguna |
| **2** | Say It | Nombra con estructura simple | *This is a cat.* / *It is red.* | `sentence_builder` (1 hueco), `multiple_choice` (elige la frase) | `a`, `this`, `it`, `is` |
| **3** | About Me | Habla de sí mismo | *I have a cat.* / *I like dogs.* / *I am happy.* | `sentence_builder` (marco fijo), `translation` (frase completa) | `I`, `my`, `have`, `like`, `am` |
| **4** | Describe | Describe con detalle y habilidad | *The cat is black.* / *The dog can run.* | `sentence_builder` (2 huecos), `multiple_choice` (frase correcta) | `the`, `can`, verbos de `acciones` |
| **5** | Magic Reading | Comprende un texto | los 8 textos de la Etapa 3 | flujo de lectura + 2 preguntas | negación, preguntas, pronombres de tercera persona |

### Las consecuencias de este cambio

- El nivel pasa a ser un **objetivo de aprendizaje**, no un multiplicador de recompensa. El bono de +3 monedas se conserva porque es un refuerzo positivo, pero deja de ser la razón para subir.
- El **Nivel 5 se vuelve exclusivamente un punto de control de comprensión**: se entra después de haber resuelto los niveles 1-4 del tema, y la recompensa es completar la lectura.
- El motor adaptativo 60/30/10 **sigue funcionando, pero dentro del nivel**: elige *qué palabras* practicar en el nivel actual, no *en qué nivel* estar. El umbral de brecha (dominio < 65 %) y el de ascenso de nivel (80 %) siguen siendo números distintos y con propósitos distintos: el primero elige qué reforzar, el segundo decide si se progresa.
- El filtro por `difficulty` se vuelve **irrelevante para la progresión** y pasa a ser solo un criterio de orden interno de las tarjetas de estudio. Esto es intencional: los niveles los define el currículo, no la dificultad ortográfica de la palabra.

---

## 6. Biblioteca de estructuras (Etapa 2)

Once estructuras. Cada una se apoya exclusivamente en vocabulario que ya existe en el catálogo. Los ejemplos están escritos con palabras reales verificadas; cuando una frase requiere una palabra función, se marca en la columna de apoyo.

### 1. `I am` / `I'm` — identidad y estado

- *I am a student.* — `student` (escuela)
- *I am happy.* — `happy` (emociones)
- *I am six.* — `six` (numeros)

**Ejercicio que mejor la enseña:** `sentence_builder` con marco fijo — *Completa: «I \_\_\_ a student»*. Es la estructura de entrada, la primera que el niño completa entera.
**Apoyo:** `I`, `a`, `am`.

### 2. `I have` — posesión

- *I have a cat.* — `cat` (animales)
- *I have a red ball.* — `red` (colores), `ball` (juguetes)
- *I have three books.* — `three` (numeros), `book` (escuela)

**Ejercicio que mejor la enseña:** `sentence_builder` con huecos variables — *«I have a \_\_\_»* y *«I have three \_\_\_»*. Al ser la estructura más usada, admite la mayor variedad de plantillas.
**Apoyo:** `I`, `have`, `a`, plurales regulares.

### 3. `I like` — gusto

- *I like my dog.* — `dog` (animales)
- *I like bread and cheese.* — `bread`, `cheese` (comida)
- *I like the red car.* — `red`, `car` (juguetes)

**Ejercicio que mejor la enseña:** `translation` de frase completa, en ambos sentidos — *Traduce: «I like bread and cheese»*.
**Apoyo:** `I`, `like`, `my`, `the`, `and`.

### 4. `I don't like` — rechazo

- *I don't like soup.* — `soup` (comida)
- *I don't like rain.* — `rain` (clima)
- *I don't like cold water.* — `cold` (clima), `water` (comida)

**Ejercicio que mejor la enseña:** `multiple_choice` con dos opciones gemelas que solo difieren en la negación (*I like soup.* / *I don't like soup.*). Obliga a atender el `don't` en lugar de adivinar por contenido.
**Apoyo:** `don't` / `do not` como operador de negación.

### 5. `This is` — presentación

- *This is my mom.* — `mom` (familia)
- *This is a red ball.* — `red`, `ball`
- *This is my book.* — `book` (escuela)

**Ejercicio que mejor la enseña:** `sentence_builder` — *«This is my \_\_\_»*.
**Apoyo:** `this`, `is`, `a`, `my`.

### 6. `It is` — descripción y estado

- *It is red.* — `red` (colores)
- *It is a cat.* — `cat` (animales)
- *It is cold today.* — `cold` (clima)

**Ejercicio que mejor la enseña:** `sentence_builder` con un solo hueco — *«It is \_\_\_»*, con el adjetivo como respuesta. Es la transición natural desde el nivel 1.
**Apoyo:** `it`, `is`.

### 7. `I can` — habilidad

- *I can run.* — `run` (acciones)
- *I can jump.* — `jump` (acciones)
- *I can sing.* — `sing` (acciones)

**Ejercicio que mejor la enseña:** `sentence_builder` — *«I can \_\_\_»*.
**Apoyo:** `can`. El verbo base siempre viene de `acciones`; no hace falta vocabulario nuevo.

### 8. `I can't` — falta de habilidad

- *I can't swim.* — `swim` (acciones)
- *I can't jump.* — `jump`
- *I can't sleep.* — `sleep`

**Ejercicio que mejor la enseña:** `sentence_builder` — *«I can't \_\_\_»*, en espejo con la estructura 7. Se enseña justo después para que la diferencia sea solo el apóstrofo.
**Apoyo:** `can't` / `cannot` como negación de `can`.

### 9. `What is it?` — pregunta de identificación

- *What is it? — It is a duck.* — `duck` (animales)
- *What is it? — It is red.*
- *What is it? — It is my book.* — `book`

**Ejercicio que mejor la enseña:** `sentence_builder` para construir la pregunta y `multiple_choice` para la respuesta.
**Apoyo:** `what`.

### 10. `How are you?` — pregunta de estado

- *How are you? — I am happy, thank you!* — `happy`, `thank you`
- *How are you? — I am tired today.* — `tired` (emociones)
- *How are you? — I am sorry!* — `sorry` (saludos)

**Ejercicio que mejor la enseña:** `multiple_choice` con respuestas que difieren solo en el adjetivo de estado. Es además la estructura que abre el diálogo de lectura «Hello, Little Wizard».
**Apoyo:** `how`, `are`, `you`, `and`.

### 11. `There is a…` — presencia

- *There is a cat in the room.* — `cat`, `room` (casa)
- *There is a book on the table.* — `book`, `table` (casa)
- *There is a dog and a bird.* — `dog`, `bird` (animales)

**Ejercicio que mejor la enseña:** `sentence_builder` — *«There is a \_\_\_ in the room.»*
**Decisión de alcance:** solo singular (*There is*) en A1 inicial. El plural *There are* se deja fuera hasta que la Etapa 4 demuestre que el niño maneja el plural sistemáticamente.

### Estructuras de la Etapa 0 (no forman parte de esta biblioteca)

`My name is…` y `What's your name?` son estructuras de presentación personal, no de la Etapa 2. `Can I have…?` y `How are you?` sí se reutilizan aquí. Se listan en la Etapa 0 para que quede claro dónde se enseñan por primera vez.

---

## 7. Las 8 Lecturas Mágicas (Etapa 3)

**Nota de estado.** Los ocho textos ya están escritos e implementados en `src/data/readings.ts` (archivo presente en el árbol de trabajo, aún sin commitear). Los textos en inglés se reproducen aquí **textualmente**. Las preguntas, opciones y explicaciones se presentan en el registro neutro de este documento; la implementación actual usa un registro rioplatense más cercano al tono de la aplicación, y su alineación con este documento forma parte de la Fase C.

**Patrón común:** 3 a 6 oraciones, 1 a 3 párrafos, vocabulario del tema más palabras de alta frecuencia, tema de magia, exactamente 2 preguntas (una de recuerdo, una de inferencia).

### 1. The Magic Lunch Menu 🍎 — tema `comida` — nivel 1

*El menú de la cantina mágica de la escuela.*

> This is the menu of the magic canteen.
>
> We have bread, cheese, chicken, rice and soup.
>
> I eat cake and I drink milk. My friend eats a cookie and drinks water. Thank you!

**Pregunta 1.** ¿Qué bebe la amistad de la narradora?
Opciones: **A.** Agua · **B.** Leche · **C.** Jugo de uva
**Respuesta correcta: A. Agua**
**Explicación.** El texto dice «My friend eats a cookie and drinks water». *Water* es agua. La leche es lo que bebe la narradora, en «I drink milk».

**Pregunta 2.** ¿Qué partes tiene el menú?
Opciones: **A.** Solo el almuerzo · **B.** El almuerzo y el postre · **C.** El almuerzo y la merienda
**Respuesta correcta: B. El almuerzo y el postre**
**Explicación.** El texto presenta primero «We have bread, cheese, chicken, rice and soup», que es el almuerzo, y después el *cake*, que es el postre. El menú tiene dos partes.

### 2. The Wizard's Note 🏫 — tema `escuela` — nivel 1

*Una nota de la profesora en la clase de magia.*

> Hello, students! This is a note from your teacher.
>
> Put your book, your pencil and your eraser on the desk.
>
> The crayon and the paper are in your bag. Thank you!

**Pregunta 1.** ¿Dónde están el crayón y el papel?
Opciones: **A.** En la mochila · **B.** En el escritorio · **C.** En el libro
**Respuesta correcta: A. En la mochila**
**Explicación.** El texto dice «The crayon and the paper are in your bag». *Bag* es la mochila. El *desk* (escritorio) es para el libro, el lápiz y la goma.

**Pregunta 2.** La nota termina con «Thank you!». ¿Qué espera la profesora?
Opciones: **A.** Que guarden todo en su lugar · **B.** Que saquen el crayón para jugar · **C.** Que no usen el lápiz nunca
**Respuesta correcta: A. Que guarden todo en su lugar**
**Explicación.** La nota da instrucciones —colocar aquí, dejar allá— y termina con un agradecimiento. Espera que los estudiantes ordenen la clase y guarden sus cosas.

### 3. Luna's Toys 🧸 — tema `juguetes` — nivel 2

*Todos los juguetes de Luna y con cuál juega hoy.*

> My name is Luna and I have many toys.
>
> I have a ball, a doll, a robot and a train. My blocks are big and my puzzle is small.
>
> Today I play with the robot. My friend and I play with the ball. We do not play with the drum all day!

**Pregunta 1.** ¿Con qué juega Luna hoy?
Opciones: **A.** Con el robot · **B.** Con el tambor · **C.** Con el rompecabezas
**Respuesta correcta: A. Con el robot**
**Explicación.** El texto dice «Today I play with the robot». Luna tiene el tambor y el rompecabezas, pero hoy no juega con ellos.

**Pregunta 2.** Luna tiene muchos juguetes, pero hoy elige el robot. ¿Por qué?
Opciones: **A.** Porque el robot es su juguete favorito · **B.** Porque no tiene más juguetes · **C.** Porque está enojada con su amistad
**Respuesta correcta: A. Porque el robot es su juguete favorito**
**Explicación.** El texto dice que tiene muchos juguetes, así que no es que le falten. Escoge el robot una y otra vez, así que debe ser su favorito.

### 4. Birthday on the Magic Farm 🐾 — tema `animales` — nivel 2

*Un cumpleaños en la granja de los animales mágicos.*

> Today is my birthday! My friend and I go to the magic farm.
>
> I see a cow, a pig, a duck and a horse. The rabbit is very small.
>
> The bird sings and the frog jumps all day. I love the magic farm!

**Pregunta 1.** ¿Qué animal es muy pequeño en la granja?
Opciones: **A.** El conejo · **B.** La vaca · **C.** El caballo
**Respuesta correcta: A. El conejo**
**Explicación.** El texto dice «The rabbit is very small». *Small* significa pequeño, y el conejo es el único animal con esa descripción.

**Pregunta 2.** ¿Por qué el texto termina con «I love the magic farm»?
Opciones: **A.** Porque pasó su cumpleaños con sus amigos y muchos animales · **B.** Porque llovía todo ese día · **C.** Porque no tenía amigos
**Respuesta correcta: A. Porque pasó su cumpleaños con sus amigos y muchos animales**
**Explicación.** Es el día de su cumpleaños, fue con su amistad y vio muchos animales. Cuando algo nos gusta de verdad, decimos «I love it».

### 5. Tidy Your Magic Room 🏠 — tema `casa` — nivel 2

*Instrucciones para ordenar tu cuarto de magia.*

> Hello, little wizard! Your magic room is not clean today.
>
> Close the door and open the window. Put the lamp next to the bed.
>
> Now look in the mirror: the room is clean! Well done, little wizard.

**Pregunta 1.** ¿Dónde va la lámpara?
Opciones: **A.** Junto a la cama · **B.** En la cocina · **C.** En el baño
**Respuesta correcta: A. Junto a la cama**
**Explicación.** El texto dice «Put the lamp next to the bed». *Next to* significa «junto a», así que la lámpara va al lado de la cama.

**Pregunta 2.** El texto dice «look in the mirror: the room is clean». ¿Para qué se mira el espejo?
Opciones: **A.** Para ver si el cuarto quedó ordenado · **B.** Para ver qué hora es · **C.** Para buscar un tesoro escondido
**Respuesta correcta: A. Para ver si el cuarto quedó ordenado**
**Explicación.** Primero hay que cerrar la puerta, abrir la ventana y colocar la lámpara, y recién después se mira el espejo, para comprobar que el cuarto ya está limpio.

### 6. Hello, Little Wizard 👋 — tema `saludos` — nivel 1

*Un diálogo entre dos magos: saludos y despedidas.*

> — Hello, Luna! — Hello, Max!
>
> — How are you? — I am happy, thank you! And you?
>
> — I am tired today, sorry! — Goodbye! Bye!

**Pregunta 1.** ¿Cómo está Max?
Opciones: **A.** Cansado · **B.** Feliz · **C.** Enojado
**Respuesta correcta: A. Cansado**
**Explicación.** Max responde «I am tired today». *Tired* significa cansado. En la respuesta no dice que esté enojado ni feliz.

**Pregunta 2.** Luna dice «sorry» cuando Max está cansado. ¿Qué está pensando Luna?
Opciones: **A.** Que Max necesita descansar · **B.** Que Max se perdió en la escuela · **C.** Que Max no la conoce
**Respuesta correcta: A. Que Max necesita descansar**
**Explicación.** Luna pide disculpas y después se despide, porque Max dice que está cansado. Es una forma amable de preocuparse por él.

### 7. How Are You, Max? 😊 — tema `emociones` — nivel 2

*Max está triste… hasta que llega una llamada.*

> Max is not happy today. He is sad.
>
> He is hungry and very tired. He sleeps all day.
>
> Then Luna calls: «I am excited!» Max is happy again. He is not sad!

**Pregunta 1.** ¿Cómo se siente Max al principio de la historia?
Opciones: **A.** Triste y cansado · **B.** Feliz y emocionado · **C.** Enojado y asustado
**Respuesta correcta: A. Triste y cansado**
**Explicación.** El texto dice «He is sad» y después «He is hungry and very tired». Así que al principio está triste y cansado.

**Pregunta 2.** Al final Max está feliz. ¿Qué pasó?
Opciones: **A.** Luna lo llamó y lo puso de buen ánimo · **B.** Max durmió y se despertó peor · **C.** Max perdió a su perro
**Respuesta correcta: A. Luna lo llamó y lo puso de buen ánimo**
**Explicación.** Max está triste y cansado, pero cuando Luna llama y dice «I am excited», Max vuelve a estar feliz. La llamada lo ayudó.

### 8. Wash Your Hands 🧼 — tema `cuerpo` — nivel 1

*El cartel del baño mágico: lavarse las manos.*

> Hello, little wizard! Wash your hands.
>
> Open the tap. Put the soap on your hands and rub your fingers.
>
> Now rinse your hands. Do not touch your nose, your eyes or your ears!

**Pregunta 1.** ¿Qué hay que hacer después de poner el jabón?
Opciones: **A.** Frotar las manos y los dedos · **B.** Abrir la ventana · **C.** Mirar el espejo
**Respuesta correcta: A. Frotar las manos y los dedos**
**Explicación.** El texto dice «rub your fingers». Frotar (*rub*) las manos y los dedos es el paso que sigue al jabón.

**Pregunta 2.** El cartel dice «Do not touch your nose, your eyes or your ears!». ¿Por qué?
Opciones: **A.** Para no pasar enfermedades con las manos sucias · **B.** Porque la nariz pica siempre · **C.** Porque el espejo del baño está roto
**Respuesta correcta: A. Para no pasar enfermedades con las manos sucias**
**Explicación.** El cartel empieza con «Wash your hands» y al final avisa que no toques la cara. Lavarse las manos es justamente para no pasar enfermedades.

### 7.1 Vocabulario de apoyo: la capa de palabras función

**Este es el hallazgo más importante de la revisión de textos, y hay que resolverlo al inicio de la Fase B: sin esta capa, la biblioteca de estructuras no tiene con qué construir una sola oración, ni las lecturas de la Etapa 3 tienen dónde practicarse.**

El catálogo de 158 palabras contiene **solo palabras de contenido**: sustantivos, verbos y adjetivos temáticos. No contiene **ni un solo pronombre ni una sola palabra función**. No existen `I`, `my`, `you`, `he`, `she`, `it`, `we`, `they`, `the`, `is`, `are`, `not`, `and`, `to`, `this`, `how`, `what`.

Los ocho textos de arriba, sin embargo, son prosa real y la necesitan. Un texto de A1 no puede ser una lista de sustantivos: necesita una gramática. El desglose verificado de lo que los textos usan y el catálogo no tiene:

| Tipo | Lo que falta | Dónde aparece |
| --- | --- | --- |
| **Verbos nuevos** | `see`, `love`, `look`, `open`, `close`, `wash`, `touch`, `call`, `put`, `go` | *I see a cow* / *I love the farm* / *Close the door* / *Wash your hands* |
| **Inflexiones de verbos que ya existen** | tercera persona en `-s`: `sings`, `jumps`, `sleeps`, `eats`, `drinks`, `has`, `plays` | *The bird sings* / *He sleeps all day* |
| **Sustantivos de situación** | `menu`, `canteen`, `note`, `farm`, `birthday`, `toys`, `tap`, `soap`, `wizard` | títulos y primera línea de casi todos los textos |
| **Adjetivos de apoyo** | `clean`, `big`, `small` | *my blocks are big* / *the room is clean* |
| **Pronombres y palabras función** | `I`, `my`, `you`, `he`, `she`, `it`, `we`, `they`, `the`, `is`, `are`, `not`, `and`, `to`, `with`, `on`, `in`, `this`, `how`, `what`, `next to` | en **los ocho** textos |
| **Plurales** | `apples`, `hands`, `fingers`, `students` | *I like apples* / *rub your fingers* |
| **Nombres propios** | `Luna`, `Max` | Dos de las lecturas |

Esto no es un defecto de los textos: es un defecto del modelo de datos. Un curso necesita **dos capas**: la capa de contenido por temas (que ya existe y es buena) y una **capa de gramática y palabras función transversal**, que se enseña de forma explícita en la Etapa 2 y sostiene las lecturas de la Etapa 3.

**Decisión propuesta.** Crear una capa de apoyo —por ejemplo `src/data/grammar.ts`— con tres bloques: (a) palabras función con su categoría, (b) las 11 estructuras de la sección 6, y (c) las reglas mínimas de flexión que el niño necesita (`-s` de tercera persona, plural regular `-s`, artículo `a` / `the`). Esta capa **no se presenta como un tema más** del catálogo: se enseña de forma contextual, dentro de los ejercicios de oración de cada tema. Es la diferencia entre un catálogo de palabras y un curso, y es la pieza que hoy no existe.

Mientras esa capa no exista, los textos se pueden leer igual —la gramática se infiere del contexto, que es exactamente como se aprende— pero el niño no tiene dónde practicar esas palabras y la Fase B no puede construir oraciones reales. Por eso se construye allí, como requisito de entrada a la Fase B.

---

## 8. Rediseño del sistema de monedas y pistas (decisión tomada)

### Estado actual

| Pista | Contenido | Costo |
| --- | --- | --- |
| Pista 1 | Primera letra de la palabra en inglés | 0 monedas |
| Pista 2 | Transcripción fonética (IPA) | 1 moneda |
| Pista 3 | Traducción al español | 2 monedas |

Recompensas actuales que se conservan: **+1 moneda** por respuesta correcta, **+3** al subir de nivel, **+1** por respuesta correcta de lectura, **+2** de bono la primera vez que se completa una lectura.

### Nuevo diseño

| Elemento | Contenido | Costo |
| --- | --- | --- |
| Pista 1 | Primera letra de la palabra en inglés | **0 monedas** |
| Pista 2 | **Escuchar la palabra** (audio) | **1 moneda** |
| Pista 3 | **Ejemplo de uso / pista contextual** | **2 monedas** |
| Traducción | Significado en español | **gratis** (regla contextual «Help ≠ Answer»: nunca revela la respuesta antes de intentar) |
| Pronunciación escrita | IPA | **gratis, siempre disponible** |

### Por qué

**1. El diseño actual cobra por el recurso más útil y castiga a quien más necesita ayuda.** Para un niño hispanohablante que está decodificando una palabra nueva, la traducción no es un atajo: es **la llave**. Es la única vía por la cual puede pasar de «vi un símbolo desconocido» a «ah, eso significa perro» y entonces asimilar la forma inglesa. Hoy esa llave cuesta 2 monedas, la más cara de las tres, y el niño que más la necesita es exactamente el que tiene menos monedas.

**2. Cobrar por pedir ayuda contradice el principio pedagógico.** Si el niño tiene 0 monedas —una situación normal al empezar, y perfectamente posible si viene de una sesión difícil— no puede comprar la pista 2 ni la 3. Solo puede comprar la primera letra, que es la que menos le sirve: ya conoce la palabra, no sabe qué significa. El sistema comunica «si no te las arreglas solo, no hay salida», que es lo contrario de lo que queremos en un producto infantil.

**3. Inmersión de precios.** Con ~5 ejercicios por sesión y +1 por acierto, un niño activo gana alrededor de 5 monedas por sesión. Pagar 2 por una traducción es casi el 40 % de su ingreso diario convertido en un recurso que **le hace avanzar**. Y a partir de la Fase D esas mismas monedas compiten con los cosméticos: si la traducción es cara, las monedas se vuelven un impuesto sobre la incertidumbre en lugar de una recompensa por el dominio.

**4. optics ante la familia.** Este es un producto para niños de 6 a 10 años, y el comprador es un padre. Que un niño de 7 años no pueda preguntar «¿cómo se dice esto?» sin perder monedas es indefendible en una conversación familiar, por mucho que la moneda no sea dinero real. La decisión tiene que ser fácil de explicar: **la ayuda es gratis**.

**5. Qué ocupa el lugar de la traducción paga.** La pista 3 pasa a ser un **ejemplo de uso contextual**: *«This is a \_\_\_. The cat is black.»* Exige razonar, no solo traducir, y por eso vale monedas. Es pedagógicamente más valiosa que la traducción y, al mismo tiempo, no se puede usar como atajo para terminar el ejercicio.

**6. Por qué la pronunciación escrita también queda gratis.** El IPA ya está visible en la tarjeta de estudio de cada palabra. Ocultarlo detrás de monedas es inconsistente con el resto del diseño. Además, leer `/kæt/` y **oír** *cat* son habilidades distintas: la primera es decodificar, la segunda se acerca a producir el sonido. Por eso el IPA es un recurso libre y la pista 2 de pago es el audio. Esa distinción es deliberada, y es también la razón por la que la pista 2 no es trivial.

**7. La función `getHint()` cambia de forma.** Hoy devuelve `{ text, cost }`. La pista 2 necesita **disparar audio**, no mostrar texto, así que el tipo de pista necesita distinguir entre texto, audio y contexto. Es un cambio de contrato pequeño, no una refactorización.

**8. Qué pasa si una palabra no tiene ejemplo.** Con 158 palabras, es probable que al principio falten ejemplos. La regla de degradación: si la palabra no tiene ejemplo curado, la pista 3 cae automáticamente a la pista con IPA. Nunca se muestra una pista vacía ni se cobra por nada.

**9. Help ≠ Answer (principio rector de la ayuda).** Toda pista gratuita debe ayudar al alumno a comprender o continuar el ejercicio **sin revelar directamente la respuesta correcta**. Las ayudas que revelan la respuesta completa se consideran *answer reveal* y se reservan para después de un intento o para una mecánica explícitamente definida. La traducción no se bloquea globalmente — en Study mostrar *cat → gato* está perfecto, ahí no se está respondiendo un ejercicio — la regla es contextual:

| Contexto | Traducción |
| --- | --- |
| 📚 Study | 🆓 Sí |
| 🧩 Ejercicio, antes de intentar | ❌ No si revela la respuesta (`multiple_choice` y `translation`) |
| 🧩 Ejercicio, ayuda semántica | 🆓 Sí (audio del ejercicio, imagen, contexto) |
| 🧩 Ejercicio, después de intentar | 🆓 o 🪙 según la ayuda |
| 📖 Reading | 🆓 ayuda de vocabulario, sin revelar respuestas de comprensión |

Las monedas **nunca son requisito para la ayuda fundamental**: lo que cuesta es la pista que prácticamente resuelve el ejercicio (audio y ejemplo contextual).

**10. Reglas de desbloqueo: un solo pago por ayuda.** Comprar una pista la desbloquea para todo el ejercicio, sin cobros repetidos. Pista 2 — Audio (1 moneda): al desbloquearla, el audio se reproduce automáticamente una vez y queda disponible un botón de repetición sin costo adicional durante ese ejercicio. Pista 3 — Ejemplo contextual (2 monedas): se muestra una vez y queda visible, sin volver a cobrar.

### Nota de implementación

Ya existe una vía para el ejemplo de la pista 3: el endpoint `/api/translate` devuelve `example` (frase en inglés) y `exampleTranslation`. Funciona, pero **requiere IA, tiene límite de peticiones y ya maneja el caso 429**, así que no puede ser la fuente primaria de una pista que debe funcionar siempre. La estrategia correcta es la inversa: **ejemplo curado en el catálogo como fuente primaria, `/api/translate` como enriquecimiento opcional** cuando la IA esté disponible.

---

## 9. Sistema futuro — Magic Wardrobe 🧙 (documentar, NO implementar)

La segunda capa de gamificación, para una fase posterior. No se escribe código en este documento; se define la intención y las reglas para que las decisiones de economía se puedan tomar con tiempo.

**Avatares completos** comprables con monedas: mago, hechicera, caballero, exploradora, hechicera ancestral. Son identidades completas que el niño elige.

**Piezas personalizables**, cada una con su precio en monedas: cabeza y cabello, cara, sombrero, capa, ropa, accesorios, y más adelante una mascota. El niño compone su personaje pieza por pieza.

**Recompensas por logro, no comprables.** Estas piezas se ganan, no se venden, y por eso valen más que cualquier compra:

| Logro | Recompensa |
| --- | --- |
| Completar la primera unidad | Túnica |
| Racha de 7 días | Sombrero |
| Completar 5 lecturas | Mascota |
| Terminar A1 | Avatar legendario |

**Advertencia técnica sobre la racha de 7 días.** El campo `bestStreak` que existe en el estado de juego es la racha de **respuestas correctas**, no de días. No se puede reutilizar para este logro: sería un error de modelo. Hace falta un concepto nuevo de racha de calendario, que se apoyaría en el campo `lastSessionDate` que ya existe. El contador de «5 lecturas» sí está disponible directamente en `completedReadings`.

**Reglas de la economía.** Los cosméticos viven **únicamente dentro de la economía del juego**. Sin dinero real, sin compras con tarjeta, sin pay-to-win, sin venta de cosméticos con desventaja para quien no paga. Es un producto infantil: la economía es una herramienta de motivación, no un modelo de negocio de desbloqueos.

**La progresión emocional que buscamos.** *Aprendí 20 palabras → gané monedas → compré mi sombrero mágico.* Ese es el circuito completo del producto, y solo funciona si la etapa de aprender palabras está bien construida. La economía cosmética amplifica un buen currículo; no lo arregla.

---

## 10. Roadmap de implementación (fases, sin tocar código ahora)

Ninguna de estas fases tiene fecha ni estimación. El orden es de dependencia, no de urgencia.

### Prerrequisito — Estrategia mínima de pruebas (antes de Fase A/B)

Antes de tocar la lógica existente, el proyecto necesita una red mínima de pruebas. La regla es simple: **toda modificación de lógica empieza con su test**. No se convierte la aplicación en una nave espacial de testing; se cubre exactamente lo que cada fase va a tocar, ni más ni menos.

**Alcance mínimo (lógica pura, sin interfaz):**

| Área | Qué se cubre | Archivo |
| --- | --- | --- |
| Selección adaptativa | reparto 60/30/10 y umbral de brecha del 65 % | `src/lib/adaptive.ts` |
| Economía y pistas | +1 por acierto, +3 por nivel, costos de pista, regla de degradación de la pista 3 | `src/lib/gamification.ts` |
| Logros | umbrales y criterios de los 9 badges | `src/lib/badges.ts` |
| Progreso | normalización backward-compatible de localStorage antiguo | `src/types/progress.ts` |
| Generadores de ejercicio | los 4 tipos y sus plantillas | `src/lib/exercises.ts` |
| Lectura Mágica | `recordReadingResult`, bono único la primera vez, relectura sin bono | `src/lib/gamification.ts` |
| Respuestas | el normalizador que se agregará en la Fase B (mayúsculas, puntuación, crédito parcial) | nuevo |

**Framework sugerido: Vitest** — cero configuración con TypeScript y estándar en el ecosistema Next. Pruebas de unidad sobre lógica pura; **no se incluyen pruebas de interfaz ni e2e en este prerrequisito** (solo se agregan más adelante si una fase lo justifica). Regla de compromiso: no se escribe ni una línea de lógica nueva ni se modifica una existente sin que el test de esa zona exista y pase. Estos tests se crean y se verifican en una pasada inicial, antes de ejecutar la Fase A.

### Fase A — Orden de temas y pistas · *lista para implementar pronto*

1. **Reordenar los temas** con `saludos` en la posición 1 y el orden de la sección 4. El campo `order` ya existe; hoy la lista se dibuja en orden de arreglo y `getTopicByOrder()` no se usa. Como el progreso se indexa por *slug*, **no hay migración de datos**: el progreso de un niño que ya empezó con *animales* se conserva y aparece en su nueva posición.
2. **Agregar `hi` y `name`** al tema `saludos` y las estructuras `My name is…` / `What's your name?`, sin las cuales la Etapa 0 no tiene contenido suficiente.
3. **Rediseñar las pistas**: traducción e IPA gratuitos, con la traducción sujeta a la regla contextual «Help ≠ Answer» de la sección 8 (no se muestra en `multiple_choice` ni `translation` hasta después de un intento; en Study, `listening` y `sentence_builder` está desde el arranque); pista 2 pasa a ser audio (reproducción automática al comprar + botón de repetición gratis); pista 3 pasa a ser ejemplo contextual (queda visible sin volver a cobrar). Actualizar el contrato de `getHint()` para distinguir texto, audio y contexto, y agregar la regla de degradación cuando falte el ejemplo.
4. **Verificar que los criterios de los logros siguen funcionando.** Los nueve logros referencian temas por *slug* (`animales`, `colores`, `numeros`, `casa`); como los identificadores no cambian, ninguno se rompe.

*Nota:* este proyecto usa Next.js 16 y React 19, cuyas APIs pueden diferir de versiones anteriores. Quien implemente debe leer la documentación en `node_modules/next/dist/docs/` antes de escribir código.

### Fase B — Estructuras de la Etapa 2 · *lista para implementar pronto*

**Requisito de entrada — la capa de palabras función (sección 7.1).** Sin pronombres ni palabras función no hay oración posible: *I have a cat* no existe sin `I`, `have`, `a`. Esta capa se construye aquí, al inicio de la Fase B, como requisito duro. No se presenta como un tema del catálogo: se enseña de forma contextual dentro de los ejercicios de oración de cada tema, y sostiene tanto la biblioteca de estructuras de esta fase como las lecturas de la Etapa 3. El prerrequisito de pruebas de más abajo se ejecuta antes de tocar esta lógica.

1. **Crear la biblioteca de estructuras** con las 11 estructuras de la sección 6: forma, significado, ejemplos verificados, y qué tipo de ejercicio la enseña.
2. **Agregar un ejemplo curado por palabra**, necesario para la pista 3 de la Fase A. Es la tarea de contenido más grande del proyecto: 158 ejemplos. Empezar por las palabras de dificultad 1 y avanzar por dificultad.
3. **Hacer que el nivel determine la tarea**, no solo el grupo de palabras, según la tabla de la sección 5.
4. **Reconstruir el constructor de oraciones.** Hoy es una plantilla fija («I see a \_\_\_»). Para una oración completa, la recomendación es una interfaz de **fichas de palabras** en lugar de escribir a mano: el niño de 6 a 10 años no debe teclear oraciones, no debe ser penalizado por la ortografía y la ficha enseña el orden de las palabras, que es justo lo que se quiere evaluar. El proyecto no tiene hoy ninguna librería de arrastre y no la necesita: basta con tocar fichas y devolverlas a su lugar.
5. **Agregar un normalizador de respuestas.** La comparación actual es de cadena exacta (`answer.trim().toLowerCase() === correct_answer.toLowerCase()`). Contra una oración completa eso es demasiado severo: un punto final, un espacio de más o una mayúscula constituyen un error para un niño. El normalizador debe recortar, colapsar espacios, quitar el punto final y normalizar mayúsculas. Idealmente, puntuar por palabras para dar crédito parcial.
6. **Conectar el motor adaptativo al nivel**: 60/30/10 elige qué palabras del nivel actual practicar, no en qué nivel estar.

### Fase C — Lectura Mágica · *lista para implementar pronto*

El grueso ya está construido. El trabajo que queda es de integración y pulido:

1. **Consolidar y commitear** `src/data/readings.ts` junto con el flujo de lectura, que hoy existe en el árbol de trabajo sin commitear.
2. **Unificar el mapa de lectura con el orden de los temas** para que las lecturas aparezcan en la secuencia del curso y no solo dentro de su tema.
3. **Revisar el registro de español** de las preguntas y explicaciones para alinearlas con el texto maestro de la sección 7.
4. **Verificar el comportamiento de relectura** que ya está implementado: releer da las monedas por respuesta correcta pero no repite el bono, para que practicar no sea una forma de acumular.
5. **Monedas de lectura**: confirmar que el ritmo actual (+1 por acierto, +2 de bono la primera vez) sigue siendo sano con la traducción ahora gratis, dado que el niño gana más recursos y las pistas de pago son más caras de lo que eran.

### Fase D — Magic Wardrobe · *futuro*

Economía cosmética completa, según la sección 9. Requiere antes: la racha de calendario nueva, un registro de piezas compradas y equipadas, y la decisión de qué se compra con monedas y qué se gana con logros. No depende de las fases anteriores para ser diseñada, sí para tener sentido.

### Fase E — Tutor de inteligencia artificial opcional · *futuro*

Las costuras ya existen: `/api/translate` con Groq (`llama-3.1-8b-instant`), `lib/groq.ts`, caché, manejo de límite 429, y `generateAIExercise()` —que hoy está escrito pero **nadie llama**. El tutor debe seguir siendo **opcional**: todo el contenido y todos los ejercicios funcionan sin IA mediante las plantillas, y eso no cambia. Su lugar natural es la Etapa 4, donde la cantidad de combinaciones posibles de tema más estructura es grande y la plantilla se queda corta. Igual puede usarse como enriquecimiento de la pista 3 cuando haya red.

---

## Qué NO hacemos todavía

- **No escribimos código hasta que este documento esté aprobado.** Ni una línea, ni un componente, ni un cambio de contenido. Este documento es el acuerdo; la implementación viene después.
- **No agregamos funcionalidades de juego nuevas.** La decisión estratégica es firme: no más mecánicas, convertir lo existente en un curso. La economía cosmética de la Fase D espera, y las etapas de lectura y de oraciones tienen prioridad sobre cualquier novedad.
- **No creamos cuentas de usuario ni back-end de progreso.** El progreso vive en `localStorage` y eso es correcto para la etapa actual.
- **No ampliamos el catálogo de vocabulario.** 158 palabras bien usadas valen más que 400 palabras mal usadas. Antes de agregar una palabra hay que preguntarse qué estructura o qué lectura la necesita.
- **No usamos dinero real ni pay-to-win.** Jamás. Es un producto infantil.
- **No prometemos un tutor de IA antes de que las etapas 1 a 3 estén sólidas.** La IA es un acelerador opcional, nunca la base del aprendizaje.
- **No tocamos la lógica adaptativa ni los umbrales** (65 % de brecha, 80 % de ascenso, 80 % de dominio para un logro). Funcionan y están verificados; cambiarlos ahora sería cambiar la variable de control del sistema junto con la variable medida.
- **No unificamos el registro de la copia sin una decisión del propietario.** La interfaz está escrita en voseo rioplatense —*Traducí*, *Completá*, *Tocá*, *Elegí*— mientras que el mercado objetivo es todoophones de Latinoamérica, según el propio encabezado de `src/data/vocabulary.ts`. El voseo se entiende en casi toda la región, pero la forma neutra con *tú* es la dominante en México, Colombia y Perú. No es un problema de corrección sino de alcance comercial, y por eso es una decisión del propietario, no una corrección silenciosa. Queda planteada junto con la Fase C, que es donde más texto nuevo se va a escribir.

**Siguiente paso:** revisión y aprobación de este documento por el propietario del producto. Con la aprobación, el prerrequisito de pruebas y la Fase A quedan habilitados para implementación.

---

### Anexo — Archivos de referencia

Estos son los archivos que un ingeniero necesita leer para implementar este documento. Ninguno se modifica al escribir el documento.

| Archivo | Qué aporta |
| --- | --- |
| `src/data/vocabulary.ts` | 14 temas, 158 palabras con español, IPA y dificultad. Fuente de verdad del contenido. |
| `src/data/readings.ts` | Las 8 lecturas ya escritas, con preguntas y explicaciones. |
| `src/types/progress.ts` | Modelo de progreso: nivel 1-5, dominio por palabra, estadísticas por tipo, estado de juego. |
| `src/types/exercises.ts` | Los 4 tipos de ejercicio y el contrato `Exercise`. |
| `src/lib/adaptive.ts` | Selección 60/30/10 y umbral de brecha del 65 %. |
| `src/lib/gamification.ts` | Monedas, pistas graduadas, recompensas, registro de lecturas. |
| `src/lib/exercises.ts` | Generadores de plantilla y el camino de IA no utilizado. |
| `src/lib/badges.ts` | Los 9 logros y sus criterios. |
| `src/app/clases/[slug]/page.tsx` | Flujo estudiar → practicar → leer → resultado, pistas, subida de nivel. |
| `src/app/clases/page.tsx` | Lista de temas en orden de arreglo. Lugar del cambio de orden. |
| `src/app/dashboard/page.tsx` | Tablero de competencias: vocabulario, escucha, construcción. |
| `src/app/api/translate/route.ts` | Integración con Groq para el tutor opcional y la pista 3. |
