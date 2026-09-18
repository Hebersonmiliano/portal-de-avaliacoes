CREATE TABLE IF NOT EXISTS teachers (
  username TEXT PRIMARY KEY COLLATE NOCASE,
  name TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_verifier TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

ALTER TABLE secure_teacher_sessions ADD COLUMN teacher_username TEXT;
ALTER TABLE secure_teacher_sessions ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';

CREATE INDEX IF NOT EXISTS idx_teacher_sessions_username
ON secure_teacher_sessions(teacher_username);
