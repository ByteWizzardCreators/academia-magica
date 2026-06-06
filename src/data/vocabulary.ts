// Academia Mágica — Curated Vocabulary
// Source of truth for all topic vocabulary. Version-controlled, typed, no DB dependency.
// Every word is hand-curated for kids 6-10 learning English from Spanish (LATAM).

export interface VocabWord {
  english: string;
  spanish: string;
  ipa: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface TopicData {
  id: string; // slug
  name: string;
  icon: string;
  description: string;
  order: number;
  words: VocabWord[];
}

export const TOPICS: TopicData[] = [
  {
    id: "animales",
    name: "Animales",
    icon: "🐾",
    description: "Perros, gatos, pájaros y más — los animales más divertidos en inglés",
    order: 1,
    words: [
      { english: "dog", spanish: "perro", ipa: "/dɒɡ/", difficulty: 1 },
      { english: "cat", spanish: "gato", ipa: "/kæt/", difficulty: 1 },
      { english: "bird", spanish: "pájaro", ipa: "/bɜːrd/", difficulty: 1 },
      { english: "fish", spanish: "pez", ipa: "/fɪʃ/", difficulty: 1 },
      { english: "rabbit", spanish: "conejo", ipa: "/ˈræbɪt/", difficulty: 1 },
      { english: "horse", spanish: "caballo", ipa: "/hɔːrs/", difficulty: 2 },
      { english: "cow", spanish: "vaca", ipa: "/kaʊ/", difficulty: 2 },
      { english: "pig", spanish: "cerdo", ipa: "/pɪɡ/", difficulty: 2 },
      { english: "duck", spanish: "pato", ipa: "/dʌk/", difficulty: 2 },
      { english: "frog", spanish: "rana", ipa: "/frɒɡ/", difficulty: 2 },
      { english: "lion", spanish: "león", ipa: "/ˈlaɪən/", difficulty: 3 },
      { english: "elephant", spanish: "elefante", ipa: "/ˈɛlɪfənt/", difficulty: 3 },
      { english: "monkey", spanish: "mono", ipa: "/ˈmʌŋki/", difficulty: 2 },
      { english: "turtle", spanish: "tortuga", ipa: "/ˈtɜːrtl/", difficulty: 3 },
      { english: "bear", spanish: "oso", ipa: "/bɛər/", difficulty: 3 },
    ],
  },
  {
    id: "colores",
    name: "Colores",
    icon: "🎨",
    description: "Los colores del arcoíris y cómo se dicen en inglés",
    order: 2,
    words: [
      { english: "red", spanish: "rojo", ipa: "/rɛd/", difficulty: 1 },
      { english: "blue", spanish: "azul", ipa: "/bluː/", difficulty: 1 },
      { english: "green", spanish: "verde", ipa: "/ɡriːn/", difficulty: 1 },
      { english: "yellow", spanish: "amarillo", ipa: "/ˈjɛloʊ/", difficulty: 1 },
      { english: "purple", spanish: "morado", ipa: "/ˈpɜːrpl/", difficulty: 2 },
      { english: "pink", spanish: "rosado", ipa: "/pɪŋk/", difficulty: 1 },
      { english: "orange", spanish: "naranja", ipa: "/ˈɒrɪndʒ/", difficulty: 1 },
      { english: "white", spanish: "blanco", ipa: "/waɪt/", difficulty: 1 },
      { english: "black", spanish: "negro", ipa: "/blæk/", difficulty: 1 },
      { english: "brown", spanish: "marrón", ipa: "/braʊn/", difficulty: 2 },
      { english: "gray", spanish: "gris", ipa: "/ɡreɪ/", difficulty: 2 },
      { english: "gold", spanish: "dorado", ipa: "/ɡoʊld/", difficulty: 2 },
    ],
  },
  {
    id: "numeros",
    name: "Números",
    icon: "🔢",
    description: "Contá del 1 al 20 y aprendé los números en inglés",
    order: 3,
    words: [
      { english: "one", spanish: "uno", ipa: "/wʌn/", difficulty: 1 },
      { english: "two", spanish: "dos", ipa: "/tuː/", difficulty: 1 },
      { english: "three", spanish: "tres", ipa: "/θriː/", difficulty: 1 },
      { english: "four", spanish: "cuatro", ipa: "/fɔːr/", difficulty: 1 },
      { english: "five", spanish: "cinco", ipa: "/faɪv/", difficulty: 1 },
      { english: "six", spanish: "seis", ipa: "/sɪks/", difficulty: 1 },
      { english: "seven", spanish: "siete", ipa: "/ˈsɛvən/", difficulty: 1 },
      { english: "eight", spanish: "ocho", ipa: "/eɪt/", difficulty: 1 },
      { english: "nine", spanish: "nueve", ipa: "/naɪn/", difficulty: 1 },
      { english: "ten", spanish: "diez", ipa: "/tɛn/", difficulty: 1 },
      { english: "eleven", spanish: "once", ipa: "/ɪˈlɛvən/", difficulty: 2 },
      { english: "twelve", spanish: "doce", ipa: "/twɛlv/", difficulty: 2 },
      { english: "twenty", spanish: "veinte", ipa: "/ˈtwɛnti/", difficulty: 2 },
    ],
  },
  {
    id: "comida",
    name: "Comida",
    icon: "🍎",
    description: "Frutas, comidas y bebidas — todo lo que te gusta comer",
    order: 4,
    words: [
      { english: "apple", spanish: "manzana", ipa: "/ˈæpəl/", difficulty: 1 },
      { english: "banana", spanish: "banana", ipa: "/bəˈnænə/", difficulty: 1 },
      { english: "bread", spanish: "pan", ipa: "/brɛd/", difficulty: 1 },
      { english: "milk", spanish: "leche", ipa: "/mɪlk/", difficulty: 1 },
      { english: "water", spanish: "agua", ipa: "/ˈwɔːtər/", difficulty: 1 },
      { english: "egg", spanish: "huevo", ipa: "/ɛɡ/", difficulty: 2 },
      { english: "rice", spanish: "arroz", ipa: "/raɪs/", difficulty: 2 },
      { english: "chicken", spanish: "pollo", ipa: "/ˈtʃɪkɪn/", difficulty: 2 },
      { english: "cake", spanish: "torta", ipa: "/keɪk/", difficulty: 1 },
      { english: "orange", spanish: "naranja (fruta)", ipa: "/ˈɒrɪndʒ/", difficulty: 2 },
      { english: "grape", spanish: "uva", ipa: "/ɡreɪp/", difficulty: 2 },
      { english: "cookie", spanish: "galleta", ipa: "/ˈkʊki/", difficulty: 1 },
      { english: "cheese", spanish: "queso", ipa: "/tʃiːz/", difficulty: 2 },
      { english: "soup", spanish: "sopa", ipa: "/suːp/", difficulty: 3 },
    ],
  },
  {
    id: "cuerpo",
    name: "Cuerpo",
    icon: "🧍",
    description: "Las partes del cuerpo y la cara en inglés",
    order: 5,
    words: [
      { english: "head", spanish: "cabeza", ipa: "/hɛd/", difficulty: 1 },
      { english: "eye", spanish: "ojo", ipa: "/aɪ/", difficulty: 1 },
      { english: "ear", spanish: "oreja", ipa: "/ɪər/", difficulty: 1 },
      { english: "nose", spanish: "nariz", ipa: "/noʊz/", difficulty: 1 },
      { english: "mouth", spanish: "boca", ipa: "/maʊθ/", difficulty: 1 },
      { english: "hand", spanish: "mano", ipa: "/hænd/", difficulty: 1 },
      { english: "foot", spanish: "pie", ipa: "/fʊt/", difficulty: 2 },
      { english: "arm", spanish: "brazo", ipa: "/ɑːrm/", difficulty: 2 },
      { english: "leg", spanish: "pierna", ipa: "/lɛɡ/", difficulty: 2 },
      { english: "finger", spanish: "dedo", ipa: "/ˈfɪŋɡər/", difficulty: 2 },
      { english: "teeth", spanish: "dientes", ipa: "/tiːθ/", difficulty: 3 },
      { english: "hair", spanish: "pelo", ipa: "/hɛər/", difficulty: 1 },
    ],
  },
  {
    id: "ropa",
    name: "Ropa",
    icon: "👕",
    description: "La ropa que usamos cada día en inglés",
    order: 6,
    words: [
      { english: "shirt", spanish: "camisa", ipa: "/ʃɜːrt/", difficulty: 1 },
      { english: "pants", spanish: "pantalón", ipa: "/pænts/", difficulty: 1 },
      { english: "shoes", spanish: "zapatos", ipa: "/ʃuːz/", difficulty: 1 },
      { english: "hat", spanish: "gorro", ipa: "/hæt/", difficulty: 1 },
      { english: "socks", spanish: "medias", ipa: "/sɒks/", difficulty: 1 },
      { english: "jacket", spanish: "chaqueta", ipa: "/ˈdʒækɪt/", difficulty: 2 },
      { english: "dress", spanish: "vestido", ipa: "/drɛs/", difficulty: 2 },
      { english: "boots", spanish: "botas", ipa: "/buːts/", difficulty: 2 },
      { english: "scarf", spanish: "bufanda", ipa: "/skɑːrf/", difficulty: 3 },
      { english: "gloves", spanish: "guantes", ipa: "/ɡlʌvz/", difficulty: 3 },
    ],
  },
  {
    id: "familia",
    name: "Familia",
    icon: "👨‍👩‍👧‍👦",
    description: "Mamá, papá, hermanos — la familia en inglés",
    order: 7,
    words: [
      { english: "mom", spanish: "mamá", ipa: "/mɒm/", difficulty: 1 },
      { english: "dad", spanish: "papá", ipa: "/dæd/", difficulty: 1 },
      { english: "brother", spanish: "hermano", ipa: "/ˈbrʌðər/", difficulty: 2 },
      { english: "sister", spanish: "hermana", ipa: "/ˈsɪstər/", difficulty: 2 },
      { english: "baby", spanish: "bebé", ipa: "/ˈbeɪbi/", difficulty: 1 },
      { english: "grandma", spanish: "abuela", ipa: "/ˈɡrænmɑː/", difficulty: 2 },
      { english: "grandpa", spanish: "abuelo", ipa: "/ˈɡrænpɑː/", difficulty: 2 },
      { english: "friend", spanish: "amigo", ipa: "/frɛnd/", difficulty: 1 },
      { english: "family", spanish: "familia", ipa: "/ˈfæmɪli/", difficulty: 2 },
    ],
  },
  {
    id: "casa",
    name: "Casa",
    icon: "🏠",
    description: "Los cuartos y cosas de la casa en inglés",
    order: 8,
    words: [
      { english: "door", spanish: "puerta", ipa: "/dɔːr/", difficulty: 1 },
      { english: "window", spanish: "ventana", ipa: "/ˈwɪndoʊ/", difficulty: 1 },
      { english: "table", spanish: "mesa", ipa: "/ˈteɪbəl/", difficulty: 1 },
      { english: "chair", spanish: "silla", ipa: "/tʃɛər/", difficulty: 1 },
      { english: "bed", spanish: "cama", ipa: "/bɛd/", difficulty: 1 },
      { english: "room", spanish: "cuarto", ipa: "/ruːm/", difficulty: 2 },
      { english: "kitchen", spanish: "cocina", ipa: "/ˈkɪtʃɪn/", difficulty: 2 },
      { english: "bathroom", spanish: "baño", ipa: "/ˈbæθruːm/", difficulty: 2 },
      { english: "lamp", spanish: "lámpara", ipa: "/læmp/", difficulty: 2 },
      { english: "mirror", spanish: "espejo", ipa: "/ˈmɪrər/", difficulty: 3 },
      { english: "clock", spanish: "reloj", ipa: "/klɒk/", difficulty: 2 },
    ],
  },
  {
    id: "clima",
    name: "Clima",
    icon: "🌤️",
    description: "El clima, el tiempo y las estaciones en inglés",
    order: 9,
    words: [
      { english: "sun", spanish: "sol", ipa: "/sʌn/", difficulty: 1 },
      { english: "rain", spanish: "lluvia", ipa: "/reɪn/", difficulty: 1 },
      { english: "snow", spanish: "nieve", ipa: "/snoʊ/", difficulty: 2 },
      { english: "wind", spanish: "viento", ipa: "/wɪnd/", difficulty: 2 },
      { english: "cloud", spanish: "nube", ipa: "/klaʊd/", difficulty: 1 },
      { english: "hot", spanish: "caliente", ipa: "/hɒt/", difficulty: 1 },
      { english: "cold", spanish: "frío", ipa: "/koʊld/", difficulty: 1 },
      { english: "rainbow", spanish: "arcoíris", ipa: "/ˈreɪnboʊ/", difficulty: 2 },
      { english: "storm", spanish: "tormenta", ipa: "/stɔːrm/", difficulty: 3 },
      { english: "star", spanish: "estrella", ipa: "/stɑːr/", difficulty: 1 },
    ],
  },
  {
    id: "escuela",
    name: "Escuela",
    icon: "🏫",
    description: "La mochila, los libros y la escuela en inglés",
    order: 10,
    words: [
      { english: "book", spanish: "libro", ipa: "/bʊk/", difficulty: 1 },
      { english: "pencil", spanish: "lápiz", ipa: "/ˈpɛnsɪl/", difficulty: 1 },
      { english: "teacher", spanish: "maestro", ipa: "/ˈtiːtʃər/", difficulty: 1 },
      { english: "student", spanish: "estudiante", ipa: "/ˈstuːdənt/", difficulty: 2 },
      { english: "bag", spanish: "mochila", ipa: "/bæɡ/", difficulty: 1 },
      { english: "desk", spanish: "escritorio", ipa: "/dɛsk/", difficulty: 2 },
      { english: "paper", spanish: "papel", ipa: "/ˈpeɪpər/", difficulty: 2 },
      { english: "eraser", spanish: "goma", ipa: "/ɪˈreɪsər/", difficulty: 2 },
      { english: "ruler", spanish: "regla", ipa: "/ˈruːlər/", difficulty: 3 },
      { english: "crayon", spanish: "crayón", ipa: "/ˈkreɪɒn/", difficulty: 1 },
      { english: "scissors", spanish: "tijeras", ipa: "/ˈsɪzərz/", difficulty: 3 },
    ],
  },
];

// Helpers
export function getTopic(slug: string): TopicData | undefined {
  return TOPICS.find((t) => t.id === slug);
}

export function getTopicByOrder(order: number): TopicData | undefined {
  return TOPICS.find((t) => t.order === order);
}

export function getWordsByDifficulty(topic: TopicData, level: number): VocabWord[] {
  return topic.words.filter((w) => w.difficulty <= level);
}

/** Total words across all topics */
export const TOTAL_WORDS = TOPICS.reduce((sum, t) => sum + t.words.length, 0);
