import {characters,missions,practice} from './instrumentacao-dados.js';

const mode=document.body.dataset.mode;
const playerKey='portal-instrumentacao-player-v1';
const simulationKey='portal-instrumentacao-simulado-v1';
const $=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let storageAvailable=true;
function read(key){try{return JSON.parse(localStorage.getItem(key))}catch{storageAvailable=false;return null}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{storageAvailable=false}showStorageWarning()}
function showStorageWarning(){if(!storageAvailable){$('storageWarning').hidden=false;$('storageWarning').textContent='O navegador não permitiu salvar o progresso. Você pode continuar estudando, mas talvez perca o progresso ao sair.'}}

const raw=read(playerKey)||{};
const knownIds=new Set(missions.map(m=>m.id));
let player={
  character:characters.some(c=>c.id===raw.character)?raw.character:characters[0].id,
  done:Array.isArray(raw.done)?[...new Set(raw.done.filter(id=>knownIds.has(id)))]:[],
  current:knownIds.has(raw.current)?raw.current:missions[0].id,
  bestScore:Number.isInteger(raw.bestScore)&&raw.bestScore>=0&&raw.bestScore<=practice.length?raw.bestScore:0
};
let gateAnswer=null;
function selectedCharacter(){return characters.find(c=>c.id===player.character)}
function savePlayer(){write(playerKey,player)}
function renderPlayer(){
  const character=selectedCharacter();
  $('playerPanel').innerHTML=`<div class="head-row"><div class="player"><span class="player-icon" aria-hidden="true">${character.icon}</span><div><strong>${esc(character.name)} · ${esc(character.role)}</strong><span class="small">${esc(character.description)}</span></div></div><button class="btn secondary" data-picker>Trocar personagem</button></div><div class="rewards"><span class="pill">⭐ ${player.done.length*100} XP na trilha</span><span class="pill">🏅 ${player.done.length} de 8 estações</span><span class="pill">🏆 Melhor simulado: ${player.bestScore} / 40</span></div>`;
  $('characters').innerHTML=characters.map(c=>`<button class="character ${c.id===player.character?'selected':''}" data-character="${c.id}" aria-pressed="${c.id===player.character}"><span class="portrait" aria-hidden="true">${c.icon}</span><strong>${esc(c.name)}</strong><span class="role">${esc(c.role)}</span><p>${esc(c.description)}</p></button>`).join('');
}
function renderTrail(){
  renderPlayer();
  $('trailProgress').innerHTML=`<div class="progress" role="progressbar" aria-label="Estações concluídas" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${player.done.length}"><i style="width:${player.done.length/8*100}%"></i></div><span class="small">${player.done.length} de 8 estações concluídas</span>`;
  $('missionMap').innerHTML=missions.map((m,i)=>`<button class="mission-node ${player.current===m.id?'current':''} ${player.done.includes(m.id)?'done':''}" data-mission="${m.id}" ${player.current===m.id?'aria-current="step"':''}><span class="symbol" aria-hidden="true">${m.icon}</span><span><small>Estação ${i+1}${player.done.includes(m.id)?' · concluída ✓':''}</small><strong>${esc(m.title)}</strong></span></button>`).join('');
  renderLesson();
  $('trailFinish').hidden=player.done.length!==missions.length;
  if(player.done.length===missions.length)$('trailFinish').innerHTML='<h2>🏆 Equipe pronta para praticar</h2><p>Você concluiu as oito estações. Agora resolva 40 situações novas no simulado e revise as explicações de cada resposta.</p><div class="actions"><a class="btn" href="instrumentacao-simulado.html">Ir para o simulado →</a></div>';
}
function renderLesson(){
  const m=missions.find(item=>item.id===player.current),i=missions.indexOf(m),answered=gateAnswer!==null,correct=gateAnswer===m.gate.c;
  $('lesson').innerHTML=`<div class="chapter-label">${esc(m.world)} · ${i+1} de 8</div><h2>${m.icon} ${esc(m.title)}</h2><p class="muted">${esc(m.intro)}</p><div class="concepts">${m.concepts.map(([title,definition,example],j)=>`<article class="concept"><span class="concept-number">Conceito ${j+1}</span><h3>${esc(title)}</h3><p>${esc(definition)}</p><div class="example"><strong>NA PRÁTICA</strong>${esc(example)}</div></article>`).join('')}</div><div class="checkpoint"><div class="chapter-label">Checkpoint da estação</div><h3>${esc(m.gate.q)}</h3>${m.gate.o.map((option,j)=>`<button class="option ${answered&&j===m.gate.c?'correct':''} ${answered&&j===gateAnswer&&!correct?'wrong':''}" data-gate="${j}" ${answered?'disabled':''}>${String.fromCharCode(65+j)}. ${esc(option)}</button>`).join('')}${answered?`<div class="feedback ${correct?'':'wrong'}" role="status"><strong>${correct?'✓ Estação concluída!':'Revise a explicação e tente novamente.'}</strong><br>${esc(m.gate.why)}</div>${!correct?'<div class="actions"><button class="btn secondary" data-retry-gate>Tentar novamente</button></div>':''}`:''}</div><div class="actions">${i>0?`<button class="btn secondary" data-mission="${missions[i-1].id}">← Estação anterior</button>`:''}${i<missions.length-1?`<button class="btn" data-mission="${missions[i+1].id}">Próxima estação →</button>`:'<a class="btn" href="instrumentacao-simulado.html">Praticar no simulado →</a>'}<a class="btn secondary" href="./">Voltar ao portal</a></div><div class="sources">Referências para estudo: <a href="https://www.pe.senai.br/cursos/ead-fundamentos-da-instrumentacao/" target="_blank" rel="noopener">SENAI · Fundamentos da Instrumentação</a><a href="https://www.pe.senai.br/cursos/instrumentacao-basica/" target="_blank" rel="noopener">SENAI · Instrumentação Básica</a><a href="https://www.isa.org/training/course-description/fg05" target="_blank" rel="noopener">ISA · Medição e Controle</a></div>`;
}
export function validCampaign(s){
  return !!s&&Array.isArray(s.order)&&s.order.length===practice.length&&new Set(s.order).size===practice.length&&s.order.every(i=>Number.isInteger(i)&&i>=0&&i<practice.length)&&Array.isArray(s.answers)&&s.answers.length===practice.length&&s.answers.every(a=>a===null||Number.isInteger(a)&&a>=0&&a<5)&&Number.isInteger(s.cursor)&&s.cursor>=0&&s.cursor<practice.length&&typeof s.finished==='boolean';
}
let campaign=null,running=false;
if(mode==='simulation'){const saved=read(simulationKey);if(validCampaign(saved))campaign=saved}
function saveCampaign(){write(simulationKey,campaign)}
function newCampaign(){
  const order=practice.map((_,i)=>i);
  for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  campaign={order,answers:Array(practice.length).fill(null),cursor:0,finished:false};
  saveCampaign();
}
function simulationScore(){return campaign.answers.reduce((score,answer,i)=>score+(answer===practice[campaign.order[i]].correct?1:0),0)}
function renderSimulation(){
  renderPlayer();
  $('simulationIntro').hidden=running;$('simulationMap').hidden=!running;$('quiz').hidden=!running||campaign?.finished;$('simulationResult').hidden=!running||!campaign?.finished;
  if(!running){$('beginSimulation').textContent=campaign?.finished?'Ver meu resultado':campaign?'Retomar simulado →':'Começar simulado →';return}
  const answered=campaign.answers.filter(value=>value!==null).length;
  $('simulationCount').textContent=`${answered} de 40 respondidas`;
  $('simulationBar').style.width=answered/practice.length*100+'%';
  $('questionMap').innerHTML=campaign.order.map((_,i)=>`<button class="question-node ${i===campaign.cursor?'current':''} ${campaign.answers[i]!==null?'done':''}" data-question="${i}" aria-label="Situação ${i+1}${campaign.answers[i]!==null?', respondida':''}">${i+1}</button>`).join('');
  if(campaign.finished){renderResult();return}
  const q=practice[campaign.order[campaign.cursor]],m=missions.find(item=>item.id===q.mission),choice=campaign.answers[campaign.cursor],hasAnswer=choice!==null,correct=choice===q.correct;
  $('quiz').innerHTML=`<div class="head-row"><span class="chapter-label">Situação ${campaign.cursor+1} de 40</span><span class="pill">${m.icon} ${esc(m.title)}</span></div><span class="small">Nível: ${esc(q.difficulty)}</span><h2 class="quiz-title">${esc(q.text)}</h2><p class="small">Conforme a situação, escolha a decisão tecnicamente mais adequada.</p>${q.options.map((option,i)=>`<button class="option ${hasAnswer&&i===q.correct?'correct':''} ${hasAnswer&&i===choice&&!correct?'wrong':''}" data-answer="${i}" ${hasAnswer?'disabled':''}>${String.fromCharCode(65+i)}. ${esc(option)}</button>`).join('')}${hasAnswer?`<div class="feedback ${correct?'':'wrong'}" role="status"><strong>${correct?'✓ Boa análise!':'Vamos revisar.'}</strong><br>${esc(q.explain)}</div>`:''}<div class="actions">${hasAnswer?`<button class="btn" data-next>${campaign.cursor===practice.length-1?'Concluir simulado →':'Próxima situação →'}</button>`:''}<a class="btn secondary" href="instrumentacao-trilha.html?missao=${m.id}">Revisar assunto</a><a class="btn secondary" href="./">Sair e salvar</a></div>`;
}
function renderResult(){
  const score=simulationScore(),rank=score>=36?'S':score>=32?'A':score>=28?'B':score>=24?'C':'D';
  $('simulationResult').innerHTML=`<div class="head-row"><div><div class="chapter-label">Simulado concluído</div><h2>Seu diagnóstico de aprendizagem</h2></div><span class="rank">RANK ${rank}</span></div><div class="score">${score} / 40</div><p class="muted">Revise as estações com menor número de acertos e tente outra vez. Este resultado é apenas de estudo.</p><div class="rewards"><span class="pill">⭐ ${score*20} XP de treino</span></div><h3>Acertos por estação</h3><div class="review-grid">${missions.map(m=>{const answers=campaign.order.map((index,i)=>({q:practice[index],a:campaign.answers[i]})).filter(item=>item.q.mission===m.id),hits=answers.filter(item=>item.a===item.q.correct).length;return `<a class="review-link" href="instrumentacao-trilha.html?missao=${m.id}"><strong>${m.icon} ${esc(m.title)}</strong><br>${hits} de ${answers.length} acertos · revisar</a>`}).join('')}</div><div class="actions"><button class="btn secondary" data-restart>Fazer novo simulado</button><a class="btn" href="instrumentacao-trilha.html">Voltar à trilha</a></div><p class="small">As questões são originais, no formato de situações-problema. Não são itens oficiais do SAEP nem constituem prova com nota no painel do professor.</p>`;
}

