-- City Holder Daily Quiz Database Schema
-- Stores all questions and answers for the City Holder Daily game

CREATE TABLE IF NOT EXISTS city_holder_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_number INTEGER NOT NULL,
  date TEXT,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  option_2 TEXT,
  option_3 TEXT,
  option_4 TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_day_number ON city_holder_answers(day_number);
CREATE INDEX IF NOT EXISTS idx_date ON city_holder_answers(date);
CREATE INDEX IF NOT EXISTS idx_question_text ON city_holder_answers(question_text);

-- Create a unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_day_question ON city_holder_answers(day_number, question_number);
