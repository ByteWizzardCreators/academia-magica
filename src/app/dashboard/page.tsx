"use client";

import { useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/data/vocabulary";

interface TopicProgress {
  slug: string;
  correct: number;
  total: number;
  level: number;
  streak: number;
}

function loadProgress(): { progress: Record<string, TopicProgress>; maxStreak: number } {
  if (typeof window === "undefined") return { progress: {}, maxStreak: 0 };
  try {
    const saved = localStorage.getItem("magic_progress");
    const parsed = saved ? (JSON.parse(saved) as Record<string, TopicProgress>) : {};
    const maxStreak = Object.values(parsed).reduce(
      (max, p) => Math.max(max, p.streak || 0),
      0,
    );
    return { progress: parsed, maxStreak };
  } catch {
    return { progress: {}, maxStreak: 0 };
  }
}

export default function DashboardPage() {
  const [{ progress, maxStreak: totalStreak }] = useState(loadProgress);

  const hasProgress = Object.keys(progress).length > 0;
  const totalCorrect = Object.values(progress).reduce((s, p) => s + p.correct, 0);
  const totalAttempts = Object.values(progress).reduce((s, p) => s + p.total, 0);
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const completedTopics = Object.keys(progress).length;

    // Get the topic with the most progress to suggest continuing
  const suggestedTopic = Object.entries(progress)
    .map(([s, p]) => ({ ...p, slug: s }))
    .sort((a, b) => (b.total - b.correct) - (a.total - a.correct)) // most to learn
    .find((p) => p.total > 0 && p.correct < p.total)?.slug;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-center text-3xl font-bold text-magic-purple sm:text-4xl">
        📊 Mi Progreso
      </h1>
      <p className="mb-10 text-center text-magic-text-light">
        {hasProgress
          ? "Seguí mejorando día a día"
          : "Todavía no hiciste ejercicios. ¡Empezá con una clase!"}
      </p>

      {!hasProgress ? (
        /* Empty state */
        <div className="magic-card text-center">
          <div className="p-12">
            <span className="text-6xl">🎯</span>
            <h2 className="mt-4 text-xl font-bold text-magic-purple">
              ¡Empezá a aprender!
            </h2>
            <p className="mt-2 text-magic-text-light">
              Elegí un tema y practicá para ver tu progreso acá
            </p>
            <Link
              href="/clases"
              className="magic-gradient mt-6 inline-block rounded-xl px-8 py-3 font-bold text-white transition-all hover:scale-105"
            >
              Ir a Clases 📚
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats overview */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="magic-card p-4 text-center">
              <div className="text-2xl font-bold text-magic-gold">
                {overallPct}%
              </div>
              <div className="text-xs text-magic-text-light">Precisión</div>
            </div>
            <div className="magic-card p-4 text-center">
              <div className="text-2xl font-bold text-magic-purple">
                {totalCorrect}
              </div>
              <div className="text-xs text-magic-text-light">Correctas</div>
            </div>
            <div className="magic-card p-4 text-center">
              <div className="text-2xl font-bold text-magic-teal">
                {completedTopics}
              </div>
              <div className="text-xs text-magic-text-light">Temas</div>
            </div>
            <div className="magic-card p-4 text-center">
              <div className="text-2xl font-bold text-magic-pink">
                🔥{totalStreak}
              </div>
              <div className="text-xs text-magic-text-light">Mejor racha</div>
            </div>
          </div>

          {/* Topic progress */}
          <h2 className="mb-4 text-lg font-bold text-magic-purple">
            Progreso por tema
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TOPICS.map((topic) => {
              const prog = progress[topic.id];
              const pct = prog && prog.total > 0
                ? Math.round((prog.correct / prog.total) * 100)
                : 0;

              return (
                <Link
                  key={topic.id}
                  href={`/clases/${topic.id}`}
                  className="magic-card flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="text-3xl">{topic.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-magic-purple">
                        {topic.name}
                      </span>
                      {prog && (
                        <span className="text-xs text-magic-text-light">
                          Nv.{prog.level}
                        </span>
                      )}
                    </div>
                    {prog && prog.total > 0 ? (
                      <>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-magic-bg-alt">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-magic-purple to-magic-gold transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-0.5 text-xs text-magic-text-light">
                          {prog.correct}/{prog.total} · {pct}%
                        </div>
                      </>
                    ) : (
                      <div className="mt-1 text-xs text-magic-text-light">
                        No empezado
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Suggested next action */}
          {suggestedTopic && (
            <div className="mt-8 text-center">
              <Link
                href={`/clases/${suggestedTopic}`}
                className="magic-gradient inline-flex items-center gap-2 rounded-xl px-8 py-3 font-bold text-white transition-all hover:scale-105"
              >
                📖 Seguir aprendiendo
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
