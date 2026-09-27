// Safety net for the protected coin economy and hint contract in
// src/lib/gamification.ts.
//
// The hint ladder below is the Fase A contract from docs/curriculum.md section 8:
// hint 1 is the free first letter, hint 2 is the paid AUDIO of the english word
// and hint 3 is the paid contextual example — degrading to the free IPA hint
// when the word has no curated example yet (Fase B). The Spanish translation and
// the written pronunciation are free resources, so no hint may ever put them
// behind coins; the translation is free but contextual ("Help ≠ Answer",
// section 8 point 9), which the `canShowFreeHelp` block below pins. The coin
// rewards (+1 correct, +3 level up, reading rewards) are unchanged by both
// decisions and stay asserted exactly as before.

import { beforeEach, describe, expect, it } from "vitest";
import type { VocabWord } from "@/data/vocabulary";
import { TOPICS } from "@/data/vocabulary";
import {
  addCoins,
  awardLevelUpCoins,
  canAfford,
  canShowFreeHelp,
  coinsAvailable,
  finalizeSession,
  getHint,
  recordExerciseResult,
  recordReadingResult,
  revealsAnswer,
  spendCoins,
} from "@/lib/gamification";
import type { FreeHelpContext } from "@/lib/gamification";
import { getGameState, loadAllProgress } from "@/types/progress";

const DOG: VocabWord = { english: "dog", spanish: "perro", ipa: "/dɒɡ/", difficulty: 1 };
/** Fase B curates the examples; the hint 3 branch is exercised with a local one. */
const DOG_WITH_EXAMPLE: VocabWord = { ...DOG, example: "My dog is black." };
const HINT_LEVELS = [1, 2, 3] as const;

beforeEach(() => {
  localStorage.clear();
});

describe("addCoins", () => {
  it("returns the new balance", () => {
    expect(addCoins(1)).toBe(1);
    expect(addCoins(4)).toBe(5);
  });

  it("adds to both the spendable balance and the lifetime earnings", () => {
    addCoins(3);
    addCoins(2);
    const state = getGameState();
    expect(state.coins).toBe(5);
    expect(state.totalCoinsEarned).toBe(5);
  });

  it("persists the balance so a later read sees it", () => {
    addCoins(7);
    expect(coinsAvailable()).toBe(7);
    expect(getGameState().coins).toBe(7);
  });

  it("allows a negative delta to reduce the balance", () => {
    addCoins(10);
    expect(addCoins(-3)).toBe(7);
    expect(getGameState().totalCoinsEarned).toBe(7);
  });
});

describe("canAfford / spendCoins", () => {
  it("reports affordability against the current balance", () => {
    expect(canAfford(1)).toBe(false);
    addCoins(2);
    expect(canAfford(1)).toBe(true);
    expect(canAfford(2)).toBe(true);
    expect(canAfford(3)).toBe(false);
  });

  it("deducts the cost on a successful spend", () => {
    addCoins(5);
    expect(spendCoins(2)).toBe(true);
    expect(coinsAvailable()).toBe(3);
  });

  it("refuses a spend the kid cannot afford and leaves the balance untouched", () => {
    addCoins(1);
    expect(spendCoins(2)).toBe(false);
    expect(coinsAvailable()).toBe(1);
  });

  it("never lets a spend take the balance below zero", () => {
    addCoins(1);
    expect(spendCoins(5)).toBe(false);
    expect(coinsAvailable()).toBeGreaterThanOrEqual(0);
  });
});

describe("awardLevelUpCoins", () => {
  it("awards the +3 level-up bonus", () => {
    expect(awardLevelUpCoins()).toBe(3);
  });

  it("adds to the lifetime earnings as well", () => {
    awardLevelUpCoins();
    expect(getGameState().totalCoinsEarned).toBe(3);
  });
});

