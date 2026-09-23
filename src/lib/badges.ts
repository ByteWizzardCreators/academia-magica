// Badge/achievement system — criteria evaluated against persisted progress.
// A word is "dominated" at mastery >= 80% with at least 5 attempts.

import type { GameState, TopicProgress } from "@/types/progress";
import {
  getGameState,
  getWordMastery,
  loadAllProgress,
  saveGameState,
} from "@/types/progress";

export type BadgeCriteriaType =
  | "correct_total"
  | "topic_level"
  | "coins_earned"
  | "streak"
  | "words_dominated";

export interface BadgeCriteria {
  type: BadgeCriteriaType;
  target: number;
  topicSlug?: string;
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  criteria: BadgeCriteria;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first_star",
    name: "Primera Estrella",
    emoji: "⭐",
    desc: "Respondé 10 ejercicios correctamente",
    criteria: { type: "correct_total", target: 10 },
  },
  {
    id: "novice_wizard",
    name: "Mago Novato",
    emoji: "🪄",
    desc: "Respondé 25 ejercicios correctamente",
    criteria: { type: "correct_total", target: 25 },
  },
  {
    id: "fire_streak",
    name: "Racha de Fuego",
    emoji: "🔥",
    desc: "Lográ una racha de 3 respuestas seguidas",
    criteria: { type: "streak", target: 3 },
  },
  {
    id: "coin_collector",
    name: "Coleccionista",
    emoji: "💰",
    desc: "Ganá 30 monedas mágicas",
    criteria: { type: "coins_earned", target: 30 },
  },
  {
    id: "word_tamer",
    name: "Domador de Palabras",
    emoji: "🐾",
    desc: "Dominá 20 palabras (80% de precisión en 5 intentos)",
    criteria: { type: "words_dominated", target: 20 },
  },
  {
    id: "animal_friend",
    name: "Amigo de los Animales",
    emoji: "🦁",
    desc: "Alcanzá el nivel 3 en Animales",
    criteria: { type: "topic_level", target: 3, topicSlug: "animales" },
  },
  {
    id: "color_master",
    name: "Maestro de los Colores",
    emoji: "🎨",
    desc: "Alcanzá el nivel 3 en Colores",
    criteria: { type: "topic_level", target: 3, topicSlug: "colores" },
  },
  {
    id: "number_ninja",
    name: "Ninja de los Números",
    emoji: "🔢",
    desc: "Alcanzá el nivel 3 en Números",
    criteria: { type: "topic_level", target: 3, topicSlug: "numeros" },
  },
  {
    id: "home_hero",
    name: "Héroe del Hogar",
    emoji: "🏠",
    desc: "Alcanzá el nivel 3 en Casa",
    criteria: { type: "topic_level", target: 3, topicSlug: "casa" },
  },
];

const DOMINATED_MIN_ATTEMPTS = 5;
const DOMINATED_MIN_MASTERY = 80;

function countDominatedWords(progress: Record<string, TopicProgress>): number {
  let count = 0;
  for (const topic of Object.values(progress)) {
    for (const word of Object.values(topic.words)) {
      if (
        word.attempts >= DOMINATED_MIN_ATTEMPTS &&
        getWordMastery(word) >= DOMINATED_MIN_MASTERY
      ) {
        count += 1;
      }
    }
  }
  return count;
}

function meetsCriteria(
  badge: BadgeDef,
  progress: Record<string, TopicProgress>,
  game: GameState,
): boolean {
  const { type, target, topicSlug } = badge.criteria;
  switch (type) {
    case "correct_total":
      return game.totalCorrect >= target;
    case "coins_earned":
      return game.totalCoinsEarned >= target;
    case "streak":
      return game.bestStreak >= target;
    case "topic_level":
      return topicSlug ? (progress[topicSlug]?.level ?? 0) >= target : false;
    case "words_dominated":
      return countDominatedWords(progress) >= target;
  }
  return false;
}

/** Badges whose criteria pass but are not unlocked yet. */
export function checkNewBadges(
  progress: Record<string, TopicProgress>,
  game: GameState,
): BadgeDef[] {
  const unlockedIds = new Set(game.badges.map((badge) => badge.id));
  return BADGES.filter(
    (badge) => !unlockedIds.has(badge.id) && meetsCriteria(badge, progress, game),
  );
}

/** Unlock + persist any newly earned badges. Returns them for the UI banner. */
export function unlockBadges(): BadgeDef[] {
  const progress = loadAllProgress();
  const game = getGameState();
  const newly = checkNewBadges(progress, game);
  if (newly.length === 0) return [];

  const now = new Date().toISOString();
  game.badges = [
    ...game.badges,
    ...newly.map((badge) => ({ id: badge.id, unlockedAt: now })),
  ];
  saveGameState(game);
  return newly;
}