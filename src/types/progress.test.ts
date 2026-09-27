// Safety net for src/types/progress.ts — the localStorage layer.
// The critical behaviour is backward compatibility: a kid who already had
// progress saved before per-word mastery and completedReadings existed must keep
// it. Normalization is what makes that true, so it is tested directly.

import { beforeEach, describe, expect, it } from "vitest";
import {
  createEmptyTopicProgress,
  getDefaultGameState,
  getGameState,
  getWordMastery,
  loadAllProgress,
  loadTopicProgress,
  markReadingCompleted,
  normalizeTopicProgress,
  saveAllProgress,
  saveGameState,
  updateTopicWordResult,
} from "@/types/progress";
import type { GameState, TopicProgress } from "@/types/progress";

const PROGRESS_KEY = "magic_progress";
const GAME_KEY = "magic_game_state";

function seedProgress(value: unknown): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(value));
}

function seedGameState(value: unknown): void {
  localStorage.setItem(GAME_KEY, JSON.stringify(value));
}

/**
 * Legacy or corrupted payloads deliberately do not match `Partial<TopicProgress>`:
 * that mismatch is exactly what normalization exists to absorb, so the cast
 * documents the intent instead of hiding it.
 */
function legacy(raw: unknown): Partial<TopicProgress> {
  return raw as Partial<TopicProgress>;
}

beforeEach(() => {
  localStorage.clear();
});

describe("getDefaultGameState", () => {
  it("starts every kid at zero with nothing completed", () => {
    expect(getDefaultGameState()).toEqual({
      coins: 0,
      totalCoinsEarned: 0,
      badges: [],
      totalCorrect: 0,
      bestStreak: 0,
      lastSessionDate: null,
      completedReadings: [],
    });
  });

  it("includes completedReadings as an empty array, not undefined", () => {
    expect(Array.isArray(getDefaultGameState().completedReadings)).toBe(true);
    expect(getDefaultGameState().completedReadings).toEqual([]);
  });

  it("returns a fresh object each call so callers cannot leak state", () => {
    const first = getDefaultGameState();
    first.coins = 99;
    first.completedReadings.push("x");
    expect(getDefaultGameState().coins).toBe(0);
    expect(getDefaultGameState().completedReadings).toEqual([]);
  });
});

describe("getWordMastery", () => {
  it("returns 0 for a word with no attempts", () => {
    expect(getWordMastery({ english: "dog", attempts: 0, correct: 0 })).toBe(0);
  });

  it("returns the correct percentage", () => {
    expect(getWordMastery({ english: "dog", attempts: 4, correct: 3 })).toBe(75);
    expect(getWordMastery({ english: "dog", attempts: 4, correct: 4 })).toBe(100);
    expect(getWordMastery({ english: "dog", attempts: 4, correct: 0 })).toBe(0);
  });
});

describe("createEmptyTopicProgress", () => {
  it("creates a level-1 topic with empty word and per-type stats", () => {
    const topic = createEmptyTopicProgress("animales");
    expect(topic.slug).toBe("animales");
    expect(topic.level).toBe(1);
    expect(topic.correct).toBe(0);
    expect(topic.total).toBe(0);
    expect(topic.words).toEqual({});
    expect(topic.byType).toEqual({
      multiple_choice: { correct: 0, total: 0 },
      translation: { correct: 0, total: 0 },
      sentence_builder: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
    });
  });
});

describe("getGameState — reading and tolerating what is on disk", () => {
  it("returns the default state when nothing is stored", () => {
    expect(getGameState()).toEqual(getDefaultGameState());
  });

  it("normalizes a legacy state that has no completedReadings field", () => {
    seedGameState({ coins: 12, totalCoinsEarned: 40, totalCorrect: 9, bestStreak: 4 });
    const state = getGameState();
    expect(state.completedReadings).toEqual([]);
    expect(state.coins).toBe(12);
    expect(state.totalCoinsEarned).toBe(40);
  });

  it("keeps the stored completedReadings of a current state", () => {
    seedGameState({ ...getDefaultGameState(), completedReadings: ["wizards-note"] });
    expect(getGameState().completedReadings).toEqual(["wizards-note"]);
  });

  it("drops non-string entries from completedReadings", () => {
    seedGameState({ ...getDefaultGameState(), completedReadings: ["ok", 7, null] });
    expect(getGameState().completedReadings).toEqual(["ok"]);
  });

  it("replaces a non-array completedReadings with an empty array", () => {
    seedGameState({ ...getDefaultGameState(), completedReadings: "wizards-note" });
    expect(getGameState().completedReadings).toEqual([]);
  });

  it("replaces wrong-typed numeric fields with safe defaults", () => {
    seedGameState({ coins: "12", totalCorrect: null, bestStreak: undefined });
    const state = getGameState();
    expect(state.coins).toBe(0);
    expect(state.totalCorrect).toBe(0);
    expect(state.bestStreak).toBe(0);
  });

  it("falls back to the default state on corrupted JSON instead of throwing", () => {
    localStorage.setItem(GAME_KEY, "{not json");
    expect(getGameState()).toEqual(getDefaultGameState());
  });

  it("falls back to the default state when the stored value is not an object", () => {
    seedGameState(42);
    expect(getGameState()).toEqual(getDefaultGameState());
  });
});

