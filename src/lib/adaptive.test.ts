// Safety net for the protected-logic rules in src/lib/adaptive.ts:
// the 60/30/10 weighted draw and the 65% mastery gap threshold.
// These thresholds are explicitly frozen by docs/curriculum.md ("no tocamos la
// lógica adaptativa ni los umbrales"), so they are pinned here on purpose.

import { afterEach, describe, expect, it, vi } from "vitest";
import type { TopicData, VocabWord } from "@/data/vocabulary";
import type { PickReason } from "@/lib/adaptive";
import { pickNextWords } from "@/lib/adaptive";
import type { TopicProgress, WordProgress } from "@/types/progress";

function word(english: string, difficulty: 1 | 2 | 3 | 4 | 5 = 1): VocabWord {
  return { english, spanish: `es-${english}`, ipa: `/x/`, difficulty };
}

function topicOf(words: VocabWord[]): TopicData {
  return {
    id: "test-topic",
    name: "Test Topic",
    icon: "*",
    description: "synthetic topic used by the adaptive tests",
    order: 1,
    words,
  };
}

function record(english: string, attempts: number, correct: number): WordProgress {
  return { english, attempts, correct };
}

function progressOf(words: WordProgress[]): TopicProgress {
  return {
    slug: "test-topic",
    correct: 0,
    total: 0,
    level: 1,
    streak: 0,
    words: Object.fromEntries(words.map((w) => [w.english, w])),
    byType: {
      multiple_choice: { correct: 0, total: 0 },
      translation: { correct: 0, total: 0 },
      sentence_builder: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
    },
  };
}

/** Deterministic PRNG so the distribution test never flakes. */
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pickNextWords — mastery buckets", () => {
  // 50% mastery is below the 65% threshold → gap; 80% is above → strength;
  // a word with no record at all → explore.
  const words = [word("gapword"), word("strongword"), word("newword")];
  const topic = topicOf(words);
  const progress = progressOf([
    record("gapword", 10, 5),
    record("strongword", 10, 8),
  ]);

  it("routes a low-mastery word to the gap bucket", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const picked = pickNextWords(topic, progress, 1);
    expect(picked).toHaveLength(1);
    expect(picked[0].reason).toBe("gap");
    expect(picked[0].word.english).toBe("gapword");
  });

  it("routes a mastered word to the strength bucket", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const picked = pickNextWords(topic, progress, 1);
    expect(picked[0].reason).toBe("strength");
    expect(picked[0].word.english).toBe("strongword");
  });

  it("routes an untouched word to the explore bucket", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.95);
    const picked = pickNextWords(topic, progress, 1);
    expect(picked[0].reason).toBe("explore");
    expect(picked[0].word.english).toBe("newword");
  });

  it("treats a word with zero attempts as untouched (explore), not as a gap", () => {
    const zeroProgress = progressOf([record("gapword", 0, 0)]);
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(pickNextWords(topic, zeroProgress, 1)[0].reason).toBe("explore");
  });

  it("treats a word with no record at all as untouched (explore)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(pickNextWords(topic, progressOf([]), 1)[0].reason).toBe("explore");
  });
});

describe("pickNextWords — 65% mastery gap threshold", () => {
  function reasonAtMastery(attempts: number, correct: number): PickReason {
    const single = topicOf([word("solo")]);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    return pickNextWords(single, progressOf([record("solo", attempts, correct)]), 1)[0]
      .reason;
  }

  it("classifies a word below 65% mastery as a gap", () => {
    expect(reasonAtMastery(100, 64)).toBe("gap");
  });

  it("classifies a word at exactly 65% mastery as strength (threshold is inclusive)", () => {
    expect(reasonAtMastery(100, 65)).toBe("strength");
  });

  it("classifies a word just under 65% as a gap (boundary, 13/20 = 65% excluded below)", () => {
    expect(reasonAtMastery(20, 12)).toBe("gap");
  });

  it("classifies 13/20 as strength, the exact 65% boundary", () => {
    expect(reasonAtMastery(20, 13)).toBe("strength");
  });

  it("classifies 100% mastery as strength", () => {
    expect(reasonAtMastery(4, 4)).toBe("strength");
  });

  it("classifies 0% mastery with attempts as a gap", () => {
    expect(reasonAtMastery(3, 0)).toBe("gap");
  });
});

