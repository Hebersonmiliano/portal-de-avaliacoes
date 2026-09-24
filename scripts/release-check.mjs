import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const requireFile = file => {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Arquivo obrigatório ausente: ${file}`);
};
const requireText = (content, text, file) => {
  if (!content.includes(text)) throw new Error(`Conteúdo obrigatório ausente em ${file}: ${text}`);
};

const disciplines = [
  ['Banco de Dados', 'banco-dados.html'],
  ['Programação de Jogos Digitais', 'jogos-digitais.html'],
  ['Desenvolvimento Web', 'desenvolvimento-web.html'],
  ['Projeto de Vida', 'projeto-de-vida.html'],
  ['Mundo do Trabalho 4.0', 'mundo-trabalho-4.html'],
  ['Fundamentos de Redes de Computadores', 'fundamentos-redes.html'],
  ['Técnico em Manutenção de Máquinas Industriais', 'manutencao-maquinas.html'],
];

const index = read('index.html');
requireText(index, '7 DISCIPLINAS', 'index.html');
if (index.includes('6 DISCIPLINAS')) throw new Error('O portal voltou a informar apenas 6 disciplinas.');
for (const [name, file] of disciplines) {
  requireText(index, name, 'index.html');
  requireText(index, `href="${file}"`, 'index.html');
  requireFile(file);
}

for (const image of [
  'banco-dados-imagem.png',
  'jogos-programacao.png',
  'desenvolvimento-web-imagem.png',
  'projeto-de-vida-card.jpg',
  'mundo-trabalho-4.jpg',
  'fundamentos-redes.jpg',
  'manutencao-maquinas-card.jpg',
]) requireFile(image);

for (const marker of [
  'games-card-image',
  'web-card-image',
  'maintenance-card-image',
  'jogos-programacao.png',
  'desenvolvimento-web-imagem.png',
  'manutencao-maquinas-card.jpg',
]) requireText(index, marker, 'index.html');

for (const file of ['jogos-digitais-trilha.html', 'jogos-digitais-simulado.html']) requireFile(file);
for (const link of ['jogos-digitais-trilha.html', 'jogos-digitais-simulado.html', 'jogos-digitais.html']) requireText(index, `href="${link}"`, 'index.html');
const gamesTrailProduction = read('jogos-digitais-trilha.html');
for (const marker of ['Missão: Construa seu Primeiro Jogo', 'Chefão final: Bug Supremo', 'portal-jogos-trilha-v2']) requireText(gamesTrailProduction, marker, 'jogos-digitais-trilha.html');
const gamesSimulationProduction = read('jogos-digitais-simulado.html');
for (const marker of ['Arena dos Desafios', 'Poder: eliminar opção', 'portal-jogos-simulado-v2']) requireText(gamesSimulationProduction, marker, 'jogos-digitais-simulado.html');
const gamesExamProduction = read('jogos-digitais.html');
for (const marker of ['Desafio Final: Portal dos 40 Códigos', 'Mapa dos 40 desafios', "const API='https://provabd.hebersonmiliano.chatgpt.site'"]) requireText(gamesExamProduction, marker, 'jogos-digitais.html');
for (const [content,file] of [[gamesTrailProduction,'jogos-digitais-trilha.html'],[gamesSimulationProduction,'jogos-digitais-simulado.html'],[gamesExamProduction,'jogos-digitais.html']]) {
  if (content.includes('AMBIENTE DE TESTE') || content.includes('homologacao.hebersonmiliano')) throw new Error(`Conteúdo de homologação encontrado em produção: ${file}`);
}

const maintenance = read('manutencao-maquinas.html');
requireText(maintenance, 'manutencao-maquinas-card.jpg', 'manutencao-maquinas.html');
requireText(maintenance, 'max-width:none', 'manutencao-maquinas.html');

const panel = read('painel-professor.html');
for (const id of ['banco-dados','jogos-digitais','desenvolvimento-web','projeto-de-vida','mundo-trabalho-4','fundamentos-redes','manutencao-maquinas']) requireText(panel, `id:'${id}'`, 'painel-professor.html');
for (const marker of ['Gerenciar professores','createTeacher','loadTeachers','setTeacherStatus']) requireText(panel, marker, 'painel-professor.html');

for (const file of ['teste/jogos-digitais-trilha.html', 'teste/jogos-digitais-simulado.html', 'teste/jogos-digitais.html']) requireFile(file);
const testIndex = read('teste/index.html');
for (const link of ['jogos-digitais-trilha.html', 'jogos-digitais-simulado.html', 'jogos-digitais.html']) requireText(testIndex, `href="${link}"`, 'teste/index.html');
const gamesTrail = read('teste/jogos-digitais-trilha.html');
for (const marker of ['const modules=', 'Planejamento e game design', 'GDevelop: cenas, objetos e instâncias', 'Testes, áudio, salvamento e publicação']) requireText(gamesTrail, marker, 'teste/jogos-digitais-trilha.html');
const gamesSimulation = read('teste/jogos-digitais-simulado.html');
for (const marker of ['const questions=', 'Arena dos Desafios', 'Floresta do Design', 'Poder: eliminar opção', 'jogos-digitais.html']) requireText(gamesSimulation, marker, 'teste/jogos-digitais-simulado.html');
const gamesExamTest = read('teste/jogos-digitais.html');
for (const marker of ['Desafio Final: Portal dos 40 Códigos', 'Mapa dos 40 desafios', 'Reino do Game Design', 'RANK ${rank}', 'portal-avaliacoes-homologacao.hebersonmiliano.chatgpt.site']) requireText(gamesExamTest, marker, 'teste/jogos-digitais.html');

console.log('Homologação aprovada: 7 disciplinas, imagens, links e painel verificados.');

