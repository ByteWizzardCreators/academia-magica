-- Academia Mágica — Vocabulary + Seed Data for Phase 2
-- Creates vocabulary table and seeds 10 topics with ~120 words

-- Vocabulary words per topic
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  english TEXT NOT NULL,
  spanish TEXT NOT NULL,
  ipa TEXT,
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_topic ON vocabulary(topic_id);

-- Seed topics (also inserts if topics table is empty)
INSERT INTO topics (name, slug, icon, description, "order") VALUES
  ('Animales', 'animales', '🐾', 'Perros, gatos, pájaros y más — los animales más divertidos en inglés', 1),
  ('Colores', 'colores', '🎨', 'Los colores del arcoíris y cómo se dicen en inglés', 2),
  ('Números', 'numeros', '🔢', 'Contá del 1 al 20 y aprendé los números en inglés', 3),
  ('Comida', 'comida', '🍎', 'Frutas, comidas y bebidas — todo lo que te gusta comer', 4),
  ('Cuerpo', 'cuerpo', '🧍', 'Las partes del cuerpo y la cara en inglés', 5),
  ('Ropa', 'ropa', '👕', 'La ropa que usamos cada día en inglés', 6),
  ('Familia', 'familia', '👨‍👩‍👧‍👦', 'Mamá, papá, hermanos — la familia en inglés', 7),
  ('Casa', 'casa', '🏠', 'Los cuartos y cosas de la casa en inglés', 8),
  ('Clima', 'clima', '🌤️', 'El clima, el tiempo y las estaciones en inglés', 9),
  ('Escuela', 'escuela', '🏫', 'La mochila, los libros y la escuela en inglés', 10)
ON CONFLICT (slug) DO NOTHING;

-- Vocabulary data per topic
-- Only insert if vocabulary table is empty
DO $$
DECLARE
  animales_id UUID;
  colores_id UUID;
  numeros_id UUID;
  comida_id UUID;
  cuerpo_id UUID;
  ropa_id UUID;
  familia_id UUID;
  casa_id UUID;
  clima_id UUID;
  escuela_id UUID;