describe("saveGameState / getGameState round trip", () => {
  it("persists every field including completedReadings", () => {
    const state: GameState = {
      coins: 7,
      totalCoinsEarned: 31,
      badges: [{ id: "first_star", unlockedAt: "2026-01-01T00:00:00.000Z" }],
      totalCorrect: 10,
      bestStreak: 5,
      lastSessionDate: "2026-01-01",
      completedReadings: ["wizards-note", "lunas-toys"],
    };
    saveGameState(state);
    expect(getGameState()).toEqual(state);
  });
});

describe("normalizeTopicProgress — legacy topic data", () => {
  it("fills in words and byType for a pre-mastery record while keeping the totals", () => {
    // Shape saved by the app before per-word mastery existed.
    const normalized = normalizeTopicProgress(
      legacy({ slug: "animales", correct: 17, total: 20, level: 3, streak: 5 }),
    );

    expect(normalized.slug).toBe("animales");
    expect(normalized.correct).toBe(17);
    expect(normalized.total).toBe(20);
    expect(normalized.level).toBe(3);
    expect(normalized.streak).toBe(5);
    expect(normalized.words).toEqual({});
    expect(normalized.byType.translation).toEqual({ correct: 0, total: 0 });
  });

  it("defaults a missing level to 1", () => {
    expect(normalizeTopicProgress(legacy({ slug: "colores" })).level).toBe(1);
  });

  it("defaults a missing slug to an empty string instead of crashing", () => {
    expect(normalizeTopicProgress(legacy({})).slug).toBe("");
  });

  it("keeps stored per-word mastery and per-type stats", () => {
    const normalized = normalizeTopicProgress(
      legacy({
        slug: "animales",
        words: { dog: { english: "dog", attempts: 4, correct: 3 } },
        byType: { translation: { correct: 2, total: 5 } },
      }),
    );
    expect(normalized.words.dog).toEqual({ english: "dog", attempts: 4, correct: 3 });
    expect(normalized.byType.translation).toEqual({ correct: 2, total: 5 });
    expect(normalized.byType.listening).toEqual({ correct: 0, total: 0 });
  });

  it("repairs a word entry with missing fields", () => {
    const normalized = normalizeTopicProgress(
      legacy({ slug: "animales", words: { cat: { attempts: 3 } } }),
    );
    expect(normalized.words.cat).toEqual({ english: "cat", attempts: 3, correct: 0 });
  });

  it("repairs a per-type stat entry with missing fields", () => {
    const normalized = normalizeTopicProgress(
      legacy({ slug: "animales", byType: { listening: { total: 3 } } }),
    );
    expect(normalized.byType.listening).toEqual({ correct: 0, total: 3 });
  });

  it("discards non-object word entries instead of throwing", () => {
    const normalized = normalizeTopicProgress(
      legacy({
        slug: "animales",
        words: { dog: null, cat: 4, bird: { english: "bird", attempts: 1, correct: 1 } },
      }),
    );
    expect(normalized.words).toEqual({ bird: { english: "bird", attempts: 1, correct: 1 } });
  });
});

