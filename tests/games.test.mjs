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

const torneio=(extra={})=>({game:'torneio-matematica',name:'Ana Souza',turma,trail:'medio',phase:0,xp:640,stars:3,firstTry:5,...extra});

test('Torneio de Matemática grava a melhor rodada de cada nível',async()=>{
 const {call,token}=await setup();
 assert.equal((await call('game/result',torneio())).data.xp,640);
 assert.equal((await call('game/result',torneio({xp:300,stars:1}))).data.xp,640);
 assert.equal((await call('game/result',torneio({xp:2900}))).data.xp,2900);
 for(const bad of [{trail:'html'},{trail:'extremo'},{phase:1},{xp:3001}])
  assert.equal((await call('game/result',torneio(bad))).status,400,JSON.stringify(bad));
 // O teto da Trilha Dev continua 1500.
 assert.equal((await call('game/result',result({xp:2000}))).status,400);
 const list=await call('teacher/game-results?game=torneio-matematica',undefined,token);
 assert.equal(list.data.results.length,1);
 assert.equal(list.data.results[0].plays,3);
});

test('Ranking do Torneio filtra por nível ou soma os níveis',async()=>{
 const {call}=await setup();
 await call('game/result',torneio({xp:500}));
 await call('game/result',torneio({trail:'d4-dificil',xp:900}));
 await call('game/result',torneio({name:'Bruno Lima',xp:700}));
 const medio=await call('game/ranking?game=torneio-matematica&trail=medio&turma='+encodeURIComponent(turma));
 assert.equal(medio.data.trail,'medio');
 assert.deepEqual(medio.data.ranking.map(r=>[r.name,r.xp]),[['Bruno L.',700],['Ana S.',500]]);
 const d4=await call('game/ranking?game=torneio-matematica&trail=d4-dificil&turma='+encodeURIComponent(turma));
 assert.deepEqual(d4.data.ranking.map(r=>[r.name,r.xp]),[['Ana S.',900]]);
 const geral=await call('game/ranking?game=torneio-matematica&turma='+encodeURIComponent(turma));
 assert.deepEqual(geral.data.ranking.map(r=>[r.name,r.xp]),[['Ana S.',1400],['Bruno L.',700]]);
 assert.equal((await call('game/ranking?game=torneio-matematica&trail=html&turma='+encodeURIComponent(turma))).status,400);
 assert.equal((await call('game/ranking?game=trilha-dev&trail=medio&turma='+encodeURIComponent(turma))).status,400);
});

test('Torneio tem ranking global da escola; Trilha Dev continua exigindo turma',async()=>{
 const {call,token}=await setup();
 assert.equal((await call('teacher/classes',{name:'Turma B'},token)).status,200);
 await call('game/result',torneio({xp:500}));
 await call('game/result',torneio({turma:'Turma B',name:'Caio Rocha',xp:800}));
 const escola=await call('game/ranking?game=torneio-matematica&trail=medio');
 assert.equal(escola.status,200);
 assert.deepEqual(escola.data.ranking.map(r=>[r.name,r.turma,r.xp]),[['Caio R.','Turma B',800],['Ana S.',turma,500]]);
 assert.equal((await call('game/ranking?game=trilha-dev')).status,400);
});

test('Arena Dev grava torneio e treino e tem ranking da escola',async()=>{
 const {call}=await setup();
 const cup=(extra={})=>({game:'arena-dev',name:'Ana Souza',turma,trail:'torneio',phase:0,xp:4200,stars:2,firstTry:2,...extra});
 assert.equal((await call('game/result',cup())).status,200);
 assert.equal((await call('game/result',cup({xp:3000}))).status,200);
 assert.equal((await call('game/result',cup({trail:'treino',xp:5000,stars:3,firstTry:5}))).status,200);
 assert.equal((await call('game/result',cup({name:'Bruno Lima',xp:9000,stars:3,firstTry:3}))).status,200);
 for(const bad of [{trail:'medio'},{xp:15001},{phase:1}])
  assert.equal((await call('game/result',cup(bad))).status,400,JSON.stringify(bad));
 const torneio=await call('game/ranking?game=arena-dev&trail=torneio');
 assert.equal(torneio.status,200);
 assert.deepEqual(torneio.data.ranking.map(r=>[r.name,r.xp]),[['Bruno L.',9000],['Ana S.',4200]]);
 const turmaRank=await call('game/ranking?game=arena-dev&trail=treino&turma='+encodeURIComponent(turma));
 assert.deepEqual(turmaRank.data.ranking.map(r=>[r.name,r.xp]),[['Ana S.',5000]]);
});
