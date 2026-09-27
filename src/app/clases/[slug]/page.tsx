"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getTopic, getWordByEnglish } from "@/data/vocabulary";
import type { TopicData, VocabWord } from "@/data/vocabulary";
import type { Exercise } from "@/types/exercises";
import { getReadingsByTopic } from "@/data/readings";
import type { Reading } from "@/data/readings";

// ─── Progress helpers (localStorage until auth) ───

import {
  loadAllProgress,
  saveAllProgress,
  loadTopicProgress,
  createEmptyTopicProgress,
  getGameState,
} from "@/types/progress";

// ─── Game mechanics (no AI) ───

import { pickNextWords } from "@/lib/adaptive";
import {
  getHint,
  recordExerciseResult,
  recordReadingResult,
  spendCoins,
  awardLevelUpCoins,
  finalizeSession,
} from "@/lib/gamification";
import type { Hint, ReadingReward } from "@/lib/gamification";
import { unlockBadges } from "@/lib/badges";
import type { BadgeDef } from "@/lib/badges";

// ─── Audio helper ───

function speak(text: string) {
  if (typeof window === "undefined") return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  // Try to pick a US English voice
  const voices = speechSynthesis.getVoices();
  const usVoice = voices.find(
    (v) => v.lang.startsWith("en-US") && !v.name.includes("Microsoft"),
  );
  if (usVoice) utterance.voice = usVoice;
  speechSynthesis.speak(utterance);
}

// ─── Modes ───

