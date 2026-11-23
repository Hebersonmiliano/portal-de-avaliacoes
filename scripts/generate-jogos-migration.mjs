import fs from 'node:fs';
import { jogosQuestions } from '../server/jogos-questions.mjs';

if (jogosQuestions.length !== 40) throw new Error('A prova deve ter exatamente 40 questões.');

const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const rows = jogosQuestions.map((question, index) => {
  const id = `q${String(index + 1).padStart(2, '0')}`;
  return `('jogos-digitais',${quote(id)},${quote(JSON.stringify(question))})`;
});

const sql = [
  '-- Atualiza somente o banco de questões de Jogos Digitais. Tentativas e notas antigas são preservadas.',
  "DELETE FROM discipline_question_bank WHERE discipline='jogos-digitais';",
  'INSERT INTO discipline_question_bank (discipline,id,payload) VALUES',
  rows.join(',\n') + ';',
  ''
].join('\n');

fs.writeFileSync('drizzle/0009_prova_jogos_gamificada.sql', sql);
console.log('Migração de Jogos Digitais gerada com 40 questões.');