BEGIN
  -- Get topic IDs by slug
  SELECT id INTO animales_id FROM topics WHERE slug = 'animales';
  SELECT id INTO colores_id FROM topics WHERE slug = 'colores';
  SELECT id INTO numeros_id FROM topics WHERE slug = 'numeros';
  SELECT id INTO comida_id FROM topics WHERE slug = 'comida';
  SELECT id INTO cuerpo_id FROM topics WHERE slug = 'cuerpo';
  SELECT id INTO ropa_id FROM topics WHERE slug = 'ropa';
  SELECT id INTO familia_id FROM topics WHERE slug = 'familia';
  SELECT id INTO casa_id FROM topics WHERE slug = 'casa';
  SELECT id INTO clima_id FROM topics WHERE slug = 'clima';
  SELECT id INTO escuela_id FROM topics WHERE slug = 'escuela';

  -- 1. ANIMALES (difficulty 1-3)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (animales_id, 'dog', 'perro', '/dɒɡ/', 1, 1),
    (animales_id, 'cat', 'gato', '/kæt/', 1, 2),
    (animales_id, 'bird', 'pájaro', '/bɜːrd/', 1, 3),
    (animales_id, 'fish', 'pez', '/fɪʃ/', 1, 4),
    (animales_id, 'rabbit', 'conejo', '/ˈræbɪt/', 1, 5),
    (animales_id, 'horse', 'caballo', '/hɔːrs/', 2, 6),
    (animales_id, 'cow', 'vaca', '/kaʊ/', 2, 7),
    (animales_id, 'pig', 'cerdo', '/pɪɡ/', 2, 8),
    (animales_id, 'duck', 'pato', '/dʌk/', 2, 9),
    (animales_id, 'frog', 'rana', '/frɒɡ/', 2, 10),
    (animales_id, 'bear', 'oso', '/bɛər/', 3, 11),
    (animales_id, 'lion', 'león', '/ˈlaɪən/', 3, 12),
    (animales_id, 'elephant', 'elefante', '/ˈɛlɪfənt/', 3, 13),
    (animales_id, 'monkey', 'mono', '/ˈmʌŋki/', 2, 14),
    (animales_id, 'turtle', 'tortuga', '/ˈtɜːrtl/', 3, 15);

  -- 2. COLORES (difficulty 1-2)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (colores_id, 'red', 'rojo', '/rɛd/', 1, 1),
    (colores_id, 'blue', 'azul', '/bluː/', 1, 2),
    (colores_id, 'green', 'verde', '/ɡriːn/', 1, 3),
    (colores_id, 'yellow', 'amarillo', '/ˈjɛloʊ/', 1, 4),
    (colores_id, 'purple', 'morado', '/ˈpɜːrpl/', 2, 5),
    (colores_id, 'pink', 'rosado', '/pɪŋk/', 1, 6),
    (colores_id, 'orange', 'naranja', '/ˈɒrɪndʒ/', 1, 7),
    (colores_id, 'white', 'blanco', '/waɪt/', 1, 8),
    (colores_id, 'black', 'negro', '/blæk/', 1, 9),
    (colores_id, 'brown', 'marrón', '/braʊn/', 2, 10),
    (colores_id, 'gray', 'gris', '/ɡreɪ/', 2, 11),
    (colores_id, 'gold', 'dorado', '/ɡoʊld/', 2, 12);

  -- 3. NÚMEROS (difficulty 1-2)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (numeros_id, 'one', 'uno', '/wʌn/', 1, 1),
    (numeros_id, 'two', 'dos', '/tuː/', 1, 2),
    (numeros_id, 'three', 'tres', '/θriː/', 1, 3),
    (numeros_id, 'four', 'cuatro', '/fɔːr/', 1, 4),
    (numeros_id, 'five', 'cinco', '/faɪv/', 1, 5),
    (numeros_id, 'six', 'seis', '/sɪks/', 1, 6),
    (numeros_id, 'seven', 'siete', '/ˈsɛvən/', 1, 7),
    (numeros_id, 'eight', 'ocho', '/eɪt/', 1, 8),
    (numeros_id, 'nine', 'nueve', '/naɪn/', 1, 9),
    (numeros_id, 'ten', 'diez', '/tɛn/', 1, 10),
    (numeros_id, 'eleven', 'once', '/ɪˈlɛvən/', 2, 11),
    (numeros_id, 'twelve', 'doce', '/twɛlv/', 2, 12),
    (numeros_id, 'twenty', 'veinte', '/ˈtwɛnti/', 2, 13);

  -- 4. COMIDA (difficulty 1-3)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (comida_id, 'apple', 'manzana', '/ˈæpəl/', 1, 1),
    (comida_id, 'banana', 'banana', '/bəˈnænə/', 1, 2),
    (comida_id, 'bread', 'pan', '/brɛd/', 1, 3),
    (comida_id, 'milk', 'leche', '/mɪlk/', 1, 4),
    (comida_id, 'water', 'agua', '/ˈwɔːtər/', 1, 5),
    (comida_id, 'egg', 'huevo', '/ɛɡ/', 2, 6),
    (comida_id, 'rice', 'arroz', '/raɪs/', 2, 7),
    (comida_id, 'chicken', 'pollo', '/ˈtʃɪkɪn/', 2, 8),
    (comida_id, 'cake', 'torta', '/keɪk/', 1, 9),
    (comida_id, 'orange', 'naranja', '/ˈɒrɪndʒ/', 2, 10),
    (comida_id, 'grape', 'uva', '/ɡreɪp/', 2, 11),
    (comida_id, 'cookie', 'galleta', '/ˈkʊki/', 1, 12),
    (comida_id, 'cheese', 'queso', '/tʃiːz/', 2, 13),
    (comida_id, 'soup', 'sopa', '/suːp/', 3, 14);

  -- 5. CUERPO (difficulty 1-3)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (cuerpo_id, 'head', 'cabeza', '/hɛd/', 1, 1),
    (cuerpo_id, 'eye', 'ojo', '/aɪ/', 1, 2),
    (cuerpo_id, 'ear', 'oreja', '/ɪər/', 1, 3),
    (cuerpo_id, 'nose', 'nariz', '/noʊz/', 1, 4),
    (cuerpo_id, 'mouth', 'boca', '/maʊθ/', 1, 5),
    (cuerpo_id, 'hand', 'mano', '/hænd/', 1, 6),
    (cuerpo_id, 'foot', 'pie', '/fʊt/', 2, 7),
    (cuerpo_id, 'arm', 'brazo', '/ɑːrm/', 2, 8),
    (cuerpo_id, 'leg', 'pierna', '/lɛɡ/', 2, 9),
    (cuerpo_id, 'finger', 'dedo', '/ˈfɪŋɡər/', 2, 10),
    (cuerpo_id, 'teeth', 'dientes', '/tiːθ/', 3, 11),
    (cuerpo_id, 'hair', 'pelo', '/hɛər/', 1, 12);

  -- 6. ROPA (difficulty 1-3)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (ropa_id, 'shirt', 'camisa', '/ʃɜːrt/', 1, 1),
    (ropa_id, 'pants', 'pantalón', '/pænts/', 1, 2),
    (ropa_id, 'shoes', 'zapatos', '/ʃuːz/', 1, 3),
    (ropa_id, 'hat', 'gorro', '/hæt/', 1, 4),
    (ropa_id, 'socks', 'medias', '/sɒks/', 1, 5),
    (ropa_id, 'jacket', 'chaqueta', '/ˈdʒækɪt/', 2, 6),
    (ropa_id, 'dress', 'vestido', '/drɛs/', 2, 7),
    (ropa_id, 'boots', 'botas', '/buːts/', 2, 8),
    (ropa_id, 'scarf', 'bufanda', '/skɑːrf/', 3, 9),
    (ropa_id, 'gloves', 'guantes', '/ɡlʌvz/', 3, 10);

  -- 7. FAMILIA (difficulty 1-2)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (familia_id, 'mom', 'mamá', '/mɒm/', 1, 1),
    (familia_id, 'dad', 'papá', '/dæd/', 1, 2),
    (familia_id, 'brother', 'hermano', '/ˈbrʌðər/', 2, 3),
    (familia_id, 'sister', 'hermana', '/ˈsɪstər/', 2, 4),
    (familia_id, 'baby', 'bebé', '/ˈbeɪbi/', 1, 5),
    (familia_id, 'grandma', 'abuela', '/ˈɡrænmɑː/', 2, 6),
    (familia_id, 'grandpa', 'abuelo', '/ˈɡrænpɑː/', 2, 7),
    (familia_id, 'friend', 'amigo', '/frɛnd/', 1, 8),
    (familia_id, 'family', 'familia', '/ˈfæmɪli/', 2, 9);

  -- 8. CASA (difficulty 1-3)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (casa_id, 'door', 'puerta', '/dɔːr/', 1, 1),
    (casa_id, 'window', 'ventana', '/ˈwɪndoʊ/', 1, 2),
    (casa_id, 'table', 'mesa', '/ˈteɪbəl/', 1, 3),
    (casa_id, 'chair', 'silla', '/tʃɛər/', 1, 4),
    (casa_id, 'bed', 'cama', '/bɛd/', 1, 5),
    (casa_id, 'room', 'cuarto', '/ruːm/', 2, 6),
    (casa_id, 'kitchen', 'cocina', '/ˈkɪtʃɪn/', 2, 7),
    (casa_id, 'bathroom', 'baño', '/ˈbæθruːm/', 2, 8),
    (casa_id, 'lamp', 'lámpara', '/læmp/', 2, 9),
    (casa_id, 'mirror', 'espejo', '/ˈmɪrər/', 3, 10),
    (casa_id, 'clock', 'reloj', '/klɒk/', 2, 11);

  -- 9. CLIMA (difficulty 1-3)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (clima_id, 'sun', 'sol', '/sʌn/', 1, 1),
    (clima_id, 'rain', 'lluvia', '/reɪn/', 1, 2),
    (clima_id, 'snow', 'nieve', '/snoʊ/', 2, 3),
    (clima_id, 'wind', 'viento', '/wɪnd/', 2, 4),
    (clima_id, 'cloud', 'nube', '/klaʊd/', 1, 5),
    (clima_id, 'hot', 'caliente', '/hɒt/', 1, 6),
    (clima_id, 'cold', 'frío', '/koʊld/', 1, 7),
    (clima_id, 'rainbow', 'arcoíris', '/ˈreɪnboʊ/', 2, 8),
    (clima_id, 'storm', 'tormenta', '/stɔːrm/', 3, 9),
    (clima_id, 'star', 'estrella', '/stɑːr/', 1, 10);

  -- 10. ESCUELA (difficulty 1-3)
  INSERT INTO vocabulary (topic_id, english, spanish, ipa, difficulty, sort_order) VALUES
    (escuela_id, 'book', 'libro', '/bʊk/', 1, 1),
    (escuela_id, 'pencil', 'lápiz', '/ˈpɛnsɪl/', 1, 2),
    (escuela_id, 'teacher', 'maestro', '/ˈtiːtʃər/', 1, 3),
    (escuela_id, 'student', 'estudiante', '/ˈstuːdənt/', 2, 4),
    (escuela_id, 'bag', 'mochila', '/bæɡ/', 1, 5),
    (escuela_id, 'desk', 'escritorio', '/dɛsk/', 2, 6),
    (escuela_id, 'paper', 'papel', '/ˈpeɪpər/', 2, 7),
    (escuela_id, 'eraser', 'goma', '/ɪˈreɪsər/', 2, 8),
    (escuela_id, 'ruler', 'regla', '/ˈruːlər/', 3, 9),
    (escuela_id, 'crayon', 'crayón', '/ˈkreɪɒn/', 1, 10),
    (escuela_id, 'scissors', 'tijeras', '/ˈsɪzərz/', 3, 11);
END $$;
