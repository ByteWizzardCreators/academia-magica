"use client";

import { useState } from "react";
import Link from "next/link";
import { getTopicsInOrder } from "@/data/vocabulary";
import { loadAllProgress, getGameState } from "@/types/progress";
import type { TopicProgress, GameState } from "@/types/progress";
import { BADGES } from "@/lib/badges";
import type { BadgeDef } from "@/lib/badges";

type SkillKey = "vocabulario" | "escucha" | "construccion";

interface SkillStat {
  correct: number;
  total: number;
}

/**
 * Coins stat card. Rendered in the top stats overview and in the empty state, so a
 * kid with no activity yet still sees their balance instead of no coins at all.
 */
function CoinsStat({
  coins,
  totalCoinsEarned,
}: {
  coins: number;
  totalCoinsEarned: number;
}) {
  return (
    <div className="magic-card p-4 text-center">
      <div className="text-2xl font-bold text-magic-gold-dark">
        🪙{coins}
      </div>
      <div className="text-xs text-magic-text-light">
        {totalCoinsEarned} ganadas
      </div>
    </div>
  );
}

function loadDashboardData(): {
  progress: Record<string, TopicProgress>;
  maxStreak: number;
  game: GameState;
} {
  const progress = loadAllProgress();
  const maxStreak = Object.values(progress).reduce(
    (max, p) => Math.max(max, p.streak || 0),
    0,
  );
  const game = getGameState();
  return { progress, maxStreak, game };
}

