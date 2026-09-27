// Safety net for the curated catalogue in src/data/vocabulary.ts.
//
// Fase A of docs/curriculum.md changes two things about this file:
//   1. the pedagogical order of the 14 topics (section 4), carried by the
//      `order` field. The physical array order is deliberately left alone — the
//      UI renders `getTopicsInOrder()` — so these tests pin the ORDER CONTRACT,
//      not the array layout.
//   2. the two words Stage 0 needs in `saludos` (hi, name).
//
// Progress is keyed by topic slug, so the slugs must never change: they are
// asserted explicitly below. That is what makes the reorder a zero-migration
// change.

import { describe, expect, it } from "vitest";
import {
  TOPICS,
  TOTAL_WORDS,
  getTopic,
  getTopicByOrder,
  getTopicsInOrder,
  getWordByEnglish,
} from "@/data/vocabulary";
import type { VocabWord } from "@/data/vocabulary";

/** Section 4 of docs/curriculum.md: the approved pedagogical sequence. */
const CURRICULUM_SEQUENCE = [
  "saludos",
  "colores",
  "numeros",
  "familia",
  "animales",
  "comida",
  "cuerpo",
  "ropa",
  "clima",
  "casa",
  "escuela",
  "emociones",
  "juguetes",
  "acciones",
] as const;

const ORDERS_1_TO_14 = Array.from({ length: 14 }, (_, i) => i + 1);

describe("topic order — curriculum section 4", () => {
  it("sorts the topics into the approved pedagogical sequence", () => {
    expect(getTopicsInOrder().map((t) => t.id)).toEqual([...CURRICULUM_SEQUENCE]);
  });

  it("numbers the topics 1 to 14 with no gaps and no duplicates", () => {
    expect(getTopicsInOrder().map((t) => t.order)).toEqual(ORDERS_1_TO_14);
  });

  it("keeps the 14 topic slugs stable, because progress is keyed by slug", () => {
    const catalogSlugs = TOPICS.map((t) => t.id).sort();
    expect(catalogSlugs).toEqual([...CURRICULUM_SEQUENCE].sort());
  });

  it("opens the course with greetings and closes it with actions", () => {
    expect(getTopicByOrder(1)?.id).toBe("saludos");
    expect(getTopicByOrder(14)?.id).toBe("acciones");
  });

  it("resolves every position of the sequence through getTopicByOrder", () => {
    for (const [index, slug] of CURRICULUM_SEQUENCE.entries()) {
      expect(getTopicByOrder(index + 1)?.id).toBe(slug);
    }
  });

  it("hands out a sorted copy, so a caller cannot reorder the catalogue", () => {
    const reordered = getTopicsInOrder();
    reordered.reverse();
    expect(getTopicsInOrder()[0]?.id).toBe("saludos");
  });
});

describe("saludos — Stage 0 content", () => {
  it("adds hi and name to the six curated greetings", () => {
    const greetings = getTopic("saludos")?.words ?? [];
    expect(greetings.map((w) => w.english)).toEqual([
      "hello",
      "goodbye",
      "bye",
      "sorry",
      "please",
      "thank you",
      "hi",
      "name",
    ]);
  });

  it("curates hi with the same shape as every other word", () => {
    const hi = getWordByEnglish("hi");
    expect(hi).toEqual({ english: "hi", spanish: "hola", ipa: "/haɪ/", difficulty: 1 });
  });

  it("curates name with the same shape as every other word", () => {
    const name = getWordByEnglish("name");
    expect(name).toEqual({
      english: "name",
      spanish: "nombre",
      ipa: "/neɪm/",
      difficulty: 1,
    });
  });

  it("keeps both new words at difficulty 1 so level 1 of saludos can teach them", () => {
    const greetings = getTopic("saludos")?.words ?? [];
    const added = greetings.filter((w) => w.english === "hi" || w.english === "name");
    expect(added).toHaveLength(2);
    expect(added.every((w) => w.difficulty === 1)).toBe(true);
  });

  it("shows eight words in the topic header, which reads words.length", () => {
    expect(getTopic("saludos")?.words).toHaveLength(8);
  });

  it("grows the catalogue from 158 to 160 words", () => {
    expect(TOTAL_WORDS).toBe(160);
  });
});

describe("catalogue integrity", () => {
  it("gives every word the full curated shape", () => {
    const words = TOPICS.flatMap((t) => t.words);
    expect(words).toHaveLength(TOTAL_WORDS);
    for (const word of words) {
      expect(word.english.length).toBeGreaterThan(0);
      expect(word.spanish.length).toBeGreaterThan(0);
      expect(word.ipa.startsWith("/")).toBe(true);
      expect([1, 2, 3, 4, 5]).toContain(word.difficulty);
    }
  });

  it("leaves the curated examples for Fase B: the field exists but is empty", () => {
    // The hint 3 degradation rule depends on this: with no example curated yet,
    // hint 3 has nothing to sell and degrades to the free IPA hint.
    const withoutExample = TOPICS.flatMap((t) =>
      t.words.filter((w: VocabWord) => w.example === undefined),
    );
    expect(withoutExample).toHaveLength(TOTAL_WORDS);
  });
});
