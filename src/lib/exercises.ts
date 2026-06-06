// Academia Mágica — Exercise Generation Engine
// Hybrid approach: curated vocabulary + AI-generated exercises via Groq
// Falls back to template-based exercises when Groq is rate-limited

import Groq from "groq-sdk";
import { getTopic, getWordsByDifficulty } from "@/data/vocabulary";
import type { VocabWord } from "@/data/vocabulary";
import type { Exercise, ExerciseType } from "@/types/exercises";
import { GROQ_MODEL, GROQ_TEMPERATURE, GROQ_MAX_TOKENS } from "./constants";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Template-based exercise generators (fallback) ───

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateMultipleChoice(
  word: VocabWord,
  allWords: VocabWord[],
  index: number,
): Exercise {
  // Pick wrong options from other words
  const others = allWords.filter((w) => w.english !== word.english);
  const wrongOptions = shuffle(others)
    .slice(0, 3)
    .map((w) => w.spanish);
  const options = shuffle([word.spanish, ...wrongOptions]);

  return {
    id: `mc-${word.english}-${index}`,
    type: "multiple_choice",
    difficulty: word.difficulty,
    topic_id: "",
    question: `¿Cómo se dice "${word.english}" en español?`,
    options,
    correct_answer: word.spanish,
    explanation: `"${word.english}" se dice "${word.spanish}" en español. ¡Muy bien! 🎉`,
    target_word: word.english,
  };
}

function generateTranslation(word: VocabWord, _all: VocabWord[], index: number): Exercise {
  const dir = Math.random() > 0.5 ? "toSpanish" : "toEnglish";
  if (dir === "toSpanish") {
    return {
      id: `tr-${word.english}-${index}`,
      type: "translation",
      difficulty: word.difficulty,
      topic_id: "",
      question: `Escribí "${word.english}" en español`,
      correct_answer: word.spanish,
      explanation: `"${word.english}" es "${word.spanish}" en español. ¡Genial! ⭐`,
      target_word: word.english,
    };
  }
  return {
    id: `tr-${word.english}-${index}`,
    type: "translation",
    difficulty: word.difficulty,
    topic_id: "",
    question: `Escribí "${word.spanish}" en inglés`,
    correct_answer: word.english,
    explanation: `"${word.spanish}" es "${word.english}" en inglés. ¡Perfecto! ⭐`,
    target_word: word.english,
  };
}

function generateSentenceBuilder(word: VocabWord, _all: VocabWord[], index: number): Exercise {
  const templates = [
    { q: `Completá: "I see a ___" (${word.spanish})`, a: word.english },
  ];
  const t = templates[0];
  return {
    id: `sb-${word.english}-${index}`,
    type: "sentence_builder",
    difficulty: Math.min(word.difficulty + 1, 5) as 1 | 2 | 3 | 4 | 5,
    topic_id: "",
    question: t.q,
    correct_answer: t.a,
    explanation: `"I see a ${word.english}" significa "Veo un ${word.spanish}". ¡Muy bien! 🌟`,
    target_word: word.english,
  };
}

function generateListening(word: VocabWord, _all: VocabWord[], index: number): Exercise {
  return {
    id: `li-${word.english}-${index}`,
    type: "listening",
    difficulty: word.difficulty,
    topic_id: "",
    question: `Escuchá y escribí la palabra en inglés`,
    correct_answer: word.english,
    explanation: `La palabra era "${word.english}" que significa "${word.spanish}". ¡Bien ahí! 🎧`,
    target_word: word.english,
  };
}

const generators: Record<
  ExerciseType,
  (w: VocabWord, all: VocabWord[], i: number) => Exercise
> = {
  multiple_choice: generateMultipleChoice,
  translation: generateTranslation,
  sentence_builder: generateSentenceBuilder,
  listening: generateListening,
};

