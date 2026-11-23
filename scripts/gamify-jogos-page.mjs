import fs from 'node:fs';

const path = 'jogos-digitais.html';
let html = fs.readFileSync(path, 'utf8');

html = html
  .replace('</style>', `.phase-map{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px}.phase-chip{padding:12px;border:1px solid #ffffff38;border-radius:12px;background:#ffffff12;font-weight:800}.phase-chip small{display:block;color:#c9b8ff;margin-top:4px}.mission-panel{background:linear-gradient(145deg,#15102b,#241449);border:1px solid #7c5cff;color:#fff}.mission-panel .muted{color:#d5cffa}.xp{color:#ffd84d;font-weight:900}.phase-title{margin:28px 0 10px;padding:14px 18px;border-radius:14px;background:linear-gradient(90deg,#47258e,#6842c2);color:#fff;box-shadow:0 8px 20px #47258e35}.q{border-left:5px solid #7656d8}.opt:has(input:checked){border-color:#6842c2;background:#f0eaff;box-shadow:0 0 0 2px #6842c222}.rank{font-size:22px;font-weight:900;color:#ffd84d;background:#21123e;padding:10px 14px;border-radius:10px;display:inline-block;margin:10px 0}@media(max-width:760px){.phase-map{grid-template-columns:1fr 1fr}}</style>`)
  .replace('<h1>Prova e Simulado</h1><p>40 questões • 0,25 ponto por questão • total 10,0 pontos</p>', '<h1>Desafio Final: Portal dos 40 Códigos</h1><p>Uma missão gamificada de nível fácil • 40 desafios • 10,0 pontos</p><div class="phase-map" aria-label="Mapa das fases"><div class="phase-chip">🗺️ Fase 1<small>Mundo do Jogo</small></div><div class="phase-chip">🧰 Fase 2<small>Ferramentas Web</small></div><div class="phase-chip">🚀 Fase 3<small>Carreira & Mercado</small></div><div class="phase-chip">👾 Chefão<small>Missão Final</small></div></div>')
  .replace('<section id="start" class="card">', '<section id="start" class="card mission-panel">')
  .replace('AVALIAÇÃO DISPONÍVEL', 'MISSÃO DISPONÍVEL')
  .replace('<h2>Identificação do aluno</h2>', '<h2>Prepare seu avatar</h2>')
  .replace('Informe seus dados e o código individual fornecido pelo professor.', 'Informe seus dados, receba acesso ao mapa e conquiste até 1.000 XP. Cada desafio vale 25 XP e 0,25 ponto.')
  .replace('Começar prova', 'Iniciar missão')
  .replace('<div class="muted"><span id="count">0</span>/40 respondidas</div>', '<div class="muted"><span id="phaseLabel">Fase 1 · Mundo do Jogo</span> • <span class="xp"><span id="xp">0</span> XP</span> • <span id="count">0</span>/40 desafios</div>')
  .replace('Finalizar prova', 'Concluir missão')
  .replace('Finalizar e enviar respostas', 'Vencer o chefão e enviar respostas')
  .replace('<span class="status">PROVA FINALIZADA</span><h2>Resultado</h2>', '<span class="status">MISSÃO CONCLUÍDA</span><h2>Resultado da aventura</h2><div id="rank" class="rank"></div>')
  .replace('Nota de 0 a 10. Resultado salvo no banco da disciplina Programação de Jogos Digitais.', 'Sua nota e seu protocolo foram salvos no banco da disciplina Programação de Jogos Digitais.')
  .replace("function render(qs){$('questions').innerHTML=qs.map((q,i)=>`<article class=\"q\"><h3>${i+1}. ${escapeHtml(q.text)}</h3>${q.options.map((o,j)=>`<label class=\"opt\"><input type=\"radio\" name=\"q${i}\" value=\"${j}\" onchange=\"answer(${i},${j})\">${String.fromCharCode(65+j)}) ${escapeHtml(o)}</label>`).join('')}</article>`).join('')}", "function render(qs){const phases=['🗺️ Fase 1 · Mundo do Jogo','🧰 Fase 2 · Ferramentas Web','🚀 Fase 3 · Carreira & Mercado','👾 Chefão Final · Integração'];$('questions').innerHTML=qs.map((q,i)=>(i%10===0?`<h2 class=\"phase-title\">${phases[i/10]} <small>· desafios ${i+1}–${i+10}</small></h2>`:'')+`<article class=\"q\"><h3>Desafio ${i+1}. ${escapeHtml(q.text)}</h3>${q.options.map((o,j)=>`<label class=\"opt\"><input type=\"radio\" name=\"q${i}\" value=\"${j}\" onchange=\"answer(${i},${j})\">${String.fromCharCode(65+j)}) ${escapeHtml(o)}</label>`).join('')}</article>`).join('')}")
  .replace("$('count').textContent=n;$('bar').style.width=(n/40*100)+'%'", "$('count').textContent=n;$('xp').textContent=n*25;const p=Math.min(3,Math.floor(n/10));$('phaseLabel').textContent=['Fase 1 · Mundo do Jogo','Fase 2 · Ferramentas Web','Fase 3 · Carreira & Mercado','Chefão Final'][p];$('bar').style.width=(n/40*100)+'%'")
  .replace("$('score').textContent=Number(data.score).toFixed(2);", "$('score').textContent=Number(data.score).toFixed(2);const s=Number(data.score);$('rank').textContent='RANK '+(s>=9?'S — Mestre do Código':s>=7?'A — Dev Aventureiro':s>=6?'B — Explorador Digital':'C — Continue treinando');")
  .replaceAll('Responda todas as 40 questões', 'Complete todos os 40 desafios')
  .replace('Deseja finalizar e enviar a prova?', 'Deseja concluir a missão e enviar suas respostas?');

if (!html.includes('Desafio Final: Portal dos 40 Códigos') || !html.includes('Mapa das fases') || !html.includes('RANK ')) throw new Error('A gamificação não foi aplicada por completo.');
fs.writeFileSync(path, html);
console.log('Página de Jogos Digitais gamificada.');

