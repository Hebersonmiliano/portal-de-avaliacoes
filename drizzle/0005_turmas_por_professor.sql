CREATE TABLE IF NOT EXISTS teacher_classes (
  id TEXT PRIMARY KEY,
  teacher_username TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (teacher_username) REFERENCES teachers(username)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_classes_owner_name
ON teacher_classes(teacher_username, name COLLATE NOCASE);

ALTER TABLE secure_codes ADD COLUMN teacher_username TEXT;
ALTER TABLE discipline_codes ADD COLUMN teacher_username TEXT;
ALTER TABLE exam_attempts ADD COLUMN teacher_username TEXT;
ALTER TABLE discipline_attempts ADD COLUMN teacher_username TEXT;
ALTER TABLE submissions ADD COLUMN teacher_username TEXT;
ALTER TABLE discipline_submissions ADD COLUMN teacher_username TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_teacher ON submissions(teacher_username);
CREATE INDEX IF NOT EXISTS idx_discipline_submissions_teacher ON discipline_submissions(discipline, teacher_username);
CREATE INDEX IF NOT EXISTS idx_secure_codes_teacher ON secure_codes(teacher_username);
CREATE INDEX IF NOT EXISTS idx_discipline_codes_teacher ON discipline_codes(discipline, teacher_username);
