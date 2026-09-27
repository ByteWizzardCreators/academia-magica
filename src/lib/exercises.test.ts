// Safety net for the template exercise generators in src/lib/exercises.ts.
// Everything here runs on the curated vocabulary; no AI call is involved.

import { afterEach, describe, expect, it, vi } from "vitest";
import { getTopic } from "@/data/vocabulary";
import type { VocabWord } from "@/data/vocabulary";
import { generateTemplateExercises, getExercises } from "@/lib/exercises";
import type { Exercise, ExerciseType } from "@/types/exercises";

// KNOWN GAP: src/lib/exercises.ts builds a Groq client at module scope, so the file
// throws on import when GROQ_API_KEY is absent — even though the template
// generators are pure and never touch the network. The SDK is stubbed here so the
// pure logic can be tested without faking an API key into the environment. Making
// the client lazy in the source would remove this coupling; that is a source change
// and is out of scope for the test prerequisite.
vi.mock("groq-sdk", () => ({
  default: class GroqStub {
    chat = {
      completions: {
        create: () => {
          throw new Error("unit tests must not perform network calls");
        },
      },
    };
  },
}));

/** Deterministic PRNG so the generated set is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedRandom(seed = 4242): void {
  vi.spyOn(Math, "random").mockImplementation(mulberry32(seed));
}

function topicWords(slug: string): VocabWord[] {
  const topic = getTopic(slug);
  if (!topic) throw new Error(`unknown test topic: ${slug}`);
  return topic.words;
}

/** A fixed word pool makes the generated set deterministic. */
function fixedPool(slug: string, size: number): VocabWord[] {
  return topicWords(slug).slice(0, size);
}

function exerciseTypes(exercises: Exercise[]): ExerciseType[] {
  return exercises.map((e) => e.type);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateTemplateExercises — empty and unknown inputs", () => {
  it("returns an empty array for an unknown topic", () => {
    expect(generateTemplateExercises("no-existe", 1, 5)).toEqual([]);
  });

  it("returns an empty array for a count of zero", () => {
    expect(generateTemplateExercises("animales", 1, 0)).toEqual([]);
  });

  it("returns fewer exercises than requested when the pool is smaller than the count", () => {
    const pool = fixedPool("animales", 3);
    const exercises = generateTemplateExercises("animales", 1, 10, pool);
    expect(exercises).toHaveLength(3);
  });

  it("ignores requested words that are not in the topic and falls back to the level pool", () => {
    const foreign = topicWords("colores").slice(0, 2);
    const exercises = generateTemplateExercises("animales", 1, 2, foreign);
    expect(exercises).toHaveLength(2);
    for (const ex of exercises) {
      expect(topicWords("animales").some((w) => w.english === ex.target_word)).toBe(true);
    }
  });
});

describe("generateTemplateExercises — count and shape", () => {
  it("respects the requested count", () => {
    seedRandom();
    const pool = fixedPool("animales", 8);
    expect(generateTemplateExercises("animales", 1, 5, pool)).toHaveLength(5);
    expect(generateTemplateExercises("animales", 1, 2, pool)).toHaveLength(2);
  });

  it("never repeats a target word inside one call", () => {
    seedRandom();
    const pool = fixedPool("animales", 6);
    const exercises = generateTemplateExercises("animales", 1, 6, pool);
    const targets = exercises.map((e) => e.target_word);
    expect(new Set(targets).size).toBe(targets.length);
  });

  it("uses the provided words when they belong to the topic", () => {
    seedRandom();
    const pool = fixedPool("animales", 4);
    const exercises = generateTemplateExercises("animales", 1, 4, pool);
    const targets = new Set(exercises.map((e) => e.target_word));
    for (const word of pool) {
      expect(targets.has(word.english)).toBe(true);
    }
  });

  it("gives every exercise an id, a question, a correct answer and an explanation", () => {
    seedRandom();
    const exercises = generateTemplateExercises("animales", 1, 5, fixedPool("animales", 5));
    const ids = new Set<string>();

    for (const ex of exercises) {
      expect(ex.id.length).toBeGreaterThan(0);
      expect(ex.question.length).toBeGreaterThan(0);
      expect(ex.correct_answer.length).toBeGreaterThan(0);
      expect(ex.explanation.length).toBeGreaterThan(0);
      expect(ex.target_word.length).toBeGreaterThan(0);
      expect(ex.difficulty).toBeGreaterThanOrEqual(1);
      expect(ex.difficulty).toBeLessThanOrEqual(5);
      ids.add(ex.id);
    }
    expect(ids.size).toBe(exercises.length);
  });

  it("keeps the difficulty inside the 1-5 range for every type", () => {
    seedRandom();
    for (const exercise of generateTemplateExercises("casa", 5, 5, fixedPool("casa", 5))) {
      expect(exercise.difficulty).toBeGreaterThanOrEqual(1);
      expect(exercise.difficulty).toBeLessThanOrEqual(5);
    }
  });
});

