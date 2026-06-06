-- Academia Mágica — Initial Schema
-- Tables: profiles, topics, exercises, exercise_topics, progress, translations, daily_activity

-- Custom enums
CREATE TYPE user_role AS ENUM ('parent', 'child');
CREATE TYPE exercise_type AS ENUM ('translation', 'multiple_choice', 'listening', 'sentence_builder');

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role user_role NOT NULL DEFAULT 'child',
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vocabulary topics (e.g. Animals, Colors, Food)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '📚',
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exercise definitions
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type exercise_type NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- M:N join between exercises and topics
CREATE TABLE exercise_topics (
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, topic_id)
);

-- Per-user exercise progress
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  streak INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, exercise_id)
);

-- Translation cache
CREATE TABLE translations (
  phrase_hash TEXT PRIMARY KEY,
  phrase TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'es',
  response_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily activity tracking (for streaks)
CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercises_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, activity_date)
);

-- Indexes
CREATE INDEX idx_profiles_parent ON profiles(parent_id);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_exercises_topic ON exercises(topic_id);
CREATE INDEX idx_daily_activity_user ON daily_activity(user_id, activity_date);
CREATE INDEX idx_translations_lookup ON translations(phrase_hash);