describe("normalizeTopicProgress — legacy records with inflated correct counts", () => {
  // Before commit 67b8be3 a session saved `correct += score` where `score` started
  // from the already-saved score, so every session double-counted. Those records can
  // hold more correct answers than attempts, which the dashboard rendered as
  // "Precisión 200%". `total` tracks real attempts, so it is trusted; `correct` is
  // the inflated field and gets clamped.
  it("clamps correct down to total when a legacy record has more correct than attempts", () => {
    const normalized = normalizeTopicProgress(
      legacy({ slug: "animales", correct: 12, total: 6, level: 2, streak: 4 }),
    );

    expect(normalized.correct).toBe(6);
    expect(normalized.total).toBe(6);
    // The rest of the record survives the repair untouched
    expect(normalized.level).toBe(2);
    expect(normalized.streak).toBe(4);
  });

  it("clamps correct to zero when the record has no attempts at all", () => {
    const normalized = normalizeTopicProgress(legacy({ slug: "colores", correct: 5, total: 0 }));

    expect(normalized.correct).toBe(0);
    expect(normalized.total).toBe(0);
  });

  it("leaves an untouched zeroed record alone", () => {
    const normalized = normalizeTopicProgress(legacy({ slug: "colores", correct: 0, total: 0 }));

    expect(normalized.correct).toBe(0);
    expect(normalized.total).toBe(0);
  });

  it("does not touch a healthy record where correct is below total", () => {
    const normalized = normalizeTopicProgress(legacy({ slug: "animales", correct: 17, total: 20 }));

    expect(normalized.correct).toBe(17);
    expect(normalized.total).toBe(20);
  });

  it("keeps a perfect record where correct equals total", () => {
    const normalized = normalizeTopicProgress(legacy({ slug: "animales", correct: 20, total: 20 }));

    expect(normalized.correct).toBe(20);
    expect(normalized.total).toBe(20);
  });
});

describe("loadAllProgress — legacy localStorage data", () => {
  it("returns an empty map when nothing is stored", () => {
    expect(loadAllProgress()).toEqual({});
  });

  it("loads legacy topics saved before the per-word fields existed", () => {
    seedProgress({ animales: { slug: "animales", correct: 17, total: 20, level: 3, streak: 5 } });

    const all = loadAllProgress();
    expect(all.animales.level).toBe(3);
    expect(all.animales.correct).toBe(17);
    expect(all.animales.words).toEqual({});
    expect(all.animales.byType).toEqual(createEmptyTopicProgress("animales").byType);
  });

  it("sanitizes a legacy stored topic whose correct exceeds its total", () => {
    seedProgress({ animales: { slug: "animales", correct: 12, total: 6, level: 2, streak: 4 } });

    const all = loadAllProgress();
    expect(all.animales.correct).toBe(6);
    expect(all.animales.total).toBe(6);
    expect(all.animales.level).toBe(2);
  });

  it("does not throw on corrupted JSON", () => {
    localStorage.setItem(PROGRESS_KEY, "]]not json[[");
    expect(loadAllProgress()).toEqual({});
  });

  it("skips non-object entries", () => {
    seedProgress({ animales: 5, colores: { slug: "colores", correct: 1, total: 1 } });
    const all = loadAllProgress();
    expect(Object.keys(all)).toEqual(["colores"]);
    expect(all.colores.correct).toBe(1);
  });

  it("returns an empty map when the stored value is not an object", () => {
    seedProgress("nope");
    expect(loadAllProgress()).toEqual({});
  });
});

describe("saveAllProgress / loadAllProgress round trip", () => {
  it("persists the word map and the per-type stats", () => {
    const topic = createEmptyTopicProgress("animales");
    topic.correct = 3;
    topic.total = 4;
    updateTopicWordResult(topic, "dog", "multiple_choice", true);
    saveAllProgress({ animales: topic });

    const loaded = loadAllProgress().animales;
    expect(loaded.words.dog).toEqual({ english: "dog", attempts: 1, correct: 1 });
    expect(loaded.byType.multiple_choice).toEqual({ correct: 1, total: 1 });
    expect(loaded.correct).toBe(3);
  });
});

describe("loadTopicProgress", () => {
  it("falls back to level 1 and score 0 for an untouched topic", () => {
    expect(loadTopicProgress("animales")).toEqual({ level: 1, score: 0 });
  });

  it("returns the stored level and correct count", () => {
    const topic = createEmptyTopicProgress("animales");
    topic.level = 4;
    topic.correct = 11;
    // total must cover correct: a record with more correct answers than attempts is
    // the legacy double-count corruption, which normalization now clamps
    topic.total = 15;
    saveAllProgress({ animales: topic });
    expect(loadTopicProgress("animales")).toEqual({ level: 4, score: 11 });
  });
});