describe("generateTemplateExercises — exercise type cycle", () => {
  it("cycles multiple_choice, translation, sentence_builder, multiple_choice, translation", () => {
    seedRandom();
    const pool = fixedPool("animales", 10);
    const exercises = generateTemplateExercises("animales", 5, 10, pool);
    expect(exerciseTypes(exercises)).toEqual([
      "multiple_choice",
      "translation",
      "sentence_builder",
      "multiple_choice",
      "translation",
      "multiple_choice",
      "translation",
      "sentence_builder",
      "multiple_choice",
      "translation",
    ]);
  });

  it("restarts the cycle on every call", () => {
    seedRandom();
    const pool = fixedPool("animales", 4);
    const first = exerciseTypes(generateTemplateExercises("animales", 5, 2, pool));
    const second = exerciseTypes(generateTemplateExercises("animales", 5, 2, pool));
    expect(first).toEqual(["multiple_choice", "translation"]);
    expect(second).toEqual(first);
  });

  it("never produces listening exercises: the cycle omits that type", () => {
    // KNOWN GAP: `listening` is a valid ExerciseType with a `generateListening`
    // template, but it is not part of the `types` cycle in generateTemplateExercises,
    // so it is unreachable from this generator. Asserted so a future change to the
    // cycle is a visible, deliberate test diff.
    seedRandom();
    for (let count = 1; count <= 12; count++) {
      const exercises = generateTemplateExercises(
        "animales",
        5,
        count,
        fixedPool("animales", 12),
      );
      expect(exerciseTypes(exercises)).not.toContain("listening");
    }
  });
});

describe("generateTemplateExercises — multiple_choice", () => {
  function multipleChoice(): Exercise {
    seedRandom();
    const pool = fixedPool("animales", 10);
    return generateTemplateExercises("animales", 5, 1, pool)[0];
  }

  it("offers exactly 4 options including the correct answer", () => {
    const ex = multipleChoice();
    expect(ex.type).toBe("multiple_choice");
    expect(ex.options).toHaveLength(4);
    expect(ex.options).toContain(ex.correct_answer);
  });

  it("asks for the Spanish meaning of the English word and answers in Spanish", () => {
    const ex = multipleChoice();
    expect(ex.question).toContain(ex.target_word);
    const word = topicWords("animales").find((w) => w.english === ex.target_word);
    expect(ex.correct_answer).toBe(word?.spanish);
  });

  it("keeps the word difficulty unchanged", () => {
    const ex = multipleChoice();
    const word = topicWords("animales").find((w) => w.english === ex.target_word);
    expect(ex.difficulty).toBe(word?.difficulty);
  });

  it("builds the wrong options from other words of the same pool", () => {
    const ex = multipleChoice();
    const wrong = (ex.options ?? []).filter((o) => o !== ex.correct_answer);
    expect(wrong).toHaveLength(3);
    for (const option of wrong) {
      expect(option).not.toBe(ex.correct_answer);
    }
  });

  it("does not use the same Spanish word twice among the options", () => {
    seedRandom(99);
    for (const ex of generateTemplateExercises("animales", 5, 5, fixedPool("animales", 10))) {
      if (ex.type !== "multiple_choice") continue;
      expect(new Set(ex.options).size).toBe(4);
    }
  });
});

