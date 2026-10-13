CREATE TABLE IF NOT EXISTS admin_classes (
  name TEXT PRIMARY KEY COLLATE NOCASE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO admin_classes (name, active, created_at) VALUES
('2° ANO TÉCNICO MATUTINO', 1, 'legacy'),
('2° ANO TÉCNICO VESPERTINO', 1, 'legacy'),
('2° ANO TÉCNICO VESPERTINO NAZIR', 1, 'legacy'),
('2° ANO TÉCNICO TRINDADE', 1, 'legacy'),
('1° ANO TÉCNICO TRINDADE', 1, 'legacy');
