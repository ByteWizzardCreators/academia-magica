// Academia Mágica — Exercise Types
// Shared types for the exercise generation system

export type ExerciseType = "multiple_choice" | "translation" | "sentence_builder" | "listening";

/** A single exercise question presented to the user */
export interface Exercise {
  id: string;
  type: ExerciseType;
  difficulty: number;
  topic_id: string;

  /** The question text shown to the kid */
  question: string;

  /** Options for multiple choice (shuffled) */
  options?: string[];

  /** The correct answer */
  correct_answer: string;

  /** Hint or explanation after answering */
  explanation: string;

  /** The word(s) this exercise targets */
  target_word: string;
}

/** Result of a single exercise attempt */
export interface ExerciseAttempt {
  exercise_id: string;
  correct: boolean;
  answer_given: string;
}

/** Client-side session tracking progress within a practice session */
export interface SessionProgress {
  topic_id: string;
  level: number;
  correct: number;
  total: number;
  streak: number;
}

/** Server response from the exercise API */
export interface ExerciseResponse {
  exercise: Exercise;
  session: {
    correct: number;
    total: number;
    streak: number;
    level: number;
    level_up: boolean;
  };
}

/** Error response */
export interface ExerciseError {
  error: string;
  retry_after?: number;
}
