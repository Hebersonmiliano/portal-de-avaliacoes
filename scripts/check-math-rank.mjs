import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
import {database} from '../tests/database.mjs';

const env = {DB: database()};
const base = 'https://provabd.hebersonmiliano.chatgpt.site/api/game';
const headers = {Origin: 'https://hebersonmiliano.github.io', 'Content-Type': 'application/json'};
const score = {
  game: 'torneio-matematica', name: 'Aluna de Teste', turma: 'TORNEIO DE MATEMATICA',
  trail: 'medio', phase: 0, stars: 3, firstTry: 5,
};

for (const [points, expected] of [[635, 635], [720, 720], [630, 720]]) {
  const response = await worker.fetch(new Request(base + '/result', {
    method: 'POST', headers, body: JSON.stringify({...score, xp: points}),
  }), env);
  const result = await response.json();
  assert.equal(response.status, 200, `Envio do torneio rejeitado: ${JSON.stringify(result)}`);
  assert.equal(result.xp, expected);
}

const response = await worker.fetch(new Request(base + '/ranking?game=torneio-matematica&trail=medio', {headers}), env);
assert.equal(response.status, 200);
assert.equal((await response.json()).ranking[0]?.xp, 720);
console.log('Ranking de Matemática verificado no pacote que será publicado.');
