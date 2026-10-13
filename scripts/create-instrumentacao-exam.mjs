import fs from 'node:fs';
import path from 'node:path';

for (const area of ['dist', 'dist/teste']) {
  const test = area.endsWith('teste');
  const file = path.join(area, 'metodologias-ageis.html');
  let page = fs.readFileSync(file, 'utf8');
  const changes = [
    ['Metodologias Ágeis', 'Fundamentos da Instrumentação'],
    ['METODOLOGIAS ÁGEIS', 'FUNDAMENTOS DA INSTRUMENTAÇÃO'],
    ['metodologias-ageis', 'instrumentacao'],
    ['Desafio Final: Fortaleza Ágil', 'Desafio Final: Central de Controle'],
    ['Maya · Estrategista da equipe', 'Lia · Técnica de instrumentação'],
    ['Maya', 'Lia'],
    ['portal-ageis-player-v1', 'portal-instrumentacao-player-v1'],
    ['portal-teste-ageis-player-v1', 'portal-teste-instrumentacao-player-v1'],
    ['Portal da Guilda', 'Sala de Medição'],
    ['Ponte das Entregas', 'Linha de Sinais'],
    ['Oficina da Equipe', 'Laboratório de Calibração'],
    ['Fortaleza Ágil', 'Central de Controle'],
    ['🎮', '👩🏽‍🔬'],
  ];
  page = page.replace('url("metodologias-ageis-hero.webp") center/cover', 'radial-gradient(circle at 82% 30%,#21b8ca88,transparent 32%),linear-gradient(110deg,#071a33,#0b5d73)');
  for (const [before, after] of changes) page = page.replaceAll(before, after);
  page = page.replace('40 desafios · 4 etapas · uma conquista', '40 situações · 4 etapas · uma conquista');
  page = page.replace('Seu avatar atravessará quatro mundos com 10 desafios cada.', 'Seu avatar atravessará quatro estações com 10 situações industriais cada.');
  page = page.replace('Prepare-se para atravessar os quatro mundos da avaliação.', 'Prepare-se para medir, interpretar sinais, calibrar e controlar processos.');
  page = page.replace('background:#dbf8ef;color:#075454', 'background:#d9f5f5;color:#075454');
  page = page.replace('🏁 Revise as questões marcadas antes de atravessar o portal final.', '🏁 Revise todas as respostas antes de concluir a prova.');
  page = page.replace('DESAFIO FINAL DISPONÍVEL', 'PROVA OFICIAL · 40 QUESTÕES');
  page = page.replace('<button class="btn" onclick="startExam()">Começar prova</button>', '<button id="startButton" class="btn" onclick="startExam()" disabled>Verificando disponibilidade…</button>');
  page = page.replace('const API=', 'const API=');
  page = page.replace("let attempt=null", "let examReady=false;let attempt=null");
  page = page.replace("async function startExam(){msg('startMsg','');", "async function startExam(){msg('startMsg','');if(!examReady)return msg('startMsg','A prova ainda não está disponível. Aguarde o professor.');");
  page = page.replace('const initialPlayer=examPlayer();', "async function checkExamReady(){const button=$('startButton');try{const state=await api('/api/health?discipline='+DISC);examReady=state.ready===true&&state.count>=40;button.disabled=!examReady;button.textContent=examReady?'Começar prova':'Prova em preparação';if(!examReady)msg('startMsg','A prova ainda não está disponível. Aguarde o professor.')}catch{button.disabled=true;button.textContent='Serviço indisponível';msg('startMsg','Não foi possível verificar a prova. Atualize a página mais tarde.')}}checkExamReady();const initialPlayer=examPlayer();");
  if (test && !page.includes('portal-avaliacoes-homologacao.hebersonmiliano.chatgpt.site')) throw Error('API de teste ausente');
  if (!test && page.includes('homologacao.hebersonmiliano')) throw Error('API de teste em produção');
  if (!page.includes("DISC='instrumentacao'")) throw Error('Disciplina incorreta');
  fs.writeFileSync(path.join(area, 'instrumentacao.html'), page);
}
