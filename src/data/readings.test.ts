// Data sanity net for src/data/readings.ts (Magic Reading content).
// These tests protect the invariants the curriculum states for the readings:
// 8 texts, 2 questions each, a correct answer that is one of the offered
// options, and vocabulary that actually exists in the linked topic.

import { describe, expect, it } from "vitest";
import {
  READINGS,
  TOTAL_READINGS,
  getAllReadings,
  getReadingsByTopic,
} from "@/data/readings";
import { TOPICS, getTopic } from "@/data/vocabulary";

const TOPIC_IDS = TOPICS.map((t) => t.id);

function englishWordsOf(topicId: string): Set<string> {
  const topic = getTopic(topicId);
  if (!topic) throw new Error(`unknown topic: ${topicId}`);
  return new Set(topic.words.map((w) => w.english));
}

describe("readings catalogue", () => {
  it("contains exactly the 8 readings", () => {
    expect(READINGS).toHaveLength(8);
  });

  it("exposes the same count through TOTAL_READINGS and getAllReadings", () => {
    expect(TOTAL_READINGS).toBe(8);
    expect(getAllReadings()).toHaveLength(8);
  });

  it("uses unique reading ids", () => {
    const ids = READINGS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links every reading to an existing topic", () => {
    for (const reading of READINGS) {
      expect(TOPIC_IDS).toContain(reading.topicId);
    }
  });

  it("covers 8 distinct topics, one reading per topic", () => {
    const topicIds = READINGS.map((r) => r.topicId);
    expect(new Set(topicIds).size).toBe(topicIds.length);
  });

  it("gives every reading a title, an icon and a valid level", () => {
    for (const reading of READINGS) {
      expect(reading.title.length).toBeGreaterThan(0);
      expect(reading.icon.length).toBeGreaterThan(0);
      expect(reading.level).toBeGreaterThanOrEqual(1);
      expect(reading.level).toBeLessThanOrEqual(5);
    }
  });

  it("keeps the text in 1 to 3 non-empty paragraphs", () => {
    for (const reading of READINGS) {
      expect(reading.paragraphs.length).toBeGreaterThanOrEqual(1);
      expect(reading.paragraphs.length).toBeLessThanOrEqual(3);
      for (const paragraph of reading.paragraphs) {
        expect(paragraph.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("reading questions", () => {
  it("has exactly 2 questions per reading", () => {
    for (const reading of READINGS) {
      expect(reading.questions).toHaveLength(2);
    }
  });

  it("offers the correct answer among the options", () => {
    for (const reading of READINGS) {
      for (const question of reading.questions) {
        expect(question.options).toContain(question.correctAnswer);
      }
    }
  });

  it("offers at least 2 and at most 3 distinct options per question", () => {
    for (const reading of READINGS) {
      for (const question of reading.questions) {
        expect(question.options.length).toBeGreaterThanOrEqual(2);
        expect(question.options.length).toBeLessThanOrEqual(3);
        expect(new Set(question.options).size).toBe(question.options.length);
      }
    }
  });

  it("spells the correct answer exactly as it appears in the options", () => {
    for (const reading of READINGS) {
      for (const question of reading.questions) {
        expect(question.options.filter((o) => o === question.correctAnswer)).toHaveLength(1);
      }
    }
  });

  it("asks a question and explains the answer for every question", () => {
    for (const reading of READINGS) {
      for (const question of reading.questions) {
        expect(question.question.trim().length).toBeGreaterThan(0);
        expect(question.explanation.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("reading vocabulary", () => {
  it("lists at least one vocabulary word per reading", () => {
    for (const reading of READINGS) {
      expect(reading.vocab.length).toBeGreaterThan(0);
    }
  });

  it("only uses vocabulary that exists in the linked topic", () => {
    for (const reading of READINGS) {
      const known = englishWordsOf(reading.topicId);
      const missing = reading.vocab.filter((word) => !known.has(word));
      expect({ reading: reading.id, missing }).toEqual({ reading: reading.id, missing: [] });
    }
  });

  it("does not repeat a vocabulary word inside a reading", () => {
    for (const reading of READINGS) {
      expect(new Set(reading.vocab).size).toBe(reading.vocab.length);
    }
  });
});

describe("getReadingsByTopic", () => {
  it("returns the readings of a topic that has one", () => {
    const lecturas = getReadingsByTopic("animales");
    expect(lecturas).toHaveLength(1);
    expect(lecturas[0].topicId).toBe("animales");
  });

  it("returns an empty array for a topic with no reading", () => {
    expect(getReadingsByTopic("ropa")).toEqual([]);
  });

  it("returns an empty array for an unknown topic", () => {
    expect(getReadingsByTopic("no-existe")).toEqual([]);
  });

  it("partitions the whole catalogue by topic", () => {
    const grouped = TOPIC_IDS.flatMap((id) => getReadingsByTopic(id));
    expect(grouped).toHaveLength(READINGS.length);
  });
});