document.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.hasAttribute('data-picker')){$('characterPicker').hidden=!$('characterPicker').hidden;return}
  if(target.dataset.character){if(!characters.some(c=>c.id===target.dataset.character))return;player.character=target.dataset.character;savePlayer();renderPlayer();$('characterPicker').hidden=true;return}
  if(mode==='trail'){
    if(target.dataset.mission){if(!knownIds.has(target.dataset.mission))return;player.current=target.dataset.mission;gateAnswer=null;savePlayer();renderTrail();$('lesson').scrollIntoView({block:'start'});return}
    if(target.hasAttribute('data-gate')){if(gateAnswer!==null)return;const m=missions.find(item=>item.id===player.current),answer=Number(target.dataset.gate);if(!Number.isInteger(answer)||answer<0||answer>=m.gate.o.length)return;gateAnswer=answer;if(answer===m.gate.c&&!player.done.includes(m.id)){player.done.push(m.id);savePlayer()}renderTrail();return}
    if(target.hasAttribute('data-retry-gate')){gateAnswer=null;renderLesson();return}
  }
  if(mode==='simulation'){
    if(target.hasAttribute('data-start')){if(!campaign)newCampaign();running=true;renderSimulation();(campaign.finished?$('simulationResult'):$('quiz')).scrollIntoView({block:'start'});return}
    if(target.hasAttribute('data-answer')){if(!campaign||campaign.answers[campaign.cursor]!==null)return;const answer=Number(target.dataset.answer);if(!Number.isInteger(answer)||answer<0||answer>4)return;campaign.answers[campaign.cursor]=answer;saveCampaign();renderSimulation();return}
    if(target.hasAttribute('data-next')){if(!campaign||campaign.answers[campaign.cursor]===null)return;if(campaign.cursor===practice.length-1){const missed=campaign.answers.indexOf(null);if(missed===-1){campaign.finished=true;player.bestScore=Math.max(player.bestScore,simulationScore());savePlayer()}else campaign.cursor=missed}else campaign.cursor++;saveCampaign();renderSimulation();(campaign.finished?$('simulationResult'):$('quiz')).scrollIntoView({block:'start'});return}
    if(target.hasAttribute('data-question')){const i=Number(target.dataset.question);if(!campaign||!Number.isInteger(i)||i<0||i>=practice.length)return;campaign.cursor=i;campaign.finished=false;saveCampaign();renderSimulation();$('quiz').scrollIntoView({block:'start'});return}
    if(target.hasAttribute('data-restart')&&confirm('Iniciar um novo simulado? As respostas atuais serão substituídas, mas o melhor resultado será mantido.')){newCampaign();running=true;renderSimulation();$('quiz').scrollIntoView({block:'start'});return}
  }
});

if(mode==='trail'){const requested=new URLSearchParams(location.search).get('missao');if(knownIds.has(requested))player.current=requested;renderTrail()}else renderSimulation();
if(!raw.character)$('characterPicker').hidden=false;
showStorageWarning();

