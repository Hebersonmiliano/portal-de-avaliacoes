import fs from 'node:fs';

for (const area of ['dist', 'dist/teste']) {
  const indexPath = `${area}/index.html`;
  let index = fs.readFileSync(indexPath, 'utf8');
  const cardStart = index.indexOf('<h3>Fundamentos da Instrumentação</h3>');
  const cardEnd = index.indexOf('</article>', cardStart);
  if (cardStart < 0 || cardEnd < 0) throw Error(`Card de Instrumentação ausente: ${indexPath}`);
  const card = index.slice(cardStart, cardEnd);
  const updatedCard = card.replace('Prova · em preparação', 'Prova · 40 questões').replace('<a class="btn" href="instrumentacao-simulado.html">2. Simulado</a>', '<a class="btn" href="instrumentacao-simulado.html">2. Simulado</a><a class="btn" href="instrumentacao.html">3. Prova</a>');
  index = index.slice(0, cardStart) + updatedCard + index.slice(cardEnd);
  fs.writeFileSync(indexPath, index);

  const panelPath = `${area}/painel-professor.html`;
  let panel = fs.readFileSync(panelPath, 'utf8');
  const addition = " {id:'instrumentacao',name:'Fundamentos da Instrumentação',desc:'Medição, sinais, calibração e controle de processos.',color:'#0b7082'},\n";
  if (!panel.includes("id:'instrumentacao'")) panel = panel.replace(/const DISCIPLINES=\[\r?\n/, match => match + addition);
  fs.writeFileSync(panelPath, panel);
}
