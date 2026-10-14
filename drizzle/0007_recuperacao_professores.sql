ALTER TABLE teachers ADD COLUMN email TEXT;
ALTER TABLE teachers ADD COLUMN email_verified_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_verified_email
ON teachers(email COLLATE NOCASE) WHERE email_verified_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS teacher_account_tokens (
  token_hash TEXT PRIMARY KEY,
  teacher_username TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK(purpose IN ('verify_email','reset_password')),
  pending_email TEXT,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (teacher_username) REFERENCES teachers(username)
);

CREATE INDEX IF NOT EXISTS idx_teacher_account_tokens_owner
ON teacher_account_tokens(teacher_username,purpose,expires_at);
