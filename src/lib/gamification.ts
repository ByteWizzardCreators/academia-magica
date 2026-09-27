// Gamification: magic coins + graduated hints.
// Pure client-side rules — no AI involved.

import type { VocabWord } from "@/data/vocabulary";
import type { Exercise, ExerciseType } from "@/types/exercises";
import {
  createEmptyTopicProgress,
  getGameState,
  loadAllProgress,
  markReadingCompleted,
  saveAllProgress,
  saveGameState,
  updateTopicWordResult,
} from "@/types/progress";

/**
 * What the UI has to do with a hint. `text` and `context` are read, `audio` is
 * spoken (SpeechSynthesis) — that is the whole reason this field exists.
 */
export type HintKind = "text" | "audio" | "context";

export interface Hint {
  /**
   * The hint payload: the sentence to read for a text/context hint, the word to
   * speak for an audio hint.
   */
  text: string;
  kind: HintKind;
  /** Coins to reveal this hint. 0 means free, so the UI never offers to buy it. */
  cost: number;
}

const CORRECT_ANSWER_REWARD = 1;
const LEVEL_UP_REWARD = 3;
const READING_CORRECT_REWARD = 1;
const READING_COMPLETE_REWARD = 2;
const AUDIO_HINT_COST = 1;
const CONTEXT_HINT_COST = 2;

/**
 * Graduated hints. Asking for help is never punished, so the two decoding aids
 * a kid needs most — the Spanish meaning and the written pronunciation — are
 * free and always available in the UI; only the ladder below is sold:
 * - level 1 (free): first letter of the english word
 * - level 2 (1 coin): listen to the word (audio, no text to read)
 * - level 3 (2 coins): the word used in a sentence
 *
 * Degradation: while a word has no curated example, level 3 falls back to the
 * free IPA hint — an empty hint is never shown and coins are never charged for
 * nothing. The UI hides any level 2 or 3 that comes back with cost 0.
 */
export function getHint(word: VocabWord, level: 1 | 2 | 3): Hint {
  if (level === 1) {
    return {
      kind: "text",
      text: `Empieza con la letra "${word.english.charAt(0).toUpperCase()}"`,
      cost: 0,
    };
  }
  if (level === 2) {
    return { kind: "audio", text: word.english, cost: AUDIO_HINT_COST };
  }
  if (word.example) {
    return { kind: "context", text: `Ejemplo: "${word.example}"`, cost: CONTEXT_HINT_COST };
  }
  return { kind: "text", text: `Se pronuncia ${word.ipa}`, cost: 0 };
}

/** The helps a kid can always ask for, no coins involved. */
export type FreeHelpKind = "translation" | "ipa";

/**
 * The part of an exercise the "Help ≠ Answer" rule has to read. A real
 * `Exercise` satisfies it; a test only needs the two fields.
 */
export type FreeHelpContext = Pick<Exercise, "type" | "direction">;

/**
 * "Help ≠ Answer" (curriculum section 8, point 9): free help must let the child
 * understand or continue the exercise WITHOUT handing over the correct answer.
 *
 * The question this answers is not "which exercise type is this?" but "does this
 * help reveal THIS exercise's answer?".
 * - The written pronunciation never does: reading `/kæt/` is a decoding aid.
 * - The Spanish meaning does whenever the Spanish spelling IS the expected
 *   answer: on a multiple choice (its options are the Spanish spellings) and on a
 *   translation in the `toSpanish` direction.
 * - It does not on a translation in the `toEnglish` direction — the question
 *   already contains the Spanish, so the panel would be redundant rather than
 *   revealing — nor on `listening` / `sentence_builder`, whose answers are the
 *   English word.
 *
 * A translation with no recorded direction is treated as revealing: the rule
 * assumes the worst when it cannot prove the help is harmless.
 */
export function revealsAnswer(kind: FreeHelpKind, exercise: FreeHelpContext): boolean {
  if (kind === "ipa") return false;
  if (exercise.type === "multiple_choice") return true;
  if (exercise.type === "translation") return exercise.direction !== "toEnglish";
  return false;
}

/**
 * Whether the free help may be shown right now. A revealing help waits for the
 * first attempt (`hasAttempted`); everything else is free from the start. Once
 * the child has tried, even a revealing help becomes free again: coins are never
 * the price of fundamental help.
 *
 * This is a visibility rule only. It never changes a price.
 */
export function canShowFreeHelp(
  kind: FreeHelpKind,
  exercise: FreeHelpContext,
  hasAttempted: boolean,
): boolean {
  return !revealsAnswer(kind, exercise) || hasAttempted;
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