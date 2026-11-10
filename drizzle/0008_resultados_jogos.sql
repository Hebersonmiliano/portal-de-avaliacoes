-- Resultados dos jogos de estudo (Trilha Dev). Guarda o melhor resultado de cada aluno em cada fase.
-- Não é nota oficial: a correção do jogo acontece no navegador do aluno.
CREATE TABLE IF NOT EXISTS game_results (
  game TEXT NOT NULL,
  turma TEXT NOT NULL COLLATE NOCASE,
  name TEXT NOT NULL COLLATE NOCASE,
  trail TEXT NOT NULL,
  phase INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  stars INTEGER NOT NULL,
  first_try INTEGER NOT NULL,
  plays INTEGER NOT NULL DEFAULT 1,
  first_at TEXT NOT NULL,
  at TEXT NOT NULL,
  PRIMARY KEY (game, turma, name, trail, phase)
);
