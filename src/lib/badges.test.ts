// Safety net for the 9 badge unlock rules in src/lib/badges.ts.
// The criteria are frozen by docs/curriculum.md (Fase A step 4 requires them to
// keep working), so every threshold is asserted explicitly here.

import { beforeEach, describe, expect, it } from "vitest";
import type { BadgeDef } from "@/lib/badges";
import { BADGES, checkNewBadges, unlockBadges } from "@/lib/badges";
import {
  createEmptyTopicProgress,
  getDefaultGameState,
  getGameState,
  saveAllProgress,
  saveGameState,
} from "@/types/progress";
import type { GameState, TopicProgress, WordProgress } from "@/types/progress";

function gameWith(overrides: Partial<GameState> = {}): GameState {
  return { ...getDefaultGameState(), ...overrides };
}

function topicWithLevel(slug: string, level: number): TopicProgress {
  const topic = createEmptyTopicProgress(slug);
  topic.level = level;
  return topic;
}

function topicWithWords(slug: string, words: WordProgress[]): TopicProgress {
  const topic = createEmptyTopicProgress(slug);
  topic.words = Object.fromEntries(words.map((w) => [w.english, w]));
  return topic;
}

function idsOf(badges: BadgeDef[]): string[] {
  return badges.map((b) => b.id);
}

beforeEach(() => {
  localStorage.clear();
});

describe("badge catalogue", () => {
  it("defines exactly the 9 badges from the curriculum", () => {
    expect(BADGES).toHaveLength(9);
  });

  it("uses unique ids", () => {
    const ids = idsOf(BADGES);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every badge a name, emoji, description and criteria", () => {
    for (const badge of BADGES) {
      expect(badge.name.length).toBeGreaterThan(0);
      expect(badge.emoji.length).toBeGreaterThan(0);
      expect(badge.desc.length).toBeGreaterThan(0);
      expect(badge.criteria.target).toBeGreaterThan(0);
    }
  });

  it("keeps the four topic badges pointed at existing slugs", () => {
    const topicBadges = BADGES.filter((b) => b.criteria.type === "topic_level");
    expect(idsOf(topicBadges)).toEqual([
      "animal_friend",
      "color_master",
      "number_ninja",
      "home_hero",
    ]);
    for (const badge of topicBadges) {
      expect(badge.criteria.topicSlug).toBeDefined();
      expect(badge.criteria.target).toBe(3);
    }
  });
});

describe("checkNewBadges — fresh state", () => {
  it("unlocks nothing on an empty progress and game state", () => {
    expect(checkNewBadges({}, getDefaultGameState())).toEqual([]);
  });

  it("unlocks nothing when a topic exists but has only just started", () => {
    const progress = { animales: topicWithLevel("animales", 1) };
    expect(checkNewBadges(progress, getDefaultGameState())).toEqual([]);
  });
});

describe("checkNewBadges — correct_total thresholds", () => {
  it("needs 10 correct answers for first_star", () => {
    expect(idsOf(checkNewBadges({}, gameWith({ totalCorrect: 9 })))).not.toContain(
      "first_star",
    );
    expect(idsOf(checkNewBadges({}, gameWith({ totalCorrect: 10 })))).toContain("first_star");
  });

  it("needs 25 correct answers for novice_wizard and not before", () => {
    expect(idsOf(checkNewBadges({}, gameWith({ totalCorrect: 24 })))).not.toContain(
      "novice_wizard",
    );
    expect(idsOf(checkNewBadges({}, gameWith({ totalCorrect: 25 })))).toContain(
      "novice_wizard",
    );
  });

  it("unlocks both total badges once both thresholds are passed", () => {
    const ids = idsOf(checkNewBadges({}, gameWith({ totalCorrect: 25 })));
    expect(ids).toContain("first_star");
    expect(ids).toContain("novice_wizard");
  });
});

describe("checkNewBadges — streak and coins thresholds", () => {
  it("needs a best streak of 3 for fire_streak", () => {
    expect(idsOf(checkNewBadges({}, gameWith({ bestStreak: 2 })))).not.toContain(
      "fire_streak",
    );
    expect(idsOf(checkNewBadges({}, gameWith({ bestStreak: 3 })))).toContain("fire_streak");
  });

  it("needs 30 lifetime coins for coin_collector, not the current balance", () => {
    expect(idsOf(checkNewBadges({}, gameWith({ totalCoinsEarned: 29, coins: 100 }))).length).toBe(
      0,
    );
    expect(
      idsOf(checkNewBadges({}, gameWith({ totalCoinsEarned: 30, coins: 0 }))),
    ).toContain("coin_collector");
  });
});