export default function DashboardPage() {
  const [{ progress, maxStreak: totalStreak, game }] = useState(loadDashboardData);
  // Both topic grids follow the course sequence, not the catalogue layout.
  const topics = getTopicsInOrder();

  const hasProgress = Object.keys(progress).length > 0;
  const readingsDone = game.completedReadings.length;
  // Reading a story is progress too, even before the first exercise
  const hasActivity = hasProgress || readingsDone > 0;
  const totalCorrect = Object.values(progress).reduce((s, p) => s + p.correct, 0);
  const totalAttempts = Object.values(progress).reduce((s, p) => s + p.total, 0);
  // Belt and braces: normalization already clamps every topic record, but a raw
  // record that reached this point must never render a precision above 100.
  const overallPct = totalAttempts > 0
    ? Math.min(100, Math.round((totalCorrect / totalAttempts) * 100))
    : 0;
  const completedTopics = Object.keys(progress).length;

  // Get the topic with the most progress to suggest continuing
  const suggestedTopic = Object.entries(progress)
    .map(([s, p]) => ({ ...p, slug: s }))
    .sort((a, b) => (b.total - b.correct) - (a.total - a.correct)) // most to learn
    .find((p) => p.total > 0 && p.correct < p.total)?.slug;

  // ─── Competencia helpers ───

  // Mastery per topic: aggregated from per-word records (attempted words only)
  const topicMastery = (topicId: string): number => {
    const topicProgress = progress[topicId];
    if (!topicProgress) return 0;
    const words = Object.values(topicProgress.words);
    if (words.length === 0) return 0;
    const attempts = words.reduce((sum, w) => sum + w.attempts, 0);
    const correct = words.reduce((sum, w) => sum + w.correct, 0);
    return attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  };

  // Ability stats, consolidated from byType across all topics
  const skillStats = Object.values(progress).reduce<Record<SkillKey, SkillStat>>(
    (acc, p) => {
      acc.vocabulario.correct += p.byType.multiple_choice.correct + p.byType.translation.correct;
      acc.vocabulario.total += p.byType.multiple_choice.total + p.byType.translation.total;
      acc.escucha.correct += p.byType.listening.correct;
      acc.escucha.total += p.byType.listening.total;
      acc.construccion.correct += p.byType.sentence_builder.correct;
      acc.construccion.total += p.byType.sentence_builder.total;
      return acc;
    },
    {
      vocabulario: { correct: 0, total: 0 },
      escucha: { correct: 0, total: 0 },
      construccion: { correct: 0, total: 0 },
    },
  );

  const skillMeta: { key: SkillKey; label: string }[] = [
    { key: "vocabulario", label: "📖 Vocabulario" },
    { key: "escucha", label: "🎧 Escucha" },
    { key: "construccion", label: "🧩 Construcción" },
  ];

  const badgeDefById = new Map(BADGES.map((b) => [b.id, b]));
  const unlockedBadges = game.badges
    .map((b) => badgeDefById.get(b.id))
    .filter((b): b is BadgeDef => Boolean(b));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-center text-3xl font-bold text-magic-purple sm:text-4xl">
        📊 Mi Progreso
      </h1>
      <p className="mb-10 text-center text-magic-text-light">
        {hasActivity
          ? "Seguí mejorando día a día"
          : "Todavía no hiciste ejercicios. ¡Empezá con una clase!"}
      </p>

      {!hasActivity ? (
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
            <div className="mx-auto mt-6 w-full max-w-xs">
              <CoinsStat
                coins={game.coins}
                totalCoinsEarned={game.totalCoinsEarned}
              />
            </div>
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
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
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
            {/* Odd card out: full width on mobile, one of five from sm up */}
            <div className="col-span-2 sm:col-span-1">
              <CoinsStat
                coins={game.coins}
                totalCoinsEarned={game.totalCoinsEarned}
              />
            </div>
          </div>

          {/* Topic progress */}
          <h2 className="mb-4 text-lg font-bold text-magic-purple">
            Progreso por tema
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {topics.map((topic) => {
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

          {/* ─── Competencia section ─── */}
          <h2 className="mb-4 mt-10 text-lg font-bold text-magic-purple">
            🏆 Competencia
          </h2>

          {/* Readings + badges. Coins live in the top stats overview. */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="magic-card flex items-center gap-3 px-4 py-3">
              <span className="text-2xl">📖</span>
              <div>
                <div className="text-lg font-bold text-magic-purple">
                  {readingsDone}
                </div>
                <div className="text-xs text-magic-text-light">
                  Historias leídas
                </div>
              </div>
            </div>

            {unlockedBadges.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {unlockedBadges.map((badge) => (
                  <span
                    key={badge.id}
                    title={badge.desc}
                    className="magic-card flex cursor-help items-center gap-2 px-3 py-2 text-sm font-bold text-magic-purple"
                  >
                    <span className="text-xl">{badge.emoji}</span>
                    {badge.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="magic-card px-4 py-3 text-sm text-magic-text-light">
                Todavía no desbloqueaste logros. ¡Seguí practicando! ✨
              </div>
            )}
          </div>

          {/* Mastery per topic */}
          <div className="grid gap-4 sm:grid-cols-2">
            {topics.map((topic) => {
              const mastery = topicMastery(topic.id);
              const attempted =
                Object.keys(progress[topic.id]?.words ?? {}).length > 0;
              return (
                <div key={topic.id} className="magic-card flex items-center gap-4 p-4">
                  <span className="text-3xl">{topic.icon}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-bold text-magic-purple">
                        {topic.name}
                      </span>
                      {attempted && (
                        <span className="text-xs text-magic-text-light">
                          {mastery}%
                        </span>
                      )}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-magic-bg-alt">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-magic-teal to-magic-sky transition-all"
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                    <div className="mt-0.5 text-xs text-magic-text-light">
                      {attempted ? "Dominio" : "Sin datos todavía"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ability stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {skillMeta.map(({ key, label }) => {
              const stat = skillStats[key];
              const pct = stat.total > 0
                ? Math.round((stat.correct / stat.total) * 100)
                : 0;
              return (
                <div key={key} className="magic-card p-4 text-center">
                  <div className="text-sm font-bold text-magic-purple">
                    {label}
                  </div>
                  <div className="mt-1 text-xl font-bold text-magic-gold">
                    {stat.total > 0 ? `${pct}%` : "—"}
                  </div>
                  <div className="mt-0.5 text-xs text-magic-text-light">
                    {stat.correct}/{stat.total}
                  </div>
                </div>
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