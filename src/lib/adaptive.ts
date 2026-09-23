// Adaptive word selection engine — 60/30/10 weighted draw.
// gap (weak mastery) 60%, strength (solid mastery) 30%, explore (untouched) 10%.
// Pure rule engine over per-word mastery stats — no AI involved.

import type { TopicData, VocabWord } from "@/data/vocabulary";
import type { TopicProgress, WordProgress } from "@/types/progress";
import { getWordMastery } from "@/types/progress";

export type PickReason = "gap" | "strength" | "explore";

export interface PickedWord {
  word: VocabWord;
  reason: PickReason;
}

const WEIGHTS: Record<PickReason, number> = {
  gap: 0.6,
  strength: 0.3,
  explore: 0.1,
};

const MASTERY_GAP_THRESHOLD = 65;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Mastery bucket for a word:
 * - explore: never attempted
 * - gap: attempts > 0 and mastery < 65%
 * - strength: mastery >= 65%
 */
function categorize(word: VocabWord, wordProgress: WordProgress | undefined): PickReason {
  if (!wordProgress || wordProgress.attempts === 0) return "explore";
  return getWordMastery(wordProgress) < MASTERY_GAP_THRESHOLD ? "gap" : "strength";
}

function errorCount(wordProgress: WordProgress | undefined): number {
  if (!wordProgress) return 0;
  return wordProgress.attempts - wordProgress.correct;
}

/**
 * Weighted category draw. Missing categories redistribute their weight
 * proportionally among the available ones (no gap words → strength picks up
 * 30/40 of the draw and explore 10/40).
 */
function drawCategory(pools: Record<PickReason, VocabWord[]>): PickReason | null {
  const available = (Object.keys(WEIGHTS) as PickReason[]).filter(
    (key) => pools[key].length > 0,
  );
  if (available.length === 0) return null;

  const totalWeight = available.reduce((sum, key) => sum + WEIGHTS[key], 0);
  let roll = Math.random() * totalWeight;
  for (const key of available) {
    roll -= WEIGHTS[key];
    if (roll <= 0) return key;
  }
  return available[available.length - 1];
}

/**
 * Pick `count` words for a practice session using the 60/30/10 rule.
 * - gap: most errored words first (stable priority)
 * - strength / explore: random within the pool
 * No repeats within a single call; returns fewer than `count` only when the
 * topic runs out of words.
 */
export function pickNextWords(
  topic: TopicData,
  topicProgress: TopicProgress | undefined,
  count: number,
): PickedWord[] {
  const byKey = topicProgress?.words ?? {};

  const pools: Record<PickReason, VocabWord[]> = { gap: [], strength: [], explore: [] };
  for (const word of topic.words) {
    pools[categorize(word, byKey[word.english.toLowerCase()])].push(word);
  }

  // Most errored words first within the gap pool; random elsewhere.
  pools.gap.sort(
    (a, b) =>
      errorCount(byKey[b.english.toLowerCase()]) -
      errorCount(byKey[a.english.toLowerCase()]),
  );
  pools.strength = shuffle(pools.strength);
  pools.explore = shuffle(pools.explore);

  const picked: PickedWord[] = [];
  for (let i = 0; i < count; i++) {
    const category = drawCategory(pools);
    if (!category) break;
    const word = pools[category].shift();
    if (!word) break;
    picked.push({ word, reason: category });
  }
  return picked;
}