describe("checkNewBadges — topic_level thresholds", () => {
  it("unlocks only the badge of the topic that reached level 3", () => {
    const progress = { animales: topicWithLevel("animales", 3) };
    const ids = idsOf(checkNewBadges(progress, getDefaultGameState()));
    expect(ids).toEqual(["animal_friend"]);
  });

  it("needs level 3 and does not unlock at level 2", () => {
    const progress = { colores: topicWithLevel("colores", 2) };
    expect(checkNewBadges(progress, getDefaultGameState())).toEqual([]);
  });

  it("unlocks the remaining topic badges independently", () => {
    expect(idsOf(checkNewBadges({ numeros: topicWithLevel("numeros", 5) }, getDefaultGameState())))
      .toEqual(["number_ninja"]);
    expect(idsOf(checkNewBadges({ casa: topicWithLevel("casa", 3) }, getDefaultGameState())))
      .toEqual(["home_hero"]);
  });

  it("unlocks every topic badge once all four topics are at level 3", () => {
    const progress = {
      animales: topicWithLevel("animales", 3),
      colores: topicWithLevel("colores", 3),
      numeros: topicWithLevel("numeros", 3),
      casa: topicWithLevel("casa", 3),
    };
    expect(idsOf(checkNewBadges(progress, getDefaultGameState())).sort()).toEqual([
      "animal_friend",
      "color_master",
      "home_hero",
      "number_ninja",
    ]);
  });
});

describe("checkNewBadges — words_dominated threshold", () => {
  function dominated(count: number, attempts = 5, correct = 5) {
    const words = Array.from({ length: count }, (_, i) => ({
      english: `w${i}`,
      attempts,
      correct,
    }));
    return { animales: topicWithWords("animales", words) };
  }

  it("needs 20 dominated words and not 19", () => {
    expect(checkNewBadges(dominated(19), getDefaultGameState())).toEqual([]);
    expect(idsOf(checkNewBadges(dominated(20), getDefaultGameState()))).toContain("word_tamer");
  });

  it("requires at least 5 attempts, so a perfect word with 4 attempts does not count", () => {
    expect(checkNewBadges(dominated(20, 4, 4), getDefaultGameState())).toEqual([]);
  });

  it("requires 80% mastery, so 3/5 does not count", () => {
    expect(checkNewBadges(dominated(20, 5, 3), getDefaultGameState())).toEqual([]);
  });

  it("counts exactly 80% mastery as dominated (4/5 and 8/10)", () => {
    expect(idsOf(checkNewBadges(dominated(20, 5, 4), getDefaultGameState()))).toContain(
      "word_tamer",
    );
    expect(idsOf(checkNewBadges(dominated(20, 10, 8), getDefaultGameState()))).toContain(
      "word_tamer",
    );
  });

  it("counts dominated words across all topics", () => {
    const progress = {
      animales: topicWithWords("animales", [
        { english: "a", attempts: 5, correct: 5 },
        { english: "b", attempts: 5, correct: 5 },
      ]),
      casa: topicWithWords("casa", [
        { english: "c", attempts: 5, correct: 5 },
        { english: "d", attempts: 5, correct: 5 },
      ]),
    };
    expect(checkNewBadges(progress, getDefaultGameState())).toEqual([]);
  });
});

describe("unlockBadges", () => {
  it("unlocks nothing and persists nothing on a fresh state", () => {
    expect(unlockBadges()).toEqual([]);
    expect(getGameState().badges).toEqual([]);
  });

  it("unlocks the earned badge and persists it with a timestamp", () => {
    saveGameState(gameWith({ totalCorrect: 10 }));
    const newly = unlockBadges();
    expect(idsOf(newly)).toEqual(["first_star"]);

    const saved = getGameState().badges;
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe("first_star");
    expect(Number.isNaN(Date.parse(saved[0].unlockedAt))).toBe(false);
  });

  it("never unlocks the same badge twice", () => {
    saveGameState(gameWith({ totalCorrect: 10 }));
    unlockBadges();
    expect(unlockBadges()).toEqual([]);
    expect(getGameState().badges).toHaveLength(1);
  });

  it("keeps badges already unlocked before the call", () => {
    saveGameState(
      gameWith({
        totalCorrect: 25,
        badges: [{ id: "first_star", unlockedAt: "2020-01-01T00:00:00.000Z" }],
      }),
    );
    const newly = unlockBadges();
    expect(idsOf(newly)).toEqual(["novice_wizard"]);

    const saved = getGameState().badges;
    expect(saved).toHaveLength(2);
    expect(saved[0].unlockedAt).toBe("2020-01-01T00:00:00.000Z");
  });

  it("unlocks topic badges from persisted topic progress", () => {
    saveAllProgress({ animales: topicWithLevel("animales", 3) });
    expect(idsOf(unlockBadges())).toEqual(["animal_friend"]);
    expect(idsOf(unlockBadges())).toEqual([]);
  });
});
