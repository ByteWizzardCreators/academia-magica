// Academia Mágica — Lectura Mágica (Magic Reading)
// Short A1-level English texts for kids 6-10 (British Council level-1 style:
// authentic everyday texts — menus, notes, instructions, dialogues).
// Rules followed by every text here:
// - 3-6 short sentences, split into 1-3 paragraphs
// - topic vocabulary (see src/data/vocabulary.ts) + high-frequency words only
// - exactly 2 comprehension questions: one recall, one inference
// - kid-magic theme, no magic-less text
// Questions and explanations are in Rioplatense Spanish, matching the app tone.

export interface ReadingQuestion {
  /** Kid-friendly Spanish question. */
  question: string;
  /** 2-3 answer options. The correct one is spelled exactly as in correctAnswer. */
  options: string[];
  /** Exact text of the correct option. */
  correctAnswer: string;
  /** Spanish explanation shown after answering. */
  explanation: string;
}

export interface Reading {
  /** Slug, also used as the completion key in GameState.completedReadings. */
  id: string;
  topicId: string;
  /** English title. */
  title: string;
  icon: string;
  level: 1 | 2 | 3 | 4 | 5;
  /** Short English sentences, 3-6 in total across all paragraphs. */
  paragraphs: string[];
  /** Topic words used in the text (lemma form when the text uses a plural). */
  vocab: string[];
  /** Exactly 2 questions: recall + inference. */
  questions: ReadingQuestion[];
  /** Optional one-line Spanish teaser for the reading picker card. */
  hint?: string;
}