describe("markReadingCompleted", () => {
  it("returns true and records the id the first time", () => {
    expect(markReadingCompleted("wizards-note")).toBe(true);
    expect(getGameState().completedReadings).toEqual(["wizards-note"]);
  });

  it("returns false and does not duplicate the id on the second call", () => {
    markReadingCompleted("wizards-note");
    expect(markReadingCompleted("wizards-note")).toBe(false);
    expect(getGameState().completedReadings).toEqual(["wizards-note"]);
  });

  it("stays idempotent after many calls", () => {
    for (let i = 0; i < 5; i++) markReadingCompleted("lunas-toys");
    expect(getGameState().completedReadings).toEqual(["lunas-toys"]);
  });

  it("accumulates different reading ids", () => {
    markReadingCompleted("wizards-note");
    markReadingCompleted("lunas-toys");
    expect(getGameState().completedReadings).toEqual(["wizards-note", "lunas-toys"]);
  });

  it("is idempotent on a legacy state that has no completedReadings field", () => {
    seedGameState({ coins: 5, totalCoinsEarned: 5, totalCorrect: 3, bestStreak: 1 });
    expect(markReadingCompleted("hello-little-wizard")).toBe(true);
    expect(markReadingCompleted("hello-little-wizard")).toBe(false);
    expect(getGameState().completedReadings).toEqual(["hello-little-wizard"]);
  });

  it("preserves the other game state fields", () => {
    saveGameState({ ...getDefaultGameState(), coins: 9, totalCorrect: 4 });
    markReadingCompleted("wash-your-hands");
    const state = getGameState();
    expect(state.coins).toBe(9);
    expect(state.totalCorrect).toBe(4);
  });
});

describe("updateTopicWordResult", () => {
  it("records a first correct attempt", () => {
    const topic = createEmptyTopicProgress("animales");
    updateTopicWordResult(topic, "dog", "multiple_choice", true);

    expect(topic.words.dog).toEqual({ english: "dog", attempts: 1, correct: 1 });
    expect(topic.byType.multiple_choice).toEqual({ correct: 1, total: 1 });
  });

  it("counts an attempt without a correct answer", () => {
    const topic = createEmptyTopicProgress("animales");
    updateTopicWordResult(topic, "dog", "multiple_choice", false);

    expect(topic.words.dog).toEqual({ english: "dog", attempts: 1, correct: 0 });
    expect(topic.byType.multiple_choice).toEqual({ correct: 0, total: 1 });
  });

  it("accumulates attempts and correct answers per word", () => {
    const topic = createEmptyTopicProgress("animales");
    for (const correct of [true, false, true, true]) {
      updateTopicWordResult(topic, "dog", "translation", correct);
    }
    expect(topic.words.dog).toEqual({ english: "dog", attempts: 4, correct: 3 });
    expect(topic.byType.translation).toEqual({ correct: 3, total: 4 });
  });

  it("keys the word by its lowercase english spelling", () => {
    const topic = createEmptyTopicProgress("animales");
    updateTopicWordResult(topic, "Dog", "listening", true);
    expect(Object.keys(topic.words)).toEqual(["dog"]);
  });

  it("keeps the original english spelling in the record", () => {
    const topic = createEmptyTopicProgress("animales");
    updateTopicWordResult(topic, "Dog", "listening", true);
    expect(topic.words.dog.english).toBe("Dog");
  });

  it("merges a differently-cased spelling into the same word record", () => {
    const topic = createEmptyTopicProgress("animales");
    updateTopicWordResult(topic, "dog", "translation", true);
    updateTopicWordResult(topic, "DOG", "translation", true);
    expect(Object.keys(topic.words)).toEqual(["dog"]);
    expect(topic.words.dog.attempts).toBe(2);
  });

  it("tracks each exercise type separately", () => {
    const topic = createEmptyTopicProgress("animales");
    updateTopicWordResult(topic, "dog", "multiple_choice", true);
    updateTopicWordResult(topic, "dog", "listening", false);

    expect(topic.byType.multiple_choice).toEqual({ correct: 1, total: 1 });
    expect(topic.byType.listening).toEqual({ correct: 0, total: 1 });
    expect(topic.byType.translation).toEqual({ correct: 0, total: 0 });
    expect(topic.words.dog.attempts).toBe(2);
  });

  it("mutates the topic in place and returns nothing", () => {
    const topic = createEmptyTopicProgress("animales");
    expect(updateTopicWordResult(topic, "dog", "multiple_choice", true)).toBeUndefined();
    expect(topic.total).toBe(0);
  });
});
