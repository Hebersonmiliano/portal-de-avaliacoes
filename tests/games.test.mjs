import test from 'node:test';
import assert from 'node:assert/strict';
import {classes} from '../server/security.mjs';
import {shortName} from '../server/games.mjs';
import {setup} from './api.test.mjs';

const turma=classes[0];
const result=(extra={})=>({game:'trilha-dev',name:'Maria Clara de Souza',turma,trail:'html',phase:0,xp:700,stars:2,firstTry:4,...extra});

test('Trilha Dev grava o melhor resultado de cada fase',async()=>{
 const {call,token}=await setup();
 const first=await call('game/result',result());
 assert.equal(first.status,200);
 assert.equal(first.data.xp,700);
 // Jogar de novo com menos pontos não rebaixa o recorde; mais pontos atualiza.
 assert.equal((await call('game/result',result({xp:500,stars:1}))).data.xp,700);
 const better=await call('game/result',result({name:'maria clara de souza',xp:900,stars:3,firstTry:5}));
 assert.equal(better.data.xp,900);
 assert.equal(better.data.stars,3);
 const list=await call('teacher/game-results?game=trilha-dev',undefined,token);
 assert.equal(list.status,200);
 assert.equal(list.data.results.length,1);
 assert.equal(list.data.results[0].plays,3);
 assert.equal(list.data.results[0].first_try,5);
});

test('Trilha Dev recusa dados inválidos e turma desconhecida',async()=>{
 const {call}=await setup();
 for(const bad of [{game:'outro'},{trail:'php'},{phase:6},{phase:-1},{xp:1501},{xp:1.5},{stars:4},{stars:0},{firstTry:6},{name:'A'},{name:'x'.repeat(41)},{turma:''}])
  assert.equal((await call('game/result',result(bad))).status,400,JSON.stringify(bad));
 assert.equal((await call('game/result',result({turma:'Turma que não existe'}))).status,404);
 assert.equal((await call('game/ranking?game=outro&turma='+encodeURIComponent(turma))).status,400);
});

test('Ranking público soma as fases e abrevia os nomes',async()=>{
 const {call}=await setup();
 await call('game/result',result({xp:600}));
 await call('game/result',result({phase:1,xp:500}));
 await call('game/result',result({name:'João Pedro Lima',xp:1200,stars:3}));
 await call('game/result',result({name:'Ana',xp:100,stars:1}));
 const ranking=await call('game/ranking?game=trilha-dev&turma='+encodeURIComponent(turma));
 assert.equal(ranking.status,200);
 assert.deepEqual(ranking.data.ranking,[
  {name:'João L.',xp:1200,stars:3,phases:1},
  {name:'Maria S.',xp:1100,stars:4,phases:2},
  {name:'Ana',xp:100,stars:1,phases:1},
 ]);
 assert.equal(shortName('  ana   beatriz  '),'ana B.');
});

test('Painel exige login e cada professor vê só as próprias turmas',async()=>{
 const {call,token}=await setup();
 assert.equal((await call('teacher/game-results?game=trilha-dev')).status,401);
 assert.equal((await call('teacher/accounts',{name:'Professora Teste',username:'prof.teste',password:'senha-do-professor'},token)).status,200);
 const teacher=(await call('login',{username:'prof.teste',password:'senha-do-professor'})).data.token;
 assert.equal((await call('teacher/classes',{name:'Turma da Professora'},teacher)).status,200);
 await call('game/result',result());
 await call('game/result',result({turma:'turma da professora',name:'Aluno da Professora'}));
 const mine=await call('teacher/game-results?game=trilha-dev',undefined,teacher);
 assert.deepEqual(mine.data.results.map(r=>r.name),['Aluno da Professora']);
 assert.equal(mine.data.results[0].turma,'Turma da Professora');
 assert.equal((await call('teacher/game-results?game=trilha-dev',undefined,token)).data.results.length,2);
 // O professor não remove aluno de turma alheia; o da própria turma, sim.
 assert.equal((await call('teacher/game-results/remove',{game:'trilha-dev',turma,name:'Maria Clara de Souza'},teacher)).status,404);
 assert.equal((await call('teacher/game-results/remove',{game:'trilha-dev',turma:'Turma da Professora',name:'Aluno da Professora'},teacher)).status,200);
 assert.equal((await call('teacher/game-results?game=trilha-dev',undefined,teacher)).data.results.length,0);
 assert.equal((await call('teacher/game-results?game=trilha-dev',undefined,token)).data.results.length,1);
});
