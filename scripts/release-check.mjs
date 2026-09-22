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

const maintenance = read('manutencao-maquinas.html');
requireText(maintenance, 'manutencao-maquinas-card.jpg', 'manutencao-maquinas.html');
requireText(maintenance, 'max-width:none', 'manutencao-maquinas.html');

const panel = read('painel-professor.html');
for (const id of ['banco-dados','jogos-digitais','desenvolvimento-web','projeto-de-vida','mundo-trabalho-4','fundamentos-redes','manutencao-maquinas']) requireText(panel, `id:'${id}'`, 'painel-professor.html');
for (const marker of ['Gerenciar professores','createTeacher','loadTeachers','setTeacherStatus']) requireText(panel, marker, 'painel-professor.html');

console.log('Homologação aprovada: 7 disciplinas, imagens, links e painel verificados.');