describe("getHint — hint ladder (curriculum section 8)", () => {
  it("hint 1 stays free and reveals the first letter of the english word", () => {
    const hint = getHint(DOG, 1);
    expect(hint.kind).toBe("text");
    expect(hint.cost).toBe(0);
    expect(hint.text).toContain("D");
  });

  it("hint 2 costs 1 coin and is an audio hint carrying the word to speak", () => {
    const hint = getHint(DOG, 2);
    expect(hint.kind).toBe("audio");
    expect(hint.cost).toBe(1);
    expect(hint.text).toBe(DOG.english);
  });

  it("hint 2 does not print the pronunciation — it has to be spoken", () => {
    expect(getHint(DOG, 2).text).not.toContain(DOG.ipa);
  });

  it("hint 3 costs 2 coins and reveals the curated example when there is one", () => {
    const hint = getHint(DOG_WITH_EXAMPLE, 3);
    expect(hint.kind).toBe("context");
    expect(hint.cost).toBe(2);
    expect(hint.text).toContain(DOG_WITH_EXAMPLE.example);
  });

  it("hint 3 degrades to the free IPA hint when the word has no example", () => {
    const hint = getHint(DOG, 3);
    expect(hint.kind).toBe("text");
    expect(hint.cost).toBe(0);
    expect(hint.text).toContain(DOG.ipa);
  });

  it("charges 0/1/2 with a curated example and 0/1/0 without one", () => {
    const costs = (word: VocabWord) =>
      HINT_LEVELS.map((level) => getHint(word, level).cost);
    expect(costs(DOG_WITH_EXAMPLE)).toEqual([0, 1, 2]);
    expect(costs(DOG)).toEqual([0, 1, 0]);
  });

  it("never charges for a hint that has nothing to show, across the whole catalogue", () => {
    for (const topic of TOPICS) {
      for (const word of topic.words) {
        const hint = getHint(word, 3);
        expect(hint.cost).toBe(word.example ? 2 : 0);
        expect(hint.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("never puts the Spanish translation behind coins", () => {
    for (const word of [DOG, DOG_WITH_EXAMPLE]) {
      for (const level of HINT_LEVELS) {
        expect(getHint(word, level).text).not.toContain(word.spanish);
      }
    }
  });
});

// "Help ≠ Answer" (curriculum section 8, point 9). The Spanish meaning and the
// written pronunciation are always free resources, so no hint may ever put them
// behind coins; the translation is only CONTEXTUAL. The gate is NOT by exercise
// type: it asks whether the help would hand over THIS exercise's correct answer.
// The Spanish meaning IS the answer on a multiple choice (its options are the
// Spanish spellings) and on a translation in the toSpanish direction; on toEnglish
// the question already gives the Spanish away, so the panel is redundant rather
// than revealing, and on listening/sentence_builder the answer is the English word.
// The written pronunciation never reveals anything. Visibility only: it never
// touches a price.
describe("canShowFreeHelp — «Help ≠ Answer» (curriculum section 8, point 9)", () => {
  const MULTIPLE_CHOICE: FreeHelpContext = { type: "multiple_choice" };
  const TO_SPANISH: FreeHelpContext = { type: "translation", direction: "toSpanish" };
  const TO_ENGLISH: FreeHelpContext = { type: "translation", direction: "toEnglish" };
  const LISTENING: FreeHelpContext = { type: "listening" };
  const SENTENCE_BUILDER: FreeHelpContext = { type: "sentence_builder" };
  /** No recorded direction, e.g. an exercise the API generated: assume the worst. */
  const UNKNOWN_DIRECTION: FreeHelpContext = { type: "translation" };

  // The Spanish translation would hand over the correct answer.
  const REVEALING: FreeHelpContext[] = [MULTIPLE_CHOICE, TO_SPANISH, UNKNOWN_DIRECTION];
  // The Spanish translation reveals nothing about the correct answer.
  const REDUNDANT: FreeHelpContext[] = [TO_ENGLISH, LISTENING, SENTENCE_BUILDER];
  const EVERY_EXERCISE: FreeHelpContext[] = [...REVEALING, ...REDUNDANT];

  it("keeps the Spanish translation locked wherever it IS the answer, until the first attempt", () => {
    for (const exercise of REVEALING) {
      expect(canShowFreeHelp("translation", exercise, false)).toBe(false);
      expect(canShowFreeHelp("translation", exercise, true)).toBe(true);
    }
  });

  it("offers the Spanish translation from the start wherever it reveals nothing", () => {
    for (const exercise of REDUNDANT) {
      expect(canShowFreeHelp("translation", exercise, false)).toBe(true);
      expect(canShowFreeHelp("translation", exercise, true)).toBe(true);
    }
  });

  it("always offers the written pronunciation, in every exercise and at any time", () => {
    for (const exercise of EVERY_EXERCISE) {
      for (const hasAttempted of [false, true]) {
        expect(canShowFreeHelp("ipa", exercise, hasAttempted)).toBe(true);
      }
    }
  });

  it("states the reveal decision per type and direction", () => {
    expect([
      revealsAnswer("translation", MULTIPLE_CHOICE),
      revealsAnswer("translation", TO_SPANISH),
      revealsAnswer("translation", TO_ENGLISH),
      revealsAnswer("translation", UNKNOWN_DIRECTION),
      revealsAnswer("translation", LISTENING),
      revealsAnswer("translation", SENTENCE_BUILDER),
      revealsAnswer("ipa", MULTIPLE_CHOICE),
      revealsAnswer("ipa", TO_SPANISH),
    ]).toEqual([
      true, // multiple choice: the options are the Spanish spellings
      true, // translation toSpanish: it asks for the Spanish spelling
      false, // translation toEnglish: the question already gave the Spanish away
      true, // direction unknown -> worst case assumed
      false, // listening: the answer is the english word
      false, // sentence_builder: the answer is the english word
      false, // pronunciation: a decoding aid, never the answer
      false,
    ]);
  });

  it("follows the full matrix from the curriculum", () => {
    const row = (label: string, exercise: FreeHelpContext) => [
      label,
      canShowFreeHelp("translation", exercise, false),
      canShowFreeHelp("translation", exercise, true),
      canShowFreeHelp("ipa", exercise, false),
      canShowFreeHelp("ipa", exercise, true),
    ];
    expect([
      row("multiple_choice", MULTIPLE_CHOICE),
      row("translation/toSpanish", TO_SPANISH),
      row("translation/toEnglish", TO_ENGLISH),
      row("translation/unknown", UNKNOWN_DIRECTION),
      row("listening", LISTENING),
      row("sentence_builder", SENTENCE_BUILDER),
    ]).toEqual([
      ["multiple_choice", false, true, true, true],
      ["translation/toSpanish", false, true, true, true],
      ["translation/toEnglish", true, true, true, true],
      ["translation/unknown", false, true, true, true],
      ["listening", true, true, true, true],
      ["sentence_builder", true, true, true, true],
    ]);
  });
});

describe("recordExerciseResult", () => {
  it("pays exactly +1 coin for a correct answer", () => {
    recordExerciseResult({
      topicSlug: "animales",
      wordEnglish: "dog",
      exerciseType: "multiple_choice",
      correct: true,
    });
    expect(coinsAvailable()).toBe(1);
  });

  it("pays nothing for an incorrect answer", () => {
    recordExerciseResult({
      topicSlug: "animales",
      wordEnglish: "dog",
      exerciseType: "multiple_choice",
      correct: false,
    });
    expect(coinsAvailable()).toBe(0);
  });

  it("accumulates one coin per correct answer across a session", () => {
    for (let i = 0; i < 3; i++) {
      recordExerciseResult({
        topicSlug: "animales",
        wordEnglish: "dog",
        exerciseType: "translation",
        correct: true,
      });
    }
    recordExerciseResult({
      topicSlug: "animales",
      wordEnglish: "cat",
      exerciseType: "translation",
      correct: false,
    });
    expect(coinsAvailable()).toBe(3);
  });

  it("increments the global correct counter only on correct answers", () => {
    recordExerciseResult({
      topicSlug: "animales",
      wordEnglish: "dog",
      exerciseType: "listening",
      correct: true,
    });
    recordExerciseResult({
      topicSlug: "animales",
      wordEnglish: "cat",
      exerciseType: "listening",
      correct: false,
    });
    expect(getGameState().totalCorrect).toBe(1);
  });

  it("records the topic totals, including the wrong answers", () => {
    recordExerciseResult({
      topicSlug: "animales",
      wordEnglish: "dog",
      exerciseType: "multiple_choice",
      correct: true,
    });
    recordExerciseResult({
      topicSlug: "animales",
      wordEnglish: "cat",
      exerciseType: "multiple_choice",
      correct: false,
    });

    const topic = loadAllProgress().animales;
    expect(topic.total).toBe(2);
    expect(topic.correct).toBe(1);
  });

  it("keeps per-word mastery in sync with the answers", () => {
    for (const correct of [true, false, true]) {
      recordExerciseResult({
        topicSlug: "animales",
        wordEnglish: "dog",
        exerciseType: "sentence_builder",
        correct,
      });
    }

    const topic = loadAllProgress().animales;
    expect(topic.words.dog).toEqual({ english: "dog", attempts: 3, correct: 2 });
    expect(topic.byType.sentence_builder).toEqual({ correct: 2, total: 3 });
  });

  it("creates the topic record on the first result of a new topic", () => {
    expect(loadAllProgress().colores).toBeUndefined();
    recordExerciseResult({
      topicSlug: "colores",
      wordEnglish: "red",
      exerciseType: "multiple_choice",
      correct: true,
    });
    const topic = loadAllProgress().colores;
    expect(topic.slug).toBe("colores");
    expect(topic.level).toBe(1);
    expect(topic.total).toBe(1);
  });

  it("keeps topic progress and the coin balance independent", () => {
    recordExerciseResult({
      topicSlug: "animales",
      wordEnglish: "dog",
      exerciseType: "multiple_choice",
      correct: true,
    });
    expect(loadAllProgress().animales.correct).toBe(1);
    expect(getGameState().totalCorrect).toBe(1);
    expect(coinsAvailable()).toBe(1);
  });
});

describe("recordReadingResult — magic reading rewards", () => {
  it("pays +1 per correct answer plus the +2 first-time bonus", () => {
    const reward = recordReadingResult({ readingId: "magic-lunch-menu", correctAnswers: 2 });
    expect(reward.earned).toBe(4);
    expect(reward.firstTime).toBe(true);
    expect(coinsAvailable()).toBe(4);
  });

  it("still pays the first-time bonus when no answer was correct", () => {
    const reward = recordReadingResult({ readingId: "magic-lunch-menu", correctAnswers: 0 });
    expect(reward.earned).toBe(2);
    expect(reward.firstTime).toBe(true);
    expect(coinsAvailable()).toBe(2);
  });

  it("does not repeat the bonus on a re-read but still pays per correct answer", () => {
    recordReadingResult({ readingId: "magic-lunch-menu", correctAnswers: 2 });
    const reread = recordReadingResult({ readingId: "magic-lunch-menu", correctAnswers: 2 });

    expect(reread.earned).toBe(2);
    expect(reread.firstTime).toBe(false);
    expect(coinsAvailable()).toBe(6);
  });

  it("keeps completed readings unique across repeated reads", () => {
    for (let i = 0; i < 4; i++) {
      recordReadingResult({ readingId: "wizards-note", correctAnswers: 1 });
    }
    expect(getGameState().completedReadings).toEqual(["wizards-note"]);
  });

  it("tracks each reading independently", () => {
    recordReadingResult({ readingId: "wizards-note", correctAnswers: 2 });
    const second = recordReadingResult({ readingId: "lunas-toys", correctAnswers: 1 });
    expect(second.firstTime).toBe(true);
    expect(getGameState().completedReadings).toEqual(["wizards-note", "lunas-toys"]);
  });

  it("pays per correct answer for a re-read with a worse score", () => {
    recordReadingResult({ readingId: "lunas-toys", correctAnswers: 2 });
    const reread = recordReadingResult({ readingId: "lunas-toys", correctAnswers: 1 });
    expect(reread.earned).toBe(1);
    expect(coinsAvailable()).toBe(5);
  });
});

describe("finalizeSession", () => {
  it("records the session date", () => {
    finalizeSession(2);
    expect(getGameState().lastSessionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("keeps the best streak when the session does not beat it", () => {
    addCoins(0);
    const state = getGameState();
    state.bestStreak = 7;
    localStorage.setItem("magic_game_state", JSON.stringify(state));

    finalizeSession(3);
    expect(getGameState().bestStreak).toBe(7);
  });

  it("raises the best streak when the session beats it", () => {
    finalizeSession(5);
    expect(getGameState().bestStreak).toBe(5);
    finalizeSession(2);
    expect(getGameState().bestStreak).toBe(5);
  });

  it("does not touch the coin balance", () => {
    addCoins(4);
    finalizeSession(3);
    expect(coinsAvailable()).toBe(4);
  });
});
