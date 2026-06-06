"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getTopic } from "@/data/vocabulary";
import type { VocabWord } from "@/data/vocabulary";
import type { Exercise } from "@/types/exercises";

// ─── Progress helpers (localStorage until auth) ───

interface TopicProgress {
  slug: string;
  correct: number;
  total: number;
  level: number;
  streak: number;
}

function loadTopicProgress(topicId: string): { level: number; score: number } {
  if (typeof window === "undefined") return { level: 1, score: 0 };
  try {
    const saved = localStorage.getItem("magic_progress");
    const prog = saved ? JSON.parse(saved) : {};
    if (prog[topicId]) {
      return { level: prog[topicId].level, score: prog[topicId].correct };
    }
  } catch {
    // ignore
  }
  return { level: 1, score: 0 };
}

function saveProgress(progress: Record<string, TopicProgress>) {
  localStorage.setItem("magic_progress", JSON.stringify(progress));
}

/** Load full progress object (for saving/merging) */
function getFullProgress(): Record<string, TopicProgress> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("magic_progress");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

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

type Mode = "study" | "practice" | "result";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const topic = getTopic(slug);

  // Load initial progress from localStorage (lazy init — runs once)
  const [initialLevel, initialScore] = topic
    ? [loadTopicProgress(topic.id).level, loadTopicProgress(topic.id).score]
    : [1, 0];

  // Mode
  const [mode, setMode] = useState<Mode>("study");
  const [level, setLevel] = useState(initialLevel);

  // Exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(initialScore);
  const [streak, setStreak] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_id: topic.id, level, count: 5 }),
      });
      if (!res.ok) throw new Error("Error al cargar ejercicios");
      const data = await res.json();
      setExercises(data.exercises);
      setCurrentIdx(0);
      setAnswer("");
      setSelectedOption(null);
      setFeedback(null);
      setMode("practice");
    } catch {
      setError("No pudimos cargar los ejercicios. ¡Intentalo de nuevo!");
    } finally {
      setLoading(false);
    }
  }, [topic, level]);

  const currentEx = exercises[currentIdx] as Exercise | undefined;

  const handleOptionClick = (option: string) => {
    if (feedback) return;
    setSelectedOption(option);
    const isCorrect = option === currentEx?.correct_answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleSubmitText = () => {
    if (!currentEx || feedback) return;
    const isCorrect =
      answer.trim().toLowerCase() === currentEx.correct_answer.toLowerCase();
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
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
    const pct = Math.round((correctCount / totalAttempts) * 100);

    // Level up logic: 80%+ correct → advance
    let newLevel = level;
    let didLevelUp = false;
    if (pct >= 80 && level < 5) {
      newLevel = level + 1;
      didLevelUp = true;
    }

    setLevel(newLevel);
    setLeveledUp(didLevelUp);

    // Save progress
    const prog = getFullProgress();
    prog[topic!.id] = {
      slug: topic!.id,
      correct: (prog[topic!.id]?.correct ?? 0) + correctCount,
      total: (prog[topic!.id]?.total ?? 0) + totalAttempts,
      level: newLevel,
      streak: streak,
    };
    saveProgress(prog);

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

          <div className="mt-8 text-center">
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

      {/* ─── PRACTICE MODE ─── */}
      {mode === "practice" && currentEx && (
        <div className="magic-card p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between text-xs text-magic-text-light">
              <span>
                Ejercicio {currentIdx + 1} de {exercises.length}
              </span>
              <span>🔥 {streak} seguidas</span>
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

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => {
                  setMode("study");
                  setExercises([]);
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
