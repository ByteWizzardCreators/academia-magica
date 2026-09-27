// Gamification: magic coins + graduated hints.
// Pure client-side rules — no AI involved.

import type { VocabWord } from "@/data/vocabulary";
import type { ExerciseType } from "@/types/exercises";
import {
  createEmptyTopicProgress,
  getGameState,
  loadAllProgress,
  markReadingCompleted,
  saveAllProgress,
  saveGameState,
  updateTopicWordResult,
} from "@/types/progress";

export interface Hint {
  text: string;
  cost: number;
}

const CORRECT_ANSWER_REWARD = 1;
const LEVEL_UP_REWARD = 3;
const READING_CORRECT_REWARD = 1;
const READING_COMPLETE_REWARD = 2;

/**
 * Graduated hints:
 * - level 1 (free): first letter of the english word
 * - level 2 (1 coin): IPA pronunciation
 * - level 3 (2 coins): spanish translation reveal
 */
export function getHint(word: VocabWord, level: 1 | 2 | 3): Hint {
  if (level === 1) {
    return { text: `Empieza con la letra "${word.english.charAt(0).toUpperCase()}"`, cost: 0 };
  }
  if (level === 2) {
    return { text: `Se pronuncia ${word.ipa}`, cost: 1 };
  }
  return { text: `La traducción es "${word.spanish}"`, cost: 2 };
}

// ─── Coins ───

export function coinsAvailable(): number {
  return getGameState().coins;
}

export function canAfford(cost: number): boolean {
  return getGameState().coins >= cost;
}

/** Add earned coins and persist. Returns the new balance. */
export function addCoins(amount: number): number {
  const state = getGameState();
  state.coins += amount;
  state.totalCoinsEarned += amount;
  saveGameState(state);
  return state.coins;
}

/** Try to spend coins. Returns false when the balance is insufficient. */
export function spendCoins(cost: number): boolean {
  const state = getGameState();
  if (state.coins < cost) return false;
  state.coins -= cost;
  saveGameState(state);
  return true;
}

/** +3 coins bonus awarded on level up. */
export function awardLevelUpCoins(): number {
  return addCoins(LEVEL_UP_REWARD);
}

// ─── Exercise result recording ───

export interface ExerciseResultInput {
  topicSlug: string;
  wordEnglish: string;
  exerciseType: ExerciseType;
  correct: boolean;
}

/**
 * Persist one exercise outcome: per-word mastery, per-type stats, topic
 * totals, global correct count and the +1 coin reward.
 */
export function recordExerciseResult(input: ExerciseResultInput): void {
  const all = loadAllProgress();
  const entry = all[input.topicSlug] ?? createEmptyTopicProgress(input.topicSlug);

  entry.total += 1;
  if (input.correct) entry.correct += 1;
  updateTopicWordResult(entry, input.wordEnglish, input.exerciseType, input.correct);

  all[input.topicSlug] = entry;
  saveAllProgress(all);

  if (input.correct) {
    const state = getGameState();
    state.totalCorrect += 1;
    saveGameState(state);
    addCoins(CORRECT_ANSWER_REWARD);
  }
}

/** Session wrap-up: best streak + session date. */
export function finalizeSession(sessionBestStreak: number): void {
  const state = getGameState();
  state.bestStreak = Math.max(state.bestStreak, sessionBestStreak);
  state.lastSessionDate = new Date().toISOString().slice(0, 10);
  saveGameState(state);
}

// ─── Magic reading (Lectura Mágica) ───

export interface ReadingReward {
  /** Coins added by this reading session. */
  earned: number;
  /** True when the kid had never finished this reading before. */
  firstTime: boolean;
}

/**
 * Finish a magic reading: mark it as completed (deduped) and pay the coins.
 * +1 coin per correct question, plus a +2 coin bonus the first time only —
 * so kids can re-read a story to practice without farming the bonus.
 */
export function recordReadingResult(input: {
  readingId: string;
  correctAnswers: number;
}): ReadingReward {
  const firstTime = markReadingCompleted(input.readingId);
  const earned =
    input.correctAnswers * READING_CORRECT_REWARD +
    (firstTime ? READING_COMPLETE_REWARD : 0);
  if (earned > 0) addCoins(earned);
  return { earned, firstTime };
}