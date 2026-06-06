// Manual types until supabase gen types runs
// TODO: run `npx supabase gen types typescript --linked > src/lib/supabase/types.ts`

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          role: "parent" | "child";
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          role: "parent" | "child";
          parent_id?: string | null;
          created_at?: string;
        };
      };
      topics: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          description: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string;
          description?: string | null;
          order?: number;
          created_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          type: "translation" | "multiple_choice" | "listening" | "sentence_builder";
          content: Record<string, unknown>;
          difficulty: number;
          topic_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: "translation" | "multiple_choice" | "listening" | "sentence_builder";
          content: Record<string, unknown>;
          difficulty?: number;
          topic_id?: string | null;
          created_at?: string;
        };
      };
      exercise_topics: {
        Row: {
          exercise_id: string;
          topic_id: string;
        };
        Insert: {
          exercise_id: string;
          topic_id: string;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          correct_count: number;
          total_attempts: number;
          last_attempt_at: string;
          streak: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          correct_count?: number;
          total_attempts?: number;
          last_attempt_at?: string;
          streak?: number;
        };
        Update: {
          id?: string;
          correct_count?: number;
          total_attempts?: number;
          last_attempt_at?: string;
          streak?: number;
        };
      };
      translations: {
        Row: {
          phrase_hash: string;
          phrase: string;
          language: string;
          response_json: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          phrase_hash: string;
          phrase: string;
          language: string;
          response_json: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          response_json?: Record<string, unknown>;
          created_at?: string;
        };
      };
      daily_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_date: string;
          exercises_completed: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_date: string;
          exercises_completed?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      exercise_type: "translation" | "multiple_choice" | "listening" | "sentence_builder";
      user_role: "parent" | "child";
    };
  };
}