type Mode = "study" | "practice" | "reading" | "result";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const topic = getTopic(slug);

  // Load initial level from localStorage (lazy init — runs once)
  const initialLevel = topic ? loadTopicProgress(topic.id).level : 1;

  // Mode
  const [mode, setMode] = useState<Mode>("study");
  const [level, setLevel] = useState(initialLevel);

  // Exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0); // session correct answers
  const [streak, setStreak] = useState(0);
  const [peakStreak, setPeakStreak] = useState(0); // best streak within the session
  const [leveledUp, setLeveledUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game mechanics
  const [coins, setCoins] = useState(() => getGameState().coins);
  const [hintOpen, setHintOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, number[]>>({});
  const [newBadges, setNewBadges] = useState<BadgeDef[]>([]);

  // Magic reading (Lectura Mágica) — texts available for this topic
  const readings = useMemo(
    () => (topic ? getReadingsByTopic(topic.id) : []),
    [topic],
  );
  const [completedReadings, setCompletedReadings] = useState<string[]>(
    () => getGameState().completedReadings,
  );

  // Load voices for speech
  useEffect(() => {
    if (typeof window !== "undefined") {
      speechSynthesis.getVoices(); // Prime the voice list
    }
  }, []);

  const loadExercises = useCallback(async () => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    try {
      // Adaptive selection: 60/30/10 among gap / strength / explore words
      const topicProgress = loadAllProgress()[topic.id];
      const picked = pickNextWords(topic, topicProgress, 5);

      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: topic.id,
          level,
          count: 5,
          words: picked.map((p) => p.word.english),
        }),
      });
      if (!res.ok) throw new Error("Error al cargar ejercicios");
      const data = await res.json();
      setExercises(data.exercises);
      setCurrentIdx(0);
      setAnswer("");
      setSelectedOption(null);
      setFeedback(null);
      setHintOpen(false);
      setRevealedHints({});
      setMode("practice");
    } catch {
      setError("No pudimos cargar los ejercicios. ¡Intentalo de nuevo!");
    } finally {
      setLoading(false);
    }
  }, [topic, level]);

  const currentEx = exercises[currentIdx] as Exercise | undefined;

  // Persist one answered exercise (word mastery, type stats, coins)
  const recordAnswer = (isCorrect: boolean) => {
    if (!currentEx || !topic) return;
    if (isCorrect) {
      const nextStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(nextStreak);
      setPeakStreak((p) => Math.max(p, nextStreak));
    } else {
      setStreak(0);
    }
    recordExerciseResult({
      topicSlug: topic.id,
      wordEnglish: currentEx.target_word,
      exerciseType: currentEx.type,
      correct: isCorrect,
    });
    setCoins(getGameState().coins);
  };

  const handleOptionClick = (option: string) => {
    if (!currentEx || feedback) return;
    setSelectedOption(option);
    const isCorrect = option === currentEx.correct_answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    recordAnswer(isCorrect);
  };

  const handleSubmitText = () => {
    if (!currentEx || feedback) return;
    const isCorrect =
      answer.trim().toLowerCase() === currentEx.correct_answer.toLowerCase();
    setFeedback(isCorrect ? "correct" : "incorrect");
    recordAnswer(isCorrect);
  };

  const buyHint = (hintLevel: 2 | 3) => {
    if (!currentEx) return;
    const exWord = getWordByEnglish(currentEx.target_word);
    if (!exWord) return;
    const hint = getHint(exWord, hintLevel);
    if (hint.cost > 0 && !spendCoins(hint.cost)) return;
    setRevealedHints((prev) => ({
      ...prev,
      [currentEx.id]: [...(prev[currentEx.id] ?? []), hintLevel],
    }));
    setCoins(getGameState().coins);
  };

  const handleNext = () => {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((i) => i + 1);
      setAnswer("");
      setSelectedOption(null);
      setFeedback(null);
    } else {
      // Practice complete
      finishPractice();
    }
  };

  const finishPractice = () => {
    const totalAttempts = exercises.length;
    const correctCount = score;
    const pct = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    // Level up logic: 80%+ correct → advance
    let newLevel = level;
    let didLevelUp = false;
    if (pct >= 80 && level < 5) {
      newLevel = level + 1;
      didLevelUp = true;
    }

    setLevel(newLevel);
    setLeveledUp(didLevelUp);

    // Save level + session streak (correct/total/words/byType were already
    // recorded per exercise by recordExerciseResult)
    const prog = loadAllProgress();
    const entry = prog[topic!.id] ?? createEmptyTopicProgress(topic!.id);
    entry.level = newLevel;
    entry.streak = streak;
    prog[topic!.id] = entry;
    saveAllProgress(prog);

    if (didLevelUp) awardLevelUpCoins();
    finalizeSession(peakStreak);
    setCoins(getGameState().coins);

    // New achievements → banner on the result screen
    const unlocked = unlockBadges();
    if (unlocked.length > 0) setNewBadges(unlocked);

    setMode("result");
  };

  if (!topic) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <span className="text-6xl">🔮</span>
        <h1 className="text-2xl font-bold text-magic-purple">
          Tema no encontrado
        </h1>
        <p className="text-magic-text-light">
          Este tema no existe... ¡volví a las clases!
        </p>
        <button
          onClick={() => router.push("/clases")}
          className="magic-gradient rounded-xl px-6 py-2 font-bold text-white"
        >
          Volver a Clases
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* New badge banner */}
      {newBadges.length > 0 && (
        <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md">
          <div className="magic-card flex items-center gap-3 border-2 border-magic-gold/50 p-4 shadow-xl">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-magic-gold-dark">
                ¡Logro desbloqueado!
              </p>
              <div className="mt-1 space-y-0.5">
                {newBadges.map((badge) => (
                  <p key={badge.id} className="font-bold text-magic-purple">
                    {badge.emoji} {badge.name}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={() => setNewBadges([])}
              aria-label="Cerrar aviso de logro"
              className="rounded-full bg-magic-bg p-2 text-sm text-magic-text-light transition-colors hover:text-magic-purple"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Back link */}
      <button
        onClick={() => router.push("/clases")}
        className="mb-6 flex items-center gap-1 text-sm text-magic-text-light transition-colors hover:text-magic-purple"
      >
        ← Volver a clases
      </button>

      {/* Topic header */}
      <div className="magic-card mb-8 flex items-center gap-5 p-6">
        <span className="text-5xl">{topic.icon}</span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-magic-purple">
            {topic.name}
          </h1>
          <p className="mt-1 text-sm text-magic-text-light">
            {topic.words.length} palabras · Nivel {level}/5
          </p>
        </div>
        {/* Level indicator */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((l) => (
            <div
              key={l}
              className={`h-3 w-3 rounded-full ${
                l <= level ? "bg-magic-gold" : "bg-magic-bg-alt"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ─── STUDY MODE ─── */}
      {mode === "study" && (
        <>
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-magic-purple">
              📖 Estudiá las palabras
            </h2>
            <p className="text-sm text-magic-text-light">
              Tocá cada palabra para escuchar su pronunciación
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {topic.words.map((word) => (
              <WordCard key={word.english} word={word} />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {readings.length > 0 && (
              <button
                onClick={() => setMode("reading")}
                className="magic-gradient rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105"
              >
                📖 Leer historia
              </button>
            )}
            <button
              onClick={loadExercises}
              disabled={loading}
              className="magic-gradient rounded-2xl px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? "🔄 Preparando..." : "🎯 Practicar ahora"}
            </button>
          </div>
        </>
      )}

      {/* ─── READING MODE (Lectura Mágica) ─── */}
      {mode === "reading" && (
        <ReadingFlow
          topic={topic}
          readings={readings}
          coins={coins}
          completedReadings={completedReadings}
          onCoinsChange={() => setCoins(getGameState().coins)}
          onCompletedChange={() => setCompletedReadings(getGameState().completedReadings)}
          onBackToStudy={() => setMode("study")}
        />
      )}

      {/* ─── PRACTICE MODE ─── */}
      {mode === "practice" && currentEx && (
        <div className="magic-card p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between text-xs text-magic-text-light">
              <span>
                Ejercicio {currentIdx + 1} de {exercises.length}
              </span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1 rounded-full bg-magic-gold/15 px-2.5 py-1 font-bold text-magic-gold-dark">
                  🪙 {coins}
                </span>
                <span>🔥 {streak} seguidas</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-magic-bg-alt">
              <div
                className="h-full rounded-full bg-gradient-to-r from-magic-purple to-magic-gold transition-all"
                style={{
                  width: `${((currentIdx + 1) / exercises.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <h3 className="mb-2 text-lg font-bold text-magic-purple">
            {currentEx.type === "multiple_choice" && "🤔 Elegí la opción correcta"}
            {currentEx.type === "translation" && "✍️ Traducí la palabra"}
            {currentEx.type === "sentence_builder" && "🧩 Completá la oración"}
            {currentEx.type === "listening" && "🎧 Escuchá y escribí"}
          </h3>

          <p className="mb-6 text-xl font-semibold">{currentEx.question}</p>

          {/* Hint panel */}
          <div className="mb-4">
            <button
              onClick={() => setHintOpen((open) => !open)}
              className="rounded-xl border-2 border-magic-gold/40 bg-magic-gold/10 px-4 py-2 text-sm font-bold text-magic-gold-dark transition-all hover:bg-magic-gold/20"
            >
              💡 Pista {hintOpen ? "▲" : "▼"}
            </button>
            {hintOpen && (
              <HintPanel
                exercise={currentEx}
                coins={coins}
                revealed={revealedHints[currentEx.id] ?? []}
                onBuy={buyHint}
              />
            )}
          </div>

          {/* Audio button for listening exercises */}
          {currentEx.type === "listening" && (
            <div className="mb-4 text-center">
              <button
                onClick={() => speak(currentEx.target_word)}
                className="rounded-xl bg-magic-purple-light px-6 py-3 text-2xl text-white transition-all hover:scale-105"
              >
                🔈 Escuchar
              </button>
            </div>
          )}

          {/* Multiple choice options */}
          {currentEx.options && (
            <div className="grid gap-3 sm:grid-cols-2">
              {currentEx.options.map((option, i) => {
                const isSelected = selectedOption === option;
                const isCorrectOption = option === currentEx.correct_answer;
                let bg = "bg-white border-magic-bg-alt hover:border-magic-purple/30";
                if (feedback) {
                  if (isCorrectOption) bg = "bg-green-50 border-green-400";
                  else if (isSelected) bg = "bg-red-50 border-red-400";
                  else bg = "bg-gray-50 border-gray-200 opacity-50";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(option)}
                    disabled={!!feedback}
                    className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${bg}`}
                  >
                    <span className="mr-2 text-magic-text-light">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Text input for translation / sentence builder */}
          {(currentEx.type === "translation" ||
            currentEx.type === "sentence_builder" ||
            currentEx.type === "listening") && (
            <div className="flex gap-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !feedback && handleSubmitText()}
                placeholder="Escribí tu respuesta..."
                disabled={!!feedback}
                className="flex-1 rounded-xl border-2 border-magic-bg-alt px-4 py-3 text-lg font-medium outline-none transition-all focus:border-magic-purple disabled:opacity-50"
                autoFocus
              />
              {!feedback && (
                <button
                  onClick={handleSubmitText}
                  className="magic-gradient rounded-xl px-6 py-3 font-bold text-white transition-all hover:scale-105"
                >
                  ✓
                </button>
              )}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-6 rounded-xl p-4 ${
                feedback === "correct"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="font-bold">
                {feedback === "correct" ? "✅ ¡Correcto!" : "❌ ¡Casi!"}
              </p>
              <p className="mt-1 text-sm">
                {feedback === "correct"
                  ? currentEx.explanation
                  : `La respuesta correcta era: "${currentEx.correct_answer}"`}
              </p>

              <button
                onClick={handleNext}
                className="mt-3 rounded-lg bg-white px-5 py-2 text-sm font-bold shadow-sm transition-all hover:shadow-md"
              >
                {currentIdx < exercises.length - 1
                  ? "Siguiente →"
                  : "Ver resultado 🏆"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── RESULT MODE ─── */}
      {mode === "result" && (
        <div className="magic-card text-center">
          <div className="p-8">
            <span className="text-6xl">
              {leveledUp ? "🎉" : streak >= 3 ? "🌟" : "👏"}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-magic-purple">
              {leveledUp
                ? `¡Subiste a nivel ${level}!`
                : streak >= 3
                  ? "¡Impresionante racha!"
                  : "¡Muy bien hecho!"}
            </h2>

            <div className="mx-auto mt-6 flex max-w-xs justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-magic-gold">
                  {score}/{exercises.length}
                </div>
                <div className="text-xs text-magic-text-light">Correctas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-magic-purple-light">
                  🔥{streak}
                </div>
                <div className="text-xs text-magic-text-light">Racha</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-magic-teal">
                  Nv.{level}
                </div>
                <div className="text-xs text-magic-text-light">Nivel</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-magic-gold-dark">
              🪙 {coins} monedas
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => {
                  setMode("study");
                  setExercises([]);
                  setNewBadges([]);
                }}
                className="rounded-xl border-2 border-magic-purple/20 px-6 py-2 font-bold text-magic-purple transition-all hover:bg-magic-bg-alt"
              >
                📖 Seguir estudiando
              </button>
              <button
                onClick={loadExercises}
                className="magic-gradient rounded-xl px-6 py-2 font-bold text-white transition-all hover:scale-105"
              >
                🎯 Practicar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hint Panel component ───

function HintPanel({
  exercise,
  coins,
  revealed,
  onBuy,
}: {
  exercise: Exercise;
  coins: number;
  revealed: number[];
  onBuy: (level: 2 | 3) => void;
}) {
  const exWord = getWordByEnglish(exercise.target_word);
  if (!exWord) return null;

  const hints: Hint[] = [getHint(exWord, 1), getHint(exWord, 2), getHint(exWord, 3)];

  return (
    <div className="mt-3 space-y-2 rounded-xl bg-magic-bg p-4 text-sm">
      <p className="text-xs font-bold text-magic-text-light">Pistas disponibles</p>
      {hints.map((hint, i) => {
        const level = (i + 1) as 1 | 2 | 3;
        const isRevealed = level === 1 || revealed.includes(level);

        if (isRevealed) {
          return (
            <p key={level} className="flex items-start gap-2 font-medium text-magic-text">
              <span>💡</span> {hint.text}
            </p>
          );
        }

        const affordable = coins >= hint.cost;
        return (
          <div key={level} className="flex items-center justify-between gap-3">
            <span className="text-magic-text-light">Pista {level}</span>
            <button
              onClick={() => onBuy(level as 2 | 3)}
              disabled={!affordable}
              className="rounded-lg bg-magic-purple px-3 py-1.5 text-xs font-bold text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {affordable ? `Comprar · ${hint.cost} 🪙` : `Necesitás ${hint.cost} 🪙`}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Word Card component ───

function WordCard({ word }: { word: VocabWord }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => {
        setFlipped(!flipped);
        if (!flipped) speak(word.english);
      }}
      className={`magic-card flex cursor-pointer items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        flipped ? "border-magic-gold/50" : ""
      }`}
    >
      {/* Difficulty dots */}
      <div className="flex flex-col gap-0.5">
        {[1, 2, 3, 4, 5].map((d) => (
          <div
            key={d}
            className={`h-1.5 w-1.5 rounded-full ${
              d <= word.difficulty ? "bg-magic-purple-light" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Word content */}
      <div className="flex-1">
        {flipped ? (
          <>
            <p className="text-lg font-bold text-magic-purple">
              {word.spanish}
            </p>
            <p className="text-xs text-magic-text-light">{word.ipa}</p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-magic-text">{word.english}</p>
            <p className="text-xs text-magic-text-light">Tocá para ver →</p>
          </>
        )}
      </div>

      {/* Audio button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          speak(word.english);
        }}
        className="rounded-full bg-magic-bg-alt p-2 text-sm transition-colors hover:bg-magic-purple/10"
      >
        🔈
      </button>
    </div>
  );
}

// ─── Magic reading (Lectura Mágica) ───

/** picker → text → questions → done */
type ReadingStage = "picker" | "text" | "questions" | "done";

function ReadingFlow({
  topic,
  readings,
  coins,
  completedReadings,
  onCoinsChange,
  onCompletedChange,
  onBackToStudy,
}: {
  topic: TopicData;
  readings: Reading[];
  coins: number;
  completedReadings: string[];
  onCoinsChange: () => void;
  onCompletedChange: () => void;
  onBackToStudy: () => void;
}) {
  const [stage, setStage] = useState<ReadingStage>("picker");
  const [reading, setReading] = useState<Reading | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [reward, setReward] = useState<ReadingReward | null>(null);

  const readingsLabel =
    readings.length === 1 ? "1 historia" : `${readings.length} historias`;

  const resetAnswers = () => {
    setQuestionIdx(0);
    setSelectedOption(null);
    setFeedback(null);
    setCorrectCount(0);
  };

  const openReading = (target: Reading) => {
    setReading(target);
    setReward(null);
    resetAnswers();
    setStage("text");
  };

  const backToPicker = () => {
    setReading(null);
    setReward(null);
    resetAnswers();
    setStage("picker");
  };

  const startQuestions = () => {
    resetAnswers();
    setStage("questions");
  };

  const currentQuestion = reading?.questions[questionIdx];

  const handleReadingOption = (option: string) => {
    if (!currentQuestion || feedback) return;
    setSelectedOption(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const finishReading = () => {
    if (!reading) return;
    // Coins + completion marking live in the gamification layer.
    const result = recordReadingResult({
      readingId: reading.id,
      correctAnswers: correctCount,
    });
    setReward(result);
    onCompletedChange();
    onCoinsChange();
    setStage("done");
  };

  const handleReadingNext = () => {
    if (!reading) return;
    const isLast = questionIdx >= reading.questions.length - 1;
    if (isLast) {
      finishReading();
      return;
    }
    setQuestionIdx((i) => i + 1);
    setSelectedOption(null);
    setFeedback(null);
  };

  // No texts for this topic (yet) — friendly empty state
  if (readings.length === 0) {
    return (
      <div className="magic-card text-center">
        <div className="p-10">
          <span className="text-6xl">📚</span>
          <h2 className="mt-4 text-xl font-bold text-magic-purple">
            Todavía no hay historias
          </h2>
          <p className="mt-2 text-magic-text-light">
            Para {topic.name} todavía no escribimos una historia. ¡Pronto vas a
            poder leerla acá!
          </p>
          <button
            onClick={onBackToStudy}
            className="magic-gradient mt-6 rounded-xl px-6 py-3 font-bold text-white transition-all hover:scale-105"
          >
            📖 Volver a estudiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header — English title when a text is open */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-magic-purple">
          {reading ? `${reading.icon} ${reading.title}` : "📖 Lectura Mágica"}
        </h2>
        <p className="text-sm text-magic-text-light">
          {topic.name} · {readingsLabel}
        </p>
      </div>

      {/* ─── Picker ─── */}
      {stage === "picker" && (
        <>
          <div className="grid gap-3">
            {readings.map((r) => (
              <ReadingCard
                key={r.id}
                reading={r}
                completed={completedReadings.includes(r.id)}
                onOpen={() => openReading(r)}
              />
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={onBackToStudy}
              className="rounded-xl border-2 border-magic-purple/20 px-6 py-2 font-bold text-magic-purple transition-all hover:bg-magic-bg-alt"
            >
              ← Volver a estudiar
            </button>
          </div>
        </>
      )}

      {/* ─── Text ─── */}
      {stage === "text" && reading && (
        <>
          <div className="magic-card space-y-4 p-6">
            {reading.paragraphs.map((paragraph, i) => (
              <div key={i} className="flex items-start gap-3">
                <p className="flex-1 text-lg leading-relaxed text-magic-text">
                  {paragraph}
                </p>
                <button
                  onClick={() => speak(paragraph)}
                  aria-label={`Escuchar el párrafo ${i + 1}`}
                  className="rounded-full bg-magic-bg-alt p-2 text-sm transition-colors hover:bg-magic-purple/10"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={backToPicker}
              className="rounded-xl border-2 border-magic-purple/20 px-6 py-3 font-bold text-magic-purple transition-all hover:bg-magic-bg-alt"
            >
              ← Volver
            </button>
            <button
              onClick={startQuestions}
              className="magic-gradient rounded-2xl px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
            >
              Empezar preguntas →
            </button>
          </div>
        </>
      )}

      {/* ─── Questions ─── */}
      {stage === "questions" && reading && currentQuestion && (
        <div className="magic-card p-6">
          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between text-xs text-magic-text-light">
              <span>
                Pregunta {questionIdx + 1} de {reading.questions.length}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-magic-gold/15 px-2.5 py-1 font-bold text-magic-gold-dark">
                🪙 {coins}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-magic-bg-alt">
              <div
                className="h-full rounded-full bg-gradient-to-r from-magic-purple to-magic-gold transition-all"
                style={{
                  width: `${((questionIdx + 1) / reading.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <h3 className="mb-2 text-lg font-bold text-magic-purple">
            🤔 Leé y respondé
          </h3>
          <p className="mb-6 text-xl font-semibold">{currentQuestion.question}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              let bg = "bg-white border-magic-bg-alt hover:border-magic-purple/30";
              if (feedback) {
                if (isCorrectOption) bg = "bg-green-50 border-green-400";
                else if (isSelected) bg = "bg-red-50 border-red-400";
                else bg = "bg-gray-50 border-gray-200 opacity-50";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleReadingOption(option)}
                  disabled={!!feedback}
                  className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${bg}`}
                >
                  <span className="mr-2 text-magic-text-light">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div
              className={`mt-6 rounded-xl p-4 ${
                feedback === "correct"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="font-bold">
                {feedback === "correct" ? "✅ ¡Correcto!" : "❌ ¡Casi!"}
              </p>
              <p className="mt-1 text-sm">
                {feedback === "correct"
                  ? currentQuestion.explanation
                  : `La respuesta correcta era: "${currentQuestion.correctAnswer}". ${currentQuestion.explanation}`}
              </p>

              <button
                onClick={handleReadingNext}
                className="mt-3 rounded-lg bg-white px-5 py-2 text-sm font-bold shadow-sm transition-all hover:shadow-md"
              >
                {questionIdx < reading.questions.length - 1
                  ? "Siguiente →"
                  : "Ver resultado 🎉"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Done ─── */}
      {stage === "done" && reading && (
        <div className="magic-card text-center">
          <div className="p-8">
            <span className="text-6xl">🎉</span>
            <h2 className="mt-4 text-2xl font-bold text-magic-purple">
              ¡Historia leída!
            </h2>
            <p className="mt-1 text-magic-text-light">
              {reading.icon} {reading.title}
            </p>

            <div className="mx-auto mt-6 flex max-w-xs justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-magic-gold">
                  {correctCount}/{reading.questions.length}
                </div>
                <div className="text-xs text-magic-text-light">Correctas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-magic-purple-light">
                  +{reward?.earned ?? 0}
                </div>
                <div className="text-xs text-magic-text-light">Monedas</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-magic-gold-dark">
              🪙 {coins} monedas
            </div>

            {reward && !reward.firstTime && (
              <p className="mt-3 text-sm text-magic-text-light">
                ¡La leíste de nuevo! Por eso el bonus fue solo de las respuestas
                correctas.
              </p>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={onBackToStudy}
                className="rounded-xl border-2 border-magic-purple/20 px-6 py-2 font-bold text-magic-purple transition-all hover:bg-magic-bg-alt"
              >
                Volver a estudiar
              </button>
              <button
                onClick={backToPicker}
                className="magic-gradient rounded-xl px-6 py-2 font-bold text-white transition-all hover:scale-105"
              >
                📖 Leer otra historia
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Reading Card component ───

function ReadingCard({
  reading,
  completed,
  onOpen,
}: {
  reading: Reading;
  completed: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="magic-card flex w-full items-center gap-4 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="text-4xl">{reading.icon}</span>

      <div className="flex-1">
        <p className="text-lg font-bold text-magic-purple">{reading.title}</p>
        {reading.hint && (
          <p className="text-xs text-magic-text-light">{reading.hint}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          {/* Level dots */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((l) => (
              <div
                key={l}
                className={`h-1.5 w-1.5 rounded-full ${
                  l <= reading.level ? "bg-magic-gold" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-magic-text-light">
            Nivel {reading.level} · {reading.questions.length} preguntas
          </span>
        </div>
      </div>

      {completed ? (
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
          ✓ leída
        </span>
      ) : (
        <span className="text-sm text-magic-text-light">Tocá para leer →</span>
      )}
    </button>
  );
}