export const READINGS: Reading[] = [
  // ─── 1. Comida ───
  {
    id: "magic-lunch-menu",
    topicId: "comida",
    title: "The Magic Lunch Menu",
    icon: "🍎",
    level: 1,
    hint: "El menú de la cantina mágica de la escuela",
    paragraphs: [
      "This is the menu of the magic canteen.",
      "We have bread, cheese, chicken, rice and soup.",
      "I eat cake and I drink milk. My friend eats a cookie and drinks water. Thank you!",
    ],
    vocab: ["bread", "cheese", "chicken", "rice", "soup", "cake", "milk", "cookie", "water"],
    questions: [
      {
        question: "¿Qué toma la amistad de la narradora?",
        options: ["Agua", "Leche", "Jugo de uva"],
        correctAnswer: "Agua",
        explanation:
          "El texto dice “My friend eats a cookie and drinks water”. Water es agua, y la leche es lo que toma la narradora.",
      },
      {
        question: "¿Qué partes tiene el menú?",
        options: [
          "Solo el almuerzo",
          "El almuerzo y el postre",
          "El almuerzo y la merienda",
        ],
        correctAnswer: "El almuerzo y el postre",
        explanation:
          "El texto presenta primero “We have bread, cheese, chicken, rice and soup” (el almuerzo) y después el cake (el postre). El menú tiene dos partes.",
      },
    ],
  },

  // ─── 2. Escuela ───
  {
    id: "wizards-note",
    topicId: "escuela",
    title: "The Wizard's Note",
    icon: "🏫",
    level: 1,
    hint: "Una nota de la profesora en la clase de magia",
    paragraphs: [
      "Hello, students! This is a note from your teacher.",
      "Put your book, your pencil and your eraser on the desk.",
      "The crayon and the paper are in your bag. Thank you!",
    ],
    vocab: ["teacher", "student", "book", "pencil", "eraser", "desk", "crayon", "paper", "bag"],
    questions: [
      {
        question: "¿Dónde están el crayón y el papel?",
        options: ["En la mochila", "En el escritorio", "En el libro"],
        correctAnswer: "En la mochila",
        explanation:
          "El texto dice “The crayon and the paper are in your bag”. Bag es la mochila, y el desk (escritorio) es para el libro, el lápiz y la goma.",
      },
      {
        question: "La profesora termina la nota con “Thank you!”. ¿Qué espera de los estudiantes?",
        options: [
          "Que guarden todo en el lugar correcto",
          "Que saquen el crayón para jugar",
          "Que no usen el lápiz nunca",
        ],
        correctAnswer: "Que guarden todo en el lugar correcto",
        explanation:
          "La nota da instrucciones (“poné acá, dejá allá”) y termina agradecer. Espera que los estudiantes ordenen la clase y guarden sus cosas.",
      },
    ],
  },

  // ─── 3. Juguetes ───
  {
    id: "lunas-toys",
    topicId: "juguetes",
    title: "Luna's Toys",
    icon: "🧸",
    level: 2,
    hint: "Todos los juguetes de Luna y a cuál juega hoy",
    paragraphs: [
      "My name is Luna and I have many toys.",
      "I have a ball, a doll, a robot and a train. My blocks are big and my puzzle is small.",
      "Today I play with the robot. My friend and I play with the ball. We do not play with the drum all day!",
    ],
    vocab: ["ball", "doll", "robot", "train", "blocks", "puzzle", "drum"],
    questions: [
      {
        question: "¿Con qué juega Luna hoy?",
        options: ["Con el robot", "Con el tambor", "Con el rompecabezas"],
        correctAnswer: "Con el robot",
        explanation:
          "El texto dice “Today I play with the robot”. El tambor y el rompecabezas los tiene, pero hoy no juega con ellos.",
      },
      {
        question:
          "Luna tiene muchos juguetes, pero hoy elige el robot. ¿Por qué pensás que pasa eso?",
        options: [
          "Porque el robot es su juguete favorito",
          "Porque no tiene más juguetes",
          "Porque está enojada con su amistad",
        ],
        correctAnswer: "Porque el robot es su juguete favorito",
        explanation:
          "El texto dice que tiene muchos juguetes, así que no es que le falten. Escoge el robot una y otra vez, así que debe ser su favorito.",
      },
    ],
  },

  // ─── 4. Animales ───
  {
    id: "birthday-magic-farm",
    topicId: "animales",
    title: "Birthday on the Magic Farm",
    icon: "🐾",
    level: 2,
    hint: "Un cumpleaños en la granja de los animales mágicos",
    paragraphs: [
      "Today is my birthday! My friend and I go to the magic farm.",
      "I see a cow, a pig, a duck and a horse. The rabbit is very small.",
      "The bird sings and the frog jumps all day. I love the magic farm!",
    ],
    vocab: ["cow", "pig", "duck", "horse", "rabbit", "bird", "frog"],
    questions: [
      {
        question: "¿Qué animal es muy chiquito en la granja?",
        options: ["El conejo", "La vaca", "El caballo"],
        correctAnswer: "El conejo",
        explanation:
          "El texto dice “The rabbit is very small”. Small significa chiquito, y el conejo es el único animal con esa descripción.",
      },
      {
        question: "¿Por qué el texto termina con “I love the magic farm”?",
        options: [
          "Porque pasó su cumpleaños con sus amigos y muchos animales",
          "Porque llovía todo ese día",
          "Porque no tenía amigos",
        ],
        correctAnswer: "Porque pasó su cumpleaños con sus amigos y muchos animales",
        explanation:
          "Es el día de su cumpleaños, fue con su amistad y vio muchos animales. Cuando algo nos gusta de verdad, decimos “I love it”.",
      },
    ],
  },

  // ─── 5. Casa ───
  {
    id: "tidy-magic-room",
    topicId: "casa",
    title: "Tidy Your Magic Room",
    icon: "🏠",
    level: 2,
    hint: "Instrucciones para ordenar tu cuarto de magia",
    paragraphs: [
      "Hello, little wizard! Your magic room is not clean today.",
      "Close the door and open the window. Put the lamp next to the bed.",
      "Now look in the mirror: the room is clean! Well done, little wizard.",
    ],
    vocab: ["room", "door", "window", "lamp", "bed", "mirror"],
    questions: [
      {
        question: "¿Dónde va la lámpara?",
        options: ["Junto a la cama", "En la cocina", "En el baño"],
        correctAnswer: "Junto a la cama",
        explanation:
          "El texto dice “Put the lamp next to the bed”. Next to significa “junto a”, así que la lámpara va al lado de la cama.",
      },
      {
        question: "El texto dice “look in the mirror: the room is clean”. ¿Para qué se mira al espejo?",
        options: [
          "Para ver si la habitación quedó ordenada",
          "Para ver qué hora es",
          "Para buscar un tesoro escondido",
        ],
        correctAnswer: "Para ver si la habitación quedó ordenada",
        explanation:
          "Primero hay que cerrar la puerta, abrir la ventana y poner la lámpara, y recién después se mira al espejo, para ver que la habitación ya está limpia.",
      },
    ],
  },

  // ─── 6. Saludos ───
  {
    id: "hello-little-wizard",
    topicId: "saludos",
    title: "Hello, Little Wizard",
    icon: "👋",
    level: 1,
    hint: "Un diálogo entre dos magos: saludos y despedidas",
    paragraphs: [
      "— Hello, Luna! — Hello, Max!",
      "— How are you? — I am happy, thank you! And you?",
      "— I am tired today, sorry! — Goodbye! Bye!",
    ],
    vocab: ["hello", "thank you", "sorry", "goodbye"],
    questions: [
      {
        question: "¿Cómo está Max?",
        options: ["Cansado", "Feliz", "Enojado"],
        correctAnswer: "Cansado",
        explanation:
          "Max responde “I am tired today”. Tired significa cansado, y en la respuesta no dice que esté enojado ni feliz.",
      },
      {
        question: "Luna dice “sorry” cuando Max está cansado. ¿Qué está pensando Luna?",
        options: [
          "Que Max necesita descansar",
          "Que Max se perdió en la escuela",
          "Que Max no la conoce",
        ],
        correctAnswer: "Que Max necesita descansar",
        explanation:
          "Luna pide disculpas y después se despide, porque Max dice que está cansado. Es una forma amable de preocuparse por él.",
      },
    ],
  },

  // ─── 7. Emociones ───
  {
    id: "how-are-you-max",
    topicId: "emociones",
    title: "How Are You, Max?",
    icon: "😊",
    level: 2,
    hint: "Max está triste… hasta que llega una llamada",
    paragraphs: [
      "Max is not happy today. He is sad.",
      "He is hungry and very tired. He sleeps all day.",
      "Then Luna calls: “I am excited!” Max is happy again. He is not sad!",
    ],
    vocab: ["happy", "sad", "hungry", "tired", "excited"],
    questions: [
      {
        question: "¿Cómo se siente Max al principio de la historia?",
        options: ["Triste y cansado", "Feliz y emocionado", "Enojado y asustado"],
        correctAnswer: "Triste y cansado",
        explanation:
          "El texto dice “He is sad” y después “He is hungry and very tired”. Así que al principio está triste y cansado.",
      },
      {
        question: "Al final Max está happy. ¿Qué pasó?",
        options: [
          "Luna lo llamó y lo puso de buen ánimo",
          "Max durmió y se despertó peor",
          "Max perdió a su perro",
        ],
        correctAnswer: "Luna lo llamó y lo puso de buen ánimo",
        explanation:
          "Max está sad y tired, pero cuando Luna llama y dice “I am excited”, Max vuelve a estar happy. La llamada de Luna lo ayudó.",
      },
    ],
  },

  // ─── 8. Cuerpo ───
  {
    id: "wash-your-hands",
    topicId: "cuerpo",
    title: "Wash Your Hands",
    icon: "🧼",
    level: 1,
    hint: "El cartel del baño mágico: lavarse las manos",
    paragraphs: [
      "Hello, little wizard! Wash your hands.",
      "Open the tap. Put the soap on your hands and rub your fingers.",
      "Now rinse your hands. Do not touch your nose, your eyes or your ears!",
    ],
    vocab: ["hand", "finger", "nose", "eye", "ear"],
    questions: [
      {
        question: "¿Qué hay que hacer después de poner el jabón?",
        options: ["Frotar las manos y los dedos", "Abrir la ventana", "Mirar el espejo"],
        correctAnswer: "Frotar las manos y los dedos",
        explanation:
          "El texto dice “rub your fingers”. Frotar (rub) las manos y los dedos es el paso después del jabón.",
      },
      {
        question: "El cartel dice “Do not touch your nose, your eyes or your ears!”. ¿Por qué?",
        options: [
          "Para no pasar enfermedades con las manos sucias",
          "Porque la nariz pica siempre",
          "Porque el espejo del baño está roto",
        ],
        correctAnswer: "Para no pasar enfermedades con las manos sucias",
        explanation:
          "El cartel empieza con “Wash your hands” y al final avisa que no toques la cara. Lavarse las manos es justamente para no pasar enfermedades.",
      },
    ],
  },
];

// ─── Helpers ───

/** All readings, in curriculum order. */
export function getAllReadings(): Reading[] {
  return READINGS;
}

/** Readings available for a topic (empty array when the topic has none). */
export function getReadingsByTopic(topicId: string): Reading[] {
  return READINGS.filter((r) => r.topicId === topicId);
}

/** Total number of readings in the whole app. */
export const TOTAL_READINGS = READINGS.length;