/** Generate a set of exercises locally (no AI) — fast, reliable, always works */
export function generateTemplateExercises(
  topicId: string,
  level: number,
  count: number = 5,
): Exercise[] {
  const topic = getTopic(topicId);
  if (!topic) return [];

  const availableWords = getWordsByDifficulty(topic, level);
  if (availableWords.length === 0) return [];

  // Pick random words, weighted by difficulty match
  const selected = shuffle(availableWords).slice(0, count);

  // Cycle through exercise types
  const types: ExerciseType[] = [
    "multiple_choice",
    "translation",
    "sentence_builder",
    "multiple_choice",
    "translation",
  ];

  return selected.map((word, i) => {
    const type = types[i % types.length];
    return generators[type](word, availableWords, i);
  });
}

// ─── AI-powered exercise generation via Groq ───

const EXERCISE_SYSTEM_PROMPT = `You are a fun English teacher for kids ages 6-10 (LATAM Spanish speakers).
Generate ONE exercise at a time. Respond ONLY with valid JSON. No markdown, no extra text.

The exercise MUST be appropriate for the child's CURRENT LEVEL (1-5):
- Level 1: Single words, matching, very simple choices
- Level 2: Simple phrases, basic comprehension
- Level 3: Short sentences, ordering words
- Level 4: Complete sentences, fill in the blank
- Level 5: Complex sentences, paragraph comprehension

Exercise types:
- "multiple_choice": Question + 4 options (1 correct, 3 wrong). Options are IN SPANISH.
- "translation": "Translate X to Y" — specify direction in the question
- "sentence_builder": "Order the words" or "Complete the sentence"

Return JSON format:
{
  "type": "multiple_choice" | "translation" | "sentence_builder",
  "question": "the question in Spanish, kid-friendly",
  "options": ["option1", "option2", "option3", "option4"],
  "correct_answer": "the correct answer",
  "explanation": "fun explanation in Spanish why this is correct",
  "target_word": "the main English word being taught"
}`;

function buildExercisePrompt(
  topicId: string,
  level: number,
  type: ExerciseType,
  previousExercises: string[],
): string {
  const topic = getTopic(topicId);
  const words = topic ? getWordsByDifficulty(topic, level) : [];
  const wordList = words.map((w) => `- ${w.english} (${w.spanish})`).join("\n");

  return `Generate a "${type}" exercise for a child at level ${level} learning English (native Spanish speaker).

Topic: ${topic?.name ?? topicId}
Available vocabulary (use ONLY these words):
${wordList || "General vocabulary level " + level}

${previousExercises.length > 0 ? `Previous exercises in this session (DO NOT repeat these words):\n${previousExercises.join(", ")}` : ""}

Make it fun, magical, and appropriate for a kid. The question MUST be in Spanish.`;
}

export interface GeneratedExercise extends Exercise {
  // AI-generated exercises have the same shape
}

/** Generate ONE exercise via Groq AI */
export async function generateAIExercise(
  topicId: string,
  level: number,
  type: ExerciseType,
  previousWords: string[] = [],
): Promise<GeneratedExercise> {
  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature: GROQ_TEMPERATURE,
    max_tokens: GROQ_MAX_TOKENS,
    messages: [
      { role: "system", content: EXERCISE_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildExercisePrompt(topicId, level, type, previousWords),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Groq response");

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    id: `ai-${topicId}-${level}-${type}-${Date.now()}`,
    type: parsed.type || type,
    difficulty: level,
    topic_id: topicId,
    question: parsed.question || "",
    options: parsed.options,
    correct_answer: parsed.correct_answer || "",
    explanation: parsed.explanation || "",
    target_word: parsed.target_word || "",
  };
}

/** Get exercises for a topic/level — tries AI first, falls back to templates */
export async function getExercises(
  topicId: string,
  level: number,
  count: number = 5,
): Promise<Exercise[]> {
  // For now, always use templates (faster, reliable, no rate limit issues)
  // AI generation can be enabled for "premium" exercises later
  const exercises = generateTemplateExercises(topicId, level, count);

  // Attach topic_id to each exercise
  return exercises.map((ex) => ({ ...ex, topic_id: topicId }));
}