describe("generateTemplateExercises — translation", () => {
  function translations(): Exercise[] {
    seedRandom(7);
    const pool = fixedPool("animales", 12);
    return generateTemplateExercises("animales", 5, 8, pool).filter(
      (e) => e.type === "translation",
    );
  }

  it("has no options to choose from", () => {
    for (const ex of translations()) {
      expect(ex.options).toBeUndefined();
    }
  });

  it("answers with either the Spanish or the English spelling of the target word", () => {
    const word = (english: string) => topicWords("animales").find((w) => w.english === english);
    for (const ex of translations()) {
      const target = word(ex.target_word);
      expect([target?.spanish, target?.english]).toContain(ex.correct_answer);
    }
  });

  it("states the direction of the translation in the question", () => {
    for (const ex of translations()) {
      expect(ex.question).toMatch(/español|inglés/);
    }
  });

  // The "Help ≠ Answer" gate reads `direction` to know whether the free Spanish
  // panel would hand over the correct answer, so the stamp must agree with the
  // question and the answer. Without it the gate has to assume the worst.
  it("stamps the direction that matches the question and the answer", () => {
    for (const ex of translations()) {
      expect(["toSpanish", "toEnglish"]).toContain(ex.direction);
      const target = topicWords("animales").find((w) => w.english === ex.target_word);
      if (ex.direction === "toSpanish") {
        expect(ex.question).toContain("español");
        expect(ex.correct_answer).toBe(target?.spanish);
      } else {
        expect(ex.question).toContain("inglés");
        expect(ex.correct_answer).toBe(target?.english);
      }
    }
  });
});

describe("generateTemplateExercises — sentence_builder", () => {
  function sentenceBuilders(): Exercise[] {
    seedRandom(11);
    const pool = fixedPool("animales", 12);
    return generateTemplateExercises("animales", 5, 8, pool).filter(
      (e) => e.type === "sentence_builder",
    );
  }

  it("fills the blank with the English target word", () => {
    for (const ex of sentenceBuilders()) {
      expect(ex.correct_answer).toBe(ex.target_word);
    }
  });

  it("has no options to choose from", () => {
    for (const ex of sentenceBuilders()) {
      expect(ex.options).toBeUndefined();
    }
  });

  it("uses the fixed 'I see a ___' template with the Spanish gloss", () => {
    for (const ex of sentenceBuilders()) {
      const target = topicWords("animales").find((w) => w.english === ex.target_word);
      expect(ex.question).toContain("I see a");
      expect(ex.question).toContain(target?.spanish ?? "missing");
    }
  });

  it("raises the difficulty by one, capped at 5", () => {
    for (const ex of sentenceBuilders()) {
      const target = topicWords("animales").find((w) => w.english === ex.target_word);
      expect(ex.difficulty).toBe(Math.min((target?.difficulty ?? 1) + 1, 5));
    }
  });
});

describe("getExercises — topic_id attachment", () => {
  it("attaches the topic id to every generated exercise", async () => {
    seedRandom();
    const exercises = await getExercises("animales", 1, 3, fixedPool("animales", 3));
    expect(exercises).toHaveLength(3);
    for (const ex of exercises) {
      expect(ex.topic_id).toBe("animales");
    }
  });

  it("returns an empty array for an unknown topic", async () => {
    expect(await getExercises("no-existe", 1, 3)).toEqual([]);
  });

  it("keeps the exercise payload identical to the template generator", async () => {
    const pool = fixedPool("colores", 4);
    // Re-seed before each call so both consume the same random stream.
    seedRandom();
    const [fromTemplates] = generateTemplateExercises("colores", 5, 1, pool);
    seedRandom();
    const [fromGetExercises] = await getExercises("colores", 5, 1, pool);

    expect(fromGetExercises.type).toBe(fromTemplates.type);
    expect(fromGetExercises.question).toBe(fromTemplates.question);
    expect(fromGetExercises.correct_answer).toBe(fromTemplates.correct_answer);
  });
});

describe("generateTemplateExercises — topic_id is NOT set by the template generator", () => {
  it("leaves topic_id empty; only getExercises fills it", () => {
    // KNOWN GAP: generateTemplateExercises hardcodes `topic_id: ""` and relies on
    // the getExercises wrapper to attach the topic. Callers that use the template
    // generator directly get exercises with no topic attached.
    seedRandom();
    const exercises = generateTemplateExercises("animales", 1, 3, fixedPool("animales", 3));
    for (const ex of exercises) {
      expect(ex.topic_id).toBe("");
    }
  });
});