describe("pickNextWords — 60/30/10 weights", () => {
  const words = [word("gapword"), word("strongword"), word("newword")];
  const topic = topicOf(words);
  const progress = progressOf([
    record("gapword", 10, 5),
    record("strongword", 10, 8),
  ]);

  function reasonForRoll(roll: number): PickReason {
    vi.spyOn(Math, "random").mockReturnValue(roll);
    return pickNextWords(topic, progress, 1)[0].reason;
  }

  it("draws gap for the first 60% of the range", () => {
    expect(reasonForRoll(0)).toBe("gap");
    expect(reasonForRoll(0.3)).toBe("gap");
    expect(reasonForRoll(0.59)).toBe("gap");
  });

  it("draws strength for the next 30% of the range", () => {
    expect(reasonForRoll(0.7)).toBe("strength");
    expect(reasonForRoll(0.85)).toBe("strength");
  });

  it("draws explore for the last 10% of the range", () => {
    expect(reasonForRoll(0.95)).toBe("explore");
    expect(reasonForRoll(0.999)).toBe("explore");
  });

  it("keeps the band edges closed on the lower side (0.6 → gap, 0.9 → strength)", () => {
    expect(reasonForRoll(0.6)).toBe("gap");
    expect(reasonForRoll(0.9)).toBe("strength");
  });

  it("redistributes the gap weight among the remaining pools when no gap words exist", () => {
    const noGaps = topicOf([word("strongword"), word("newword")]);
    const partial = progressOf([record("strongword", 10, 8)]);

    vi.spyOn(Math, "random").mockReturnValue(0.2);
    expect(pickNextWords(noGaps, partial, 1)[0].reason).toBe("strength");

    vi.spyOn(Math, "random").mockReturnValue(0.8);
    expect(pickNextWords(noGaps, partial, 1)[0].reason).toBe("explore");
  });

  it("always draws gap when gap is the only non-empty pool, whatever the roll", () => {
    const onlyGaps = topicOf([word("a"), word("b")]);
    const allGap = progressOf([record("a", 10, 1), record("b", 10, 2)]);

    for (const roll of [0, 0.5, 0.99]) {
      vi.spyOn(Math, "random").mockReturnValue(roll);
      expect(pickNextWords(onlyGaps, allGap, 1)[0].reason).toBe("gap");
    }
  });

  it("produces roughly 60/30/10 over many draws", () => {
    // Pools mirror the weights (6 gap / 3 strength / 1 explore) so the expected
    // split is the 60/30/10 rule rather than a pool-size artefact.
    const bigWords = [
      ...Array.from({ length: 6 }, (_, i) => word(`g${i}`)),
      ...Array.from({ length: 3 }, (_, i) => word(`s${i}`)),
      word("e0"),
    ];
    const bigProgress = progressOf([
      ...Array.from({ length: 6 }, (_, i) => record(`g${i}`, 10, 5)),
      ...Array.from({ length: 3 }, (_, i) => record(`s${i}`, 10, 8)),
    ]);
    const bigTopic = topicOf(bigWords);

    vi.spyOn(Math, "random").mockImplementation(mulberry32(20260927));

    const counts: Record<PickReason, number> = { gap: 0, strength: 0, explore: 0 };
    const draws = 2000;
    for (let i = 0; i < draws; i++) {
      counts[pickNextWords(bigTopic, bigProgress, 1)[0].reason] += 1;
    }

    expect(counts.gap / draws).toBeGreaterThan(0.55);
    expect(counts.gap / draws).toBeLessThan(0.65);
    expect(counts.strength / draws).toBeGreaterThan(0.25);
    expect(counts.strength / draws).toBeLessThan(0.35);
    expect(counts.explore / draws).toBeGreaterThan(0.05);
    expect(counts.explore / draws).toBeLessThan(0.15);
  });
});

describe("pickNextWords — gap pool prioritises the most errored words", () => {
  it("returns gap words ordered by descending error count", () => {
    const topic = topicOf([word("few"), word("many"), word("mid")]);
    // All three stay under the 65% threshold so they all land in the gap pool;
    // only the error count differs.
    const progress = progressOf([
      record("few", 2, 1), // 1 error, 50%
      record("many", 10, 4), // 6 errors, 40%
      record("mid", 4, 2), // 2 errors, 50%
    ]);

    const picked = pickNextWords(topic, progress, 3);
    expect(picked.map((p) => p.word.english)).toEqual(["many", "mid", "few"]);
    expect(picked.every((p) => p.reason === "gap")).toBe(true);
  });
});

describe("pickNextWords — no repeats and count handling", () => {
  const topic = topicOf([word("a"), word("b"), word("c")]);

  it("never repeats a word inside a single call", () => {
    const progress = progressOf([
      record("a", 10, 5),
      record("b", 10, 8),
    ]);
    const picked = pickNextWords(topic, progress, 3);
    const names = picked.map((p) => p.word.english);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toHaveLength(3);
  });

  it("returns exactly the requested count when enough words exist", () => {
    expect(pickNextWords(topic, progressOf([]), 2)).toHaveLength(2);
  });

  it("returns fewer than the requested count when the topic runs out of words", () => {
    expect(pickNextWords(topic, progressOf([]), 10)).toHaveLength(3);
  });

  it("returns an empty array for a count of zero", () => {
    expect(pickNextWords(topic, progressOf([]), 0)).toEqual([]);
  });

  it("returns an empty array for a topic with no words", () => {
    expect(pickNextWords(topicOf([]), progressOf([]), 5)).toEqual([]);
  });

  it("works with undefined progress by treating every word as untouched", () => {
    const picked = pickNextWords(topic, undefined, 3);
    expect(picked).toHaveLength(3);
    expect(picked.every((p) => p.reason === "explore")).toBe(true);
  });

  it("ignores progress keys that belong to other words", () => {
    const foreign = progressOf([record("zzz", 10, 0)]);
    const picked = pickNextWords(topic, foreign, 3);
    expect(picked.every((p) => p.reason === "explore")).toBe(true);
  });
});
