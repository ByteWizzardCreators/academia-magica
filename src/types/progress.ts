// Shared progress type used across classes + dashboard pages

export interface TopicProgress {
  slug: string;
  correct: number;
  total: number;
  level: number;
  streak: number;
}

export function loadAllProgress(): Record<string, TopicProgress> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("magic_progress");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveAllProgress(progress: Record<string, TopicProgress>) {
  localStorage.setItem("magic_progress", JSON.stringify(progress));
}

export function loadTopicProgress(topicId: string): { level: number; score: number } {
  const all = loadAllProgress();
  if (all[topicId]) {
    return { level: all[topicId].level, score: all[topicId].correct };
  }
  return { level: 1, score: 0 };
}
