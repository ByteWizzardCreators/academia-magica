"use client";

import Link from "next/link";
import { useState } from "react";
import { TOPICS } from "@/data/vocabulary";
import { loadAllProgress } from "@/types/progress";
import type { TopicProgress } from "@/types/progress";

export default function ClasesPage() {
  const [progress] = useState<Record<string, TopicProgress>>(loadAllProgress);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-magic-purple sm:text-5xl">
          📚 Clases Mágicas
        </h1>
        <p className="mt-3 text-lg text-magic-text-light">
          Elegí un tema y empezá a aprender inglés con el profesor mágico
        </p>
      </div>

      {/* Topic grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((topic) => {
          const prog = progress[topic.id];
          const pct = prog && prog.total > 0
            ? Math.round((prog.correct / prog.total) * 100)
            : 0;

          return (
            <Link
              key={topic.id}
              href={`/clases/${topic.id}`}
              className="magic-card group flex flex-col gap-3 p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <span className="text-3xl">{topic.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-magic-purple">
                    {topic.name}
                  </h2>
                  <span className="text-xs text-magic-text-light">
                    {topic.words.length} palabras
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-magic-text-light">
                {topic.description}
              </p>

              {/* Progress bar */}
              {prog && prog.total > 0 ? (
                <div className="mt-auto">
                  <div className="mb-1 flex items-center justify-between text-xs text-magic-text-light">
                    <span>Progreso</span>
                    <span>
                      Nivel {prog.level}/5 · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-magic-bg-alt">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-magic-purple to-magic-gold transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-auto text-xs font-semibold text-magic-gold-dark">
                  Empezar ahora →
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Stats footer */}
      <div className="mt-12 text-center text-sm text-magic-text-light">
        {TOPICS.reduce((sum, t) => sum + t.words.length, 0)} palabras en total
        {" · "}
        {TOPICS.length} temas
      </div>
    </div>
  );
}
