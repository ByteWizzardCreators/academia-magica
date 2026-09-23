// Shared progress type used across classes + dashboard pages.
// Extended with per-word mastery and per-exercise-type stats for the
// adaptive engine, gamification, badges and the competence dashboard.

import type { ExerciseType } from "@/types/exercises";

export const EXERCISE_TYPES: ExerciseType[] = [
  "multiple_choice",
  "translation",
  "sentence_builder",
  "listening",
];

/** Per-word mastery record, keyed by lowercase english spelling */
export interface WordProgress {
  english: string;
  attempts: number;
  correct: number;
}

export interface ExerciseTypeStats {
  correct: number;
  total: number;
}

export interface TopicProgress {
  slug: string;
  correct: number;
  total: number;
  level: number;
  streak: number;
  /** Per-word mastery across the topic */
  words: Record<string, WordProgress>;
  /** Stats per exercise type */
  byType: Record<ExerciseType, ExerciseTypeStats>;
}

export interface BadgeProgress {
  id: string;
  unlockedAt: string;
}

/** Global game state that lives alongside topic progress (localStorage) */
export interface GameState {
  coins: number;
  totalCoinsEarned: number;
  badges: BadgeProgress[];
  totalCorrect: number;
  bestStreak: number;
  lastSessionDate: string | null;
}

const STORAGE_KEY = "magic_progress";
const GAME_STORAGE_KEY = "magic_game_state";

/** Fresh per-exercise-type stats map (never share the same object) */
export function emptyByType(): Record<ExerciseType, ExerciseTypeStats> {
  return {
    multiple_choice: { correct: 0, total: 0 },
    translation: { correct: 0, total: 0 },
    sentence_builder: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
  };
}

export function createEmptyTopicProgress(slug: string): TopicProgress {
  return {
    slug,
    correct: 0,
    total: 0,
    level: 1,
    streak: 0,
    words: {},
    byType: emptyByType(),
  };
}

export function getDefaultGameState(): GameState {
  return {
    coins: 0,
    totalCoinsEarned: 0,
    badges: [],
    totalCorrect: 0,
    bestStreak: 0,
    lastSessionDate: null,
  };
}

/** Mastery percentage (0-100). Words with no attempts have mastery 0. */
export function getWordMastery(word: WordProgress): number {
  return word.attempts > 0 ? (word.correct / word.attempts) * 100 : 0;
}

// ─── Normalization (backward compatible with the legacy format) ───
// Old saved data (Record<slug, TopicProgress> without words/byType) must keep
// working: missing fields are merged with safe defaults on load.

function normalizeWord(raw: Partial<WordProgress> | undefined, fallbackEnglish: string): WordProgress {
  return {
    english: raw && typeof raw.english === "string" ? raw.english : fallbackEnglish,
    attempts: raw && typeof raw.attempts === "number" ? raw.attempts : 0,
    correct: raw && typeof raw.correct === "number" ? raw.correct : 0,
  };
}

export function normalizeTopicProgress(raw: Partial<TopicProgress>): TopicProgress {
  const words: Record<string, WordProgress> = {};
  if (raw.words && typeof raw.words === "object") {
    for (const [key, value] of Object.entries(raw.words)) {
      if (value && typeof value === "object") {
        words[key] = normalizeWord(value as Partial<WordProgress>, key);
      }
    }
  }

  const byType = emptyByType();
  if (raw.byType && typeof raw.byType === "object") {
    for (const type of EXERCISE_TYPES) {
      const stats = (raw.byType as Partial<Record<ExerciseType, Partial<ExerciseTypeStats>>>)[type];
      if (stats && typeof stats === "object") {
        byType[type] = {
          correct: typeof stats.correct === "number" ? stats.correct : 0,
          total: typeof stats.total === "number" ? stats.total : 0,
        };
      }
    }
  }

  return {
    slug: typeof raw.slug === "string" ? raw.slug : "",
    correct: typeof raw.correct === "number" ? raw.correct : 0,
    total: typeof raw.total === "number" ? raw.total : 0,
    level: typeof raw.level === "number" ? raw.level : 1,
    streak: typeof raw.streak === "number" ? raw.streak : 0,
    words,
    byType,
  };
}

// ─── Topic progress persistence ───

export function loadAllProgress(): Record<string, TopicProgress> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, TopicProgress> = {};
    for (const [slug, rawEntry] of Object.entries(parsed)) {
      if (rawEntry && typeof rawEntry === "object") {
        out[slug] = normalizeTopicProgress(rawEntry as Partial<TopicProgress>);
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveAllProgress(progress: Record<string, TopicProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadTopicProgress(topicId: string): { level: number; score: number } {
  const all = loadAllProgress();
  if (all[topicId]) {
    return { level: all[topicId].level, score: all[topicId].correct };
  }
  return { level: 1, score: 0 };
}

// ─── Game state persistence ───

export function getGameState(): GameState {
  if (typeof window === "undefined") return getDefaultGameState();
  try {
    const saved = localStorage.getItem(GAME_STORAGE_KEY);
    if (!saved) return getDefaultGameState();
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return getDefaultGameState();
    const raw = parsed as Partial<GameState>;
    return {
      coins: typeof raw.coins === "number" ? raw.coins : 0,
      totalCoinsEarned: typeof raw.totalCoinsEarned === "number" ? raw.totalCoinsEarned : 0,
      badges: Array.isArray(raw.badges) ? raw.badges : [],
      totalCorrect: typeof raw.totalCorrect === "number" ? raw.totalCorrect : 0,
      bestStreak: typeof raw.bestStreak === "number" ? raw.bestStreak : 0,
      lastSessionDate: typeof raw.lastSessionDate === "string" ? raw.lastSessionDate : null,
    };
  } catch {
    return getDefaultGameState();
  }
}

export function saveGameState(state: GameState) {
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (private mode, quota) — game state is best-effort.
  }
}

/** Apply one exercise result to the topic's word mastery + type stats. In-place. */
export function updateTopicWordResult(
  progress: TopicProgress,
  wordEnglish: string,
  exerciseType: ExerciseType,
  correct: boolean,
) {
  const key = wordEnglish.toLowerCase();
  const prevWord = progress.words[key];
  progress.words[key] = {
    english: wordEnglish,
    attempts: (prevWord?.attempts ?? 0) + 1,
    correct: (prevWord?.correct ?? 0) + (correct ? 1 : 0),
  };
  const prevType = progress.byType[exerciseType];
  progress.byType[exerciseType] = {
    correct: prevType.correct + (correct ? 1 : 0),
    total: prevType.total + 1,
  };
}